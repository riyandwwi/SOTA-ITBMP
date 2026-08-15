"use client";

import { useActionState } from "react";
import { ajukanGantiAction } from "@/lib/actions";

export default function AjukanGanti({ mappingId, mahasiswaNama }: { mappingId: string; mahasiswaNama: string }) {
  const [state, formAction, pending] = useActionState(ajukanGantiAction, {});

  return (
    <form action={formAction}>
      <input type="hidden" name="mappingId" value={mappingId} />
      {state?.ok ? <div className="alert alert-success">Pengajuan pergantian {mahasiswaNama} dikirim. Admin Akademik akan memproses.</div> : null}
      {state?.error ? <div className="alert alert-error">{state.error}</div> : null}
      <label className="field-label">Alasan Pergantian</label>
      <input className="input mb14" name="alasan" placeholder="Mis: mahasiswa sudah tidak aktif / ingin ganti" />
      <button className="btn btn-danger-ghost btn-sm" disabled={pending} style={{ width: "100%", justifyContent: "center" }}>
        {pending ? "Mengirim…" : "Ajukan Ganti Mahasiswa Asuh"}
      </button>
    </form>
  );
}