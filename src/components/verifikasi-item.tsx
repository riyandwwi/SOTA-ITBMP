"use client";

import { useActionState } from "react";
import { accBatchAction, tolakBatchAction } from "@/lib/actions";
import { rupiah, tanggal, bulanLabel } from "@/lib/format";
import { Icon } from "./icons";
import { Badge } from "./ui";
import LihatBuktiDialog from "./lihat-bukti-dialog";

interface VerifikasiPembayaran {
  id: string;
  batchId: string | null;
  fileBuktiTransferUrl: string;
  nominalDitransfer: number;
  tanggalTransfer: Date;
  status: string;
  sumber: string;
  tagihan: {
    periodeKey: string;
    periode: string;
    kodeReferensiUnik: string;
    mappingBeasiswa: {
      donatur: { user: { nama: string } };
      mahasiswa: { nama: string };
    };
  };
}

export default function VerifikasiItem({ items }: { items: VerifikasiPembayaran[] }) {
  const item = items[0];
  const isBatch = item.batchId !== null && items.length > 1;
  const key = isBatch ? item.batchId! : item.id;
  const total = items.reduce((s, p) => s + p.nominalDitransfer, 0);
  const bulanUnik = Array.from(new Set(items.map((p) => p.tagihan.periodeKey))).sort();

  const [accState, accAction, accPending] = useActionState(accBatchAction, {});
  const [tolakState, tolakAction, tolakPending] = useActionState(tolakBatchAction, {});

  return (
    <div className="list-item">
      <div className="thumb"><Icon name="upload" /></div>
      <div className="grow">
        <div className="top-row">
          <strong style={{ fontSize: 13 }}>{item.tagihan.mappingBeasiswa.donatur.user.nama}</strong>
          {item.sumber === "manual" ? <Badge text="Manual" tone="accent" /> : <Badge text="Sistem" tone="info" />}
          <span className="mono" style={{ fontSize: 11 }}>{isBatch ? `#${item.batchId!.slice(-6)}` : `#${item.tagihan.kodeReferensiUnik}`}</span>
        </div>
        <div className="meta">
          {rupiah(total)} · transfer {tanggal(item.tanggalTransfer)} · untuk {item.tagihan.mappingBeasiswa.mahasiswa.nama}
        </div>
        {isBatch ? (
          <div className="meta" style={{ marginTop: 4 }}>
            <b>{bulanUnik.length} bulan</b>: {bulanUnik.map(bulanLabel).join(", ")}
          </div>
        ) : (
          <div className="meta" style={{ marginTop: 4 }}>Periode {item.tagihan.periode}</div>
        )}

        {accState?.ok ? <div className="alert alert-success" style={{ marginTop: 8 }}>{isBatch ? "Seluruh pembayaran di-ACC, tagihan lunas & STT dibuat." : "Pembayaran di-ACC, tagihan lunas & STT dibuat."}</div> : null}
        {accState?.error ? <div className="alert alert-error" style={{ marginTop: 8 }}>{accState.error}</div> : null}
        {tolakState?.ok ? <div className="alert alert-success" style={{ marginTop: 8 }}>{isBatch ? "Seluruh pembayaran ditolak, donatur dapat upload ulang." : "Pembayaran ditolak, donatur dapat upload ulang."}</div> : null}
        {tolakState?.error ? <div className="alert alert-error" style={{ marginTop: 8 }}>{tolakState.error}</div> : null}

        <div className="list-actions" style={{ flexWrap: "wrap" }}>
          <LihatBuktiDialog url={item.fileBuktiTransferUrl} />
          <form action={accAction} style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <input type="hidden" name="batchId" value={key} />
            <input className="input mono" style={{ width: 130, padding: "6px 8px", fontSize: 13 }} type="number" name="nominal"
              defaultValue={total} placeholder={String(item.nominalDitransfer)} />
            <button className="btn btn-primary btn-sm" disabled={accPending}><Icon name="check" size={14} />{isBatch ? `ACC (${items.length} bulan)` : "ACC"}</button>
          </form>
          <form action={tolakAction}>
            <input type="hidden" name="batchId" value={key} />
            <input type="hidden" name="alasan" value="Bukti tidak valid / nominal tidak sesuai" />
            <button className="btn btn-ghost btn-sm" disabled={tolakPending}><Icon name="x" size={14} />{isBatch ? `Tolak (${items.length})` : "Tolak"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}