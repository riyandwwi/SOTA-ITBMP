"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession, getSessionUser } from "@/lib/auth";
import { verifyPassword, hashPassword, encryptSecret, decryptSecret } from "@/lib/password";
import { audit } from "@/lib/audit";
import { saveFile, MAX_FILE_SIZE, isAllowedImage, imageExtension, isAllowedPdf } from "@/lib/storage";
import { notificationService } from "@/lib/notifications";
import { deriveTahunAkademik, bulanKeyNow, bulanLabel, bulanKeyTambah } from "@/lib/format";

const HOME: Record<string, string> = {
  super_admin: "/super-admin",
  admin_akademik: "/admin-akademik",
  lazismu: "/lazismu",
  donatur: "/donatur",
  pimpinan: "/pimpinan",
};

export type ActionResult = { error?: string; ok?: boolean };

// ---------------- AUTH ----------------

export async function loginAction(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    await audit({ jenisAksi: "login", entitas: "session", status: "gagal" });
    return { error: "Username atau password salah." };
  }

  const session = await getSession();
  session.userId = user.id;
  session.username = user.username;
  session.role = user.role;
  session.isLoggedIn = true;
  await session.save();
  await audit({ userId: user.id, jenisAksi: "login", entitas: "session", status: "berhasil" });
  redirect(HOME[user.role] || "/");
}

export async function logoutAction() {
  const u = await getSessionUser();
  await audit({ userId: u?.id, jenisAksi: "logout", entitas: "session" });
  const session = await getSession();
  session.destroy();
  redirect("/login");
}

export async function changePasswordAction(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const u = await getSessionUser();
  if (!u) return { error: "Sesi tidak valid." };
  const lama = String(formData.get("lama") || "");
  const baru = String(formData.get("baru") || "");
  const ulang = String(formData.get("ulang") || "");
  if (!(await verifyPassword(lama, u.passwordHash))) return { error: "Password lama salah." };
  if (baru.length < 6) return { error: "Password baru minimal 6 karakter." };
  if (baru !== ulang) return { error: "Konfirmasi password tidak cocok." };
  await prisma.user.update({
    where: { id: u.id },
    data: {
      passwordHash: await hashPassword(baru),
      passwordEncrypted: encryptSecret(baru),
    },
  });
  await audit({ userId: u.id, jenisAksi: "update", entitas: "akun", entitasId: u.id, detailPerubahan: { aksi: "ganti_password" } });
  return { ok: true };
}

export async function changeUsernameAction(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const u = await getSessionUser();
  if (!u) return { error: "Sesi tidak valid." };
  const username = String(formData.get("username") || "").trim();
  if (!username) return { error: "Username wajib diisi." };
  const dup = await prisma.user.findUnique({ where: { username } });
  if (dup && dup.id !== u.id) return { error: "Username sudah dipakai." };
  await prisma.user.update({ where: { id: u.id }, data: { username } });
  const session = await getSession();
  session.username = username;
  await session.save();
  await audit({ userId: u.id, jenisAksi: "update", entitas: "akun", entitasId: u.id, detailPerubahan: { username } });
  return { ok: true };
}

// ---------------- AKUN (Super Admin / Admin Akademik) ----------------

export async function createAccountAction(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const u = await getSessionUser();
  if (!u || !["super_admin", "admin_akademik"].includes(u.role)) return { error: "Tidak berwenang." };

  const role = String(formData.get("role") || "");
  if (u.role === "admin_akademik" && role !== "donatur") return { error: "Admin Akademik hanya bisa membuat akun Donatur." };

  const nama = String(formData.get("nama") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  const kontakWa = String(formData.get("kontakWa") || "").trim();
  const target = Number(formData.get("target") || 0);

  if (!nama || !email || !username || !password) return { error: "Lengkapi nama, email, username, dan password." };

  if (await prisma.user.findUnique({ where: { username } })) return { error: "Username sudah dipakai." };
  if (await prisma.user.findUnique({ where: { email } })) return { error: "Email sudah dipakai." };

  const created = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        nama, email, username, role: role as any, dibuatOlehId: u.id,
        passwordHash: await hashPassword(password),
        passwordEncrypted: encryptSecret(password),
      },
    });
    if (role === "donatur") {
      await tx.donatur.create({
        data: { userId: user.id, kontakWa: kontakWa || "-", tipeDonatur: "individu", jumlahMahasiswaTarget: Math.max(target, 1) },
      });
    }
    return user;
  });
  await audit({ userId: u.id, jenisAksi: "create", entitas: "akun", entitasId: created.id, detailPerubahan: { nama, username, role } });
  revalidatePath("/super-admin");
  return { ok: true };
}

export async function deleteAccountAction(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const u = await getSessionUser();
  if (!u || u.role !== "super_admin") redirect("/super-admin/akun");
  const id = String(formData.get("id") || "");
  const password = String(formData.get("password") || "");
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target || id === u.id) redirect("/super-admin/akun");
  if (!(await verifyPassword(password, u.passwordHash))) {
    return { error: "Password salah. Akun tidak dihapus." };
  }
  try {
    await prisma.$transaction(async (tx) => {
      await tx.donatur.deleteMany({ where: { userId: id } });
      await tx.user.delete({ where: { id } });
    });
    await audit({ userId: u.id, jenisAksi: "delete", entitas: "akun", entitasId: id, detailPerubahan: { username: target.username } });
    revalidatePath("/super-admin");
  } catch {
    return { error: "Gagal menghapus akun (masih terhubung dengan data lain)." };
  }
  redirect("/super-admin/akun");
}

export async function revealPasswordAction(formData: FormData): Promise<ActionResult & { password?: string }> {
  const u = await getSessionUser();
  if (!u || u.role !== "super_admin") return { error: "Hanya Super Admin." };
  const id = String(formData.get("id") || "");
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return { error: "Akun tidak ditemukan." };
  await audit({ userId: u.id, jenisAksi: "lihat_password", entitas: "akun", entitasId: id, detailPerubahan: { username: target.username } });
  const password = decryptSecret(target.passwordEncrypted);
  return { ok: true, password };
}

// ---------------- PENCEMATAN MAPPING (Admin Akademik) ----------------

export async function matchStudentAction(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const admin = await getSessionUser();
  if (!admin || admin.role !== "admin_akademik") return { error: "Tidak berwenang." };

  const mahasiswaId = String(formData.get("mahasiswaId") || "");
  const donaturId = String(formData.get("donaturId") || "");
  const nominal = Number(formData.get("nominal") || 0);

  if (!mahasiswaId || !donaturId) return { error: "Pilih mahasiswa dan donatur." };

  try {
    await prisma.$transaction(async (tx) => {
      const mahasiswa = await tx.mahasiswa.findUniqueOrThrow({ where: { id: mahasiswaId } });
      if (mahasiswa.statusCover !== "belum_ada_donatur") {
        throw new Error("Mahasiswa ini sudah punya donatur aktif.");
      }
      const donatur = await tx.donatur.findUniqueOrThrow({ where: { id: donaturId } });
      const jumlahAktif = await tx.mappingBeasiswa.count({ where: { donaturId, status: "aktif" } });
      if (jumlahAktif >= donatur.jumlahMahasiswaTarget) {
        throw new Error("Donatur sudah mencapai batas target mahasiswa.");
      }
      const mapping = await tx.mappingBeasiswa.create({
        data: {
          donaturId, mahasiswaId,
          nominalTanggungan: nominal > 0 ? nominal : mahasiswa.nominalKebutuhanPerBulan,
          status: "aktif", dibuatOlehId: admin.id,
        },
      });
      await tx.mahasiswa.update({ where: { id: mahasiswaId }, data: { statusCover: "sudah_ada_donatur" } });
      await tx.auditLog.create({
        data: { userId: admin.id, jenisAksi: "matching", entitas: "mapping_beasiswa", entitasId: mapping.id },
      });
      return mapping;
    });
    revalidatePath("/admin-akademik");
    revalidatePath("/admin-akademik/pencocokan");
    return { ok: true };
  } catch (e: any) {
    // Menangkap constraint unique partial index (P2002) sebagai pesan jelas.
    if (e?.code === "P2002") {
      return { error: "Mahasiswa ini baru saja dicocokkan oleh proses lain, silakan pilih mahasiswa lain." };
    }
    return { error: e?.message || "Terjadi kesalahan." };
  }
}

// ---------------- IPK (Admin Akademik) ----------------

export async function saveIpkAction(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const admin = await getSessionUser();
  if (!admin || admin.role !== "admin_akademik") return { error: "Tidak berwenang." };

  const mahasiswaId = String(formData.get("mahasiswaId") || "");
  const semester = Math.max(Number(formData.get("semester") || 1), 1);
  if (semester > 14) return { error: "Semester maksimal 14 (masa studi maksimal)." };
  const raw = String(formData.get("mataKuliah") || "[]");
  let courses: { namaMataKuliah: string; sks: number; nilaiHuruf: string }[];
  try {
    courses = JSON.parse(raw);
  } catch { return { error: "Data mata kuliah tidak valid." }; }
  if (!courses.length) return { error: "Minimal satu mata kuliah." };

  const BOBOT: Record<string, number> = { A: 4, AB: 3.5, B: 3, BC: 2.5, C: 2, D: 1, E: 0 };
  const totalBobot = courses.reduce((s, c) => s + (BOBOT[c.nilaiHuruf] ?? 0) * c.sks, 0);
  const totalSks = courses.reduce((s, c) => s + c.sks, 0);
  const ipk = Math.round((totalBobot / totalSks) * 100) / 100;

  const existing = await prisma.ipkHistory.findUnique({ where: { mahasiswaId_semester: { mahasiswaId, semester } } });
  if (existing) {
    await prisma.$transaction(async (tx) => {
      await tx.mataKuliahNilai.deleteMany({ where: { ipkHistoryId: existing.id } });
      await tx.ipkHistory.update({
        where: { id: existing.id },
        data: { nilaiIpk: ipk, flagPeringatan: ipk < 3 },
      });
      await tx.mataKuliahNilai.createMany({
        data: courses.map((c) => ({ ipkHistoryId: existing.id, namaMataKuliah: c.namaMataKuliah, sks: c.sks, nilaiHuruf: c.nilaiHuruf, bobotNilai: BOBOT[c.nilaiHuruf] ?? 0 })),
      });
    });
  } else {
    await prisma.ipkHistory.create({
      data: { mahasiswaId, semester, nilaiIpk: ipk, flagPeringatan: ipk < 3, mataKuliahNilai: { create: courses.map((c) => ({ namaMataKuliah: c.namaMataKuliah, sks: c.sks, nilaiHuruf: c.nilaiHuruf, bobotNilai: BOBOT[c.nilaiHuruf] ?? 0 })) } },
    });
  }
  await audit({ userId: admin.id, jenisAksi: "create", entitas: "ipk", detailPerubahan: { mahasiswaId, semester, ipk } });
  revalidatePath("/admin-akademik");
  return { ok: true };
}

export async function archiveMahasiswaAction(formData: FormData): Promise<void> {
  const admin = await getSessionUser();
  if (!admin || admin.role !== "admin_akademik") redirect("/admin-akademik");
  const id = String(formData.get("id") || "");
  const m = await prisma.mahasiswa.findUnique({ where: { id }, include: { mappingBeasiswa: true, ipkHistory: true } });
  if (!m) redirect("/admin-akademik");
  const punyaRiwayat = m.mappingBeasiswa.length > 0 || m.ipkHistory.length > 0;
  if (punyaRiwayat) {
    await prisma.mahasiswa.update({ where: { id }, data: { statusAktif: "diarsipkan" } });
  } else {
    await prisma.mahasiswa.delete({ where: { id } });
  }
  await audit({ userId: admin.id, jenisAksi: punyaRiwayat ? "arsipkan" : "delete", entitas: "mahasiswa", entitasId: id });
  revalidatePath("/admin-akademik");
  redirect("/admin-akademik");
}

export async function deleteMahasiswaAction(formData: FormData): Promise<void> {
  const admin = await getSessionUser();
  if (!admin || admin.role !== "admin_akademik") redirect("/admin-akademik");
  const id = String(formData.get("id") || "");
  const m = await prisma.mahasiswa.findUnique({ where: { id } });
  if (!m) redirect("/admin-akademik/mahasiswa");
  await prisma.mahasiswa.delete({ where: { id } });
  await audit({
    userId: admin.id, jenisAksi: "delete", entitas: "mahasiswa", entitasId: id,
    detailPerubahan: { nama: m.nama, nim: m.nim },
  });
  revalidatePath("/admin-akademik");
  revalidatePath("/admin-akademik/mahasiswa");
  redirect("/admin-akademik/mahasiswa");
}

// ---------------- PEMBAYARAN (SOTA ITBMP) ----------------

export async function accPembayaranAction(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const laz = await getSessionUser();
  if (!laz || laz.role !== "lazismu") return { error: "Tidak berwenang." };
  const id = String(formData.get("id") || "");
  const nominal = Number(formData.get("nominal") || 0);
  const pembayaran = await prisma.pembayaran.findUnique({ where: { id }, include: { tagihan: true } });
  if (!pembayaran) return { error: "Pembayaran tidak ditemukan." };
  const nominalBaru = nominal > 0 ? nominal : pembayaran.nominalDitransfer;
  await prisma.$transaction(async (tx) => {
    await tx.pembayaran.update({
      where: { id },
      data: {
        status: "acc", idAdminAcc: laz.id, tanggalAcc: new Date(),
        nominalDitransfer: nominalBaru,
        urlPdfStt: `/stt/stt-${pembayaran.id.slice(0, 8)}.pdf`,
      },
    });
    await tx.tagihan.update({ where: { id: pembayaran.tagihanId }, data: { status: "lunas", nominalHarusDibayar: nominalBaru } });
    await tx.auditLog.create({
      data: {
        userId: laz.id, jenisAksi: "acc", entitas: "pembayaran", entitasId: id,
        detailPerubahan: JSON.stringify({ nominalAsli: pembayaran.nominalDitransfer, nominalBaru }),
      },
    });
  });
  revalidatePath("/lazismu");
  return { ok: true };
}

export async function tolakPembayaranAction(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const laz = await getSessionUser();
  if (!laz || laz.role !== "lazismu") return { error: "Tidak berwenang." };
  const id = String(formData.get("id") || "");
  const alasan = String(formData.get("alasan") || "Bukti tidak valid");
  await prisma.$transaction(async (tx) => {
    const p = await tx.pembayaran.findUniqueOrThrow({ where: { id }, include: { tagihan: true } });
    await tx.pembayaran.update({ where: { id }, data: { status: "ditolak", alasanPenolakan: alasan } });
    await tx.tagihan.update({ where: { id: p.tagihanId }, data: { status: "ditolak" } });
    await tx.auditLog.create({ data: { userId: laz.id, jenisAksi: "tolak", entitas: "pembayaran", entitasId: id, detailPerubahan: JSON.stringify({ alasan }) } });
  });
  revalidatePath("/lazismu");
  return { ok: true };
}

export async function approveRekeningAction(formData: FormData): Promise<void> {
  const u = await getSessionUser();
  if (!u || !["super_admin", "pimpinan"].includes(u.role)) redirect("/login");
  const id = String(formData.get("id") || "");
  await prisma.$transaction(async (tx) => {
    await tx.rekeningBank.update({ where: { id }, data: { status: "aktif", diAccOlehId: u.id, tanggalAcc: new Date() } });
    await tx.auditLog.create({ data: { userId: u.id, jenisAksi: "acc", entitas: "rekening_bank", entitasId: id } });
  });
  revalidatePath("/super-admin");
  revalidatePath("/lazismu");
  redirect("/super-admin");
}

export async function rejectRekeningAction(formData: FormData): Promise<void> {
  const u = await getSessionUser();
  if (!u || !["super_admin", "pimpinan"].includes(u.role)) redirect("/login");
  const id = String(formData.get("id") || "");
  await prisma.$transaction(async (tx) => {
    await tx.rekeningBank.update({ where: { id }, data: { status: "nonaktif" } });
    await tx.auditLog.create({ data: { userId: u.id, jenisAksi: "tolak", entitas: "rekening_bank", entitasId: id } });
  });
  revalidatePath("/super-admin");
  revalidatePath("/lazismu");
  redirect("/super-admin");
}

export async function generateBillingAction(_: ActionResult, _formData: FormData): Promise<ActionResult> {
  const laz = await getSessionUser();
  if (!laz || laz.role !== "lazismu") return { error: "Tidak berwenang." };
  const periodeKey = bulanKeyNow();
  const periode = bulanLabel(periodeKey);
  const aktif = await prisma.mappingBeasiswa.findMany({ where: { status: "aktif" }, include: { tagihan: true } });
  let dibuat = 0;
  for (const m of aktif) {
    const sudah = m.tagihan.some((t) => t.periodeKey === periodeKey);
    if (sudah) continue;
    await prisma.$transaction(async (tx) => {
      const kode = `LZ-${Date.now().toString(36)}-${Math.floor(1000 + Math.random() * 9000)}`;
      await tx.tagihan.create({
        data: {
          mappingBeasiswaId: m.id, periode, periodeKey,
          nominalHarusDibayar: m.nominalTanggungan, kodeReferensiUnik: kode,
          tanggalJatuhTempo: new Date(Date.now() + 14 * 86400000), status: "pending",
        },
      });
      await tx.auditLog.create({ data: { userId: laz.id, jenisAksi: "create", entitas: "tagihan", entitasId: m.id, detailPerubahan: JSON.stringify({ periode, periodeKey }) } });
    });
    dibuat++;
  }
  await audit({ userId: laz.id, jenisAksi: "billing", entitas: "tagihan", detailPerubahan: { periode, dibuat } });
  revalidatePath("/lazismu");
  return { ok: true, ...(dibuat ? {} : { error: "Tidak ada tagihan baru (semua sudah dibuat untuk periode ini)." }) };
}

export async function transaksiManualAction(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const laz = await getSessionUser();
  if (!laz || laz.role !== "lazismu") return { error: "Tidak berwenang." };
  const donaturId = String(formData.get("donaturId") || "");
  const nominal = Number(formData.get("nominal") || 0);
  const keterangan = String(formData.get("keterangan") || "").trim() || "Transaksi manual";
  if (!donaturId || nominal <= 0) return { error: "Pilih donatur dan nominal valid." };
  const mapping = await prisma.mappingBeasiswa.findFirst({ where: { donaturId, status: "aktif" } });
  if (!mapping) return { error: "Donatur tidak punya mahasiswa asuh aktif." };
  await prisma.$transaction(async (tx) => {
    const kode = `LZ-MAN-${Date.now().toString(36)}`;
    const tagihan = await tx.tagihan.create({
      data: { mappingBeasiswaId: mapping.id, periode: keterangan, periodeKey: bulanKeyNow(), nominalHarusDibayar: nominal, kodeReferensiUnik: kode, tanggalJatuhTempo: new Date(), status: "lunas" },
    });
    await tx.pembayaran.create({
      data: { tagihanId: tagihan.id, fileBuktiTransferUrl: "/bukti-transfer/manual", tanggalTransfer: new Date(), nominalDitransfer: nominal, status: "acc", idAdminAcc: laz.id, tanggalAcc: new Date() },
    });
    await tx.auditLog.create({ data: { userId: laz.id, jenisAksi: "create", entitas: "pembayaran_manual", detailPerubahan: JSON.stringify({ nominal, keterangan }) } });
  });
  revalidatePath("/lazismu");
  return { ok: true };
}

// ---------------- MAHASISWA (Admin Akademik) ----------------

export async function semesterBaruAction(_: ActionResult, formData: FormData): Promise<ActionResult & { naik?: number; ta?: string; tetap?: number }> {
  const admin = await getSessionUser();
  if (!admin || admin.role !== "admin_akademik") return { error: "Tidak berwenang." };

  const targets = await prisma.mahasiswa.findMany({ where: { statusAktif: "aktif", semester: { lt: 14 } }, select: { id: true } });
  const sudahMaks = await prisma.mahasiswa.count({ where: { statusAktif: "aktif", semester: { gte: 14 } } });
  if (targets.length === 0) return { error: "Tidak ada mahasiswa aktif yang bisa dinaikkan (semua sudah semester 14)." };

  const ta = deriveTahunAkademik();
  const ids = targets.map((t) => t.id);
  await prisma.$transaction(async (tx) => {
    await tx.mahasiswa.updateMany({ where: { id: { in: ids } }, data: { semester: { increment: 1 }, tahunAkademik: ta } });
    await tx.auditLog.create({ data: { userId: admin.id, jenisAksi: "semester_baru", entitas: "mahasiswa", detailPerubahan: JSON.stringify({ naik: ids.length, ta }) } });
  });
  revalidatePath("/admin-akademik");
  return { ok: true, naik: ids.length, ta, tetap: sudahMaks };
}

export async function createMahasiswaAction(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const admin = await getSessionUser();
  if (!admin || admin.role !== "admin_akademik") return { error: "Tidak berwenang." };
  const nama = String(formData.get("nama") || "").trim();
  const nim = String(formData.get("nim") || "").trim();
  const prodi = String(formData.get("prodi") || "").trim();
  const semester = Math.max(Number(formData.get("semester") || 1), 1);
  if (semester > 14) return { error: "Semester maksimal 14 (masa studi maksimal)." };
  const tahunAkademik = String(formData.get("tahunAkademik") || "").trim() || null;
  const kebutuhan = Number(formData.get("kebutuhan") || 0);
  if (!nama || !nim || !prodi || kebutuhan <= 0) return { error: "Lengkapi data mahasiswa (nama, NIM, prodi, kebutuhan)." };
  const dup = await prisma.mahasiswa.findUnique({ where: { nim } });
  if (dup) return { error: "NIM sudah terdaftar." };
  const m = await prisma.mahasiswa.create({
    data: { nama, nim, prodi, semester, tahunAkademik, nominalKebutuhanPerBulan: kebutuhan, fotoUrl: null },
  });
  await audit({ userId: admin.id, jenisAksi: "create", entitas: "mahasiswa", entitasId: m.id, detailPerubahan: { nama, nim, prodi, tahunAkademik } });
  revalidatePath("/admin-akademik");
  return { ok: true };
}

export async function uploadKhsAction(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const admin = await getSessionUser();
  if (!admin || admin.role !== "admin_akademik") return { error: "Tidak berwenang." };
  const mahasiswaId = String(formData.get("mahasiswaId") || "");
  const semester = Number(formData.get("semester") || 1);
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Pilih file KHS." };
  if (file.size > MAX_FILE_SIZE) return { error: "Ukuran file maksimal 5MB." };
  if (!isAllowedPdf(file.type)) return { error: "KHS harus berupa file PDF." };
  const buf = Buffer.from(await file.arrayBuffer());
  const stored = await saveFile("khs", `${mahasiswaId}-s${semester}-${Date.now()}.pdf`, buf);
  await prisma.ipkHistory.updateMany({ where: { mahasiswaId, semester }, data: { fileKhsUrl: stored.url } });
  await audit({ userId: admin.id, jenisAksi: "upload", entitas: "khs", detailPerubahan: { mahasiswaId, semester, url: stored.url } });
  revalidatePath("/admin-akademik");
  return { ok: true };
}

// ---------------- Upload Bukti (Donatur) ----------------

/** Generate tagihan bulan berjalan (lazy) untuk semua mapping aktif yang belum punya. */
export async function ensureBulananTagihan(): Promise<void> {
  const nowKey = bulanKeyNow();
  const label = bulanLabel(nowKey);
  const aktif = await prisma.mappingBeasiswa.findMany({
    where: { status: "aktif" },
    include: { tagihan: { select: { periodeKey: true } } },
  });
  for (const m of aktif) {
    if (m.tagihan.some((t) => t.periodeKey === nowKey)) continue;
    const kode = `LZ-${Date.now().toString(36)}-${Math.floor(1000 + Math.random() * 9000)}`;
    await prisma.tagihan.create({
      data: {
        mappingBeasiswaId: m.id, periode: label, periodeKey: nowKey,
        nominalHarusDibayar: m.nominalTanggungan, kodeReferensiUnik: kode,
        tanggalJatuhTempo: new Date(Date.now() + 14 * 86400000), status: "pending",
      },
    });
  }
}

export async function uploadBuktiAction(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const don = await getSessionUser();
  if (!don || don.role !== "donatur" || !don.donatur) return { error: "Tidak berwenang." };
  const mappingId = String(formData.get("mappingId") || "");
  const nominal = Number(formData.get("nominal") || 0);
  const cakupan = String(formData.get("cakupan") || "bulan_ini");
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Upload bukti transfer." };
  if (file.size > MAX_FILE_SIZE) return { error: "Ukuran file maksimal 5MB." };
  if (!isAllowedImage(file.type)) return { error: "Bukti transfer harus berupa gambar PNG atau JPG." };

  const mapping = await prisma.mappingBeasiswa.findUnique({ where: { id: mappingId } });
  if (!mapping || mapping.donaturId !== don.donatur.id || mapping.status !== "aktif") return { error: "Data mahasiswa asuh tidak ditemukan." };

  const buf = Buffer.from(await file.arrayBuffer());
  const ext = imageExtension(file.type);
  const stored = await saveFile("buktiTransfer", `bukti-${mappingId.slice(0, 8)}-${Date.now()}.${ext}`, buf);

  const res = await prisma.$transaction(async (tx) => {
    const nowKey = bulanKeyNow();
    const existing = await tx.tagihan.findMany({ where: { mappingBeasiswaId: mapping.id } });
    const byKey = new Map(existing.map((t) => [t.periodeKey, t]));

    const buatTagihan = async (k: string) =>
      tx.tagihan.create({
        data: {
          mappingBeasiswaId: mapping.id, periode: bulanLabel(k), periodeKey: k,
          nominalHarusDibayar: mapping.nominalTanggungan,
          kodeReferensiUnik: `LZ-${Date.now().toString(36)}-${Math.floor(1000 + Math.random() * 9000)}`,
          tanggalJatuhTempo: new Date(Date.now() + 14 * 86400000), status: "pending",
        },
      });

    if (!byKey.has(nowKey)) byKey.set(nowKey, await buatTagihan(nowKey));

    const bisaDibayar = (t: { status: string }) => t.status === "pending" || t.status === "ditolak";
    let targets: { id: string; periodeKey: string; nominalHarusDibayar: number }[] = [];
    if (cakupan === "semua") {
      const pending = Array.from(byKey.values()).filter(bisaDibayar);
      if (pending.length === 0) {
        const t = byKey.get(nowKey);
        if (t && bisaDibayar(t)) targets = [t];
      } else {
        targets = pending;
      }
    } else if (cakupan === "semester") {
      for (let i = 0; i < 6; i++) {
        const k = bulanKeyTambah(nowKey, i);
        const t = byKey.get(k);
        if (t) {
          if (bisaDibayar(t)) targets.push(t);
        } else {
          targets.push(await buatTagihan(k));
        }
      }
    } else {
      const t = byKey.get(nowKey);
      if (t && bisaDibayar(t)) targets = [t];
    }
    if (targets.length === 0) return null;

    const nominalPerTagihan = nominal > 0 ? Math.round(nominal / targets.length) : mapping.nominalTanggungan;
    for (const t of targets) {
      await tx.pembayaran.create({
        data: { tagihanId: t.id, fileBuktiTransferUrl: stored.url, tanggalTransfer: new Date(), nominalDitransfer: nominalPerTagihan },
      });
      await tx.tagihan.update({ where: { id: t.id }, data: { status: "menunggu_verifikasi" } });
    }
    await tx.auditLog.create({
      data: {
        userId: don.id, jenisAksi: "upload", entitas: "pembayaran", entitasId: mapping.id,
        detailPerubahan: JSON.stringify({ nominal, cakupan, jumlahTagihan: targets.length, bulan: targets.map((t) => t.periodeKey) }),
      },
    });
    return targets;
  });
  if (!res) return { error: "Tidak ada tagihan yang bisa dibayar (semua sudah lunas)." };
  await notificationService.sendWa("08123456", `Bukti transfer baru menunggu verifikasi (${res.length} tagihan).`);
  revalidatePath("/donatur");
  revalidatePath("/donatur/tagihan");
  return { ok: true };
}

export async function ajukanRekeningAction(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const laz = await getSessionUser();
  if (!laz || laz.role !== "lazismu") return { error: "Tidak berwenang." };
  const namaBank = String(formData.get("namaBank") || "").trim();
  const nomorRekening = String(formData.get("nomorRekening") || "").trim();
  if (!namaBank || !nomorRekening) return { error: "Lengkapi nama bank dan nomor rekening." };
  await prisma.rekeningBank.create({
    data: { namaBank, nomorRekening, atasNama: "Yayasan SOTA ITBMP", diajukanOlehId: laz.id, status: "pending" },
  });
  await audit({ userId: laz.id, jenisAksi: "create", entitas: "rekening_bank", detailPerubahan: { namaBank, nomorRekening } });
  revalidatePath("/lazismu");
  return { ok: true };
}

export async function ajukanGantiAction(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const don = await getSessionUser();
  if (!don || don.role !== "donatur" || !don.donatur) return { error: "Tidak berwenang." };
  const mappingId = String(formData.get("mappingId") || "");
  const alasan = String(formData.get("alasan") || "").trim() || "Pergantian mahasiswa asuh";
  const mapping = await prisma.mappingBeasiswa.findUnique({ where: { id: mappingId } });
  if (!mapping || mapping.donaturId !== don.donatur.id || mapping.status !== "aktif") return { error: "Mapping tidak ditemukan." };
  await prisma.$transaction(async (tx) => {
    await tx.mappingBeasiswa.update({ where: { id: mappingId }, data: { status: "diganti", tanggalDiubah: new Date(), diubahOlehId: don.id } });
    await tx.mahasiswa.update({ where: { id: mapping.mahasiswaId }, data: { statusCover: "belum_ada_donatur" } });
    await tx.auditLog.create({ data: { userId: don.id, jenisAksi: "ajukan_ganti", entitas: "mapping_beasiswa", entitasId: mappingId, detailPerubahan: JSON.stringify({ alasan }) } });
  });
  revalidatePath("/donatur");
  return { ok: true };
}