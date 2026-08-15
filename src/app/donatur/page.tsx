import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { rupiah, initial, tanggal, bulanKeyNow, bulanLabel, LABEL_STATUS_TAGIHAN } from "@/lib/format";
import { ensureBulananTagihan } from "@/lib/actions";
import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui";

export default async function DonaturHome() {
  const user = await requireUser(["donatur"]);
  await ensureBulananTagihan();
  const donaturId = user.donatur!.id;
  const nowKey = bulanKeyNow();

  const mappings = await prisma.mappingBeasiswa.findMany({
    where: { donaturId, status: "aktif" },
    include: {
      mahasiswa: { include: { ipkHistory: { orderBy: { semester: "asc" } } } },
      tagihan: { orderBy: { periodeKey: "desc" } },
    },
  });
  const riwayat = await prisma.pembayaran.findMany({
    where: { tagihan: { mappingBeasiswa: { donaturId } } },
    orderBy: { tanggalTransfer: "desc" },
    include: { tagihan: { include: { mappingBeasiswa: { include: { mahasiswa: true } } } } },
  });

  const tagihanBulanIni = mappings.flatMap((m) => m.tagihan).filter((t) => t.periodeKey === nowKey);
  const sudahBulanIni = tagihanBulanIni.filter((t) => t.status === "lunas").reduce((s, t) => s + t.nominalHarusDibayar, 0);
  const belumBulanIni = tagihanBulanIni.filter((t) => t.status === "pending" || t.status === "ditolak").reduce((s, t) => s + t.nominalHarusDibayar, 0);
  const menunggu = tagihanBulanIni.filter((t) => t.status === "menunggu_verifikasi").length;
  const perluDibayar = mappings.flatMap((m) => m.tagihan).filter((t) => t.status === "pending" || t.status === "ditolak");

  const statusPembayaran: Record<string, { text: string; tone: string }> = {
    menunggu: { text: "Menunggu", tone: "info" },
    acc: { text: "Diverifikasi", tone: "primary" },
    ditolak: { text: "Ditolak", tone: "danger" },
  };

  const CG = ["var(--accent)", "var(--info)", "var(--muted)", "var(--primary)"];

  return (
    <>
      <div className="grid-2" style={{ gap: 12 }}>
        <div>
          <div className="receipt-card" style={{ marginTop: 6 }}>
            <div className="label">Dibayar {bulanLabel(nowKey)}</div>
            <div className="amount" style={{ fontSize: 24 }}>{rupiah(sudahBulanIni)}</div>
            <div className="breakdown">Tagihan bulan ini yang sudah diverifikasi LAZISMU</div>
          </div>
          <div className="receipt-jagged"></div>
        </div>
        <div>
          <div className="receipt-card" style={{ marginTop: 6, background: "linear-gradient(155deg,#7C2D12,#9A3B22)" }}>
            <div className="label">Belum Dibayar {bulanLabel(nowKey)}</div>
            <div className="amount" style={{ fontSize: 24 }}>{rupiah(belumBulanIni)}</div>
            <div className="breakdown">{perluDibayar.length} tagihan belum dibayar{menunggu ? ` · ${menunggu} menunggu verifikasi` : ""}</div>
          </div>
          <div className="receipt-jagged"></div>
        </div>
      </div>

      <div className="section-title">Mahasiswa Asuh</div>
      {mappings.length === 0 ? (
        <div className="helper-note" style={{ marginTop: 4 }}>Belum ada mahasiswa asuh. Admin akan menambahkan setelah pembayaran pertama di-ACC.</div>
      ) : mappings.map((m, idx) => {
        const ipk = m.mahasiswa.ipkHistory[m.mahasiswa.ipkHistory.length - 1];
        const tBulanIni = m.tagihan.find((t) => t.periodeKey === nowKey);
        const st = tBulanIni ? LABEL_STATUS_TAGIHAN[tBulanIni.status] : null;
        return (
          <div className="donor-card" key={m.id}>
            <div className="avatar" style={{ background: CG[idx % CG.length] }}>{initial(m.mahasiswa.nama)}</div>
            <div className="grow">
              <strong>{m.mahasiswa.nama}</strong>
              <span className="sub mono">NIM {m.mahasiswa.nim} · {ipk ? `IPK ${ipk.nilaiIpk.toFixed(2)}` : "belum ada IPK"}</span>
            </div>
            {st ? <Badge text={st.text} tone={st.tone} /> : <Badge text="Aktif" tone="primary" />}
          </div>
        );
      })}

      {perluDibayar.length > 0 ? (
        <div className="section-title">Perlu Dibayar</div>
      ) : null}
      {perluDibayar.map((t) => (
        <div className="donor-card" key={t.id}>
          <div className="thumb"><Icon name="list" /></div>
          <div className="grow">
            <strong>{rupiah(t.nominalHarusDibayar)}</strong>
            <span className="sub mono">{bulanLabel(t.periodeKey)} · Ref: {t.kodeReferensiUnik}</span>
          </div>
          <a className="btn btn-primary btn-sm" href="/donatur/tagihan">Bayar</a>
        </div>
      ))}

      <div className="section-title">Riwayat Pembayaran</div>
      {riwayat.length === 0 ? (
        <div className="helper-note" style={{ marginTop: 4 }}>Belum ada pembayaran tercatat.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Bulan</th><th>Mahasiswa</th><th>Tanggal Transfer</th><th>Nominal</th><th>Status</th></tr></thead>
            <tbody>
              {riwayat.slice(0, 15).map((p) => {
                const st = statusPembayaran[p.status];
                return (
                  <tr key={p.id}>
                    <td>{bulanLabel(p.tagihan.periodeKey)}</td>
                    <td>{p.tagihan.mappingBeasiswa.mahasiswa.nama}</td>
                    <td className="mono">{tanggal(p.tanggalTransfer)}</td>
                    <td className="mono">{rupiah(p.nominalDitransfer)}</td>
                    <td><Badge text={st.text} tone={st.tone} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="cta-upload">
        <a className="btn btn-primary" href="/donatur/tagihan"><Icon name="upload" size={15} />Unggah Bukti Transfer</a>
      </div>
    </>
  );
}
