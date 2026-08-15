import { NextResponse, type NextRequest } from "next/server";
import ExcelJS from "exceljs";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await requireUser(["super_admin", "admin_akademik", "pimpinan", "lazismu"]);
  const { searchParams } = new URL(req.url);
  const dari = searchParams.get("dari");
  const sampai = searchParams.get("sampai");

  const pembayaran = await prisma.pembayaran.findMany({
    where: {
      status: "acc",
      ...(dari ? { tanggalAcc: { gte: new Date(dari) } } : {}),
      ...(sampai ? { tanggalAcc: { lte: new Date(sampai) } } : {}),
    },
    orderBy: { tanggalAcc: "desc" },
    take: 2000,
    include: {
      tagihan: { include: { mappingBeasiswa: { include: { donatur: { include: { user: true } }, mahasiswa: true } } } },
    },
  });

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Laporan Donasi");
  ws.columns = [
    { header: "Tanggal", key: "tanggal", width: 18 },
    { header: "Donatur", key: "donatur", width: 24 },
    { header: "Mahasiswa", key: "mahasiswa", width: 22 },
    { header: "Nominal", key: "nominal", width: 16 },
    { header: "Kode Referensi", key: "kode", width: 22 },
  ];
  pembayaran.forEach((p) => {
    ws.addRow({
      tanggal: p.tanggalAcc?.toISOString() ?? "",
      donatur: p.tagihan.mappingBeasiswa.donatur.user.nama,
      mahasiswa: p.tagihan.mappingBeasiswa.mahasiswa.nama,
      nominal: p.nominalDitransfer,
      kode: p.tagihan.kodeReferensiUnik,
    });
  });
  ws.getRow(1).font = { bold: true };
  ws.getColumn("nominal").numFmt = "#,##0";

  const buf = Buffer.from(await wb.xlsx.writeBuffer());
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="laporan-donasi.xlsx"`,
    },
  });
}