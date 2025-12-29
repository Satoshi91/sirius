"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProjectAction } from "../actions";
import Modal from "@/components/Modal";
import ProjectEditForm from "./ProjectEditForm";
import { Project } from "@/types";
import { Button } from "@/components/ui/button";

interface ProjectActionsProps {
  project: Project;
}

export default function ProjectActions({ project }: ProjectActionsProps) {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `案件「${project.name}」を削除してもよろしいですか？\nこの操作は取り消せません。`
    );

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const result = await deleteProjectAction(project.id);
      if (result?.error) {
        alert(result.error);
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
          onClick={handleDelete}
          variant="destructive"
          size="sm"
          disabled={isPending}
        >
          {isPending ? "削除中..." : "削除"}
        </Button>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="案件を編集"
      >
        <ProjectEditForm
          project={project}
          onSuccess={() => setIsEditModalOpen(false)}
        />
      </Modal>
    </>
  );
}

