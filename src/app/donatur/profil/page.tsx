import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { rupiah } from "@/lib/format";
import { Icon } from "@/components/icons";
import ProfileForm from "@/components/profile-form";

export default async function DonaturProfilPage() {
  const user = await requireUser(["donatur"]);
  const donatur = await prisma.donatur.findUnique({ where: { id: user.donatur!.id }, include: { mappingBeasiswa: true } });

  const totalBayar = await prisma.tagihan.aggregate({
    where: { mappingBeasiswa: { donaturId: user.donatur!.id }, status: "lunas" },
    _sum: { nominalHarusDibayar: true },
  });
  const asuh = donatur?.mappingBeasiswa.length ?? 0;

  return (
    <>
      <div className="donor-card" style={{ marginTop: 8 }}>
        <div className="avatar" style={{ background: "var(--primary)" }}>{user.nama[0]}</div>
        <div className="grow">
          <strong>{user.nama}</strong>
          <span className="sub mono">{user.username} · Donatur</span>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 12 }}>
        <div className="stat-card"><div className="value mono">{rupiah(totalBayar._sum.nominalHarusDibayar ?? 0)}</div><div className="label">Total Donasi</div></div>
        <div className="stat-card"><div className="value">{asuh}</div><div className="label">Mahasiswa Asuh</div></div>
      </div>

      <div className="section-title">Pengaturan Akun</div>
      <div className="card">
        <ProfileForm currentUsername={user.username} />
      </div>
      <div style={{ height: 12 }} />
    </>
  );
}