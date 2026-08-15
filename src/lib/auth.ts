import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getIronSession, type IronSession } from "iron-session";
import { prisma } from "./db";

export interface SessionData {
  userId: string;
  username: string;
  role: string;
  isLoggedIn: boolean;
}

const sessionOptions = {
  cookieName: "lazismu_session",
  password: process.env.SESSION_SECRET || "lazismu-secret-at-least-32-characters!",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  },
} as const;

export async function getSession(): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function getSessionUser() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { donatur: true },
  });
  return user;
}

export async function requireUser(roles?: string[]) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    redirect("/login");
  }
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { donatur: true },
  });
  if (!user) {
    redirect("/login");
  }
  if (roles && !roles.includes(user.role)) {
    redirect("/");
  }
  return user;
}

export const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super Admin",
  admin_akademik: "Admin Akademik",
  lazismu: "LAZISMU",
  donatur: "Donatur",
  pimpinan: "Pimpinan",
};