import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader, Card, Badge, Empty } from "@/components/ui";
import { Icon } from "@/components/icons";
import { tanggal } from "@/lib/format";
import { approveRekeningAction, rejectRekeningAction } from "@/lib/actions";

export default async function RekeningPage() {
  await requireUser(["super_admin"]);
  const rek = await prisma.rekeningBank.findMany({
    orderBy: { createdAt: "desc" },
  });

  const badgeTone: Record<string, string> = { pending: "accent", aktif: "primary", nonaktif: "muted" };

  return (
    <>
      <PageHeader title="Rekening Bank" sub="Persetujuan rekening tujuan transfer donasi" />
      <Card title="Daftar Rekening" hint="Rekening aktif menjadi tujuan transfer di portal donatur">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Bank</th><th>No. Rekening</th><th>Atas Nama</th><th>Diajukan</th><th>Status</th><th>Di-ACC</th></tr></thead>
            <tbody>
              {rek.length === 0 ? <tr><td colSpan={6}><Empty /></td></tr> :
                rek.map((r) => (
                  <tr key={r.id}>
                    <td><div className="cell-name"><div className="thumb"><Icon name="bank" /></div><b>{r.namaBank}</b></div></td>
                    <td className="mono">{r.nomorRekening}</td>
                    <td>{r.atasNama}</td>
                    <td className="mono">{tanggal(r.createdAt)}</td>
                    <td><Badge text={r.status} tone={badgeTone[r.status]} /></td>
                    <td>
                      {r.status === "pending" ? (
                        <div className="list-actions">
                          <form action={approveRekeningAction}><input type="hidden" name="id" value={r.id} /><button className="btn btn-primary btn-sm">Setujui</button></form>
                          <form action={rejectRekeningAction}><input type="hidden" name="id" value={r.id} /><button className="btn btn-ghost btn-sm">Tolak</button></form>
                        </div>
                      ) : <span className="mono">{r.tanggalAcc ? tanggal(r.tanggalAcc) : "—"}</span>}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}