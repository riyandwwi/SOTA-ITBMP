"use client";

import { useActionState } from "react";
import { uploadBuktiAction } from "@/lib/actions";
import { Icon } from "./icons";
import { rupiah } from "@/lib/format";

export default function UploadBukti({ mappingId, nominal, rekening }: {
  mappingId: string;
  nominal: number;
  rekening?: { namaBank: string; nomorRekening: string; atasNama: string } | null;
}) {
  const [state, formAction, pending] = useActionState(uploadBuktiAction, {});

  return (
    <div className="upload-box">
      {state?.ok ? <div className="alert alert-success">Bukti terkirim, menunggu verifikasi SOTA ITBMP.</div> : null}
      {state?.error ? <div className="alert alert-error">{state.error}</div> : null}

      <div className="helper-note" style={{ marginTop: 0 }}>
        {rekening ? (
          <>Transfer ke <b>{rekening.namaBank} {rekening.nomorRekening}</b> a.n. <b>{rekening.atasNama}</b></>
        ) : "Transfer ke rekening SOTA ITBMP yang ditampilkan di atas."}
        <br />
        Tanggungan <b>{rupiah(nominal)}</b>/bulan · 1 semester (6 bulan) = <b>{rupiah(nominal * 6)}</b>
      </div>

      <form action={formAction}>
        <input type="hidden" name="mappingId" value={mappingId} />
        <label className="field-label">Bulan yang Dibayar</label>
        <select className="input mb14" name="cakupan" defaultValue="bulan_ini">
          <option value="bulan_ini">Bulan ini saja</option>
          <option value="semester">1 semester (6 bulan)</option>
          <option value="semua">Semua tagihan belum dibayar</option>
        </select>

        <label className="field-label">Nominal yang Di-transfer (Rp)</label>
        <input className="input mb14 mono" type="number" name="nominal" placeholder={String(nominal)} />

        <label className="field-label">File Bukti Transfer (PNG / JPG)</label>
        <input className="input mb14" type="file" name="file" accept="image/png,image/jpeg" required />

        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={pending}>
          <Icon name="upload" size={15} />{pending ? "Mengunggah…" : "Unggah Bukti Transfer"}
        </button>
      </form>
    </div>
  );
}