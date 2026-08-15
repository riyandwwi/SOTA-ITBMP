"use client";

import { useActionState } from "react";
import { transaksiManualAction } from "@/lib/actions";

export default function TransaksiManualForm({ donaturs }: { donaturs: { id: string; nama: string; asuh: string }[] }) {
  const [state, formAction, pending] = useActionState(transaksiManualAction, {});

  return (
    <form action={formAction}>
      {state?.ok ? <div className="alert alert-success">Transaksi manual dicatat sebagai lunas.</div> : null}
      {state?.error ? <div className="alert alert-error">{state.error}</div> : null}
      <label className="field-label">Donatur</label>
      <select className="input mb14" name="donaturId">
        {donaturs.map((d) => <option key={d.id} value={d.id}>{d.nama} — asuh: {d.asuh || "-"}</option>)}
      </select>
      <label className="field-label">Nominal (Rp)</label>
      <input className="input mb14 mono" type="number" name="nominal" min={1} required />
      <label className="field-label">Keterangan / Periode</label>
      <input className="input mb14" name="keterangan" placeholder="Contoh: Donasi tunai bulan Juni" />
      <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={pending}>
        {pending ? "Menyimpan…" : "Catat Transaksi"}
      </button>
    </form>
  );
}