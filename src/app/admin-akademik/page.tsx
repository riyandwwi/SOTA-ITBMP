import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader, StatCard, Card, Badge, Avatar, Empty } from "@/components/ui";
import { Icon } from "@/components/icons";
import { rupiah } from "@/lib/format";
import MatchingForm from "@/components/matching-form";
import IpkForm from "@/components/ipk-form";
import RolloverSemester from "@/components/rollover-semester";
import { deriveTahunAkademik } from "@/lib/format";

export default async function AdminAkademikDashboard() {
  await requireUser(["admin_akademik"]);

  const [mahasiswa, butuh, donaturs, avgIpk] = await Promise.all([
    prisma.mahasiswa.findMany({ where: { statusAktif: "aktif" }, orderBy: { createdAt: "asc" } }),
    prisma.mahasiswa.findMany({ where: { statusAktif: "aktif", statusCover: "belum_ada_donatur" } }),
    prisma.donatur.findMany({ include: { user: true, mappingBeasiswa: { where: { status: "aktif" } } } }),
    prisma.ipkHistory.aggregate({ _avg: { nilaiIpk: true } }),
  ]);

  const sudah = mahasiswa.length - butuh.length;
  const donors = donaturs.map((d) => ({ id: d.id, nama: d.user.nama, pakai: d.mappingBeasiswa.length, target: d.jumlahMahasiswaTarget }));
  const donorsMemenuhi = donors.filter((d) => d.pakai < d.target);

  const contohMhs = mahasiswa.find((m) => m.statusCover === "sudah_ada_donatur") ?? mahasiswa[0];
  const semesterAktif = Math.max(1, ...mahasiswa.map((m) => m.semester));
  const taBerjalan = deriveTahunAkademik();

  return (
    <>
      <PageHeader title="Dashboard Admin Akademik" sub={`Data mahasiswa, nilai, dan pencocokan donatur · Semester aktif ${semesterAktif} (TA ${taBerjalan})`}
        actions={<RolloverSemester currentSemester={semesterAktif} ta={taBerjalan} />} />

      <div className="stat-grid">
        <StatCard label="Butuh Donatur" value={String(butuh.length)} delta="Muncul di daftar matching" tone="accent" deltaTone="var(--accent)" />
        <StatCard label="Sudah Ada Donatur" value={String(sudah)} delta={`${Math.round((sudah / Math.max(mahasiswa.length, 1)) * 100)}% dari total`} />
        <StatCard label="Rata-rata IPK" value={(avgIpk._avg.nilaiIpk ?? 0).toFixed(2)} delta="Semua semester" />
        <StatCard label="Perlu Ditinjau 🔴" value={String(mahasiswa.filter((m) => m.statusCover === "belum_ada_donatur").length)} delta="Belum ter-cover" tone="danger" deltaTone="var(--danger)" />
      </div>

      <div className="grid-2">
        <div>
          <Card title="Mahasiswa Butuh Donatur" hint="Belum terikat mapping aktif"
            actions={<a className="btn btn-ghost btn-sm" href="/admin-akademik/mahasiswa"><Icon name="plus" size={14} />Tambah Mahasiswa</a>}>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Mahasiswa</th><th>Prodi / Smt</th><th>Kebutuhan</th><th></th></tr></thead>
                <tbody>
                  {butuh.length === 0 ? <tr><td colSpan={4}><Empty message="Semua mahasiswa sudah punya donatur 🎉" /></td></tr> :
                    butuh.slice(0, 5).map((m) => (
                      <tr key={m.id}>
                        <td><div className="cell-name"><Avatar nama={m.nama} tone="var(--accent)" /><div><b>{m.nama}</b><span className="sub mono">{m.nim}</span></div></div></td>
                        <td>{m.prodi} · {m.semester}</td>
                        <td className="mono">{rupiah(m.nominalKebutuhanPerSemester)}</td>
                        <td><a className="btn btn-primary btn-sm" href="/admin-akademik/pencocokan">Cocokkan</a></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>

          {contohMhs ? (
            <Card title="Input Nilai — Otomatis Hitung IPK" hint={contohMhs.nama}>
              <IpkForm mahasiswaId={contohMhs.id} defaultSemester={contohMhs.semester} />
            </Card>
          ) : null}
        </div>

        <div>
          <Card title="Cocokkan Mahasiswa → Donatur" hint="1 mahasiswa : 1 donatur, pendanaan penuh">
            {butuh.length === 0 ? <Empty message="Tidak ada mahasiswa yang butuh donatur." /> : <MatchingForm candidates={butuh.map((m) => ({ id: m.id, nama: m.nama, nim: m.nim, prodi: m.prodi, semester: m.semester, kebutuhan: m.nominalKebutuhanPerSemester }))} donors={donorsMemenuhi} />}
          </Card>

          <Card title="Status Mahasiswa">
            <div className="list-item"><div className="thumb"><Icon name="cap" /></div><div className="grow"><div className="top-row"><strong style={{ fontSize: 13 }}>Covered</strong><Badge text={`${sudah} mahasiswa`} tone="primary" /></div><div className="meta">Memiliki donatur aktif</div></div></div>
            <div className="list-item"><div className="thumb"><Icon name="alert" /></div><div className="grow"><div className="top-row"><strong style={{ fontSize: 13 }}>Belum Covered</strong><Badge text={`${butuh.length} mahasiswa`} tone="accent" /></div><div className="meta">Muncul di daftar butuh donatur</div></div></div>
          </Card>
        </div>
      </div>
    </>
  );
}