"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { sidebarMenuItems } from "@/lib/config/sidebar";
import { useSidebar } from "./SidebarContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          w-64 bg-white border-r border-zinc-200
          h-full overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-black">メニュー</h2>
            <button
              onClick={close}
              className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
              aria-label="メニューを閉じる"
            >
              <X className="h-5 w-5 text-black" />
            </button>
          </div>
          <nav>
            <ul className="space-y-2">
              {sidebarMenuItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={close}
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
    </>
  );
}


