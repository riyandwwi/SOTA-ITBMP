-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('super_admin', 'admin_akademik', 'lazismu', 'donatur', 'pimpinan');

-- CreateEnum
CREATE TYPE "StatusCover" AS ENUM ('belum_ada_donatur', 'sudah_ada_donatur');

-- CreateEnum
CREATE TYPE "StatusAktif" AS ENUM ('aktif', 'diarsipkan');

-- CreateEnum
CREATE TYPE "TipeDonatur" AS ENUM ('individu', 'korporat');

-- CreateEnum
CREATE TYPE "StatusRekening" AS ENUM ('pending', 'aktif', 'nonaktif');

-- CreateEnum
CREATE TYPE "StatusMapping" AS ENUM ('aktif', 'diganti', 'selesai');

-- CreateEnum
CREATE TYPE "StatusTagihan" AS ENUM ('pending', 'menunggu_verifikasi', 'lunas', 'ditolak');

-- CreateEnum
CREATE TYPE "StatusPembayaran" AS ENUM ('menunggu', 'acc', 'ditolak');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "passwordEncrypted" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "dibuatOlehId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mahasiswa" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nim" TEXT NOT NULL,
    "prodi" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "fotoUrl" TEXT,
    "nominalKebutuhanPerBulan" INTEGER NOT NULL,
    "statusCover" "StatusCover" NOT NULL DEFAULT 'belum_ada_donatur',
    "statusAktif" "StatusAktif" NOT NULL DEFAULT 'aktif',
    "tahunAkademik" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mahasiswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donatur" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kontakWa" TEXT NOT NULL,
    "tipeDonatur" "TipeDonatur" NOT NULL,
    "jumlahMahasiswaTarget" INTEGER NOT NULL,

    CONSTRAINT "Donatur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RekeningBank" (
    "id" TEXT NOT NULL,
    "nomorRekening" TEXT NOT NULL,
    "namaBank" TEXT NOT NULL,
    "atasNama" TEXT NOT NULL,
    "diajukanOlehId" TEXT NOT NULL,
    "status" "StatusRekening" NOT NULL DEFAULT 'pending',
    "diAccOlehId" TEXT,
    "tanggalAcc" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RekeningBank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IpkHistory" (
    "id" TEXT NOT NULL,
    "mahasiswaId" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "nilaiIpk" DOUBLE PRECISION NOT NULL,
    "fileKhsUrl" TEXT,
    "flagPeringatan" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IpkHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MataKuliahNilai" (
    "id" TEXT NOT NULL,
    "ipkHistoryId" TEXT NOT NULL,
    "namaMataKuliah" TEXT NOT NULL,
    "sks" INTEGER NOT NULL,
    "nilaiHuruf" TEXT NOT NULL,
    "bobotNilai" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "MataKuliahNilai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MappingBeasiswa" (
    "id" TEXT NOT NULL,
    "donaturId" TEXT NOT NULL,
    "mahasiswaId" TEXT NOT NULL,
    "nominalTanggungan" INTEGER NOT NULL,
    "tanggalMulai" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "StatusMapping" NOT NULL DEFAULT 'aktif',
    "dibuatOlehId" TEXT NOT NULL,
    "diubahOlehId" TEXT,
    "tanggalDiubah" TIMESTAMP(3),

    CONSTRAINT "MappingBeasiswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tagihan" (
    "id" TEXT NOT NULL,
    "mappingBeasiswaId" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "periodeKey" TEXT NOT NULL,
    "nominalHarusDibayar" INTEGER NOT NULL,
    "kodeReferensiUnik" TEXT NOT NULL,
    "tanggalJatuhTempo" TIMESTAMP(3) NOT NULL,
    "status" "StatusTagihan" NOT NULL DEFAULT 'pending',

    CONSTRAINT "Tagihan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pembayaran" (
    "id" TEXT NOT NULL,
    "tagihanId" TEXT NOT NULL,
    "fileBuktiTransferUrl" TEXT NOT NULL,
    "tanggalTransfer" TIMESTAMP(3) NOT NULL,
    "nominalDitransfer" INTEGER NOT NULL,
    "status" "StatusPembayaran" NOT NULL DEFAULT 'menunggu',
    "alasanPenolakan" TEXT,
    "idAdminAcc" TEXT,
    "urlPdfStt" TEXT,
    "tanggalAcc" TIMESTAMP(3),

    CONSTRAINT "Pembayaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "jenisAksi" TEXT NOT NULL,
    "entitas" TEXT NOT NULL,
    "entitasId" TEXT,
    "detailPerubahan" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Mahasiswa_nim_key" ON "Mahasiswa"("nim");

-- CreateIndex
CREATE UNIQUE INDEX "Donatur_userId_key" ON "Donatur"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "IpkHistory_mahasiswaId_semester_key" ON "IpkHistory"("mahasiswaId", "semester");

-- CreateIndex
CREATE INDEX "MappingBeasiswa_mahasiswaId_status_idx" ON "MappingBeasiswa"("mahasiswaId", "status");

-- CreateIndex
CREATE INDEX "MappingBeasiswa_donaturId_status_idx" ON "MappingBeasiswa"("donaturId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Tagihan_kodeReferensiUnik_key" ON "Tagihan"("kodeReferensiUnik");

-- CreateIndex
CREATE INDEX "Tagihan_mappingBeasiswaId_status_idx" ON "Tagihan"("mappingBeasiswaId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Tagihan_mappingBeasiswaId_periodeKey_key" ON "Tagihan"("mappingBeasiswaId", "periodeKey");

-- CreateIndex
CREATE INDEX "AuditLog_jenisAksi_idx" ON "AuditLog"("jenisAksi");

-- CreateIndex
CREATE INDEX "AuditLog_entitas_idx" ON "AuditLog"("entitas");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_dibuatOlehId_fkey" FOREIGN KEY ("dibuatOlehId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donatur" ADD CONSTRAINT "Donatur_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RekeningBank" ADD CONSTRAINT "RekeningBank_diajukanOlehId_fkey" FOREIGN KEY ("diajukanOlehId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IpkHistory" ADD CONSTRAINT "IpkHistory_mahasiswaId_fkey" FOREIGN KEY ("mahasiswaId") REFERENCES "Mahasiswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MataKuliahNilai" ADD CONSTRAINT "MataKuliahNilai_ipkHistoryId_fkey" FOREIGN KEY ("ipkHistoryId") REFERENCES "IpkHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MappingBeasiswa" ADD CONSTRAINT "MappingBeasiswa_donaturId_fkey" FOREIGN KEY ("donaturId") REFERENCES "Donatur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MappingBeasiswa" ADD CONSTRAINT "MappingBeasiswa_mahasiswaId_fkey" FOREIGN KEY ("mahasiswaId") REFERENCES "Mahasiswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tagihan" ADD CONSTRAINT "Tagihan_mappingBeasiswaId_fkey" FOREIGN KEY ("mappingBeasiswaId") REFERENCES "MappingBeasiswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pembayaran" ADD CONSTRAINT "Pembayaran_tagihanId_fkey" FOREIGN KEY ("tagihanId") REFERENCES "Tagihan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Jaminan Aturan #1 (anti double-assign): satu mahasiswa hanya satu mapping aktif
CREATE UNIQUE INDEX "mapping_beasiswa_mahasiswa_aktif_unique"
ON "MappingBeasiswa"("mahasiswaId")
WHERE "status" = 'aktif';
