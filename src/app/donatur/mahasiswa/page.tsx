import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { rupiah, initial } from "@/lib/format";
import { Icon } from "@/components/icons";
import { IpLineChart } from "@/components/charts";
import AjukanGanti from "@/components/ajukan-ganti";

export default async function DonaturMahasiswaPage() {
  const user = await requireUser(["donatur"]);
  const mappings = await prisma.mappingBeasiswa.findMany({
    where: { donaturId: user.donatur!.id, status: "aktif" },
    include: { mahasiswa: { include: { ipkHistory: { orderBy: { semester: "asc" }, include: { mataKuliahNilai: true } } } } },
  });

  const CG = ["var(--accent)", "var(--info)", "var(--muted)", "var(--primary)"];

  return (
    <>
      <div className="section-title" style={{ marginTop: 8 }}>Mahasiswa Asuh Saya</div>
      {mappings.length === 0 ? <div className="helper-note">Belum ada mahasiswa asuh.</div> : null}

      {mappings.map((m, idx) => {
        const riwayat = m.mahasiswa.ipkHistory;
        const ipk = riwayat[riwayat.length - 1];
        const chartData = riwayat.map((h) => ({ name: `Smt ${h.semester}`, value: h.nilaiIpk }));
        return (
          <div className="card" key={m.id} style={{ padding: 0 }}>
            <div className="card-head">
              <div className="cell-name">
                <div className="avatar" style={{ background: CG[idx % CG.length] }}>{initial(m.mahasiswa.nama)}</div>
                <div><h3>{m.mahasiswa.nama}</h3><p className="hint mono">{m.mahasiswa.nim} · {m.mahasiswa.prodi}</p></div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className="mono" style={{ fontWeight: 700, fontSize: 15 }}>{ipk ? ipk.nilaiIpk.toFixed(2) : "—"}</span>
                <p className="hint">IPK terakhir</p>
              </div>
            </div>
            <div className="card-body" style={{ paddingTop: 12 }}>
              <div className="section-title" style={{ margin: "0 0 6px" }}>Perkembangan IPK</div>
              {riwayat.length === 0 ? <div className="helper-note">Belum ada data nilai dari Admin Akademik.</div> :
                <IpLineChart data={chartData} />}

              {riwayat.length > 0 && ipk ? (
                <>
                  <div className="section-title" style={{ marginTop: 14 }}>Nilai — Semester {ipk.semester}</div>
                  <div style={{ overflowX: "auto" }}>
                    <table>
                      <thead><tr><th>Mata Kuliah</th><th>SKS</th><th>Nilai</th><th>Bobot</th></tr></thead>
                      <tbody>
                        {ipk.mataKuliahNilai.map((mk) => (
                          <tr key={mk.id}><td>{mk.namaMataKuliah}</td><td>{mk.sks}</td><td>{mk.nilaiHuruf}</td><td className="mono">{mk.bobotNilai.toFixed(2)}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : null}

              <div style={{ marginTop: 14 }}>
                <AjukanGanti mappingId={m.id} mahasiswaNama={m.mahasiswa.nama} />
              </div>
            </div>
          </div>
        );
      })}

      <div style={{ height: 12 }} />
    </>
  );
}