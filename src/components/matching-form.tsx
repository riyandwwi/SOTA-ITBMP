"use client";

import { useState, useActionState } from "react";
import { matchStudentAction } from "@/lib/actions";
import { rupiah } from "@/lib/format";

interface Candidate { id: string; nama: string; nim: string; prodi: string; semester: number; kebutuhan: number; }
interface Donor { id: string; nama: string; pakai: number; target: number; }

export default function MatchingForm({ candidates, donors }: { candidates: Candidate[]; donors: Donor[] }) {
  const [state, formAction, pending] = useActionState(matchStudentAction, {});
  const [mhsId, setMhsId] = useState(candidates[0]?.id ?? "");
  const [nominal, setNominal] = useState<string>("");
  const [skema, setSkema] = useState<"bulanan" | "semester">("bulanan");

  const sel = candidates.find((c) => c.id === mhsId);

  return (
    <form action={formAction}>
      {state?.ok ? <div className="alert alert-success">Pencocokan berhasil dibuat.</div> : null}
      {state?.error ? <div className="alert alert-error">{state.error}</div> : null}

      <label className="field-label">Mahasiswa Terpilih</label>
      <select className="input mb14" name="mahasiswaId" value={mhsId} onChange={(e) => { setMhsId(e.target.value); setNominal(""); }}>
        {candidates.map((c) => (
          <option key={c.id} value={c.id}>{c.nama} — {c.prodi}, Smt {c.semester}</option>
        ))}
      </select>
      {sel ? <p className="helper-note" style={{ marginTop: -8, marginBottom: 14 }}>Kebutuhan <b>{rupiah(sel.kebutuhan)}</b>/semester · NIM <span className="mono">{sel.nim}</span></p> : null}

      <label className="field-label">Pilih Donatur</label>
      <select className="input mb14" name="donaturId">
        {donors.map((d) => (
          <option key={d.id} value={d.id}>{d.nama} — sisa kuota {d.pakai}/{d.target}</option>
        ))}
      </select>

      <label className="field-label">Nominal Tanggungan</label>
      <input className="input mb14 mono" type="number" name="nominal" value={nominal}
        placeholder={sel ? String(sel.kebutuhan) : "0"} onChange={(e) => setNominal(e.target.value)} />

      <label className="field-label">Skema Bayar</label>
      <div className="pill-toggle">
        <button type="button" className={skema === "bulanan" ? "active" : ""} onClick={() => setSkema("bulanan")}>Bulanan</button>
        <button type="button" className={skema === "semester" ? "active" : ""} onClick={() => setSkema("semester")}>Semester</button>
      </div>
      <input type="hidden" name="skema" value={skema} />

      <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={pending || !mhsId || donors.length === 0}>
        {pending ? "Menyimpan…" : "Konfirmasi Pencocokan"}
      </button>
      <div className="helper-note">
        <b>Aman dari tabrakan:</b> database mengunci mahasiswa ini lewat unik partial index + transaksi — bila ada admin lain mencocokkan mahasiswa yang sama, prosesnya otomatis ditolak.
      </div>
    </form>
  );
}