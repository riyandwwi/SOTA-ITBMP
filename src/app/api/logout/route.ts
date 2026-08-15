import { NextResponse, type NextRequest } from "next/server";
import { getSession, getSessionUser } from "@/lib/auth";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const u = await getSessionUser();
  await audit({ userId: u?.id, jenisAksi: "logout", entitas: "session" });
  const session = await getSession();
  session.destroy();
  const res = NextResponse.redirect(new URL("/login", req.url), 303);
  res.cookies.delete("lazismu_session");
  return res;
}