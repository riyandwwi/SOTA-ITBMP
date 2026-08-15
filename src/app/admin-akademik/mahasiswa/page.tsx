import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader, Card, Badge, Avatar, Empty } from "@/components/ui";
import { Icon } from "@/components/icons";
import { rupiah } from "@/lib/format";
import CreateMahasiswaForm from "@/components/create-mahasiswa-form";
import HapusMahasiswa from "@/components/hapus-mahasiswa";

function badgeFor(m: { statusAktif: string; statusCover: string }): [string, string] {
  if (m.statusAktif === "diarsipkan") return ["diarsipkan", "muted"];
  if (m.statusCover === "sudah_ada_donatur") return ["sudah ada donatur", "primary"];
  return ["belum ada donatur", "accent"];
}

export default async function MahasiswaPage({
  searchParams,
}: { searchParams: Promise<{ ta?: string; smt?: string }> }) {
  await requireUser(["admin_akademik"]);
  const sp = await searchParams;
  const taFilter = sp.ta || "all";
  const smtFilter = sp.smt || "all";

  const all = await prisma.mahasiswa.findMany({
    orderBy: [{ tahunAkademik: "desc" }, { semester: "asc" }],
    include: { mappingBeasiswa: { where: { status: "aktif" }, include: { donatur: { include: { user: true } } } } },
  });

  const tahunList = Array.from(new Set(all.map((m) => m.tahunAkademik || "Tanpa TA"))).sort().reverse();
  const semesterList = Array.from(new Set(all.map((m) => m.semester))).sort((a, b) => a - b);

  const filtered = all.filter((m) => {
    if (taFilter !== "all" && (m.tahunAkademik || "Tanpa TA") !== taFilter) return false;
    if (smtFilter !== "all" && m.semester !== Number(smtFilter)) return false;
    return true;
  });

  const groups = new Map<string, { smt: number; items: typeof filtered }[]>();
  for (const m of filtered) {
    const ta = m.tahunAkademik || "Tanpa TA";
    if (!groups.has(ta)) groups.set(ta, []);
    const arr = groups.get(ta)!;
    let g = arr.find((x) => x.smt === m.semester);
    if (!g) { g = { smt: m.semester, items: [] }; arr.push(g); }
    g.items.push(m);
  }

  return (
    <>
      <PageHeader title="Data Mahasiswa" sub="Kelompokan per tahun akademik & semester" />

      <div className="card" style={{ padding: "14px 16px", marginBottom: 16 }}>
        <form method="get" className="list-actions">
          <Icon name="search" size={15} />
          <select className="input" name="ta" style={{ flex: 1 }}>
            <option value="all">Semua Tahun Akademik</option>
            {tahunList.map((t) => <option key={t} value={t} selected={taFilter === t}>{t}</option>)}
          </select>
          <select className="input" name="smt" style={{ flex: 1 }}>
            <option value="all">Semua Semester</option>
            {semesterList.map((s) => <option key={s} value={s} selected={smtFilter === String(s)}>Semester {s}</option>)}
          </select>
          <button className="btn btn-primary btn-sm">Terapkan</button>
        </form>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: "1fr 360px" }}>
        <div>
          {groups.size === 0 ? <Card><Empty message="Tidak ada mahasiswa sesuai filter." /></Card> :
            Array.from(groups.entries()).map(([ta, arr]) => (
              <Card key={ta} noPad title={`${ta} — ${arr.reduce((s, g) => s + g.items.length, 0)} mahasiswa`}>
                {arr.sort((a, b) => a.smt - b.smt).map((g) => (
                  <div key={g.smt}>
                    <div className="group-label">Semester {g.smt}</div>
                    <div className="table-wrap">
                      <table>
                        <thead><tr><th>Mahasiswa</th><th>Prodi</th><th>Kebutuhan</th><th>Status</th><th>Donatur</th><th></th></tr></thead>
                        <tbody>
                          {g.items.map((m) => {
                            const mapping = m.mappingBeasiswa[0];
                            const [txt, tone] = badgeFor(m);
                            return (
                              <tr key={m.id}>
                                <td><div className="cell-name"><Avatar nama={m.nama} tone={m.statusCover === "sudah_ada_donatur" ? undefined : "var(--accent)"} /><div><a href={`/admin-akademik/mahasiswa/${m.id}`} style={{ color: "var(--ink)", textDecoration: "none" }}><b>{m.nama}</b></a><span className="sub mono">{m.nim}</span></div></div></td>
                                <td>{m.prodi}</td>
                                <td className="mono">{rupiah(m.nominalKebutuhanPerSemester)}</td>
                                <td><Badge text={txt} tone={tone} /></td>
                                <td>{mapping ? mapping.donatur.user.nama : "—"}</td>
                                <td><HapusMahasiswa id={m.id} nama={m.nama} variant="icon" /></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </Card>
            ))}
        </div>

        <Card title="Tambah Mahasiswa" hint="Semester maksimal 14 · tahun akademik opsional">
          <CreateMahasiswaForm />
        </Card>
      </div>
    </>
  );
}