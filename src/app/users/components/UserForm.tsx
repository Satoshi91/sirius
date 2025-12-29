"use client";

import { useState, useEffect } from "react";
import { User } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserFormProps {
  user?: User;
  onSubmit: (data: {
    email: string;
    displayName: string;
    role: 'admin' | 'staff';
  }) => Promise<void>;
  onCancel: () => void;
  isCreating?: boolean;
}

export default function UserForm({
  user,
  onSubmit,
  onCancel,
  isCreating = false,
}: UserFormProps) {
  const [email, setEmail] = useState(user?.email || "");
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [role, setRole] = useState<'admin' | 'staff'>(user?.role || 'staff');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // userプロップが変更されたときにフォームの値を更新
  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setDisplayName(user.displayName || "");
      setRole(user.role || 'staff');
    } else {
      // 新規作成モードに戻ったときはリセット
      setEmail("");
      setDisplayName("");
      setRole('staff');
    }
    setError(null);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // バリデーション
    if (!email.trim()) {
      setError("メールアドレスは必須です");
      return;
    }
    if (!displayName.trim()) {
      setError("名前は必須です");
      return;
    }
    if (!email.includes("@")) {
      setError("有効なメールアドレスを入力してください");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ email, displayName, role });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "エラーが発生しました";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-black mb-1">
          メールアドレス <span className="text-red-500">*</span>
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading || !isCreating}
          placeholder="example@email.com"
        />
        {!isCreating && (
          <p className="mt-1 text-xs text-zinc-500">
            メールアドレスは変更できません
          </p>
        )}
      </div>

      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-black mb-1">
          名前 <span className="text-red-500">*</span>
        </label>
        <Input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          disabled={loading}
          placeholder="山田 太郎"
        />
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-black mb-1">
          権限 <span className="text-red-500">*</span>
        </label>
        <Select value={role} onValueChange={(value: 'admin' | 'staff') => setRole(value)} disabled={loading}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="staff">スタッフ</SelectItem>
            <SelectItem value="admin">管理者</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "保存中..." : isCreating ? "作成" : "更新"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          キャンセル
        </Button>
      </div>
    </form>
  );
}

