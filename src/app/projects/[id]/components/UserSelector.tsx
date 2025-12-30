"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "@/types";
import { getUsersAction } from "@/app/users/actions";

interface UserSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function UserSelector({
  value,
  onValueChange,
  placeholder = "担当者を選択",
  disabled = false,
}: UserSelectorProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      try {
        const result = await getUsersAction();
        if (result.success && result.users) {
          // アクティブなユーザーのみを表示
          setUsers(result.users.filter(user => user.isActive));
        }
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  return (
    <Select
      value={value || ""}
      onValueChange={onValueChange}
      disabled={disabled || isLoading}
    >
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? "読み込み中..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">未割り当て</SelectItem>
        {users.map((user) => (
          <SelectItem key={user.id} value={user.id}>
            {user.displayName} ({user.email})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

