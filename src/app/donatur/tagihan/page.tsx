import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { rupiah, tanggal } from "@/lib/format";
import { Icon } from "@/components/icons";
import UploadBuktiToggle from "@/components/upload-bukti-toggle";

export default async function DonaturTagihanPage() {
  const user = await requireUser(["donatur"]);
  const mappings = await prisma.mappingBeasiswa.findMany({
    where: { donaturId: user.donatur!.id, status: "aktif", tagihan: { some: {} } },
    include: { mahasiswa: true, tagihan: { orderBy: { tanggalJatuhTempo: "desc" } } },
  });
  const rek = await prisma.rekeningBank.findFirst({ where: { status: "aktif" }, orderBy: { createdAt: "desc" } });

  const ST: Record<string, [string, string]> = {
    pending: ["Belum Bayar", "badge-accent"],
    menunggu_verifikasi: ["Menunggu Verifikasi", "badge-info"],
    lunas: ["Lunas", "badge-primary"],
    ditolak: ["Ditolak", "badge-danger"],
  };

  const all = mappings.flatMap((m) => m.tagihan);
  const totalTagihan = all.reduce((s, t) => s + t.nominalHarusDibayar, 0);
  const perluBayar = all.filter((t) => t.status === "pending" || t.status === "ditolak").length;

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
        <div className="label">Total Tagihan</div>
        <div className="amount" style={{ fontSize: 24 }}>{rupiah(totalTagihan)}</div>
        <div className="breakdown">Dari {mappings.length} mahasiswa asuh · {all.length} tagihan{perluBayar ? ` · ${perluBayar} perlu dibayar` : ""}</div>
      </div>
      <div className="receipt-jagged"></div>

      <div className="section-title">Tagihan Saya</div>
      {all.length === 0 ? <div className="helper-note">Belum ada tagihan untuk periode ini.</div> : null}

      {all.map((t) => {
        const st = ST[t.status] ?? ["—", "badge-muted"];
        const mhs = mappings.find((m) => m.id === t.mappingBeasiswaId)?.mahasiswa;
        return (
          <div className="card" key={t.id} style={{ padding: 0 }}>
            <div className="card-body">
              <div className="top-row" style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div><strong style={{ fontSize: 14 }}>{rupiah(t.nominalHarusDibayar)}</strong><span className="meta" style={{ display: "block" }}>{mhs?.nama ?? "—"} · {t.periode}</span></div>
                <span className={`badge ${st[1]}`}>{st[0]}</span>
              </div>
              <div className="helper-note" style={{ margin: "10px 0" }}>
                <b>Kode Referensi:</b> <span className="mono">{t.kodeReferensiUnik}</span><br />
                Gunakan kode ini saat transfer agar LAZISMU dapat mencocokkan pembayaran Anda.
              </div>
              <div className="meta mono" style={{ marginBottom: 10 }}>Jatuh tempo {tanggal(t.tanggalJatuhTempo)}</div>

              {t.status === "pending" || t.status === "ditolak" ? (
                <UploadBuktiToggle tagihanId={t.id} tagihanNominal={t.nominalHarusDibayar} rekening={rek ? { namaBank: rek.namaBank, nomorRekening: rek.nomorRekening, atasNama: rek.atasNama } : null} />
              ) : null}
            </div>
          </div>
        );
      })}
      <div style={{ height: 12 }} />
    </>
  );
}