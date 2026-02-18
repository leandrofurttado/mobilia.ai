"use client";

import { usePathname } from "next/navigation";
import FooterNav from "./FooterNav";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  return (
    <>
      <div className={`min-h-screen ${isLogin ? "" : "pb-20 md:pb-24"}`}>
        {children}
      </div>
      {!isLogin && <FooterNav />}
    </>
  );
}
