"use client";

import { useActionState } from "react";
import { accPembayaranAction, tolakPembayaranAction } from "@/lib/actions";
import { rupiah, tanggal } from "@/lib/format";
import { Icon } from "./icons";
import LihatBuktiDialog from "./lihat-bukti-dialog";

interface VerifikasiPembayaran {
  id: string;
  fileBuktiTransferUrl: string;
  nominalDitransfer: number;
  tanggalTransfer: Date;
  status: string;
  tagihan: {
    periode: string;
    kodeReferensiUnik: string;
    mappingBeasiswa: {
      donatur: { user: { nama: string } };
      mahasiswa: { nama: string };
    };
  };
}

export default function VerifikasiItem({ pembayaran }: { pembayaran: VerifikasiPembayaran }) {
  const [accState, accAction, accPending] = useActionState(accPembayaranAction, {});
  const [tolakState, tolakAction, tolakPending] = useActionState(tolakPembayaranAction, {});

  return (
    <div className="list-item">
      <div className="thumb"><Icon name="upload" /></div>
      <div className="grow">
        <div className="top-row">
          <strong style={{ fontSize: 13 }}>{pembayaran.tagihan.mappingBeasiswa.donatur.user.nama}</strong>
          <span className="mono" style={{ fontSize: 11 }}>#{pembayaran.tagihan.kodeReferensiUnik}</span>
        </div>
        <div className="meta">{rupiah(pembayaran.nominalDitransfer)} · transfer {tanggal(pembayaran.tanggalTransfer)} · untuk {pembayaran.tagihan.mappingBeasiswa.mahasiswa.nama} ({pembayaran.tagihan.periode})</div>

        {accState?.ok ? <div className="alert alert-success" style={{ marginTop: 8 }}>Pembayaran di-ACC, tagihan lunas & STT dibuat.</div> : null}
        {accState?.error ? <div className="alert alert-error" style={{ marginTop: 8 }}>{accState.error}</div> : null}
        {tolakState?.ok ? <div className="alert alert-success" style={{ marginTop: 8 }}>Pembayaran ditolak, donatur dapat upload ulang.</div> : null}
        {tolakState?.error ? <div className="alert alert-error" style={{ marginTop: 8 }}>{tolakState.error}</div> : null}

        <div className="list-actions" style={{ flexWrap: "wrap" }}>
          <LihatBuktiDialog url={pembayaran.fileBuktiTransferUrl} />
          <form action={accAction} style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <input type="hidden" name="id" value={pembayaran.id} />
            <input className="input mono" style={{ width: 130, padding: "6px 8px", fontSize: 13 }} type="number" name="nominal"
              defaultValue={pembayaran.nominalDitransfer} />
            <button className="btn btn-primary btn-sm" disabled={accPending}><Icon name="check" size={14} />ACC</button>
          </form>
          <form action={tolakAction}>
            <input type="hidden" name="id" value={pembayaran.id} />
            <input type="hidden" name="alasan" value="Bukti tidak valid / nominal tidak sesuai" />
            <button className="btn btn-ghost btn-sm" disabled={tolakPending}><Icon name="x" size={14} />Tolak</button>
          </form>
        </div>
      </div>
    </div>
  );
}