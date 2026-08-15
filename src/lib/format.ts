export function rupiah(n: number): string {
  return "Rp " + n.toLocaleString("id-ID");
}

export const BULAN_NAMA = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

/** Key bulan format "YYYY-MM" (mis. "2026-08"). */
export function bulanKeyNow(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Label bulan Indonesia dari "YYYY-MM". */
export function bulanLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return `${BULAN_NAMA[(m || 1) - 1]} ${y}`;
}

/** Key bulan maju n bulan dari key "YYYY-MM". */
export function bulanKeyTambah(key: string, n: number): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, (m || 1) - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Tanggal format "YYYY-MM-DD" (mis. "2026-08-15"). */
export function tanggalKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function rupiahShort(n: number): string {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}jt`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${n}`;
}

export function tanggal(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function waktu(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function initial(nama: string): string {
  const parts = nama.trim().split(/\s+/);
  return ((parts[0][0] || "?") + (parts[1]?.[0] ?? "")).toUpperCase();
}

/** TA sesi berjalan dari tanggal hari ini: bulan >= 7 => ganjil Y/(Y+1), lainnya genap (Y-1)/Y. */
export function deriveTahunAkademik(): string {
  const now = new Date();
  const y = now.getFullYear();
  return now.getMonth() >= 6 ? `${y}/${y + 1}` : `${y - 1}/${y}`;
}

export const LABEL_STATUS_TAGIHAN: Record<string, { text: string; tone: string }> = {
  pending: { text: "Belum Bayar", tone: "accent" },
  menunggu_verifikasi: { text: "Menunggu Verifikasi", tone: "info" },
  lunas: { text: "Lunas", tone: "primary" },
  ditolak: { text: "Ditolak", tone: "danger" },
};

export const LABEL_STATUS_COVER: Record<string, { text: string; tone: string }> = {
  belum_ada_donatur: { text: "Belum Ada Donatur", tone: "accent" },
  sudah_ada_donatur: { text: "Sudah Ada Donatur", tone: "primary" },
};