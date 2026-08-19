import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader, StatCard, Card, Badge, Empty } from "@/components/ui";
import { Icon } from "@/components/icons";
import LihatBuktiDialog from "@/components/lihat-bukti-dialog";
import { rupiah, rupiahShort, tanggal, bulanLabel } from "@/lib/format";

const SUMBER_TONE: Record<string, string> = { manual: "accent", sistem: "info" };
const SUMBER_TEXT: Record<string, string> = { manual: "Manual", sistem: "Sistem" };

export default async function HistoriPage({
  searchParams,
}: { searchParams: Promise<{ q?: string; dari?: string; sampai?: string; sumber?: string }> }) {
  await requireUser(["lazismu"]);
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const dari = typeof sp.dari === "string" && sp.dari ? new Date(`${sp.dari}T00:00:00`) : null;
  const sampai = typeof sp.sampai === "string" && sp.sampai ? new Date(`${sp.sampai}T23:59:59`) : null;
  const sumber = typeof sp.sumber === "string" && sp.sumber !== "semua" ? sp.sumber : null;

  const pembayaran = await prisma.pembayaran.findMany({
    where: {
      status: "acc",
      ...(sumber ? { sumber: sumber as "sistem" | "manual" } : {}),
      ...(dari || sampai ? { tanggalAcc: { ...(dari ? { gte: dari } : {}), ...(sampai ? { lte: sampai } : {}) } } : {}),
      ...(q ? { tagihan: { mappingBeasiswa: { donatur: { user: { nama: { contains: q, mode: "insensitive" as const } } } } } } : {}),
    },
    orderBy: { tanggalAcc: "desc" },
    include: {
      tagihan: {
        include: {
          mappingBeasiswa: { include: { donatur: { include: { user: true } }, mahasiswa: true } },
        },
      },
    },
  });

  const totalNominal = pembayaran.reduce((s, p) => s + p.nominalDitransfer, 0);
  const totalManual = pembayaran.filter((p) => p.sumber === "manual").reduce((s, p) => s + p.nominalDitransfer, 0);
  const donaturUnik = new Set(pembayaran.map((p) => p.tagihan.mappingBeasiswa.donatur.user.nama)).size;

  return (
    <>
      <PageHeader title="Histori Pembayaran" sub="Daftar pembayaran yang sudah di-ACC: siapa, kapan, dan buktinya"
        actions={<a className="btn btn-ghost btn-sm" href="/api/export/laporan-donasi"><Icon name="download" size={14} />Laporan Donasi</a>} />

      <div className="stat-grid">
        <StatCard label="Total Dana Masuk" value={rupiahShort(totalNominal)} delta={`${pembayaran.length} transaksi`} />
        <StatCard label="Donatur Sudah Bayar" value={String(donaturUnik)} delta="Donatur unik" />
        <StatCard label="Manual (Input Lazismu)" value={rupiahShort(totalManual)} delta={`${pembayaran.filter((p) => p.sumber === "manual").length} transaksi`} tone="accent" deltaTone="var(--accent)" />
      </div>

      <Card title={`Histori (${pembayaran.length})`} hint="Filter untuk mempersempit berdasarkan nama, rentang tanggal, atau sumber pembayaran" noPad>
        <form method="get" action="/lazismu/histori" className="filter-form">
          <input className="input" type="text" name="q" placeholder="Cari nama donatur…" defaultValue={q} />
          <input className="input" type="date" name="dari" defaultValue={sp.dari ?? ""} />
          <input className="input" type="date" name="sampai" defaultValue={sp.sampai ?? ""} />
          <select className="input" name="sumber" defaultValue={sumber ?? "semua"}>
            <option value="semua">Semua Sumber</option>
            <option value="manual">Manual (Input Lazismu)</option>
            <option value="sistem">Sistem (Upload Donatur)</option>
          </select>
          <button className="btn btn-primary btn-sm" type="submit"><Icon name="search" size={14} />Terapkan</button>
          <a className="btn btn-ghost btn-sm" href="/lazismu/histori">Reset</a>
        </form>

        <div className="table-wrap" style={{ paddingTop: 6 }}>
          <table>
            <thead><tr><th>Donatur</th><th>Mahasiswa</th><th>Bulan</th><th>Transfer</th><th>ACC</th><th>Sumber</th><th>Nominal</th><th></th></tr></thead>
            <tbody>
              {pembayaran.length === 0 ? <tr><td colSpan={8}><Empty message="Tidak ada pembayaran yang cocok dengan filter." /></td></tr> :
                pembayaran.map((p) => (
                  <tr key={p.id}>
                    <td><b>{p.tagihan.mappingBeasiswa.donatur.user.nama}</b></td>
                    <td>{p.tagihan.mappingBeasiswa.mahasiswa.nama}</td>
                    <td>{bulanLabel(p.tagihan.periodeKey)}</td>
                    <td className="mono">{tanggal(p.tanggalTransfer)}</td>
                    <td className="mono">{p.tanggalAcc ? tanggal(p.tanggalAcc) : "—"}</td>
                    <td><Badge text={SUMBER_TEXT[p.sumber] ?? p.sumber} tone={SUMBER_TONE[p.sumber] ?? "muted"} /></td>
                    <td className="mono">{rupiah(p.nominalDitransfer)}</td>
                    <td style={{ textAlign: "right" }}>
                      <LihatBuktiDialog url={p.fileBuktiTransferUrl} />
                      {p.batchId ? <span className="meta" style={{ display: "block" }}>batch #{p.batchId.slice(-6)}</span> : null}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}