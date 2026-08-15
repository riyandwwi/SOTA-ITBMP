"use client";

interface MhsOption { id: string; nama: string; prodi: string; }

export default function NilaiSelect({ options, selected }: { options: MhsOption[]; selected?: string }) {
  return (
    <select className="input" name="mhs" defaultValue={selected} onChange={(e) => (window.location.href = `/admin-akademik/nilai?mhs=${e.target.value}`)}>
      {options.map((m) => <option key={m.id} value={m.id}>{m.nama} — {m.prodi}</option>)}
    </select>
  );
}
