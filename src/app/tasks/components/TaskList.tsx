import { Task } from "@/lib/types/task";
import Link from "next/link";

interface TaskListProps {
  tasks: Task[];
}

export default function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-600">
          タスクがありません
        </p>
      </div>
    );
  }

  const formatDate = (date: Date | null | undefined): string => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => (
        <Link
          key={task.id}
          href={`/tasks/${task.id}`}
          className="block p-6 bg-white rounded-lg border border-zinc-200 hover:border-zinc-300 transition-colors"
        >
          <h3 className="text-lg font-semibold text-black mb-2">
            {task.title}
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-zinc-600">クライアント:</span>
              <span className="text-black font-medium">
                {task.client}
              </span>
            </div>
            {task.status && (
              <div className="flex items-center gap-2">
                <span className="text-zinc-600">ステータス:</span>
                <span className="px-2 py-1 text-xs rounded-full bg-zinc-100 text-black">
                  {task.status}
                </span>
              </div>
            )}
            {task.deadline && (
              <div className="flex items-center gap-2">
                <span className="text-zinc-600">期限:</span>
                <span className="text-black">
                  {formatDate(task.deadline)}
                </span>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

