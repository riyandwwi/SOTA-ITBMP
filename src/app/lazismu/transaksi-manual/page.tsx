import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader, Card } from "@/components/ui";
import TransaksiManualForm from "@/components/transaksi-manual-form";

export default async function TransaksiManualPage() {
  await requireUser(["lazismu"]);
  const donaturs = await prisma.donatur.findMany({
    include: {
      user: true,
      mappingBeasiswa: {
        where: { status: "aktif" },
        include: { mahasiswa: true, tagihan: true },
      },
    },
  });
  const withAsuh = donaturs.filter((d) => d.mappingBeasiswa.length > 0);

  return (
    <>
      <PageHeader title="Transaksi Manual" sub="Catat pembayaran donatur yang transfer langsung (mis. donatur gaptek dibantu staf)" />
      <div style={{ maxWidth: 480 }}>
        <Card title="Input Pembayaran Manual" hint="Hasil catatan masuk antrean verifikasi dulu">
          <TransaksiManualForm
            donaturs={withAsuh.map((d) => ({
              id: d.id,
              nama: d.user.nama,
              asuh: d.mappingBeasiswa[0].mahasiswa.nama,
              nominalBulan: d.mappingBeasiswa[0].nominalTanggungan,
              tagihanBelum: d.mappingBeasiswa[0].tagihan.filter((t) => t.status === "pending" || t.status === "ditolak").length,
            }))}
          />
        </Card>
        <div className="helper-note">Donatur yang belum paham teknologi bisa dibantu: pilih donatur, set tanggal transfer, pilih cakupan, isi nominal & upload bukti—semuanya dicatat atas nama SOTA ITBMP lalu diverifikasi.</div>
      </div>
    </>
  );
}