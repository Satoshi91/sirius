"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Search, Bell, LogOut, User, ChevronDown } from "lucide-react";
import { useAuth } from "./auth/AuthProvider";
import { signOut } from "@/lib/auth/authClient";
import { toast } from "sonner";
import { sidebarMenuItems } from "@/lib/config/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  // 認証されていない場合（loading完了後、userがnull）はログインページにリダイレクト
  useEffect(() => {
    // ログインページ自体ではリダイレクトしない
    if (pathname?.startsWith("/login")) {
      return;
    }

    // 認証状態の読み込みが完了し、ユーザーが存在しない場合
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, pathname, router]);

  const handleLogout = async () => {
    try {
      // Firebase Authからログアウト
      await signOut();

      // 認証Cookieを削除
      const clearCookieResponse = await fetch("/api/auth/clear-cookies", {
        method: "POST",
      });

      if (!clearCookieResponse.ok) {
        console.warn(
          "Failed to clear auth cookies, but continuing with logout"
        );
      }

      toast.success("ログアウトしました");
      // ページをリロードして認証状態を確実にリセット
      window.location.href = "/login";
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("ログアウトに失敗しました");
    }
  };

  // ロールに応じてメニューをフィルタリング
  const visibleMenuItems = sidebarMenuItems.filter((item) => {
    if (item.adminOnly && user?.role !== "admin") {
      return false;
    }
    return true;
  });

  // 環境判定: ローカル開発環境またはVercel preview環境の場合にプレビュー版を表示
  const isPreviewEnv =
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === "preview";

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header Content */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Preview Badge */}
          {isPreviewEnv && (
            <div className="flex items-center flex-shrink-0">
              <span className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-100 rounded-md border border-amber-200">
                プレビュー版
              </span>
            </div>
          )}
          {/* Left: Navigation Links */}
          <nav className="flex items-center gap-1 flex-shrink-0">
            {visibleMenuItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-zinc-100 text-black"
                      : "text-zinc-700 hover:bg-zinc-50 hover:text-black"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Center: Search Input */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-5 w-5" />
              <input
                type="text"
                placeholder="検索..."
                className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black"
              />
            </div>
          </div>

          {/* Right: Notification and User Menu */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <button className="flex items-center gap-2 px-4 py-2 text-zinc-700 hover:text-black transition-colors">
              <Bell className="h-5 w-5" />
              <span className="hidden sm:inline">お知らせ</span>
            </button>
            {loading ? (
              // 認証状態を読み込み中
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-500">
                読み込み中...
              </div>
            ) : user ? (
              // ユーザーが存在する場合、ドロップダウンメニューを表示
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:text-black transition-colors rounded-lg hover:bg-zinc-50">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user.displayName}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.displayName}</p>
                      <p className="text-xs text-zinc-500">
                        {user.role === "admin" ? "管理者" : "スタッフ"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>ログアウト</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // ユーザーが存在しない場合（リダイレクト処理中）
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-500">
                認証中...
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
