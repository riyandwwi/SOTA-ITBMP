-- AlterTable
ALTER TABLE "Pembayaran" ADD COLUMN     "batchId" TEXT;

-- CreateIndex
CREATE INDEX "Pembayaran_batchId_idx" ON "Pembayaran"("batchId");
