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

  const groups = new Map<string, typeof pembayaran>();
  for (const p of pembayaran) {
    const key = p.batchId ?? `single-${p.id}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }
  const list = Array.from(groups.values());

  return (
    <>
      <PageHeader title="Verifikasi Pembayaran" sub="Bukti transfer yang menunggu persetujuan" />
      <Card title={`Antrean (${pembayaran.length} pembayaran · ${list.length} grup)`} hint="ACC melunasi seluruh bulan dalam satu grup, lalu tagihan lunas + STT + notifikasi">
        {list.length === 0 ? <Empty message="Tidak ada bukti transfer yang menunggu verifikasi. ✅" /> :
          list.map((items) => <VerifikasiItem key={items[0].id} items={items} />)}
      </Card>
    </>
  );
}