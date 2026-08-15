"use client";

import { useActionState } from "react";
import { ajukanRekeningAction } from "@/lib/actions";

export default function AjukanRekeningForm() {
  const [state, formAction, pending] = useActionState(ajukanRekeningAction, {});

  return (
    <form action={formAction}>
      {state?.ok ? <div className="alert alert-success">Rekening diajukan, menunggu ACC Pimpinan/Super Admin.</div> : null}
      {state?.error ? <div className="alert alert-error">{state.error}</div> : null}
      <label className="field-label">Nama Bank</label>
      <input className="input mb14" name="namaBank" placeholder="Contoh: BSI" required />
      <label className="field-label">Nomor Rekening</label>
      <input className="input mb14 mono" name="nomorRekening" placeholder="7001234509" required />
      <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={pending}>
        {pending ? "Mengirim…" : "Ajukan Rekening"}
      </button>
    </form>
  );
}