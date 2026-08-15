"use client";

import { useState, useActionState } from "react";
import { deleteAccountAction } from "@/lib/actions";
import { Icon } from "@/components/icons";

export default function HapusAkunDialog({ id, nama, username }: { id: string; nama: string; username: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(deleteAccountAction, {});

  if (!open) {
    return (
      <button className="btn-icon" title="Hapus akun" onClick={() => setOpen(true)}>
        <Icon name="trash" size={13} />
      </button>
    );
  }

  return (
    <div className="upload-box" style={{ minWidth: 260 }}>
      <strong style={{ fontSize: 13 }}>Hapus akun &quot;{username}&quot;?</strong>
      <p className="meta" style={{ margin: "6px 0 10px", fontSize: 12 }}>
        Akun <b>{nama}</b> akan dihapus permanen. Aksi ini tidak bisa dibatalkan.
      </p>
      {state?.error ? <div className="alert alert-error" style={{ margin: "0 0 10px" }}>{state.error}</div> : null}
      <form action={formAction}>
        <input type="hidden" name="id" value={id} />
        <label className="field-label">Password Admin</label>
        <input className="input mb14" type="password" name="password" placeholder="Masukkan password Anda" required autoFocus />
        <div className="list-actions">
          <button className="btn btn-danger-ghost btn-sm" type="submit" disabled={pending}>
            <Icon name="trash" size={13} />{pending ? "Menghapus…" : "Ya, Hapus"}
          </button>
          <button className="btn btn-ghost btn-sm" type="button" onClick={() => setOpen(false)}>Batal</button>
        </div>
      </form>
    </div>
  );
}
