import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "@/components/login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sistem Orang Tua Asuh Institut Teknologi dan Bisnis Muhammadiyah Purbalingga",
};

const HOME: Record<string, string> = {
  super_admin: "/super-admin",
  admin_akademik: "/admin-akademik",
  lazismu: "/lazismu",
  donatur: "/donatur",
  pimpinan: "/pimpinan",
};

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect(HOME[user.role] || "/");

  return (
    <div className="login-stage">
      <div className="login-card">
        <div className="brand">
          <div className="brand-text"><strong style={{ color: "#111" }}>Sistem Orang Tua Asuh</strong><span style={{ color: "#444" }}>Institut Teknologi dan Bisnis Muhammadiyah Purbalingga</span></div>
        </div>
        <h1>Masuk</h1>
        <p className="sub">Gunakan kredensial akun yang diberikan pengelola.</p>
        <LoginForm />
      </div>
    </div>
  );
}