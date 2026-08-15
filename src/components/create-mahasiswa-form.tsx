"use client";

import { useActionState } from "react";
import { createMahasiswaAction } from "@/lib/actions";

export default function CreateMahasiswaForm() {
  const [state, formAction, pending] = useActionState(createMahasiswaAction, {});

  return (
    <form action={formAction}>
      {state?.ok ? <div className="alert alert-success">Mahasiswa berhasil ditambahkan.</div> : null}
      {state?.error ? <div className="alert alert-error">{state.error}</div> : null}

      <label className="field-label">Nama Lengkap</label>
      <input className="input mb14" name="nama" required />

      <div className="grid-2" style={{ gridTemplateColumns: "1fr 1fr", gap: 10, alignItems: "start" }}>
        <div>
          <label className="field-label">NIM</label>
          <input className="input mb14 mono" name="nim" required />
        </div>
        <div>
          <label className="field-label">Program Studi</label>
          <input className="input mb14" name="prodi" required />
        </div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: "1fr 1fr", gap: 10, alignItems: "start" }}>
        <div>
          <label className="field-label">Semester</label>
          <input className="input mb14" type="number" min={1} max={14} defaultValue={1} name="semester" />
        </div>
        <div>
          <label className="field-label">Tahun Akademik</label>
          <input className="input mb14" name="tahunAkademik" placeholder="cth: 2024/2025" />
        </div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: "1fr 1fr", gap: 10, alignItems: "start" }}>
        <div>
          <label className="field-label">Kebutuhan Dana / Semester (Rp)</label>
          <input className="input mb14 mono" type="number" min={1} name="kebutuhan" required />
        </div>
        <div />
      </div>

      <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={pending}>
        {pending ? "Menyimpan…" : "Tambah Mahasiswa"}
      </button>
    </form>
  );
}