import { Project } from "@/types";
import Link from "next/link";
import { Timestamp } from "firebase/firestore";

interface ProjectListProps {
  projects: Project[];
}

export default function ProjectList({ projects }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-600">
          案件がありません
        </p>
      </div>
    );
  }

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
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-white">
        <thead>
          <tr className="border-b border-zinc-200">
            <th className="px-4 py-3 text-left text-sm font-semibold text-black">
              案件名
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-black">
              氏名
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-black">
              国籍
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-black">
              在留資格
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-black">
              有効期限
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr
              key={project.id}
              className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/projects/${project.id}`}
                  className="text-black font-medium hover:text-zinc-700"
                >
                  {project.title}
                </Link>
              </td>
              <td className="px-4 py-3 text-zinc-700">
                {project.customer ? (project.customer.name.last.ja && project.customer.name.first.ja 
                  ? `${project.customer.name.last.ja} ${project.customer.name.first.ja}` 
                  : project.customer.name.last.en && project.customer.name.first.en
                  ? `${project.customer.name.last.en} ${project.customer.name.first.en}`
                  : "-") : "-"}
              </td>
              <td className="px-4 py-3 text-zinc-700">
                {project.customer?.nationality || "-"}
              </td>
              <td className="px-4 py-3 text-zinc-700">
                {project.visaType}
              </td>
              <td className="px-4 py-3 text-zinc-700">
                {formatDate(project.expiryDate)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

