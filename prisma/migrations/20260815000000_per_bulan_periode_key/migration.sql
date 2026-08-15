-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Mahasiswa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "nim" TEXT NOT NULL,
    "prodi" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "fotoUrl" TEXT,
    "nominalKebutuhanPerBulan" INTEGER NOT NULL,
    "statusCover" TEXT NOT NULL DEFAULT 'belum_ada_donatur',
    "statusAktif" TEXT NOT NULL DEFAULT 'aktif',
    "tahunAkademik" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Mahasiswa" ("createdAt", "fotoUrl", "id", "nama", "nim", "nominalKebutuhanPerBulan", "prodi", "semester", "statusAktif", "statusCover", "tahunAkademik", "updatedAt") SELECT "createdAt", "fotoUrl", "id", "nama", "nim", "nominalKebutuhanPerSemester", "prodi", "semester", "statusAktif", "statusCover", "tahunAkademik", "updatedAt" FROM "Mahasiswa";
DROP TABLE "Mahasiswa";
ALTER TABLE "new_Mahasiswa" RENAME TO "Mahasiswa";
CREATE UNIQUE INDEX "Mahasiswa_nim_key" ON "Mahasiswa"("nim");
CREATE TABLE "new_MappingBeasiswa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "donaturId" TEXT NOT NULL,
    "mahasiswaId" TEXT NOT NULL,
    "nominalTanggungan" INTEGER NOT NULL,
    "tanggalMulai" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "dibuatOlehId" TEXT NOT NULL,
    "diubahOlehId" TEXT,
    "tanggalDiubah" DATETIME,
    CONSTRAINT "MappingBeasiswa_donaturId_fkey" FOREIGN KEY ("donaturId") REFERENCES "Donatur" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MappingBeasiswa_mahasiswaId_fkey" FOREIGN KEY ("mahasiswaId") REFERENCES "Mahasiswa" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MappingBeasiswa" ("dibuatOlehId", "diubahOlehId", "donaturId", "id", "mahasiswaId", "nominalTanggungan", "status", "tanggalDiubah", "tanggalMulai") SELECT "dibuatOlehId", "diubahOlehId", "donaturId", "id", "mahasiswaId", "nominalTanggungan", "status", "tanggalDiubah", "tanggalMulai" FROM "MappingBeasiswa";
DROP TABLE "MappingBeasiswa";
ALTER TABLE "new_MappingBeasiswa" RENAME TO "MappingBeasiswa";
CREATE INDEX "MappingBeasiswa_mahasiswaId_status_idx" ON "MappingBeasiswa"("mahasiswaId", "status");
CREATE INDEX "MappingBeasiswa_donaturId_status_idx" ON "MappingBeasiswa"("donaturId", "status");
CREATE TABLE "new_Tagihan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mappingBeasiswaId" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "periodeKey" TEXT NOT NULL,
    "nominalHarusDibayar" INTEGER NOT NULL,
    "kodeReferensiUnik" TEXT NOT NULL,
    "tanggalJatuhTempo" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    CONSTRAINT "Tagihan_mappingBeasiswaId_fkey" FOREIGN KEY ("mappingBeasiswaId") REFERENCES "MappingBeasiswa" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Tagihan" ("id", "kodeReferensiUnik", "mappingBeasiswaId", "nominalHarusDibayar", "periode", "periodeKey", "status", "tanggalJatuhTempo") SELECT "id", "kodeReferensiUnik", "mappingBeasiswaId", "nominalHarusDibayar", "periode", "periode", "status", "tanggalJatuhTempo" FROM "Tagihan";
DROP TABLE "Tagihan";
ALTER TABLE "new_Tagihan" RENAME TO "Tagihan";
CREATE UNIQUE INDEX "Tagihan_kodeReferensiUnik_key" ON "Tagihan"("kodeReferensiUnik");
CREATE INDEX "Tagihan_mappingBeasiswaId_status_idx" ON "Tagihan"("mappingBeasiswaId", "status");
CREATE UNIQUE INDEX "Tagihan_mappingBeasiswaId_periodeKey_key" ON "Tagihan"("mappingBeasiswaId", "periodeKey");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
