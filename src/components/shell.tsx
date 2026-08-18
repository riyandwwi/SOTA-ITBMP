import { Icon } from "./icons";
import { Avatar } from "./ui";
import { SidebarNav } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { NAV } from "@/lib/nav";
import { ROLE_LABEL } from "@/lib/auth";
import { initial } from "@/lib/format";
import type { User } from "@prisma/client";

export function AppShell({ user, children }: { user: User; children: React.ReactNode }) {
  const sections = NAV[user.role] ?? [];
  const roleLabel = ROLE_LABEL[user.role] || user.role;

  return (
    <>
      <div className="topbar">
        <MobileNav sections={sections} />
        <a className="brand" href="/">
          <div className="brand-mark">SOTA</div>
          <div className="brand-text">
            <strong>SOTA ITBMP</strong>
            <span>Sistem Orang Tua Asuh</span>
          </div>
        </a>
        <div className="topbar-right">
          <span className="topbar-role">{roleLabel}</span>
          <div className="avatar" style={{ background: user.role === "donatur" ? "var(--accent)" : undefined }}>
            {initial(user.nama)}
          </div>
        </div>
      </div>
      <div className="app-shell">
        <aside className="sidebar">
          <SidebarNav sections={sections} />
          <div className="sidebar-footer">
            <Avatar nama={user.nama} />
            <div className="who">
              <strong>{user.nama}</strong>
              <span>{roleLabel}</span>
            </div>
            <form action={"/api/logout"} method="post" style={{ margin: 0 }}>
              <button type="submit" className="btn-icon" title="Keluar" style={{ border: "none", background: "transparent" }}>
                <Icon name="logout" size={16} />
              </button>
            </form>
          </div>
        </aside>
        <main className="main">{children}</main>
      </div>
    </>
  );
}