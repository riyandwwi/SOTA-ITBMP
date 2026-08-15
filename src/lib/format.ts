export function rupiah(n: number): string {
  return "Rp " + n.toLocaleString("id-ID");
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