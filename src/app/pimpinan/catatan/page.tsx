import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { rupiah, initial } from "@/lib/format";
import { PageHeader, Card, Badge } from "@/components/ui";

export default async function PimpinanCatatanPage() {
  await requireUser(["pimpinan"]);
  const mappings = await prisma.mappingBeasiswa.findMany({
    where: { status: "aktif" },
    orderBy: { tanggalMulai: "desc" },
    include: {
      donatur: { include: { user: true } },
      mahasiswa: { include: { ipkHistory: { orderBy: { semester: "desc" } } } },
      tagihan: { orderBy: { tanggalJatuhTempo: "desc" } },
    },
  });

  const CG = ["var(--accent)", "var(--info)", "var(--muted)", "var(--primary)"];

  return (
    <>
      <PageHeader title="Catatan Donatur–Mahasiswa" sub="Relasi asuh aktif dan status pembayarannya" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
        <Card title={`${mappings.length} pasangan asuh aktif`}>
          {mappings.length === 0 ? <p className="hint">Belum ada pasangan aktif.</p> : null}
        </Card>
        {mappings.map((m, idx) => {
          const ipk = m.mahasiswa.ipkHistory[0];
          const t = m.tagihan[0];
          const stt = t?.status;
          const stLabel = stt === "lunas" ? ["Lunas", "primary"] : stt === "menunggu_verifikasi" ? ["Menunggu", "info"] : ["Belum", "accent"];
          return (
            <div className="card" key={m.id} style={{ padding: 0 }}>
              <div className="card-head">
                <div className="cell-name">
                  <div className="avatar" style={{ background: CG[idx % CG.length] }}>{initial(m.mahasiswa.nama)}</div>
                  <div><h3>{m.mahasiswa.nama}</h3><p className="hint mono">{m.mahasiswa.nim} · {m.mahasiswa.prodi}</p></div>
                </div>
                <Badge text={stLabel[0]} tone={stLabel[1] as any} />
              </div>
              <div className="card-body" style={{ paddingTop: 0 }}>
                <div className="list-item" style={{ padding: "8px 0" }}>
                  <div className="thumb" style={{ background: "var(--primary)" }}>{initial(m.donatur.user.nama)}</div>
                  <div className="grow">
                    <div className="top-row"><strong style={{ fontSize: 13 }}>{m.donatur.user.nama}</strong><span className="mono" style={{ fontSize: 11 }}>{ipk ? `IPK ${ipk.nilaiIpk.toFixed(2)}` : "IPK —"}</span></div>
                    <div className="meta">Sejak {new Date(m.tanggalMulai).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</div>
                  </div>
                </div>
                <div className="meta" style={{ marginTop: 6 }}>
                  Tagihan terbaru: <b>{t ? rupiah(t.nominalHarusDibayar) : "—"}</b> · Ref {t?.kodeReferensiUnik ?? "—"} · Periode {t?.periode ?? "—"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}