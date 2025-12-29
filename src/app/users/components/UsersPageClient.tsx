"use client";

import { useState, useTransition } from "react";
import { User } from "@/types";
import UserList from "./UserList";
import UserForm from "./UserForm";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import Modal from "@/components/Modal";
import {
  createUserAction,
  updateUserAction,
  deactivateUserAction,
} from "../actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface UsersPageClientProps {
  initialUsers: User[];
  currentUserId: string;
}

export default function UsersPageClient({
  initialUsers,
  currentUserId,
}: UsersPageClientProps) {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [isPending, startTransition] = useTransition();

  const handleCreate = () => {
    setEditingUser(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDeactivate = (userId: string) => {
    if (!confirm("この職員を無効化してもよろしいですか？")) {
      return;
    }

    startTransition(async () => {
      const result = await deactivateUserAction(userId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("職員を無効化しました");
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isActive: false } : u))
        );
        router.refresh();
      }
    });
  };

  const handleSubmit = async (data: {
    email: string;
    displayName: string;
    role: 'admin' | 'staff';
  }) => {
    startTransition(async () => {
      if (editingUser) {
        // 更新
        const formData = new FormData();
        formData.append("displayName", data.displayName);
        formData.append("role", data.role);

        const result = await updateUserAction(editingUser.id, formData);
        if (result.error) {
          toast.error(result.error);
          return; // エラー時は早期リターン、フォームは開いたまま
        } else {
          toast.success("職員を更新しました");
          setUsers((prev) =>
            prev.map((u) =>
              u.id === editingUser.id
                ? { ...u, displayName: data.displayName, role: data.role }
                : u
            )
          );
          setIsFormOpen(false);
          setEditingUser(undefined);
          router.refresh();
        }
      } else {
        // 作成
        const formData = new FormData();
        formData.append("email", data.email);
        formData.append("displayName", data.displayName);
        formData.append("role", data.role);

        const result = await createUserAction(formData);
        if (result.error) {
          toast.error(result.error);
          return; // エラー時は早期リターン、フォームは開いたまま
        } else {
          toast.success("職員を作成しました");
          setIsFormOpen(false);
          router.refresh();
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-blue-700">
          システムに登録されている職員を管理できます
        </p>
        <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          新規職員
        </Button>
      </div>

      <UserList
        users={users}
        currentUserId={currentUserId}
        onEdit={handleEdit}
        onDeactivate={handleDeactivate}
      />

      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingUser(undefined);
        }}
        title={editingUser ? "職員編集" : "新規職員作成"}
      >
        <UserForm
          user={editingUser}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingUser(undefined);
          }}
          isCreating={!editingUser}
        />
      </Modal>
    </div>
  );
}


