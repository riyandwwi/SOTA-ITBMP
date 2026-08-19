import type { IconName } from "@/components/icons";

export interface NavItem {
  label: string;
  href: string;
  icon: IconName;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const NAV: Record<string, NavSection[]> = {
  super_admin: [
    { label: "Menu", items: [
      { label: "Dashboard", href: "/super-admin", icon: "grid" },
      { label: "Manajemen Akun", href: "/super-admin/akun", icon: "users" },
      { label: "Rekening Bank", href: "/super-admin/rekening", icon: "bank" },
      { label: "Audit Log", href: "/super-admin/audit", icon: "clipboard" },
    ] },
  ],
  admin_akademik: [
    { label: "Menu", items: [
      { label: "Dashboard", href: "/admin-akademik", icon: "grid" },
      { label: "Mahasiswa", href: "/admin-akademik/mahasiswa", icon: "cap" },
      { label: "Pencocokan Donatur", href: "/admin-akademik/pencocokan", icon: "heart" },
      { label: "Nilai & IPK", href: "/admin-akademik/nilai", icon: "clipboard" },
    ] },
  ],
  lazismu: [
    { label: "Menu", items: [
      { label: "Dashboard", href: "/lazismu", icon: "grid" },
      { label: "Verifikasi Pembayaran", href: "/lazismu/verifikasi", icon: "shield" },
      { label: "Histori Pembayaran", href: "/lazismu/histori", icon: "wallet" },
      { label: "Rekening Bank", href: "/lazismu/rekening", icon: "bank" },
      { label: "Transaksi Manual", href: "/lazismu/transaksi-manual", icon: "plus" },
    ] },
  ],
  donatur: [
    { label: "Menu", items: [
      { label: "Beranda", href: "/donatur", icon: "home" },
      { label: "Mahasiswa Asuh", href: "/donatur/mahasiswa", icon: "cap" },
      { label: "Tagihan", href: "/donatur/tagihan", icon: "list" },
      { label: "Profil", href: "/donatur/profil", icon: "user" },
    ] },
  ],
  pimpinan: [
    { label: "Menu", items: [
      { label: "Dashboard", href: "/pimpinan", icon: "grid" },
      { label: "Catatan Donatur–Mahasiswa", href: "/pimpinan/catatan", icon: "clipboard" },
    ] },
  ],
};