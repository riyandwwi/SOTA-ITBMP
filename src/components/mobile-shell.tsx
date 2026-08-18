import { requireUser } from "@/lib/auth";
import { Icon } from "./icons";
import { ROLE_LABEL } from "@/lib/auth";
import type { IconName } from "./icons";
import { initial } from "@/lib/format";

const TABS: { label: string; href: string; icon: IconName }[] = [
  { label: "Beranda", href: "/donatur", icon: "home" },
  { label: "Mahasiswa", href: "/donatur/mahasiswa", icon: "cap" },
  { label: "Tagihan", href: "/donatur/tagihan", icon: "list" },
  { label: "Profil", href: "/donatur/profil", icon: "user" },
];

export async function MobileShell({ children }: { children: React.ReactNode }) {
  const user = await requireUser(["donatur"]);

  return (
    <div className="phone-screen">
      <header className="mobile-header" style={{ maxWidth: 600, margin: "0 auto", width: "100%" }}>
        <div>
          <h2>Assalamu&apos;alaikum, {user.nama.split(" ")[0]} 👋</h2>
          <p className="sub">{user.nama} · {ROLE_LABEL[user.role]}</p>
        </div>
        <div className="header-actions">
          <form action="/api/logout" method="post" style={{ margin: 0 }}>
            <button className="icon-btn" title="Keluar" aria-label="Keluar"><Icon name="logout" size={18} /></button>
          </form>
        </div>
      </header>
      <div className="mobile-body">{children}</div>
      <nav className="bottom-tabbar">
        {TABS.map((t) => (
          <a key={t.href} href={t.href}><Icon name={t.icon} />{t.label}</a>
        ))}
      </nav>
    </div>
  );
}