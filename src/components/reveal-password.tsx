"use client";

import { useState, useTransition } from "react";
import { revealPasswordAction } from "@/lib/actions";
import { Icon } from "./icons";

export function RevealPassword({ userId }: { userId: string }) {
  const [pending, start] = useTransition();
  const [pw, setPw] = useState<string | null>(null);

  function run() {
    const fd = new FormData();
    fd.set("id", userId);
    start(async () => {
      const res = await revealPasswordAction(fd);
      setPw(res.password ?? res.error ?? null);
    });
  }

  return (
    <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
      {pw ? (
        <>
          <span className="mono" style={{ color: "var(--primary-dark)", fontWeight: 600 }}>{pw}</span>
          <button className="btn-icon" title="Sembunyikan" onClick={() => setPw(null)}><Icon name="x" size={13} /></button>
        </>
      ) : (
        <button className="btn-icon" title="Lihat password" disabled={pending} onClick={run}>
          <Icon name="eye" size={13} />
        </button>
      )}
    </span>
  );
}