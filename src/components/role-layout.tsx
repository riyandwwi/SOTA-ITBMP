import { requireUser } from "@/lib/auth";
import { AppShell } from "./shell";

export async function RoleLayout({ role, children }: { role: string; children: React.ReactNode }) {
  const user = await requireUser([role]);
  return <AppShell user={user}>{children}</AppShell>;
}