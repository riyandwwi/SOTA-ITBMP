import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { rupiahShort, rupiah } from "@/lib/format";
import { PageHeader, Card } from "@/components/ui";
import { Icon, type IconName } from "@/components/icons";
import { BarChartCard } from "@/components/charts";

export default async function PimpinanDashboard() {
  await requireUser(["pimpinan"]);
  const [totalDonatur, totalMahasiswa, totalPembayaran] = await Promise.all([
    prisma.donatur.count(),
    prisma.mahasiswa.count(),
    prisma.pembayaran.count({ where: { status: "acc" } }),
  ]);
  const sumPay = await prisma.pembayaran.aggregate({ where: { status: "acc" }, _sum: { nominalDitransfer: true } });
  const lunasAmt = await prisma.tagihan.aggregate({ where: { status: "lunas" }, _sum: { nominalHarusDibayar: true } });

  const pay = await prisma.pembayaran.findMany({ where: { status: "acc" }, select: { tanggalTransfer: true, nominalDitransfer: true } });
  const tags = await prisma.tagihan.findMany({ where: { status: "lunas" }, select: { tanggalJatuhTempo: true, nominalHarusDibayar: true } });
  const months = Array.from(new Set([
    ...pay.map((p) => new Date(p.tanggalTransfer).toISOString().slice(0, 7)),
    ...tags.map((t) => new Date(t.tanggalJatuhTempo).toISOString().slice(0, 7)),
  ])).sort().slice(-6);
  const bar = months.map((mo) => {
    const mm = new Date(mo + "-01T00:00:00Z").getTime();
    return {
      name: new Date(mo + "-01T00:00:00Z").toLocaleDateString("id-ID", { month: "short" }),
      a: tags.filter((t) => new Date(t.tanggalJatuhTempo).getTime() >= mm && new Date(t.tanggalJatuhTempo).getTime() < mm + 31 * 86400000).reduce((s, t) => s + t.nominalHarusDibayar, 0),
      b: pay.filter((p) => new Date(p.tanggalTransfer).getTime() >= mm && new Date(p.tanggalTransfer).getTime() < mm + 31 * 86400000).reduce((s, p) => s + p.nominalDitransfer, 0),
    };
  });

  return (
    <>
      <PageHeader title="Dashboard Pimpinan" sub="Pantauan ringkas donasi beasiswa LAZISMU" />
      <div className="stat-row">
        {[{ icon: "users", label: "Donatur", value: totalDonatur }, { icon: "cap", label: "Mahasiswa", value: totalMahasiswa }, { icon: "wallet", label: "Pembayaran ACC", value: totalPembayaran }, { icon: "bank", label: "Dana Masuk", value: rupiahShort(sumPay._sum?.nominalDitransfer ?? 0) }].map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="mini-ico"><Icon name={s.icon as IconName} size={16} /></div>
            <div className="label">{s.label}</div>
            <div className="value">{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
        <Card title="Donasi Masuk & Lunas Terverifikasi">
          <div className="kpi"><span className="mono kpi-num">{rupiah(sumPay._sum?.nominalDitransfer ?? 0)}</span><span className="kpi-label hint">Total Dana Masuk (Terverifikasi)</span></div>
          <div className="kpi"><span className="mono kpi-num">{rupiah(lunasAmt._sum?.nominalHarusDibayar ?? 0)}</span><span className="kpi-label hint">Total Tagihan Lunas</span></div>
        </Card>
        <Card title="Tren Donasi (6 Bulan Terakhir)">
          <BarChartCard data={bar} />
        </Card>
      </div>
    </>
  );
}