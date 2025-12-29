export interface SidebarMenuItem {
  label: string;
  href: string;
  icon?: string; // 将来的にアイコンを追加する場合用
  adminOnly?: boolean; // adminのみ表示
}

export const sidebarMenuItems: SidebarMenuItem[] = [
  {
    label: "案件一覧",
    href: "/projects",
  },
  {
    label: "職員管理",
    href: "/users",
  },
];


