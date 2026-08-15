import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader, StatCard, Card, Badge, Avatar, Empty } from "@/components/ui";
import { Icon } from "@/components/icons";
import { DonutChart, DonutLegend } from "@/components/charts";
import { waktu } from "@/lib/format";
import { approveRekeningAction, rejectRekeningAction, deleteAccountAction } from "@/lib/actions";

async function getData() {
  const [users, mahasiswa, donaturs, rek, auditLogs] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, include: { donatur: true, dibuatOleh: true } }),
    prisma.mahasiswa.count(),
    prisma.mappingBeasiswa.findMany({ where: { status: "aktif" }, distinct: ["donaturId"] }),
    prisma.rekeningBank.findMany({ where: { status: "pending" } }),
    prisma.auditLog.findMany({ take: 6, orderBy: { timestamp: "desc" } }),
  ]);
  return { users, mahasiswa, donaturs: donaturs.length, rek, auditLogs };
}

function badgeRole(role: string) {
  const map: Record<string, string> = { super_admin: "danger", admin_akademik: "info", lazismu: "accent", donatur: "primary", pimpinan: "muted" };
  return map[role] || "muted";
}

export default async function SuperAdminDashboard() {
  await requireUser(["super_admin"]);
  const { users, mahasiswa, donaturs, rek, auditLogs } = await getData();

  const roleDist = [
    { name: "Donatur", value: users.filter((u) => u.role === "donatur").length },
    { name: "LAZISMU", value: users.filter((u) => u.role === "lazismu").length },
    { name: "Akademik", value: users.filter((u) => u.role === "admin_akademik").length },
    { name: "Lainnya", value: users.filter((u) => !["donatur", "lazismu", "admin_akademik"].includes(u.role)).length },
  ];

  return (
    <>
      <PageHeader title="Dashboard Super Admin" sub="Ringkasan sistem & akses penuh ke seluruh modul" />

      <div className="stat-grid">
        <StatCard label="Total Akun" value={String(users.length)} delta="5 role aktif" />
        <StatCard label="Mahasiswa Aktif" value={String(mahasiswa)} delta="Terdaftar di sistem" />
        <StatCard label="Donatur Aktif" value={String(donaturs)} delta="Memiliki mahasiswa asuh" />
        <StatCard label="Rekening Menunggu ACC" value={String(rek.length)} delta="Perlu ditinjau" tone="accent" deltaTone="var(--accent)" />
      </div>

      <div className="grid-2">
        <div>
          <Card title="Manajemen Akun" hint="Seluruh pengguna sistem lintas peran"
            actions={<a className="btn btn-primary btn-sm" href="/super-admin/akun"><Icon name="plus" size={14} />Buat Akun</a>}>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Nama</th><th>Role</th><th>Dibuat Oleh</th><th></th></tr></thead>
                <tbody>
                  {users.slice(0, 5).map((u) => (
                    <tr key={u.id}>
                      <td><div className="cell-name"><Avatar nama={u.nama} /><div><b>{u.nama}</b><span className="sub">{u.email}</span></div></div></td>
                      <td><Badge text={u.role} tone={badgeRole(u.role)} /></td>
                      <td>{u.dibuatOleh?.nama ?? "seed"}</td>
                      <td>
                        <div className="row-actions">
                          {u.role !== "super_admin" && u.id !== u.dibuatOlehId ? (
                            <form action={deleteAccountAction}><input type="hidden" name="id" value={u.id} /><button className="btn-icon" title="Hapus"><Icon name="trash" size={13} /></button></form>
                          ) : <span className="mono" style={{ marginLeft: 15 }}>—</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Audit Log Terbaru" hint="Seluruh aktivitas login, transaksi & perubahan data"
            actions={<a className="btn btn-ghost btn-sm" href="/api/export/audit-log"><Icon name="download" size={14} />Unduh Excel</a>}>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Waktu</th><th>Aksi</th><th>Entitas</th></tr></thead>
                <tbody>
                  {auditLogs.map((l) => (
                    <tr key={l.id}><td className="mono">{waktu(l.timestamp)}</td>
                      <td><Badge text={l.jenisAksi} tone="info" /></td><td>{l.entitas}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div>
          <Card title="Persetujuan Rekening Bank">
            {rek.length === 0 ? <Empty message="Tidak ada rekening menunggu ACC." /> :
              rek.map((r) => (
                <div className="list-item" key={r.id}>
                  <div className="thumb"><Icon name="bank" /></div>
                  <div className="grow">
                    <div className="top-row"><strong style={{ fontSize: 13 }}>{r.namaBank} — {r.nomorRekening}</strong><Badge text="pending" tone="accent" /></div>
                    <div className="meta">a.n. {r.atasNama}</div>
                    <div className="list-actions">
                      <form action={approveRekeningAction}><input type="hidden" name="id" value={r.id} /><button className="btn btn-primary btn-sm">Setujui</button></form>
                      <form action={rejectRekeningAction}><input type="hidden" name="id" value={r.id} /><button className="btn btn-ghost btn-sm">Tolak</button></form>
                    </div>
                  </div>
                </div>
              ))}
          </Card>

          <Card title="Distribusi Akun per Role">
            <DonutChart data={roleDist} />
            <DonutLegend data={roleDist} />
          </Card>
        </div>
      </div>
    </>
  );
}