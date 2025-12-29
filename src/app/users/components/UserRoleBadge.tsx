import { User } from "@/types";
import { Badge } from "@/components/ui/badge";

interface UserRoleBadgeProps {
  role: User["role"];
}

export default function UserRoleBadge({ role }: UserRoleBadgeProps) {
  return (
    <Badge
      variant={role === "admin" ? "default" : "secondary"}
      className={
        role === "admin"
          ? "bg-blue-600 text-white"
          : "bg-zinc-200 text-zinc-700"
      }
    >
      {role === "admin" ? "管理者" : "スタッフ"}
    </Badge>
  );
}

