import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader, Card, Empty } from "@/components/ui";
import VerifikasiItem from "@/components/verifikasi-item";

export default async function VerifikasiPage() {
  await requireUser(["lazismu"]);
  const pembayaran = await prisma.pembayaran.findMany({
    where: { status: "menunggu" },
    orderBy: { tanggalTransfer: "desc" },
    include: {
      tagihan: {
        include: {
          mappingBeasiswa: { include: { donatur: { include: { user: true } }, mahasiswa: true } },
        },
      },
    },
  });

  return (
    <>
      <PageHeader title="Verifikasi Pembayaran" sub="Bukti transfer yang menunggu persetujuan" />
      <Card title={`Antrean (${pembayaran.length})`} hint="ACC membuat tagihan lunas + STT + notifikasi, dalam satu transaksi">
        {pembayaran.length === 0 ? <Empty message="Tidak ada bukti transfer yang menunggu verifikasi. ✅" /> :
          pembayaran.map((p) => <VerifikasiItem key={p.id} pembayaran={p} />)}
      </Card>
    </>
  );
}