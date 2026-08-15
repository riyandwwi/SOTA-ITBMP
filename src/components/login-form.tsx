"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, {});

  return (
    <form action={formAction} className="mb14">
      {state?.error ? <div className="alert alert-error">{state.error}</div> : null}
      <label className="field-label">Username</label>
      <input className="input mb14" name="username" autoComplete="username" required autoFocus />
      <label className="field-label">Password</label>
      <input className="input mb14" type="password" name="password" autoComplete="current-password" required />
      <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px" }} disabled={pending}>
        {pending ? "Memproses…" : "Masuk"}
      </button>
      <div className="helper-note" style={{ marginTop: 18 }}>
        <b>Akun seed:</b><br />
        admin / 06280795 · nurul / akademik123 · rina / lazismu123<br />
        agus / pimpinan123 · budi / donatur123
      </div>
    </form>
  );
}