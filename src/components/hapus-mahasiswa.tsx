"use client";

import { deleteMahasiswaAction } from "@/lib/actions";
import { Icon } from "@/components/icons";

export default function HapusMahasiswa({ id, nama, variant = "button" }: {
  id: string;
  nama: string;
  variant?: "button" | "icon";
}) {
  return (
    <form action={deleteMahasiswaAction}
      onSubmit={(e) => {
        if (!confirm(`Hapus mahasiswa "${nama}" secara permanen?\nSemua riwayat IPK, pencocokan donatur, tagihan, dan pembayarannya ikut terhapus. Aksi ini tidak bisa dibatalkan.`)) e.preventDefault();
      }}>
      <input type="hidden" name="id" value={id} />
      {variant === "icon"
        ? <button className="btn-icon" title="Hapus mahasiswa" type="submit"><Icon name="trash" size={13} /></button>
        : <button className="btn btn-danger-ghost btn-sm" type="submit"><Icon name="trash" size={14} />Hapus</button>}
    </form>
  );
}
