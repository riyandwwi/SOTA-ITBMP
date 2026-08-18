"use client";

import { useActionState } from "react";
import { transaksiManualAction } from "@/lib/actions";
import { rupiah } from "@/lib/format";

interface ManualDonatur {
  id: string;
  nama: string;
  asuh: string;
  nominalBulan: number;
  tagihanBelum: number;
}

const today = new Date().toISOString().slice(0, 10);

export default function TransaksiManualForm({ donaturs }: { donaturs: ManualDonatur[] }) {
  const [state, formAction, pending] = useActionState(transaksiManualAction, {});

  const selected = donaturs[0];
  const b = selected?.nominalBulan ?? 0;
  const bSemester = b * 6;

  return (
    <form action={formAction}>
      {state?.ok ? <div className="alert alert-success">Pembayaran dicatat & masuk antrean verifikasi.</div> : null}
      {state?.error ? <div className="alert alert-error">{state.error}</div> : null}
      <label className="field-label">Donatur</label>
      <select className="input mb14" name="donaturId">
        {donaturs.map((d) => <option key={d.id} value={d.id}>{d.nama} — asuh: {d.asuh}</option>)}
      </select>

      <label className="field-label">Tanggal Transfer</label>
      <input className="input mb14" type="date" name="tanggalTransfer" defaultValue={today} required />

      <label className="field-label">Bulan yang Dibayar</label>
      <select className="input mb14" name="cakupan" defaultValue="bulan_ini">
        <option value="bulan_ini">Bulan ini saja ({rupiah(b)})</option>
        <option value="semester">1 semester (6 bulan) ({rupiah(bSemester)})</option>
        <option value="semua">Semua tagihan belum bayar ({selected?.tagihanBelum ?? 0} tagihan)</option>
      </select>

      <label className="field-label">Nominal yang Di-transfer (Rp)</label>
      <input className="input mb14 mono" type="number" name="nominal" min={1} required placeholder={String(b)} />

      <label className="field-label">File Bukti Transfer (PNG / JPG)</label>
      <input className="input mb14" type="file" name="file" accept="image/png,image/jpeg" required />

      <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={pending}>
        {pending ? "Menyimpan…" : "Catat & Ajukan Verifikasi"}
      </button>
    </form>
  );
}