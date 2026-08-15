import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader, Card, Badge, Empty } from "@/components/ui";
import { Icon } from "@/components/icons";
import { tanggal } from "@/lib/format";
import AjukanRekeningForm from "@/components/ajukan-rekening-form";

const badgeTone: Record<string, string> = { pending: "accent", aktif: "primary", nonaktif: "muted" };

export default async function RekeningLazismuPage() {
  await requireUser(["lazismu"]);
  const rek = await prisma.rekeningBank.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <>
      <PageHeader title="Rekening Bank" sub="Rekening tujuan transfer — aktif setelah di-ACC Pimpinan/Super Admin" />
      <div className="grid-2" style={{ gridTemplateColumns: "1fr 360px" }}>
        <Card title="Daftar Rekening" noPad>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Bank</th><th>No. Rekening</th><th>Diajukan</th><th>Status</th></tr></thead>
              <tbody>
                {rek.length === 0 ? <tr><td colSpan={4}><Empty /></td></tr> :
                  rek.map((r) => (
                    <tr key={r.id}>
                      <td><div className="cell-name"><div className="thumb"><Icon name="bank" /></div><b>{r.namaBank}</b></div></td>
                      <td className="mono">{r.nomorRekening}</td>
                      <td className="mono">{tanggal(r.createdAt)}</td>
                      <td><Badge text={r.status} tone={badgeTone[r.status]} /></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Ajukan Rekening Baru" hint="Menunggu ACC menjadi aktif">
          <AjukanRekeningForm />
        </Card>
      </div>
    </>
  );
}