import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { rupiah, initial } from "@/lib/format";
import { Icon } from "@/components/icons";

export default async function DonaturHome() {
  const user = await requireUser(["donatur"]);
  const donaturId = user.donatur!.id;

  const mappings = await prisma.mappingBeasiswa.findMany({
    where: { donaturId, status: "aktif" },
    include: {
      mahasiswa: { include: { ipkHistory: { orderBy: { semester: "asc" } } } },
      tagihan: { orderBy: { tanggalJatuhTempo: "desc" } },
    },
  });

  const tagihan = mappings.flatMap((m) => m.tagihan);
  const menunggu = tagihan.filter((t) => t.status === "menunggu_verifikasi").length;
  const perluDibayar = tagihan.filter((t) => t.status === "pending" || t.status === "ditolak");
  const sudahDibayar = mappings.filter((m) => m.tagihan.some((t) => t.status === "lunas")).reduce((s, m) => s + m.nominalTanggungan, 0);
  const belumDibayar = mappings.filter((m) => !m.tagihan.some((t) => t.status === "lunas")).reduce((s, m) => s + m.nominalTanggungan, 0);

  const ST = { lunas: ["Lunas", "badge-primary"], menunggu_verifikasi: ["Menunggu", "badge-info"], pending: ["Belum", "badge-accent"], ditolak: ["Ditolak", "badge-danger"] } as const;
  const CG = ["var(--accent)", "var(--info)", "var(--muted)", "var(--primary)"];

  return (
    <>
      <div className="grid-2" style={{ gap: 12 }}>
        <div>
          <div className="receipt-card" style={{ marginTop: 6 }}>
            <div className="label">Total Sudah Dibayar</div>
            <div className="amount" style={{ fontSize: 24 }}>{rupiah(sudahDibayar)}</div>
            <div className="breakdown">{mappings.filter((m) => m.tagihan.some((t) => t.status === "lunas")).length} mahasiswa asuh · sudah diverifikasi LAZISMU</div>
          </div>
          <div className="receipt-jagged"></div>
        </div>
        <div>
          <div className="receipt-card" style={{ marginTop: 6, background: "linear-gradient(155deg,#7C2D12,#9A3B22)" }}>
            <div className="label">Total Belum Dibayar</div>
            <div className="amount" style={{ fontSize: 24 }}>{rupiah(belumDibayar)}</div>
            <div className="breakdown">{mappings.filter((m) => !m.tagihan.some((t) => t.status === "lunas")).length} mahasiswa asuh belum lunas{menunggu ? ` · ${menunggu} menunggu verifikasi` : ""}</div>
          </div>
          <div className="receipt-jagged"></div>
        </div>
      </div>

      <div className="section-title">Mahasiswa Asuh</div>
      {mappings.length === 0 ? (
        <div className="helper-note" style={{ marginTop: 4 }}>Belum ada mahasiswa asuh. Admin akan menambahkan setelah pembayaran pertama di-ACC.</div>
      ) : mappings.map((m, idx) => {
        const ipk = m.mahasiswa.ipkHistory[m.mahasiswa.ipkHistory.length - 1];
        const t = m.tagihan[0];
        const st = t ? ST[t.status] ?? ["Aktif", "badge-primary"] : ["Aktif", "badge-primary"];
        return (
          <div className="donor-card" key={m.id}>
            <div className="avatar" style={{ background: CG[idx % CG.length] }}>{initial(m.mahasiswa.nama)}</div>
            <div className="grow">
              <strong>{m.mahasiswa.nama}</strong>
              <span className="sub mono">NIM {m.mahasiswa.nim} · {ipk ? `IPK ${ipk.nilaiIpk.toFixed(2)}` : "belum ada IPK"}</span>
            </div>
            <span className={`badge ${st[1]}`}>{st[0]}</span>
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
            <span className="sub mono">Ref: {t.kodeReferensiUnik}</span>
          </div>
          <a className="btn btn-primary btn-sm" href="/donatur/tagihan">Bayar</a>
        </div>
      ))}

      <div className="cta-upload">
        <a className="btn btn-primary" href="/donatur/tagihan"><Icon name="upload" size={15} />Unggah Bukti Transfer</a>
      </div>
    </>
  );
}