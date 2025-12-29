import { getProject } from "@/lib/services/projectService";
import { getDocuments } from "@/lib/services/documentService";
import { notFound } from "next/navigation";
import Link from "next/link";
import DocumentList from "./components/DocumentList";
import ProjectActions from "./components/ProjectActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timestamp } from "firebase/firestore";

interface ProjectDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    notFound();
  }

  let documents = [];
  try {
    documents = await getDocuments(id);
  } catch (error) {
    console.error("Error fetching documents:", error);
    // エラーが発生した場合は空配列を使用
    documents = [];
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

  const getDateValue = (date: Date | Timestamp): Date => {
    return date instanceof Date ? date : date.toDate();
  };

  // 在留期限の日数計算
  const getDaysUntilExpiry = (expiryDate: Date | Timestamp | null): number | null => {
    if (!expiryDate) return null;
    const now = new Date();
    const expiry = expiryDate instanceof Date ? expiryDate : expiryDate.toDate();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilExpiry = getDaysUntilExpiry(project.expiryDate);
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 90 && daysUntilExpiry >= 0;

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* パンくずリスト */}
        <div className="mb-6">
          <Link
            href="/projects"
            className="text-gray-700 hover:text-black transition-colors"
          >
            ← 案件一覧に戻る
          </Link>
        </div>

        {/* 2カラムレイアウト */}
        <div className="grid grid-cols-12 gap-6">
          {/* 左カラム: 案件基本情報カード（約30%） */}
          <div className="col-span-12 lg:col-span-3">
            <div className="sticky top-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">案件基本情報</CardTitle>
                    <ProjectActions project={project} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-1">氏名（漢字）</h3>
                      <p className="text-black font-medium">{project.name}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-1">氏名（英語）</h3>
                      <p className="text-black">{project.nameEnglish || "-"}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-1">国籍</h3>
                      <p className="text-black">{project.nationality}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-1">現在の在留資格</h3>
                      <p className="text-black">{project.currentVisaType || "-"}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-1">申請予定の資格</h3>
                      <p className="text-black">{project.visaType}</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-gray-700">在留期限</h3>
                        {isExpiringSoon && (
                          <Badge variant="destructive" className="text-xs">
                            期限切れまで {daysUntilExpiry} 日
                          </Badge>
                        )}
                      </div>
                      {project.expiryDate ? (
                        <p className="text-black font-semibold">{formatDate(project.expiryDate)}</p>
                      ) : (
                        <p className="text-gray-700">-</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 右カラム: 書類管理メインエリア（約70%） */}
          <div className="col-span-12 lg:col-span-9">
            <DocumentList projectId={id} documents={documents} />
          </div>
        </div>
      </div>
    </div>
  );
}

