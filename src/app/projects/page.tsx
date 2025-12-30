import { getProjects } from "@/lib/services/projectService";
import ProjectsPageClient from "./components/ProjectsPageClient";
import { requireAuth } from "@/lib/auth/auth";

export default async function ProjectsPage() {
  // 認証チェック
  // requireAuth()は未認証の場合に自動的にログインページにリダイレクトする
  await requireAuth();
  const projects = await getProjects();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <ProjectsPageClient projects={projects} />
      </div>
    </div>
  );
}

