import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader, Card, Badge, Avatar, Empty } from "@/components/ui";
import { Icon } from "@/components/icons";
import { waktu } from "@/lib/format";
import { RevealPassword } from "@/components/reveal-password";
import CreateAccountForm from "@/components/create-account-form";
import HapusAkunDialog from "@/components/hapus-akun-dialog";

function badgeRole(role: string) {
  const map: Record<string, string> = { super_admin: "danger", admin_akademik: "info", lazismu: "accent", donatur: "primary", pimpinan: "muted" };
  return map[role] || "muted";
}

export default async function AkunPage() {
  const me = await requireUser(["super_admin"]);
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, include: { dibuatOleh: true, donatur: true } });

  return (
    <>
      <PageHeader title="Manajemen Akun" sub="Buat, lihat password, dan hapus akun seluruh peran" />
      <div className="grid-2" style={{ gridTemplateColumns: "1fr 380px" }}>
        <Card title={`Seluruh Akun (${users.length})`} hint="Klik ikon mata untuk melihat password"
          actions={<a className="btn btn-ghost btn-sm" href="/api/export/audit-log"><Icon name="download" size={14} />Unduh Excel</a>}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>User</th><th>Role</th><th>Dibuat Oleh</th><th>Password</th><th></th></tr></thead>
              <tbody>
                {users.length === 0 ? <tr><td colSpan={5}><Empty /></td></tr> :
                  users.map((u) => (
                    <tr key={u.id}>
                      <td><div className="cell-name"><Avatar nama={u.nama} /><div><b>{u.username}</b><span className="sub">{u.nama}</span></div></div></td>
                      <td><Badge text={u.role} tone={badgeRole(u.role)} /></td>
                      <td>{u.dibuatOleh?.nama ?? "seed"}</td>
                      <td>{u.role === "super_admin" ? <span className="mono">—</span> : <RevealPassword userId={u.id} />}</td>
                      <td>
                        {u.id !== me.id && u.role !== "super_admin" ? (
                          <HapusAkunDialog id={u.id} nama={u.nama} username={u.username} />
                        ) : <span style={{ color: "var(--muted)" }}>—</span>}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Buat Akun" hint="Super Admin dapat membuat seluruh peran">
          <CreateAccountForm showAllRoles />
        </Card>
      </div>
    </>
  );
}