"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DocumentList from "./DocumentList";
import TaskList from "./TaskList";
import ActivityLogList from "./ActivityLogList";
import NoteTimeline from "@/components/notes/NoteTimeline";
import { ProjectDocument, Project, ProjectActivityLog, Task, PROJECT_STATUS_LABELS } from "@/types";
import { Timestamp } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { addProjectNoteAction } from "../actions";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { getFullNameJa, getFullNameEn } from "@/lib/utils/customerName";

interface ProjectTabsProps {
  projectId: string;
  documents: ProjectDocument[];
  tasks: Task[];
  project: Project;
  activityLogs?: ProjectActivityLog[];
}

export default function ProjectTabs({ projectId, documents, tasks, project, activityLogs = [] }: ProjectTabsProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const handleAddNote = async (content: string) => {
    return await addProjectNoteAction(projectId, content);
  };

  const handleNoteAdded = () => {
    startTransition(() => {
      router.refresh();
    });
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
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="details">案件詳細</TabsTrigger>
        <TabsTrigger value="documents">書類管理</TabsTrigger>
        <TabsTrigger value="tasks">タスク</TabsTrigger>
        <TabsTrigger value="expenses">実費・立替金</TabsTrigger>
        <TabsTrigger value="reports">帳票</TabsTrigger>
        <TabsTrigger value="activity">操作履歴</TabsTrigger>
        <TabsTrigger value="notes">メモ</TabsTrigger>
      </TabsList>
      
      <TabsContent value="details">
        <div className="border border-zinc-200 rounded-lg p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">案件名</h3>
              <p className="text-black font-medium">{project.title}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">氏名（漢字）</h3>
              <p className="text-black font-medium">{project.customer ? getFullNameJa(project.customer) || "-" : "-"}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">氏名（英語）</h3>
              <p className="text-black">{project.customer ? getFullNameEn(project.customer) || "-" : "-"}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">国籍</h3>
              <p className="text-black">{project.customer?.nationality || "-"}</p>
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

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">ステータス</h3>
              <p className="text-black">
                {PROJECT_STATUS_LABELS[project.status]}
              </p>
            </div>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="documents">
        <DocumentList projectId={projectId} documents={documents} />
      </TabsContent>
      
      <TabsContent value="tasks">
        <TaskList projectId={projectId} tasks={tasks} />
      </TabsContent>
      
      <TabsContent value="expenses">
        <div className="border border-zinc-200 rounded-lg p-8 text-center text-gray-700">
          実費・立替金管理（実装予定）
        </div>
      </TabsContent>

      <TabsContent value="reports">
        <div className="border border-zinc-200 rounded-lg p-8 text-center text-gray-700">
          帳票（実装予定）
        </div>
      </TabsContent>

      <TabsContent value="activity">
        <ActivityLogList logs={activityLogs} />
      </TabsContent>

      <TabsContent value="notes">
        <div className="border border-zinc-200 rounded-lg">
          <div className="p-4 border-b border-zinc-200">
            <h3 className="text-lg font-semibold">メモ</h3>
          </div>
          <div className="p-0">
            <NoteTimeline
              notes={project.notes}
              onAddNote={async (content) => {
                const result = await handleAddNote(content);
                if (result.success) {
                  handleNoteAdded();
                }
                return result;
              }}
            />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}

