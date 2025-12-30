"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Timestamp } from "firebase/firestore";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Modal from "@/components/Modal";
import TaskForm from "./TaskForm";
import { Task, TaskStatus, TASK_STATUS_LABELS, User } from "@/types";
import { 
  deleteTaskAction, 
  updateTaskStatusAction, 
  updateTaskAssigneeAction 
} from "../actions";
import { getUsersAction } from "@/app/users/actions";
import { toast } from "sonner";

interface TaskListProps {
  projectId: string;
  tasks: Task[];
}

export default function TaskList({ projectId, tasks }: TaskListProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // ユーザー一覧を取得
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const result = await getUsersAction();
        if (result.success && result.users) {
          setUsers(result.users.filter(user => user.isActive));
        }
      } catch (error) {
        console.error("Error loading users:", error);
      }
    };

    loadUsers();
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingTask(undefined);
  }, []);

  const handleCreateTask = () => {
    setEditingTask(undefined);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("このタスクを削除してもよろしいですか？")) {
      return;
    }

    setDeletingTaskId(taskId);
    try {
      const result = await deleteTaskAction(projectId, taskId);
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success("タスクを削除しました");
        router.refresh();
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("タスクの削除に失敗しました");
    } finally {
      setDeletingTaskId(null);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    setUpdatingTaskId(taskId);
    try {
      const result = await updateTaskStatusAction(projectId, taskId, newStatus);
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("タスクのステータス更新に失敗しました");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleAssigneeChange = async (taskId: string, assigneeId: string) => {
    setUpdatingTaskId(taskId);
    try {
      const result = await updateTaskAssigneeAction(projectId, taskId, assigneeId || null);
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error updating task assignee:", error);
      toast.error("タスクの担当者更新に失敗しました");
    } finally {
      setUpdatingTaskId(null);
    }
  };


  const getPriorityBadge = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive" className="text-xs">高</Badge>;
      case "medium":
        return <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200 text-xs">中</Badge>;
      case "low":
        return <Badge variant="outline" className="bg-gray-100 text-gray-600 text-xs">低</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const formatDate = (date: Date | Timestamp | null | undefined): string => {
    if (!date) return "-";
    const dateObj = date instanceof Date ? date : (date as Timestamp).toDate();
    return dateObj.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };


  return (
    <>
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-black">タスク管理</h2>
            <Button onClick={handleCreateTask}>
              <Plus className="mr-2 h-4 w-4" />
              タスクを追加
            </Button>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="border border-zinc-200 rounded-lg p-8 text-center text-gray-700">
            タスクが登録されていません
          </div>
        ) : (
          <div className="border border-zinc-200 rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>タスク名</TableHead>
                  <TableHead>担当者</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>優先度</TableHead>
                  <TableHead>期限</TableHead>
                  <TableHead className="text-right">アクション</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="font-semibold text-gray-700">{task.title}</div>
                        {task.description && (
                          <div className="text-xs text-gray-500 line-clamp-2">
                            {task.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {updatingTaskId === task.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      ) : (
                        <Select
                          value={task.assigneeId || ""}
                          onValueChange={(value) => handleAssigneeChange(task.id, value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="未割り当て" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">未割り当て</SelectItem>
                            {users.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.displayName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>
                      {updatingTaskId === task.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      ) : (
                        <Select
                          value={task.status}
                          onValueChange={(value) => handleStatusChange(task.id, value as TaskStatus)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>
                      {getPriorityBadge(task.priority)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-700">
                        {formatDate(task.dueDate)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTask(task)}
                          disabled={deletingTaskId === task.id || updatingTaskId === task.id}
                        >
                          <Edit2 className="mr-2 h-4 w-4" />
                          編集
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                          disabled={deletingTaskId === task.id || updatingTaskId === task.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {deletingTaskId === task.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTask ? "タスクの編集" : "タスクの新規登録"}
      >
        <TaskForm
          projectId={projectId}
          task={editingTask}
          onSuccess={handleCloseModal}
        />
      </Modal>
    </>
  );
}

