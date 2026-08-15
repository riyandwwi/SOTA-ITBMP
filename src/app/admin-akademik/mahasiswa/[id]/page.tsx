import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader, Card, Badge, Avatar } from "@/components/ui";
import { Icon } from "@/components/icons";
import { rupiah, tanggal } from "@/lib/format";
import IpkForm from "@/components/ipk-form";
import HapusMahasiswa from "@/components/hapus-mahasiswa";
import { archiveMahasiswaAction } from "@/lib/actions";

export default async function MahasiswaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireUser(["admin_akademik"]);
  const m = await prisma.mahasiswa.findUnique({
    where: { id },
    include: {
      ipkHistory: { orderBy: { semester: "asc" }, include: { mataKuliahNilai: true } },
      mappingBeasiswa: { include: { donatur: { include: { user: true } } } },
    },
  });
  if (!m) notFound();

  const active = m.mappingBeasiswa.find((x) => x.status === "aktif");
  const ipkTerbaru = m.ipkHistory[m.ipkHistory.length - 1];

  return (
    <>
      <PageHeader title={m.nama} sub={`${m.nim} · ${m.prodi} · Semester ${m.semester}${m.tahunAkademik ? ` · TA ${m.tahunAkademik}` : ""}`}
        actions={
          <>
            <form action={archiveMahasiswaAction}>
              <input type="hidden" name="id" value={m.id} />
              <button className="btn btn-ghost btn-sm"><Icon name="edit" size={14} />Arsipkan</button>
            </form>
            <HapusMahasiswa id={m.id} nama={m.nama} />
          </>
        } />

      <div className="grid-2">
        <div>
          <Card title="Status Pendanaan">
            <div className="list-item">
              <Avatar nama={m.nama} size={40} />
              <div className="grow">
                <div className="top-row">
                  <strong style={{ fontSize: 14 }}>{rupiah(m.nominalKebutuhanPerSemester)} / semester</strong>
                  <Badge text={m.statusCover === "sudah_ada_donatur" ? "Sudah Ada Donatur" : "Belum Ada Donatur"} tone={m.statusCover === "sudah_ada_donatur" ? "primary" : "accent"} />
                </div>
                <div className="meta">
                  {active ? `Didanai ${active.donatur.user.nama} · skema ${active.skemaBayar} · mulai ${tanggal(active.tanggalMulai)}` : "Belum ada donatur aktif."}
                </div>
              </div>
            </div>
            {m.statusAktif === "diarsipkan" ? <Badge text="diarsipkan" tone="muted" /> : null}
          </Card>

          <Card title={`Riwayat IPK (${m.ipkHistory.length} semester)`}>
            {m.ipkHistory.length === 0 ? <p style={{ color: "var(--muted)", fontSize: 13 }}>Belum ada entri nilai.</p> :
              m.ipkHistory.map((h) => (
                <div className="list-item" key={h.id}>
                  <div className="thumb"><Icon name="clipboard" /></div>
                  <div className="grow">
                    <div className="top-row">
                      <strong style={{ fontSize: 13 }}>Semester {h.semester}</strong>
                      <span className="mono" style={{ fontSize: 15, fontWeight: 700, color: h.flagPeringatan ? "var(--danger)" : "var(--primary-dark)" }}>{h.nilaiIpk.toFixed(2)}</span>
                    </div>
                    <div className="meta">{h.mataKuliahNilai.length} mata kuliah · {h.flagPeringatan ? "⚠️ di bawah ambang batas" : "aman"} {h.fileKhsUrl ? "· KHS terunggah" : ""}</div>
                  </div>
                </div>
              ))}
          </Card>

          {ipkTerbaru ? (
            <Card title={`Rincian Nilai — Semester ${ipkTerbaru.semester}`}>
              <table>
                <thead><tr><th>Mata Kuliah</th><th>SKS</th><th>Nilai</th><th>Bobot</th></tr></thead>
                <tbody>
                  {ipkTerbaru.mataKuliahNilai.map((mk) => (
                    <tr key={mk.id}><td>{mk.namaMataKuliah}</td><td>{mk.sks}</td><td>{mk.nilaiHuruf}</td><td className="mono">{mk.bobotNilai.toFixed(2)}</td></tr>
                  ))}
                  <tr style={{ background: "var(--primary-tint)" }}>
                    <td colSpan={3}><b>IPK Semester (otomatis)</b></td><td><b>{ipkTerbaru.nilaiIpk.toFixed(2)}</b></td>
                  </tr>
                </tbody>
              </table>
            </Card>
          ) : null}
        </div>

        <div>
          <Card title="Input / Perbarui Nilai" hint="IPK dihitung otomatis dari bobot × SKS">
            <IpkForm mahasiswaId={m.id} defaultSemester={m.semester} />
          </Card>
        </div>
      </div>
    </>
  );
}