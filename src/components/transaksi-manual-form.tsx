"use client";

import { useState } from "react";
import { useActionState } from "react";
import { transaksiManualAction } from "@/lib/actions";
import { rupiah } from "@/lib/format";
import { Icon } from "./icons";

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
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [periksa, setPeriksa] = useState(false);

  const selected = donaturs[0];
  const b = selected?.nominalBulan ?? 0;
  const bSemester = b * 6;
  const siap = !!preview && periksa;

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) { setPreview(null); setFileName(""); return; }
    setFileName(f.name);
    const url = URL.createObjectURL(f);
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return url;
    });
  }

  return (
    <form action={formAction}>
      {state?.ok ? <div className="alert alert-success">Pembayaran dicatat & masuk antrean verifikasi.</div> : null}
      {state?.error ? <div className="alert alert-error">{state.error}</div> : null}

      <div className="helper-note" style={{ marginTop: 0 }}>
        Wajib <b>periksa bukti transfer</b> di bawah sebelum mencatat — pastikan nominal & penerima sesuai.
      </div>

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
      <input className="input mb14" type="file" name="file" accept="image/png,image/jpeg" required onChange={onFile} />

      {preview ? (
        <div className="upload-preview mb14">
          <img src={preview} alt="Pratinjau bukti transfer" />
          <div className="meta">{fileName}</div>
        </div>
      ) : (
        <div className="helper-note" style={{ margin: "0 0 14px" }}>Pilih file untuk melihat pratinjau bukti.</div>
      )}

      <label className="checkbox-line">
        <input type="checkbox" name="periksa" value="1" checked={periksa} onChange={(e) => setPeriksa(e.target.checked)} />
        <span>Saya sudah melihat & memeriksa bukti transfer di atas sebelum mencatat.</span>
      </label>

      <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 12 }} disabled={pending || !siap}>
        <Icon name="upload" size={15} />{pending ? "Menyimpan…" : !preview ? "Pilih & periksa bukti dulu" : !periksa ? "Centang konfirmasi pemeriksaan" : "Catat & Ajukan Verifikasi"}
      </button>
    </form>
  );
}