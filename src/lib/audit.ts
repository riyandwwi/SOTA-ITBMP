import { prisma } from "./db";

interface AuditInput {
  userId?: string | null;
  jenisAksi: string;
  entitas: string;
  entitasId?: string | null;
  detailPerubahan?: unknown;
  status?: string;
}

/** Pusat pencatatan audit — dipanggil dari semua modul agar tidak ada yang terlewat. */
export async function audit(input: AuditInput) {
  await prisma.auditLog.create({
    data: {
      userId: input.userId ?? null,
      jenisAksi: input.jenisAksi,
      entitas: input.entitas,
      entitasId: input.entitasId ?? null,
      detailPerubahan: input.detailPerubahan ? JSON.stringify(input.detailPerubahan) : null,
      status: input.status ?? null,
    },
  });
}