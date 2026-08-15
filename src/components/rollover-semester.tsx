"use client";

import { useActionState } from "react";
import { semesterBaruAction } from "@/lib/actions";
import { Icon } from "./icons";

export default function RolloverSemester({ currentSemester, ta }: { currentSemester: number; ta: string }) {
  const [state, formAction, pending] = useActionState(semesterBaruAction, {});

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm(`Naikkan semester SEMUA mahasiswa aktif ke semester ${currentSemester + 1}?`)) e.preventDefault();
      }}
    >
      {state?.ok ? (
        <div className="alert alert-success" style={{ marginTop: 0 }}>
          Semester naik ke {currentSemester + 1} untuk {state.naik} mahasiswa (TA {state.ta})
          {state.tetap ? ` · ${state.tetap} tetap di semester 14` : ""}.
          <span className="hint" style={{ display: "block" }}>Sekarang input ulang nilai/IPK tiap mahasiswa di halaman Nilai.</span>
        </div>
      ) : null}
      {state?.error ? <div className="alert alert-error" style={{ marginTop: 0 }}>{state.error}</div> : null}
      <button className="btn btn-primary btn-sm" disabled={pending} title="Naikkan semester semua mahasiswa aktif">
        <Icon name="plus" size={14} />{pending ? "Memproses…" : "Buka Semester Baru"}
      </button>
    </form>
  );
}