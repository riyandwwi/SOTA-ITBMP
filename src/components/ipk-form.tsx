"use client";

import { useState, useActionState } from "react";
import { saveIpkAction, uploadKhsAction } from "@/lib/actions";
import { Icon } from "./icons";

const NILAI: Record<string, number> = { A: 4, AB: 3.5, B: 3, BC: 2.5, C: 2, D: 1, E: 0 };

interface Row { nama: string; sks: number; nilai: string; }

export default function IpkForm({ mahasiswaId, defaultSemester }: { mahasiswaId: string; defaultSemester: number }) {
  const [state, formAction, pending] = useActionState(saveIpkAction, {});
  const [rows, setRows] = useState<Row[]>([{ nama: "", sks: 3, nilai: "A" }]);
  const [semester, setSemester] = useState(defaultSemester);
  const [uploadState, uploadAction, uploadPending] = useActionState(uploadKhsAction, {});

  const totalBobot = rows.reduce((s, r) => s + (NILAI[r.nilai] ?? 0) * (r.sks || 0), 0);
  const totalSks = rows.reduce((s, r) => s + (r.sks || 0), 0);
  const ipk = totalSks > 0 ? (totalBobot / totalSks).toFixed(2) : "0.00";

  function setRow(i: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="mahasiswaId" value={mahasiswaId} />
        <input type="hidden" name="semester" value={semester} />
        <input type="hidden" name="mataKuliah"
          value={JSON.stringify(rows.map((r) => ({ namaMataKuliah: r.nama, sks: r.sks, nilaiHuruf: r.nilai })))} />

        {state?.ok ? <div className="alert alert-success">IPK berhasil disimpan.</div> : null}
        {state?.error ? <div className="alert alert-error">{state.error}</div> : null}

        <div className="mb14">
          <label className="field-label">Semester (maks 14)</label>
          <div className="pill-toggle">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((s) => (
              <button key={s} type="button" style={{ fontSize: 11, padding: 7 }} className={semester === s ? "active" : ""} onClick={() => setSemester(s)}>{s}</button>
            ))}
          </div>
        </div>

        <table style={{ fontSize: 12.5 }}>
          <thead><tr><th>Mata Kuliah</th><th style={{ width: 70 }}>SKS</th><th style={{ width: 80 }}>Nilai</th><th style={{ width: 40 }}></th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td><input className="input" style={{ margin: 0 }} value={r.nama} onChange={(e) => setRow(i, { nama: e.target.value })} placeholder="Nama mata kuliah" /></td>
                <td><input className="input" style={{ margin: 0 }} type="number" min={1} max={6} value={r.sks} onChange={(e) => setRow(i, { sks: Number(e.target.value) })} /></td>
                <td>
                  <select className="input" style={{ margin: 0 }} value={r.nilai} onChange={(e) => setRow(i, { nilai: e.target.value })}>
                    {Object.entries(NILAI).map(([k, v]) => <option key={k} value={k}>{k} · {v}</option>)}
                  </select>
                </td>
                <td>
                  {rows.length > 1 ? (
                    <button type="button" className="btn-icon" onClick={() => setRows(rows.filter((_, idx) => idx !== i))}><Icon name="trash" size={13} /></button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="helper-note" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span><b>Total SKS:</b> <span className="mono">{totalSks}</span> · <b>IPK Semester (otomatis):</b></span>
          <b className="mono" style={{ color: "var(--primary-dark)", fontSize: 16 }}>{ipk}</b>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setRows([...rows, { nama: "", sks: 3, nilai: "A" }])}><Icon name="plus" size={14} />Tambah Mata Kuliah</button>
          <button className="btn btn-primary btn-sm" disabled={pending} style={{ marginLeft: "auto" }}>{pending ? "Menyimpan…" : "Simpan IPK"}</button>
        </div>
      </form>

      <form action={uploadAction} style={{ marginTop: 14 }}>
        <input type="hidden" name="mahasiswaId" value={mahasiswaId} />
        <input type="hidden" name="semester" value={semester} />
        {uploadState?.error ? <div className="alert alert-error">{uploadState.error}</div> : null}
        {uploadState?.ok ? <div className="alert alert-success">KHS berhasil diunggah.</div> : null}
        <div className="list-actions">
          <input type="file" name="file" accept="application/pdf" className="chip" style={{ padding: "7px 10px", fontFamily: "inherit" }} />
          <button className="btn btn-ghost btn-sm" disabled={uploadPending}><Icon name="upload" size={14} />Upload KHS (PDF)</button>
        </div>
      </form>
    </div>
  );
}