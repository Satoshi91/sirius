"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, HelpCircle, Bell } from "lucide-react";

export default function Header() {
  const pathname = usePathname();

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    if (pathname === "/") {
      return [];
    }

    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs = segments.map((segment, index) => {
      const path = "/" + segments.slice(0, index + 1).join("/");
      return {
        label: segment,
        path: path,
      };
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header Content */}
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-xl font-bold text-black hover:text-zinc-700 transition-colors"
            >
              My App
            </Link>
          </div>

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

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 text-zinc-700 hover:text-black transition-colors">
              <HelpCircle className="h-5 w-5" />
              <span>ヘルプ</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-zinc-700 hover:text-black transition-colors">
              <Bell className="h-5 w-5" />
              <span>お知らせ</span>
            </button>
          </div>
        </div>

        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <div className="pb-3">
            <nav className="flex items-center text-sm text-zinc-600">
              <Link
                href="/"
                className="hover:text-black transition-colors"
              >
                Home
              </Link>
              {breadcrumbs.map((breadcrumb, index) => (
                <span key={breadcrumb.path} className="flex items-center">
                  <span className="mx-2 text-zinc-400">/</span>
                  <Link
                    href={breadcrumb.path}
                    className="hover:text-black transition-colors capitalize"
                  >
                    {breadcrumb.label}
                  </Link>
                </span>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

