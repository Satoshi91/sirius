"use client";

import Sidebar from "./Sidebar";
import Header from "./Header";
import { SidebarProvider, useSidebar } from "./SidebarContext";
import { usePathname } from "next/navigation";

interface AppLayoutProps {
  children: React.ReactNode;
}

function AppLayoutContent({ children }: AppLayoutProps) {
  const { isOpen } = useSidebar();
  const pathname = usePathname();
  const isLoginPage = pathname?.startsWith("/login") ?? false;

  // ログインページの場合はヘッダーとサイドバーを表示しない
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </SidebarProvider>
  );
}


