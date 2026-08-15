import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader, Card, Avatar, Badge, Empty } from "@/components/ui";
import { Icon } from "@/components/icons";
import IpkForm from "@/components/ipk-form";
import NilaiSelect from "@/components/nilai-select";
import RolloverSemester from "@/components/rollover-semester";
import { deriveTahunAkademik } from "@/lib/format";

export default async function NilaiPage({ searchParams }: { searchParams: Promise<{ mhs?: string }> }) {
  await requireUser(["admin_akademik"]);
  const q = await searchParams;
  const mahasiswa = await prisma.mahasiswa.findMany({
    where: { statusAktif: "aktif" },
    orderBy: { nama: "asc" },
    include: { ipkHistory: { orderBy: { semester: "desc" }, take: 1 } },
  });
  const selected = mahasiswa.find((m) => m.id === q.mhs) ?? mahasiswa[0];
  const semesterAktif = Math.max(1, ...mahasiswa.map((m) => m.semester));

  return (
    <>
      <PageHeader title="Input Nilai & IPK" sub="IPK semester dihitung otomatis dari bobot nilai × SKS per mata kuliah"
        actions={<RolloverSemester currentSemester={semesterAktif} ta={deriveTahunAkademik()} />} />
      <div className="grid-2">
        <div>
          <Card title="Riwayat IPK Semua Mahasiswa" noPad>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Mahasiswa</th><th>Prodi</th><th>IPK Terakhir</th><th>Status</th></tr></thead>
                <tbody>
                  {mahasiswa.length === 0 ? <tr><td colSpan={4}><Empty /></td></tr> :
                    mahasiswa.map((m) => {
                      const ipk = m.ipkHistory[0];
                      return (
                        <tr key={m.id}>
                          <td><div className="cell-name"><Avatar nama={m.nama} /><div><b>{m.nama}</b><a href={`/admin-akademik/mahasiswa/${m.id}`} style={{ display: "block", color: "var(--info)", fontSize: 11, textDecoration: "none" }}>buka detail →</a></div></div></td>
                          <td>{m.prodi}</td>
                          <td className="mono" style={{ fontWeight: 700 }}>{ipk ? ipk.nilaiIpk.toFixed(2) : "—"}</td>
                          <td>{ipk ? <div className="list-actions">{ipk.flagPeringatan ? <Badge text="peringatan" tone="danger" /> : <Badge text="aman" tone="primary" />}<Icon name="edit" size={13} /></div> : <Badge text="belum ada" tone="muted" />}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div>
          <Card title="Input Nilai" hint="Pilih mahasiswa & masukkan mata kuliah semester berjalan">
            <form action="/admin-akademik/nilai" method="get" style={{ marginBottom: 14 }}>
              <label className="field-label">Pilih Mahasiswa</label>
              <NilaiSelect options={mahasiswa} selected={selected?.id} />
            </form>
            {selected ? <IpkForm key={selected.id} mahasiswaId={selected.id} defaultSemester={selected.semester} /> : null}
          </Card>
        </div>
      </div>
    </>
  );
}