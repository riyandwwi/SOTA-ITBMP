import { MobileShell } from "@/components/mobile-shell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <MobileShell>{children}</MobileShell>;
}