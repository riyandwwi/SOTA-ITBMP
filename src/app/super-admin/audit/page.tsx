import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader, Card, Badge, Empty } from "@/components/ui";
import { Icon } from "@/components/icons";
import { waktu } from "@/lib/format";

const AKSI = ["login", "logout", "acc", "tolak", "create", "update", "delete", "matching", "arsipkan", "lihat_password", "billing"];

export default async function AuditPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = await searchParams;
  const filter = typeof q.aksi === "string" ? q.aksi : "semua";
  const dari = typeof q.dari === "string" ? new Date(q.dari) : null;
  const sampai = typeof q.sampai === "string" ? new Date(q.sampai) : null;

  await requireUser(["super_admin"]);

  const logs = await prisma.auditLog.findMany({
    where: {
      ...(filter !== "semua" ? { jenisAksi: filter } : {}),
      ...(dari ? { timestamp: { gte: dari } } : {}),
      ...(sampai ? { timestamp: { lte: sampai } } : {}),
    },
    orderBy: { timestamp: "desc" },
    take: 200
  });

  const ekspor = `/api/export/audit-log${filter !== "semua" ? `?aksi=${filter}` : ""}`;

  function badgeTone(j: string) {
    if (["acc"].includes(j)) return "primary";
    if (["tolak"].includes(j)) return "danger";
    if (["login", "logout"].includes(j)) return "muted";
    return "info";
  }

  return (
    <>
      <PageHeader title="Audit Log" sub="Jejak seluruh aktivitas login, transaksi & perubahan data"
        actions={<a className="btn btn-ghost btn-sm" href={ekspor}><Icon name="download" size={14} />Unduh Excel</a>} />

      <Card title="Riwayat Aktivitas" noPad>
        <div className="filter-chips">
          <a className={`chip${filter === "semua" ? " active" : ""}`} href="/super-admin/audit">Semua</a>
          {AKSI.map((a) => (
            <a key={a} className={`chip${filter === a ? " active" : ""}`} href={`/super-admin/audit?aksi=${a}`}>{a}</a>
          ))}
        </div>
        <div className="table-wrap" style={{ paddingTop: 6 }}>
          <table>
            <thead><tr><th>Waktu</th><th>User</th><th>Aksi</th><th>Entitas</th><th>Detail</th></tr></thead>
            <tbody>
              {logs.length === 0 ? <tr><td colSpan={5}><Empty /></td></tr> :
                logs.map((l) => (
                  <tr key={l.id}>
                    <td className="mono">{waktu(l.timestamp)}</td>
                    <td>{l.userId ? `#${l.userId.slice(0, 6)}` : "sistem"}</td>
                    <td><Badge text={l.jenisAksi} tone={badgeTone(l.jenisAksi)} /></td>
                    <td>{l.entitas}</td>
                    <td className="mono" style={{ color: "var(--muted)", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.detailPerubahan || l.status || "—"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}