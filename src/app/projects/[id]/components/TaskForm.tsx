"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Task, TaskStatus, TaskPriority, TASK_STATUS_OPTIONS, TASK_PRIORITY_OPTIONS } from "@/types";
import { Timestamp } from "firebase/firestore";
import { createTaskAction, updateTaskAction } from "../actions";
import { toast } from "sonner";
import UserSelector from "./UserSelector";

interface TaskFormProps {
  projectId: string;
  task?: Task;
  onSuccess: () => void;
}

export default function TaskForm({
  projectId,
  task,
  onSuccess,
}: TaskFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
    assigneeId: task?.assigneeId || "",
    status: (task?.status || "todo") as TaskStatus,
    priority: (task?.priority || "medium") as TaskPriority,
    dueDate: task?.dueDate 
      ? (task.dueDate instanceof Date 
          ? task.dueDate 
          : (task.dueDate instanceof Timestamp)
            ? task.dueDate.toDate() 
            : undefined)
      : undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      if (formData.description) {
        formDataToSend.append("description", formData.description);
      }
      if (formData.assigneeId) {
        formDataToSend.append("assigneeId", formData.assigneeId);
      }
      formDataToSend.append("status", formData.status);
      formDataToSend.append("priority", formData.priority);
      if (formData.dueDate) {
        formDataToSend.append("dueDate", formData.dueDate.toISOString().split('T')[0]);
      }

      const result = task
        ? await updateTaskAction(projectId, task.id, formDataToSend)
        : await createTaskAction(projectId, formDataToSend);
      
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success(task ? "タスクを更新しました" : "タスクを作成しました");
        onSuccess();
        router.refresh();
      }
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error(task ? "タスクの更新に失敗しました" : "タスクの作成に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-zinc-700 mb-1">
          タスク名 <span className="text-red-500">*</span>
        </label>
        <Input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="w-full"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-zinc-700 mb-1">
          詳細メモ
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-zinc-300 rounded-md"
        />
      </div>

      <div>
        <label htmlFor="assigneeId" className="block text-sm font-medium text-zinc-700 mb-1">
          担当者
        </label>
        <UserSelector
          value={formData.assigneeId}
          onValueChange={(value) => setFormData({ ...formData, assigneeId: value })}
          placeholder="担当者を選択"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-zinc-700 mb-1">
          ステータス <span className="text-red-500">*</span>
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
          required
          className="w-full px-3 py-2 border border-zinc-300 rounded-md"
        >
          {TASK_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-zinc-700 mb-1">
          優先度 <span className="text-red-500">*</span>
        </label>
        <select
          id="priority"
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
          required
          className="w-full px-3 py-2 border border-zinc-300 rounded-md"
        >
          {TASK_PRIORITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-zinc-700 mb-1">
          期限
        </label>
        <DatePicker
          date={formData.dueDate}
          onSelect={(date) => setFormData({ ...formData, dueDate: date })}
          placeholder="期限を選択（任意）"
          disabled={isSubmitting}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          disabled={isSubmitting}
        >
          キャンセル
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (task ? "更新中..." : "作成中...") : (task ? "更新" : "作成")}
        </Button>
      </div>
    </form>
  );
}

