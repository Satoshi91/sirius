import { getTasks } from "@/lib/services/taskService";
import TaskList from "./components/TaskList";
import Link from "next/link";

export default async function TasksPage() {
  const tasks = await getTasks();

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">
              タスク一覧
            </h1>
            <p className="text-zinc-600">
              すべてのタスクを表示しています
            </p>
          </div>
          <Link
            href="/tasks/new"
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium"
          >
            新規
          </Link>
        </div>
        <TaskList tasks={tasks} />
      </div>
    </div>
  );
}

