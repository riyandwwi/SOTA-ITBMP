"use client";

import { useActionState } from "react";
import { changePasswordAction, changeUsernameAction } from "@/lib/actions";
import { Icon } from "./icons";

export default function ProfileForm({ currentUsername }: { currentUsername: string }) {
  const [uname, unameAction, unamePending] = useActionState(changeUsernameAction, {});
  const [pw, pwAction, pwPending] = useActionState(changePasswordAction, {});

  return (
    <div className="list-item" style={{ display: "block", paddingTop: 0 }}>
      <form action={unameAction}>
        <div className="section-title" style={{ marginTop: 0 }}>Ganti Username</div>
        {uname?.ok ? <div className="alert alert-success">Username diubah.</div> : null}
        {uname?.error ? <div className="alert alert-error">{uname.error}</div> : null}
        <label className="field-label">Username Baru</label>
        <input className="input mb14" name="username" defaultValue={currentUsername} required />
        <button className="btn btn-primary btn-sm" disabled={unamePending} style={{ width: "100%", justifyContent: "center" }}><Icon name="edit" size={14} />Simpan Username</button>
      </form>

      <form action={pwAction} style={{ marginTop: 20 }}>
        <div className="section-title">Ganti Password</div>
        {pw?.ok ? <div className="alert alert-success">Password diubah.</div> : null}
        {pw?.error ? <div className="alert alert-error">{pw.error}</div> : null}
        <label className="field-label">Password Lama</label>
        <input className="input mb14" type="password" name="lama" required />
        <label className="field-label">Password Baru</label>
        <input className="input mb14" type="password" name="baru" required />
        <label className="field-label">Ulangi Password Baru</label>
        <input className="input mb14" type="password" name="ulang" required />
        <button className="btn btn-primary btn-sm" disabled={pwPending} style={{ width: "100%", justifyContent: "center" }}><Icon name="shield" size={14} />Simpan Password</button>
      </form>
    </div>
  );
}