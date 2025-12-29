import { getProjects } from "@/lib/services/projectService";
import ProjectsPageClient from "./components/ProjectsPageClient";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-900 mb-2">
              案件一覧
            </h1>
            <p className="text-blue-700">
              すべての案件を表示しています
            </p>
          </div>
          <Link href="/projects/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              新規
            </Button>
          </Link>
        </div>
        <ProjectsPageClient projects={projects} />
      </div>
    </div>
  );
}

