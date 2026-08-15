"use client";

import { useActionState } from "react";
import { createAccountAction } from "@/lib/actions";

export default function CreateAccountForm({ showAllRoles = false }: { showAllRoles?: boolean }) {
  const [state, formAction, pending] = useActionState(createAccountAction, {});

  return (
    <form action={formAction}>
      {state?.error ? <div className="alert alert-error">{state.error}</div> : null}
      {state?.ok ? <div className="alert alert-success">Akun berhasil dibuat.</div> : null}

      <label className="field-label">Peran (Role)</label>
      <select className="input mb14" name="role" defaultValue="donatur">
        {showAllRoles ? (
          <>
            <option value="donatur">Donatur</option>
            <option value="admin_akademik">Admin Akademik</option>
            <option value="lazismu">SOTA ITBMP</option>
            <option value="pimpinan">Pimpinan</option>
          </>
        ) : (
          <option value="donatur">Donatur</option>
        )}
      </select>

      <label className="field-label">Nama Lengkap</label>
      <input className="input mb14" name="nama" required />

      <label className="field-label">Email</label>
      <input className="input mb14" type="email" name="email" required />

      <label className="field-label">Nomor WhatsApp (khusus Donatur)</label>
      <input className="input mb14" name="kontakWa" placeholder="081234567890" />

      <label className="field-label">Jumlah Mahasiswa Target (khusus Donatur)</label>
      <input className="input mb14" type="number" min={1} defaultValue={1} name="target" />

      <div className="grid-2" style={{ gridTemplateColumns: "1fr 1fr", gap: 10, alignItems: "start" }}>
        <div>
          <label className="field-label">Username</label>
          <input className="input mb14" name="username" required />
        </div>
        <div>
          <label className="field-label">Password Awal</label>
          <input className="input mb14" type="text" name="password" required />
        </div>
      </div>

      <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={pending}>
        {pending ? "Menyimpan…" : "Buat Akun"}
      </button>
    </form>
  );
}