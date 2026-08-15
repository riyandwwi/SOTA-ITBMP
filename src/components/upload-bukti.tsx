"use client";

import { useActionState } from "react";
import { uploadBuktiAction } from "@/lib/actions";
import { Icon } from "./icons";
import { rupiah } from "@/lib/format";

export default function UploadBukti({ tagihanId, tagihanNominal, rekening }: {
  tagihanId: string;
  tagihanNominal: number;
  rekening?: { namaBank: string; nomorRekening: string; atasNama: string } | null;
}) {
  const [state, formAction, pending] = useActionState(uploadBuktiAction, {});

  return (
    <div className="upload-box">
      {state?.ok ? <div className="alert alert-success">Bukti terkirim, menunggu verifikasi LAZISMU.</div> : null}
      {state?.error ? <div className="alert alert-error">{state.error}</div> : null}

      <div className="helper-note" style={{ marginTop: 0 }}>
        {rekening ? (
          <>Transfer ke <b>{rekening.namaBank} {rekening.nomorRekening}</b> a.n. <b>{rekening.atasNama}</b></>
        ) : "Transfer ke rekening LAZISMU yang ditampilkan di atas."}
        <br />
        Jumlah yang harus dibayar: <b>{rupiah(tagihanNominal)}</b>
      </div>

      <form action={formAction}>
        <input type="hidden" name="tagihanId" value={tagihanId} />
        <label className="field-label">Nominal yang Di-transfer (Rp)</label>
        <input className="input mb14 mono" type="number" name="nominal" placeholder={String(tagihanNominal)} />

        <label className="field-label">File Bukti Transfer (PNG / JPG)</label>
        <input className="input mb14" type="file" name="file" accept="image/png,image/jpeg" required />

        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={pending}>
          <Icon name="upload" size={15} />{pending ? "Mengunggah…" : "Unggah Bukti Transfer"}
        </button>
      </form>
    </div>
  );
}