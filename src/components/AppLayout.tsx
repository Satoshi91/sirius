"use client";

import Header from "./Header";
import { usePathname } from "next/navigation";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const isLoginPage = pathname?.startsWith("/login") ?? false;

  // ログインページの場合はヘッダーを表示しない
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <Header />
      <main className="flex-1 overflow-y-auto p-4">
        {children}
      </main>
    </div>
  );
}


