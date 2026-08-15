"use client";

import { usePathname } from "next/navigation";
import { Icon } from "./icons";
import type { NavSection } from "@/lib/nav";

export function SidebarNav({ sections }: { sections: NavSection[] }) {
  const pathname = usePathname();
  return (
    <>
      {sections.map((sec) => (
        <div key={sec.label}>
          <div className="sidebar-label">{sec.label}</div>
          {sec.items.map((it) => {
            const active = pathname === it.href || (it.href !== "/" && pathname.startsWith(it.href));
            return (
              <a key={it.href} href={it.href} className={`nav-item${active ? " active" : ""}`}>
                <Icon name={it.icon} />
                {it.label}
              </a>
            );
          })}
        </div>
      ))}
    </>
  );
}