-- CreateEnum
CREATE TYPE "SumberPembayaran" AS ENUM ('sistem', 'manual');

-- AlterTable
ALTER TABLE "Pembayaran" ADD COLUMN     "sumber" "SumberPembayaran" NOT NULL DEFAULT 'sistem';

-- CreateIndex
CREATE INDEX "Pembayaran_status_tanggalAcc_idx" ON "Pembayaran"("status", "tanggalAcc");

-- Backfill pembayaran manual (dibuat via transaksi-manual) agar sumber = manual
UPDATE "Pembayaran" SET "sumber" = 'manual' WHERE "batchId" LIKE 'BATCH-MAN%';
