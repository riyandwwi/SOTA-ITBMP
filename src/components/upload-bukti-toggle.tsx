"use client";

import { useState } from "react";
import UploadBukti from "./upload-bukti";
import { Icon } from "./icons";

export default function UploadBuktiToggle({ tagihanId, tagihanNominal, rekening }: {
  tagihanId: string;
  tagihanNominal: number;
  rekening?: { namaBank: string; nomorRekening: string; atasNama: string } | null;
}) {
  const [open, setOpen] = useState(false);
  if (open) return <UploadBukti tagihanId={tagihanId} tagihanNominal={tagihanNominal} rekening={rekening} />;
  return (
    <button type="button" className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>
      <Icon name="upload" size={14} />Upload Bukti Bayar
    </button>
  );
}
