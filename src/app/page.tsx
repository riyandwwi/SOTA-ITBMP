import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

const HOME: Record<string, string> = {
  super_admin: "/super-admin",
  admin_akademik: "/admin-akademik",
  lazismu: "/lazismu",
  donatur: "/donatur",
  pimpinan: "/pimpinan",
};

export default async function Home() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  redirect(HOME[user.role] || "/login");
}