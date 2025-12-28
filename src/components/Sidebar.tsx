"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sidebarMenuItems } from "@/lib/config/sidebar";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-zinc-200 h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xl font-bold text-black mb-6">メニュー</h2>
        <nav>
          <ul className="space-y-2">
            {sidebarMenuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-zinc-100 text-black font-medium"
                        : "text-zinc-700 hover:bg-zinc-50 hover:text-black"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}

