import { NextResponse, type NextRequest } from "next/server";
import ExcelJS from "exceljs";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await requireUser(["super_admin", "admin_akademik"]);
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("aksi") || undefined;
  const dari = searchParams.get("dari");
  const sampai = searchParams.get("sampai");

  const LOGIN_ONLY = ["login", "logout", "lihat_password"];
  const where: any = {
    ...(filter && filter !== "semua" ? { jenisAksi: filter } : {}),
    ...(user.role === "admin_akademik" ? { jenisAksi: { notIn: LOGIN_ONLY } } : {}),
    ...(dari ? { timestamp: { gte: new Date(dari) } } : {}),
    ...(sampai ? { timestamp: { lte: new Date(sampai) } } : {}),
  };

  const logs = await prisma.auditLog.findMany({ where, orderBy: { timestamp: "desc" }, take: 2000 });

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Audit Log");
  ws.columns = [
    { header: "Waktu", key: "waktu", width: 22 },
    { header: "User ID", key: "user", width: 12 },
    { header: "Aksi", key: "aksi", width: 14 },
    { header: "Entitas", key: "entitas", width: 24 },
    { header: "Detail", key: "detail", width: 60 },
    { header: "Status", key: "status", width: 12 },
  ];
  logs.forEach((l) => {
    ws.addRow({
      waktu: l.timestamp.toISOString(),
      user: l.userId ?? "sistem",
      aksi: l.jenisAksi,
      entitas: l.entitas,
      detail: l.detailPerubahan ?? "",
      status: l.status ?? "",
    });
  });
  ws.getRow(1).font = { bold: true };

  const buf = Buffer.from(await wb.xlsx.writeBuffer());
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="audit-log.xlsx"`,
    },
  });
}