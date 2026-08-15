import { PrismaClient } from "@prisma/client";
import { hashPassword, encryptSecret } from "../src/lib/password";

const prisma = new PrismaClient();

// Jaminan Aturan #1 (anti double-assign) di level database, khusus SQLite dev.
// Untuk PostgreSQL, tambahkan via migration SQL (lihat dokumentasi).
async function ensurePartialIndex() {
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS mapping_beasiswa_mahasiswa_aktif_unique
     ON "MappingBeasiswa" ("mahasiswaId") WHERE "status" = 'aktif'`
  );
}

const NILAI: Record<string, number> = {
  A: 4, AB: 3.5, B: 3, BC: 2.5, C: 2, D: 1, E: 0,
};

async function main() {
  if (await prisma.user.findUnique({ where: { username: "admin" } })) {
    console.log("Seed sudah ada — dilewati.");
    return;
  }

  // ---- Super Admin (Aturan #18) ----
  const admin = await prisma.user.create({
    data: {
      nama: "Administrator Utama",
      email: "admin@lazismu.org",
      username: "admin",
      role: "super_admin",
      passwordHash: await hashPassword("06280795"),
      passwordEncrypted: encryptSecret("06280795"),
    },
  });

  // ---- Role lain ----
  const akad = await prisma.user.create({
    data: {
      nama: "Nurul Azizah", email: "nurul@lazismu.org", username: "nurul",
      role: "admin_akademik", dibuatOlehId: admin.id,
      passwordHash: await hashPassword("akademik123"), passwordEncrypted: encryptSecret("akademik123"),
    },
  });
  const laz = await prisma.user.create({
    data: {
      nama: "Rina Hartono", email: "rina@lazismu.org", username: "rina",
      role: "lazismu", dibuatOlehId: admin.id,
      passwordHash: await hashPassword("lazismu123"), passwordEncrypted: encryptSecret("lazismu123"),
    },
  });
  await prisma.user.create({
    data: {
      nama: "Agus Prasetyo", email: "agus@lazismu.org", username: "agus",
      role: "pimpinan", dibuatOlehId: admin.id,
      passwordHash: await hashPassword("pimpinan123"), passwordEncrypted: encryptSecret("pimpinan123"),
    },
  });

  const donatData = [
    { nama: "Budi Santoso", email: "budi@email.id", username: "budi", tipe: "individu" as const, wa: "081234567890", target: 3 },
    { nama: "PT Anugerah Sejahtera", email: "sejahtera@corp.id", username: "anugerah", tipe: "korporat" as const, wa: "081311223344", target: 4 },
    { nama: "Siti Rahmawati", email: "siti@email.id", username: "siti", tipe: "individu" as const, wa: "085799881122", target: 2 },
    { nama: "Hendra Gunawan", email: "hendra@email.id", username: "hendra", tipe: "individu" as const, wa: "082144556677", target: 2 },
  ];
  const donaturs: Record<string, any> = {};
  for (const d of donatData) {
    const u = await prisma.user.create({
      data: {
        nama: d.nama, email: d.email, username: d.username, role: "donatur",
        dibuatOlehId: akad.id,
        passwordHash: await hashPassword("donatur123"), passwordEncrypted: encryptSecret("donatur123"),
      },
    });
    donaturs[d.username] = await prisma.donatur.create({
      data: {
        userId: u.id, kontakWa: d.wa, tipeDonatur: d.tipe, jumlahMahasiswaTarget: d.target,
      },
    });
  }

  // ---- Mahasiswa (nominal kebutuhan per BULAN) ----
  const mhsData = [
    { nama: "Dewi Puspita", nim: "20210114", prodi: "Akuntansi", semester: 5, nominalKebutuhanPerBulan: 750000, statusCover: "sudah_ada_donatur" as const },
    { nama: "Rifqi Fadillah", nim: "20210087", prodi: "Teknik Informatika", semester: 3, nominalKebutuhanPerBulan: 850000, statusCover: "sudah_ada_donatur" as const },
    { nama: "Yusuf Wijaya", nim: "20200032", prodi: "Hukum", semester: 7, nominalKebutuhanPerBulan: 650000, statusCover: "sudah_ada_donatur" as const },
    { nama: "Siti Maryam", nim: "20220049", prodi: "Kedokteran", semester: 1, nominalKebutuhanPerBulan: 1050000, statusCover: "belum_ada_donatur" as const },
    { nama: "Ahmad Fauzi", nim: "20210162", prodi: "Manajemen", semester: 5, nominalKebutuhanPerBulan: 700000, statusCover: "belum_ada_donatur" as const },
    { nama: "Lina Salsabila", nim: "20220071", prodi: "Psikologi", semester: 1, nominalKebutuhanPerBulan: 720000, statusCover: "belum_ada_donatur" as const },
    { nama: "Rendi Pratama", nim: "20230015", prodi: "Ekonomi Syariah", semester: 1, nominalKebutuhanPerBulan: 600000, statusCover: "belum_ada_donatur" as const },
  ];
  const mahasiswa: Record<string, any> = {};
  for (const m of mhsData) {
    mahasiswa[m.nim] = await prisma.mahasiswa.create({ data: { ...m, fotoUrl: null } });
  }

  // ---- IPK + nilai (untuk mahasiswa yang sudah di-cover) ----
  const nilaiMhs = [
    { mhs: "20210114", semester: 5, mk: [["Akuntansi Lanjutan", 3, "A"], ["Auditing", 3, "AB"], ["Perpajakan II", 2, "A"], ["Statistika Bisnis", 2, "B"]] },
    { mhs: "20210087", semester: 3, mk: [["Basis Data", 3, "A"], ["Struktur Data", 3, "AB"], ["Sistem Operasi", 3, "B"], ["Matematika Diskrit", 2, "A"]] },
    { mhs: "20200032", semester: 7, mk: [["Hukum Pidana", 3, "AB"], ["Hukum Perdata", 3, "B"], ["ETIKA Profesi", 2, "A"], ["Metode Penelitian", 3, "AB"]] },
  ];
  for (const row of nilaiMhs) {
    const totalBobot = row.mk.reduce((s, mk) => s + (NILAI[mk[2] as string] ?? 0) * (mk[1] as number), 0);
    const totalSks = row.mk.reduce((s, mk) => s + (mk[1] as number), 0);
    const ipk = Math.round((totalBobot / totalSks) * 100) / 100;
    const ipkRec = await prisma.ipkHistory.create({
      data: {
        mahasiswaId: mahasiswa[row.mhs].id, semester: row.semester, nilaiIpk: ipk,
        flagPeringatan: ipk < 3,
        mataKuliahNilai: {
          create: row.mk.map((mk) => ({
            namaMataKuliah: mk[0] as string, sks: mk[1] as number,
            nilaiHuruf: mk[2] as string, bobotNilai: NILAI[mk[2] as string] as number,
          })),
        },
      },
    });
    console.log("IPK", row.mhs, ipkRec.nilaiIpk);
  }

  // ---- Mapping 1:1 + tagihan (lunas periode Juli 2026) + pembayaran ----
  const mappingSpecs = [
    { don: "budi", mhs: "20210114", nominal: 750000, status: "aktif" as const },
    { don: "anugerah", mhs: "20210087", nominal: 850000, status: "aktif" as const },
    { don: "siti", mhs: "20200032", nominal: 650000, status: "aktif" as const },
  ];
  const genKode = () => "LZ-" + Date.now().toString(36) + "-" + Math.floor(1000 + Math.random() * 9000);
  for (const sp of mappingSpecs) {
    const mapping = await prisma.mappingBeasiswa.create({
      data: {
        donaturId: donaturs[sp.don].id, mahasiswaId: mahasiswa[sp.mhs].id,
        nominalTanggungan: sp.nominal, status: sp.status,
        dibuatOlehId: akad.id,
      },
    });
    const tagihan = await prisma.tagihan.create({
      data: {
        mappingBeasiswaId: mapping.id, periode: "Juli 2026", periodeKey: "2026-07",
        nominalHarusDibayar: sp.nominal, kodeReferensiUnik: genKode(),
        tanggalJatuhTempo: new Date(Date.now() - 10 * 86400000), status: "lunas",
      },
    });
    await prisma.pembayaran.create({
      data: {
        tagihanId: tagihan.id, fileBuktiTransferUrl: "/bukti-transfer/contoh.png",
        tanggalTransfer: new Date(Date.now() - 3 * 86400000), nominalDitransfer: sp.nominal + Math.floor(Math.random() * 99) + 1,
        status: "acc", idAdminAcc: laz.id, tanggalAcc: new Date(Date.now() - 2 * 86400000),
        urlPdfStt: "/stt/contoh.pdf",
      },
    });
  }

  // ---- Rekening bank (1 aktif, 2 pending) ----
  await prisma.rekeningBank.create({
    data: { nomorRekening: "1330098821", namaBank: "Mandiri", atasNama: "Yayasan LAZISMU", diajukanOlehId: laz.id, status: "aktif", diAccOlehId: admin.id, tanggalAcc: new Date() },
  });
  await prisma.rekeningBank.create({ data: { nomorRekening: "7001234509", namaBank: "BSI", atasNama: "Yayasan LAZISMU", diajukanOlehId: laz.id, status: "pending" } });
  await prisma.rekeningBank.create({ data: { nomorRekening: "0123456789", namaBank: "BNI", atasNama: "Yayasan LAZISMU", diajukanOlehId: laz.id, status: "pending" } });

  // ---- Audit log contoh ----
  await prisma.auditLog.createMany({
    data: [
      { userId: laz.id, jenisAksi: "acc", entitas: "pembayaran", entitasId: "TR-DEWI", timestamp: new Date(Date.now() - 3600e3) },
      { userId: akad.id, jenisAksi: "create", entitas: "mahasiswa", timestamp: new Date(Date.now() - 7200e3) },
      { userId: admin.id, jenisAksi: "login", entitas: "session", status: "berhasil", timestamp: new Date(Date.now() - 9000e3) },
    ],
  });

  console.log("Seed selesai. Login default:");
  console.log("  Super Admin : admin / 06280795");
  console.log("  Admin Akad. : nurul / akademik123");
  console.log("  LAZISMU     : rina / lazismu123");
  console.log("  Pimpinan    : agus / pimpinan123");
  console.log("  Donatur     : budi / donatur123");

  await ensurePartialIndex();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());