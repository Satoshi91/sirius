"use client";

import { User } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import UserRoleBadge from "./UserRoleBadge";
import { Button } from "@/components/ui/button";
import { Edit, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UserListProps {
  users: User[];
  currentUserId: string;
  onEdit: (user: User) => void;
  onDeactivate: (userId: string) => void;
}

export default function UserList({
  users,
  currentUserId,
  onEdit,
  onDeactivate,
}: UserListProps) {
  return (
    <div className="border border-zinc-200 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名前</TableHead>
            <TableHead>メールアドレス</TableHead>
            <TableHead>権限</TableHead>
            <TableHead>ステータス</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-zinc-500 py-8">
                職員が見つかりませんでした
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.displayName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <UserRoleBadge role={user.role} />
                </TableCell>
                <TableCell>
                  {user.isActive ? (
                    <Badge variant="default" className="bg-green-600 text-white">
                      有効
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-zinc-200 text-zinc-700">
                      無効
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {user.id !== currentUserId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeactivate(user.id)}
                        disabled={!user.isActive}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}


