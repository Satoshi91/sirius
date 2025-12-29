"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { deleteProjectAction } from "../actions";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import ProjectEditForm from "./ProjectEditForm";
import { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ProjectActionsProps {
  project: Project;
}

export default function ProjectActions({ project }: ProjectActionsProps) {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
  }, []);
  
  const handleCloseDeleteConfirm = useCallback(() => {
    setIsDeleteConfirmOpen(false);
  }, []);

  const handleDeleteClick = () => {
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    startTransition(async () => {
      const result = await deleteProjectAction(project.id);
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        router.push("/projects");
      }
    });
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          onClick={() => setIsEditModalOpen(true)}
          variant="outline"
          size="sm"
        >
          編集
        </Button>
        <Button
          onClick={handleDeleteClick}
          variant="destructive"
          size="sm"
          disabled={isPending}
        >
          {isPending ? "削除中..." : "削除"}
        </Button>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        title="案件を編集"
      >
        <ProjectEditForm
          project={project}
          onSuccess={handleCloseEditModal}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={handleCloseDeleteConfirm}
        onConfirm={handleDeleteConfirm}
        title="案件の削除"
        message={`案件「${project.name}」を削除してもよろしいですか？\nこの操作は取り消せません。`}
        confirmText="削除"
        cancelText="キャンセル"
        variant="destructive"
      />
    </>
  );
}

