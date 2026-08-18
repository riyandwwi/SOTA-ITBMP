"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "./icons";
import type { IconName } from "./icons";
import type { NavSection } from "@/lib/nav";

export function MobileNav({ sections }: { sections: NavSection[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        className="topbar-hamburger"
        aria-label="Buka menu"
        onClick={() => setOpen(true)}
      >
        <Icon name="bars" size={20} />
      </button>

      {open && <div className="drawer-overlay" onClick={() => setOpen(false)} />}

      <aside className={`drawer${open ? " open" : ""}`} aria-hidden={!open}>
        <div className="drawer-head">
          <strong>Menu</strong>
          <button type="button" className="drawer-close" aria-label="Tutup menu" onClick={() => setOpen(false)}>
            <Icon name="x" size={18} />
          </button>
        </div>

        <nav className="drawer-nav">
          {sections.map((sec) => (
            <div key={sec.label}>
              <div className="drawer-label">{sec.label}</div>
              {sec.items.map((it) => {
                const active =
                  pathname === it.href || (it.href !== "/" && pathname.startsWith(it.href));
                return (
                  <a
                    key={it.href}
                    href={it.href}
                    className={`drawer-item${active ? " active" : ""}`}
                    onClick={() => setOpen(false)}
                  >
                    <Icon name={it.icon as IconName} />
                    {it.label}
                  </a>
                );
              })}
            </div>
          ))}
        </nav>

        <form action="/api/logout" method="post" className="drawer-footer" style={{ marginTop: "auto" }}>
          <button type="submit" className="drawer-logout">
            <Icon name="logout" size={16} />
            Keluar
          </button>
        </form>
      </aside>
    </>
  );
}