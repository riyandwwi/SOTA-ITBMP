import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader, Card } from "@/components/ui";
import TransaksiManualForm from "@/components/transaksi-manual-form";

export default async function TransaksiManualPage() {
  await requireUser(["lazismu"]);
  const donaturs = await prisma.donatur.findMany({ include: { user: true, mappingBeasiswa: { where: { status: "aktif" }, include: { mahasiswa: true } } } });
  const withAsuh = donaturs.filter((d) => d.mappingBeasiswa.length > 0);

  return (
    <>
      <PageHeader title="Transaksi Manual" sub="Input donasi tunai yang langsung masuk ke kantor" />
      <div style={{ maxWidth: 480 }}>
        <Card title="Input Pembayaran Manual" hint="Dicatat sebagai lunas langsung">
          <TransaksiManualForm donaturs={withAsuh.map((d) => ({ id: d.id, nama: d.user.nama, asuh: d.mappingBeasiswa[0].mahasiswa.nama }))} />
        </Card>
      </div>
    </>
  );
}