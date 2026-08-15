import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { rupiah, tanggal, bulanKeyNow, bulanLabel, LABEL_STATUS_TAGIHAN } from "@/lib/format";
import { ensureBulananTagihan } from "@/lib/actions";
import UploadBuktiToggle from "@/components/upload-bukti-toggle";
import { Badge } from "@/components/ui";

export default async function DonaturTagihanPage() {
  const user = await requireUser(["donatur"]);
  await ensureBulananTagihan();
  const nowKey = bulanKeyNow();

  const mappings = await prisma.mappingBeasiswa.findMany({
    where: { donaturId: user.donatur!.id, status: "aktif" },
    include: { mahasiswa: true, tagihan: { orderBy: { periodeKey: "asc" } } },
  });
  const rek = await prisma.rekeningBank.findFirst({ where: { status: "aktif" }, orderBy: { createdAt: "desc" } });

  const semuaTagihan = mappings.flatMap((m) => m.tagihan);
  const belumBayar = semuaTagihan.filter((t) => t.status === "pending" || t.status === "ditolak");
  const menungguCount = semuaTagihan.filter((t) => t.status === "menunggu_verifikasi").length;
  const totalBelumBayar = belumBayar.reduce((s, t) => s + t.nominalHarusDibayar, 0);

  return (
    <>
      {rek ? (
        <div className="receipt-card" style={{ background: "linear-gradient(155deg,#0A4E3A,#2F6FA6)" }}>
          <div className="label">Transfer ke Rekening {rek.namaBank}</div>
          <div className="amount" style={{ fontSize: 22 }}>{rek.nomorRekening}</div>
          <div className="breakdown">a.n. {rek.atasNama} · wajib isi <b>kode referensi</b> di bawah</div>
        </div>
      ) : (
        <div className="helper-note" style={{ marginTop: 8 }}>Belum ada rekening tujuan aktif. Hubungi LAZISMU.</div>
      )}
      <div className="receipt-jagged"></div>

      <div className="receipt-card" style={{ marginTop: 6 }}>
        <div className="label">Total Belum Dibayar</div>
        <div className="amount" style={{ fontSize: 24 }}>{rupiah(totalBelumBayar)}</div>
        <div className="breakdown">{belumBayar.length} tagihan belum dibayar{menungguCount ? ` · ${menungguCount} menunggu verifikasi` : ""}</div>
      </div>
      <div className="receipt-jagged"></div>

      <div className="section-title">Mahasiswa Asuh</div>
      {mappings.length === 0 ? <div className="helper-note">Belum ada mahasiswa asuh.</div> : null}

      {mappings.map((m) => {
        const adaBelum = belumBayar.some((t) => t.mappingBeasiswaId === m.id);
        const menunggu = m.tagihan.some((t) => t.status === "menunggu_verifikasi");
        return (
          <div className="card" key={m.id} style={{ padding: 0 }}>
            <div className="card-body">
              <div className="top-row" style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div>
                  <strong style={{ fontSize: 14 }}>{m.mahasiswa.nama}</strong>
                  <span className="meta" style={{ display: "block" }}>{m.mahasiswa.prodi} · NIM {m.mahasiswa.nim} · {rupiah(m.nominalTanggungan)}/bulan</span>
                </div>
              </div>

              <div className="table-wrap" style={{ margin: "10px 0" }}>
                <table>
                  <thead><tr><th>Bulan</th><th>Status</th><th>Nominal</th><th>Kode Referensi</th><th>Jatuh Tempo</th></tr></thead>
                  <tbody>
                    {m.tagihan.length === 0 ? <tr><td colSpan={5} style={{ color: "var(--muted)" }}>Belum ada tagihan.</td></tr> :
                      m.tagihan.map((t) => {
                        const st = LABEL_STATUS_TAGIHAN[t.status];
                        return (
                          <tr key={t.id}>
                            <td>{bulanLabel(t.periodeKey)}{t.periodeKey === nowKey ? " (bulan ini)" : ""}</td>
                            <td><Badge text={st.text} tone={st.tone} /></td>
                            <td className="mono">{rupiah(t.nominalHarusDibayar)}</td>
                            <td className="mono">{t.kodeReferensiUnik}</td>
                            <td className="mono">{tanggal(t.tanggalJatuhTempo)}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {adaBelum ? (
                <UploadBuktiToggle mappingId={m.id} nominal={m.nominalTanggungan} rekening={rek ? { namaBank: rek.namaBank, nomorRekening: rek.nomorRekening, atasNama: rek.atasNama } : null} />
              ) : (
                <div className="helper-note" style={{ margin: 0 }}>
                  {menunggu ? "Ada bukti yang sedang menunggu verifikasi LAZISMU." : "Semua tagihan untuk mahasiswa ini sudah lunas."}
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div style={{ height: 12 }} />
    </>
  );
}
