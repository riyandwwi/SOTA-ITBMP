import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader, StatCard, Card, Badge, Empty } from "@/components/ui";
import { Icon } from "@/components/icons";
import { DonutChart, DonutLegend } from "@/components/charts";
import { rupiah, rupiahShort, tanggal, bulanLabel, bulanKeyNow } from "@/lib/format";
import GenerateBillingForm from "@/components/generate-billing-form";
import { ensureBulananTagihan } from "@/lib/actions";

export default async function LazismuDashboard() {
  await requireUser(["lazismu"]);
  await ensureBulananTagihan();

  const [tagihan, pembayaran, aktifRek] = await Promise.all([
    prisma.tagihan.findMany({ orderBy: { tanggalJatuhTempo: "desc" }, include: { mappingBeasiswa: { include: { donatur: { include: { user: true } } } } } }),
    prisma.pembayaran.findMany({ where: { status: "menunggu" }, orderBy: { tanggalTransfer: "desc" } }),
    prisma.rekeningBank.findMany({ where: { status: "aktif" } }),
  ]);

  const lunas = tagihan.filter((t) => t.status === "lunas").length;
  const belum = tagihan.filter((t) => t.status === "pending" || t.status === "ditolak").length;
  const menunggu = tagihan.filter((t) => t.status === "menunggu_verifikasi").length;

  const seharusnya = tagihan.reduce((s, t) => s + t.nominalHarusDibayar, 0);
  const masuk = tagihan.filter((t) => t.status === "lunas").reduce((s, t) => s + t.nominalHarusDibayar, 0);
  const belumNominal = tagihan.filter((t) => t.status === "pending" || t.status === "ditolak").reduce((s, t) => s + t.nominalHarusDibayar, 0);
  const menungguNominal = tagihan.filter((t) => t.status === "menunggu_verifikasi").reduce((s, t) => s + t.nominalHarusDibayar, 0);
  const pctMasuk = seharusnya > 0 ? Math.round((masuk / seharusnya) * 100) : 0;

  const dist = [
    { name: "Lunas", value: lunas, color: "#0E6B4F" },
    { name: "Belum Bayar", value: belum, color: "#BD8A34" },
    { name: "Menunggu", value: menunggu, color: "#2F6FA6" },
  ];

  const statusTone: Record<string, string> = { lunas: "primary", pending: "accent", ditolak: "danger", menunggu_verifikasi: "info" };
  const statusText: Record<string, string> = { lunas: "Lunas", pending: "Belum Bayar", ditolak: "Ditolak", menunggu_verifikasi: "Menunggu Verifikasi" };

  return (
    <>
      <PageHeader title="Dashboard LAZISMU" sub="Penagihan, verifikasi pembayaran & rekening bank" />

      <div className="stat-grid">
        <StatCard label="Lunas" value={String(lunas)} delta={bulanLabel(bulanKeyNow())} />
        <StatCard label="Belum Bayar" value={String(belum)} delta="Perlu ditagih" tone="accent" deltaTone="var(--accent)" />
        <StatCard label="Menunggu Verifikasi" value={String(menunggu)} delta="Cek bukti transfer" tone="info" deltaTone="var(--info)" />
        <StatCard label="Dana Masuk" value={rupiahShort(masuk)} delta={`${pctMasuk}% dari target`} />
      </div>

      <div className="grid-3" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 22 }}>
        <div className="stat-card">
          <div className="label">Seharusnya Diterima</div>
          <div className="value mono" style={{ fontSize: 22 }}>{rupiah(seharusnya)}</div>
          <div className="delta">Total tagihan yang ditagihkan</div>
        </div>
        <div className="stat-card">
          <div className="label">Donasi Masuk</div>
          <div className="value mono" style={{ fontSize: 22, color: "var(--primary-dark)" }}>{rupiah(masuk)}</div>
          <div className="delta">{rupiahShort(menungguNominal)} masih menunggu verifikasi</div>
        </div>
        <div className="stat-card">
          <div className="label">Belum Masuk</div>
          <div className="value mono" style={{ fontSize: 22, color: "var(--accent)" }}>{rupiah(belumNominal)}</div>
          <div className="delta">Tagihan belum/tidak terbayar</div>
        </div>
      </div>

      <div className="grid-2">
        <div>
          <Card title="Status Tagihan Donatur" hint="No. WA untuk penagihan"
            actions={<a className="btn btn-ghost btn-sm" href="/api/export/laporan-donasi"><Icon name="download" size={14} />Laporan Donasi</a>}>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Donatur</th><th>No. WA</th><th>Status</th><th>Nominal</th><th>Jatuh Tempo</th></tr></thead>
                <tbody>
                  {tagihan.length === 0 ? <tr><td colSpan={5}><Empty /></td></tr> :
                    tagihan.slice(0, 8).map((t) => (
                      <tr key={t.id}>
                        <td><b>{t.mappingBeasiswa.donatur.user.nama}</b></td>
                        <td className="mono">{t.mappingBeasiswa.donatur.kontakWa}</td>
                        <td><Badge text={statusText[t.status]} tone={statusTone[t.status]} /></td>
                        <td className="mono">{rupiah(t.nominalHarusDibayar)}</td>
                        <td className="mono">{tanggal(t.tanggalJatuhTempo)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div>
          <Card title="Antrean Verifikasi Pembayaran" hint="ACC atau tolak bukti transfer"
            actions={<a className="btn btn-primary btn-sm" href="/lazismu/verifikasi"><Icon name="eye" size={14} />Buka Antrean</a>}>
            {pembayaran.length === 0 ? <Empty message="Tidak ada pembayaran menunggu." /> :
              pembayaran.slice(0, 3).map((p) => (
                <div className="list-item" key={p.id}>
                  <div className="thumb"><Icon name="upload" /></div>
                  <div className="grow">
                    <div className="top-row"><strong style={{ fontSize: 13 }}>#{p.id.slice(0, 8)}</strong><span className="mono" style={{ fontSize: 11 }}>{rupiah(p.nominalDitransfer)}</span></div>
                    <div className="meta">transfer {tanggal(p.tanggalTransfer)}</div>
                  </div>
                </div>
              ))}
          </Card>

          <Card title="Distribusi Status Tagihan">
            <DonutChart data={dist} />
            <DonutLegend data={dist} />
          </Card>

          <Card title="Rekening Tujuan Transfer (Aktif)">
            {aktifRek.length === 0 ? <Empty message="Belum ada rekening aktif." /> :
              aktifRek.map((r) => (
                <div className="list-item" key={r.id}>
                  <div className="thumb"><Icon name="bank" /></div>
                  <div className="grow"><div className="top-row"><strong style={{ fontSize: 13 }}>{r.namaBank} — {r.nomorRekening}</strong><Badge text="aktif" tone="primary" /></div><div className="meta">a.n. {r.atasNama}</div></div>
                </div>
              ))}
          </Card>

          <Card title="Generator Tagihan" hint="Buat tagihan baru untuk semua mapping aktif per periode">
            <GenerateBillingForm />
          </Card>
        </div>
      </div>
    </>
  );
}