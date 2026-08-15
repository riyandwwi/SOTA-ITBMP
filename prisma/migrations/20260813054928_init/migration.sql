-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "passwordEncrypted" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "dibuatOlehId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Mahasiswa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "nim" TEXT NOT NULL,
    "prodi" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "fotoUrl" TEXT,
    "nominalKebutuhanPerSemester" INTEGER NOT NULL,
    "statusCover" TEXT NOT NULL DEFAULT 'belum_ada_donatur',
    "statusAktif" TEXT NOT NULL DEFAULT 'aktif',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Donatur" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "kontakWa" TEXT NOT NULL,
    "tipeDonatur" TEXT NOT NULL,
    "jumlahMahasiswaTarget" INTEGER NOT NULL,
    CONSTRAINT "Donatur_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RekeningBank" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomorRekening" TEXT NOT NULL,
    "namaBank" TEXT NOT NULL,
    "atasNama" TEXT NOT NULL,
    "diajukanOlehId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "diAccOlehId" TEXT,
    "tanggalAcc" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "IpkHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mahasiswaId" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "nilaiIpk" REAL NOT NULL,
    "fileKhsUrl" TEXT,
    "flagPeringatan" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IpkHistory_mahasiswaId_fkey" FOREIGN KEY ("mahasiswaId") REFERENCES "Mahasiswa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MataKuliahNilai" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ipkHistoryId" TEXT NOT NULL,
    "namaMataKuliah" TEXT NOT NULL,
    "sks" INTEGER NOT NULL,
    "nilaiHuruf" TEXT NOT NULL,
    "bobotNilai" REAL NOT NULL,
    CONSTRAINT "MataKuliahNilai_ipkHistoryId_fkey" FOREIGN KEY ("ipkHistoryId") REFERENCES "IpkHistory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MappingBeasiswa" (
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
    CONSTRAINT "MappingBeasiswa_donaturId_fkey" FOREIGN KEY ("donaturId") REFERENCES "Donatur" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MappingBeasiswa_mahasiswaId_fkey" FOREIGN KEY ("mahasiswaId") REFERENCES "Mahasiswa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tagihan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mappingBeasiswaId" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "nominalHarusDibayar" INTEGER NOT NULL,
    "kodeReferensiUnik" TEXT NOT NULL,
    "tanggalJatuhTempo" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    CONSTRAINT "Tagihan_mappingBeasiswaId_fkey" FOREIGN KEY ("mappingBeasiswaId") REFERENCES "MappingBeasiswa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pembayaran" (
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
    CONSTRAINT "Pembayaran_tagihanId_fkey" FOREIGN KEY ("tagihanId") REFERENCES "Tagihan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "jenisAksi" TEXT NOT NULL,
    "entitas" TEXT NOT NULL,
    "entitasId" TEXT,
    "detailPerubahan" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT
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
CREATE INDEX "AuditLog_jenisAksi_idx" ON "AuditLog"("jenisAksi");

-- CreateIndex
CREATE INDEX "AuditLog_entitas_idx" ON "AuditLog"("entitas");

-- Jaminan anti double-assign (Aturan #1): unik partial index untuk mapping aktif
CREATE UNIQUE INDEX IF NOT EXISTS mapping_beasiswa_mahasiswa_aktif_unique ON "MappingBeasiswa" ("mahasiswaId") WHERE "status" = 'aktif';
