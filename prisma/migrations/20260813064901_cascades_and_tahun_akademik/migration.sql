-- AlterTable
ALTER TABLE "Mahasiswa" ADD COLUMN "tahunAkademik" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Donatur" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "kontakWa" TEXT NOT NULL,
    "tipeDonatur" TEXT NOT NULL,
    "jumlahMahasiswaTarget" INTEGER NOT NULL,
    CONSTRAINT "Donatur_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Donatur" ("id", "jumlahMahasiswaTarget", "kontakWa", "tipeDonatur", "userId") SELECT "id", "jumlahMahasiswaTarget", "kontakWa", "tipeDonatur", "userId" FROM "Donatur";
DROP TABLE "Donatur";
ALTER TABLE "new_Donatur" RENAME TO "Donatur";
CREATE UNIQUE INDEX "Donatur_userId_key" ON "Donatur"("userId");
CREATE TABLE "new_IpkHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mahasiswaId" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "nilaiIpk" REAL NOT NULL,
    "fileKhsUrl" TEXT,
    "flagPeringatan" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IpkHistory_mahasiswaId_fkey" FOREIGN KEY ("mahasiswaId") REFERENCES "Mahasiswa" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_IpkHistory" ("createdAt", "fileKhsUrl", "flagPeringatan", "id", "mahasiswaId", "nilaiIpk", "semester") SELECT "createdAt", "fileKhsUrl", "flagPeringatan", "id", "mahasiswaId", "nilaiIpk", "semester" FROM "IpkHistory";
DROP TABLE "IpkHistory";
ALTER TABLE "new_IpkHistory" RENAME TO "IpkHistory";
CREATE UNIQUE INDEX "IpkHistory_mahasiswaId_semester_key" ON "IpkHistory"("mahasiswaId", "semester");
CREATE TABLE "new_MappingBeasiswa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "donaturId" TEXT NOT NULL,
    "mahasiswaId" TEXT NOT NULL,
    "nominalTanggungan" INTEGER NOT NULL,
    "skemaBayar" TEXT NOT NULL,
    "tanggalMulai" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "dibuatOlehId" TEXT NOT NULL,
    "diubahOlehId" TEXT,
    "tanggalDiubah" DATETIME,
    CONSTRAINT "MappingBeasiswa_donaturId_fkey" FOREIGN KEY ("donaturId") REFERENCES "Donatur" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MappingBeasiswa_mahasiswaId_fkey" FOREIGN KEY ("mahasiswaId") REFERENCES "Mahasiswa" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MappingBeasiswa" ("dibuatOlehId", "diubahOlehId", "donaturId", "id", "mahasiswaId", "nominalTanggungan", "skemaBayar", "status", "tanggalDiubah", "tanggalMulai") SELECT "dibuatOlehId", "diubahOlehId", "donaturId", "id", "mahasiswaId", "nominalTanggungan", "skemaBayar", "status", "tanggalDiubah", "tanggalMulai" FROM "MappingBeasiswa";
DROP TABLE "MappingBeasiswa";
ALTER TABLE "new_MappingBeasiswa" RENAME TO "MappingBeasiswa";
CREATE INDEX "MappingBeasiswa_mahasiswaId_status_idx" ON "MappingBeasiswa"("mahasiswaId", "status");
CREATE INDEX "MappingBeasiswa_donaturId_status_idx" ON "MappingBeasiswa"("donaturId", "status");
CREATE TABLE "new_MataKuliahNilai" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ipkHistoryId" TEXT NOT NULL,
    "namaMataKuliah" TEXT NOT NULL,
    "sks" INTEGER NOT NULL,
    "nilaiHuruf" TEXT NOT NULL,
    "bobotNilai" REAL NOT NULL,
    CONSTRAINT "MataKuliahNilai_ipkHistoryId_fkey" FOREIGN KEY ("ipkHistoryId") REFERENCES "IpkHistory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MataKuliahNilai" ("bobotNilai", "id", "ipkHistoryId", "namaMataKuliah", "nilaiHuruf", "sks") SELECT "bobotNilai", "id", "ipkHistoryId", "namaMataKuliah", "nilaiHuruf", "sks" FROM "MataKuliahNilai";
DROP TABLE "MataKuliahNilai";
ALTER TABLE "new_MataKuliahNilai" RENAME TO "MataKuliahNilai";
CREATE TABLE "new_Pembayaran" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tagihanId" TEXT NOT NULL,
    "fileBuktiTransferUrl" TEXT NOT NULL,
    "tanggalTransfer" DATETIME NOT NULL,
    "nominalDitransfer" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'menunggu',
    "alasanPenolakan" TEXT,
    "idAdminAcc" TEXT,
    "urlPdfStt" TEXT,
    "tanggalAcc" DATETIME,
    CONSTRAINT "Pembayaran_tagihanId_fkey" FOREIGN KEY ("tagihanId") REFERENCES "Tagihan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Pembayaran" ("alasanPenolakan", "fileBuktiTransferUrl", "id", "idAdminAcc", "nominalDitransfer", "status", "tagihanId", "tanggalAcc", "tanggalTransfer", "urlPdfStt") SELECT "alasanPenolakan", "fileBuktiTransferUrl", "id", "idAdminAcc", "nominalDitransfer", "status", "tagihanId", "tanggalAcc", "tanggalTransfer", "urlPdfStt" FROM "Pembayaran";
DROP TABLE "Pembayaran";
ALTER TABLE "new_Pembayaran" RENAME TO "Pembayaran";
CREATE TABLE "new_RekeningBank" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomorRekening" TEXT NOT NULL,
    "namaBank" TEXT NOT NULL,
    "atasNama" TEXT NOT NULL,
    "diajukanOlehId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "diAccOlehId" TEXT,
    "tanggalAcc" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RekeningBank_diajukanOlehId_fkey" FOREIGN KEY ("diajukanOlehId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RekeningBank" ("atasNama", "createdAt", "diAccOlehId", "diajukanOlehId", "id", "namaBank", "nomorRekening", "status", "tanggalAcc") SELECT "atasNama", "createdAt", "diAccOlehId", "diajukanOlehId", "id", "namaBank", "nomorRekening", "status", "tanggalAcc" FROM "RekeningBank";
DROP TABLE "RekeningBank";
ALTER TABLE "new_RekeningBank" RENAME TO "RekeningBank";
CREATE TABLE "new_Tagihan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mappingBeasiswaId" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "nominalHarusDibayar" INTEGER NOT NULL,
    "kodeReferensiUnik" TEXT NOT NULL,
    "tanggalJatuhTempo" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    CONSTRAINT "Tagihan_mappingBeasiswaId_fkey" FOREIGN KEY ("mappingBeasiswaId") REFERENCES "MappingBeasiswa" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Tagihan" ("id", "kodeReferensiUnik", "mappingBeasiswaId", "nominalHarusDibayar", "periode", "status", "tanggalJatuhTempo") SELECT "id", "kodeReferensiUnik", "mappingBeasiswaId", "nominalHarusDibayar", "periode", "status", "tanggalJatuhTempo" FROM "Tagihan";
DROP TABLE "Tagihan";
ALTER TABLE "new_Tagihan" RENAME TO "Tagihan";
CREATE UNIQUE INDEX "Tagihan_kodeReferensiUnik_key" ON "Tagihan"("kodeReferensiUnik");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
