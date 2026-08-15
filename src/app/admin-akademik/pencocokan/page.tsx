import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader, Card, Avatar, Empty } from "@/components/ui";
import { rupiah } from "@/lib/format";
import MatchingForm from "@/components/matching-form";

export default async function PencocokanPage() {
  await requireUser(["admin_akademik"]);

  const [butuh, donaturs, mappings] = await Promise.all([
    prisma.mahasiswa.findMany({ where: { statusAktif: "aktif", statusCover: "belum_ada_donatur" } }),
    prisma.donatur.findMany({ include: { user: true, mappingBeasiswa: { where: { status: "aktif" } } } }),
    prisma.mappingBeasiswa.findMany({
      where: { status: "aktif" },
      include: { mahasiswa: true, donatur: { include: { user: true } } },
    }),
  ]);

  const donors = donaturs.map((d) => ({ id: d.id, nama: d.user.nama, pakai: d.mappingBeasiswa.length, target: d.jumlahMahasiswaTarget }));
  const donorsMemenuhi = donors.filter((d) => d.pakai < d.target);

  return (
    <>
      <PageHeader title="Pencocokan Donatur" sub="1 mahasiswa : 1 donatur — pendanaan penuh" />
      <div className="grid-2">
        <div>
          <Card title="Pencocokan Aktif" hint="Daftar donatur yang sedang mensponsori mahasiswa">
            <div className="table-wrap">
              <table>
                <thead><tr><th>Donatur</th><th>Mahasiswa</th><th>Nominal / Bulan</th><th>Mulai</th></tr></thead>
                <tbody>
                  {mappings.length === 0 ? <tr><td colSpan={4}><Empty message="Belum ada pencocokan." /></td></tr> :
                    mappings.map((mp) => (
                      <tr key={mp.id}>
                        <td><div className="cell-name"><Avatar nama={mp.donatur.user.nama} tone="var(--primary)" /><b>{mp.donatur.user.nama}</b></div></td>
                        <td>{mp.mahasiswa.nama}</td>
                        <td className="mono">{rupiah(mp.nominalTanggungan)}</td>
                        <td className="mono">{mp.tanggalMulai.toLocaleDateString("id-ID")}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div>
          <Card title="Cocokkan Mahasiswa → Donatur" hint="Pilih mahasiswa & donatur lalu konfirmasi">
            {butuh.length === 0 ? <Empty message="Tidak ada mahasiswa yang butuh donatur saat ini." /> :
              donorsMemenuhi.length === 0 ? <Empty message="Semua donatur sudah mencapai target kuota." /> :
              <MatchingForm candidates={butuh.map((m) => ({ id: m.id, nama: m.nama, nim: m.nim, prodi: m.prodi, semester: m.semester, kebutuhan: m.nominalKebutuhanPerBulan }))} donors={donorsMemenuhi} />}
          </Card>
        </div>
      </div>
    </>
  );
}