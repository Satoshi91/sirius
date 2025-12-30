"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Project, ProjectDocument } from "@/types";
import { Timestamp } from "firebase/firestore";
import { documentMasterList } from "@/lib/masters/documentMaster";
import { getFullNameJa, getFullNameEn } from "@/lib/utils/customerName";
import { getDocuments } from "@/lib/services/documentService";
import { getProject } from "@/lib/services/projectService";
import DocumentMasterSelector from "./components/DocumentMasterSelector";
import BulkCreateConfirmModal from "./components/BulkCreateConfirmModal";
import ProjectActions from "../../components/ProjectActions";
import { bulkCreateDocumentsAction, bulkDeleteDocumentsAction } from "./actions";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function BulkDocumentPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [selectedMasterIds, setSelectedMasterIds] = useState<Set<string>>(new Set());
  const [existingDocuments, setExistingDocuments] = useState<ProjectDocument[]>([]);
  const [isLoadingExisting, setIsLoadingExisting] = useState(true);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(true);

  // 案件データを取得
  useEffect(() => {
    const fetchProject = async () => {
      setIsLoadingProject(true);
      try {
        const projectData = await getProject(projectId);
        setProject(projectData);
      } catch (error) {
        console.error("Error fetching project:", error);
        setProject(null);
      } finally {
        setIsLoadingProject(false);
      }
    };

    fetchProject();
  }, [projectId]);

  // 既存の書類を取得
  useEffect(() => {
    const fetchExistingDocuments = async () => {
      setIsLoadingExisting(true);
      try {
        const docs = await getDocuments(projectId);
        setExistingDocuments(docs);
      } catch (error) {
        console.error("Error fetching existing documents:", error);
        setExistingDocuments([]);
      } finally {
        setIsLoadingExisting(false);
      }
    };

    fetchExistingDocuments();
  }, [projectId]);

  // 既存書類のmasterDocumentIdとマスタidでマッチングして、初期選択状態を設定
  useEffect(() => {
    if (!isLoadingExisting) {
      const existingMasterIds = new Set(
        existingDocuments
          .map((doc) => doc.masterDocumentId)
          .filter((id): id is string => !!id)
      );
      setSelectedMasterIds(existingMasterIds);
    }
  }, [existingDocuments, isLoadingExisting]);

  // 選択された書類と既存書類の差分を計算
  const changes = useMemo(() => {
    const existingMasterIds = new Set(
      existingDocuments
        .map((doc) => doc.masterDocumentId)
        .filter((id): id is string => !!id)
    );

    // 新規追加される書類（選択されているが既存にない）
    const toAdd = documentMasterList.filter(
      (item) => selectedMasterIds.has(item.id) && !existingMasterIds.has(item.id)
    );

    // 削除される書類（既存にあるが選択されていない）
    const toDelete = existingDocuments.filter(
      (doc) => doc.masterDocumentId && existingMasterIds.has(doc.masterDocumentId) && !selectedMasterIds.has(doc.masterDocumentId)
    );

    return { toAdd, toDelete };
  }, [selectedMasterIds, existingDocuments]);

  const handleConfirm = async () => {
    if (changes.toAdd.length === 0 && changes.toDelete.length === 0) {
      toast.info("変更がありません");
      return;
    }

    setIsSubmitting(true);
    try {
      // 新規追加
      if (changes.toAdd.length > 0) {
        const documentsToAdd = changes.toAdd.map((masterItem) => ({
          name: masterItem.name,
          description: masterItem.description,
          category: masterItem.category,
          source: masterItem.source,
          assignedTo: masterItem.assignedTo,
          status: masterItem.status,
          isRequiredOriginal: masterItem.isRequiredOriginal,
          masterDocumentId: masterItem.id,
        }));

        const createResult = await bulkCreateDocumentsAction(projectId, documentsToAdd);
        if (createResult?.error) {
          toast.error(createResult.error);
          setIsSubmitting(false);
          setIsConfirmModalOpen(false);
          return;
        }
      }

      // 削除
      if (changes.toDelete.length > 0) {
        const documentIdsToDelete = changes.toDelete.map((doc) => doc.id);
        const deleteResult = await bulkDeleteDocumentsAction(projectId, documentIdsToDelete);
        if (deleteResult?.error) {
          toast.error(deleteResult.error);
          setIsSubmitting(false);
          setIsConfirmModalOpen(false);
          return;
        }
      }

      // 成功メッセージ
      const addCount = changes.toAdd.length;
      const deleteCount = changes.toDelete.length;
      let message = "";
      if (addCount > 0 && deleteCount > 0) {
        message = `${addCount}件の書類を登録し、${deleteCount}件の書類を削除しました`;
      } else if (addCount > 0) {
        message = `${addCount}件の書類を登録しました`;
      } else if (deleteCount > 0) {
        message = `${deleteCount}件の書類を削除しました`;
      }
      toast.success(message);

      // 案件詳細ページに遷移
      setIsSubmitting(false);
      setIsConfirmModalOpen(false);
      router.push(`/projects/${projectId}`);
      return;
    } catch (error) {
      console.error("Error updating documents:", error);
      toast.error("書類の更新に失敗しました");
    } finally {
      setIsSubmitting(false);
      setIsConfirmModalOpen(false);
    }
  };

  const hasChanges = changes.toAdd.length > 0 || changes.toDelete.length > 0;

  // 日付フォーマット関数
  const formatDate = (date: Date | Timestamp | null | undefined): string => {
    if (!date) return "-";
    const dateObj = date instanceof Date ? date : (date as Timestamp).toDate();
    return dateObj.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  const daysUntilExpiry = project ? getDaysUntilExpiry(project.expiryDate) : null;
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 90 && daysUntilExpiry >= 0;

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* パンくずリスト */}
        <div className="mb-6">
          <Link
            href={`/projects/${projectId}`}
            className="text-gray-700 hover:text-black transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            案件詳細に戻る
          </Link>
        </div>

        {/* 2カラムレイアウト */}
        <div className="grid grid-cols-12 gap-6">
          {/* 左カラム: 案件基本情報カード（約30%） */}
          <div className="col-span-12 lg:col-span-3">
            <div className="sticky top-4 z-30">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">案件基本情報</CardTitle>
                    {project && <ProjectActions project={project} />}
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingProject ? (
                    <div className="text-center py-8 text-gray-500">読み込み中...</div>
                  ) : project ? (
                    <div className="space-y-4">
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
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">案件情報の取得に失敗しました</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 右カラム: 書類一括管理メインエリア（約70%） */}
          <div className="col-span-12 lg:col-span-9">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">書類一括管理</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoadingExisting ? (
                  <div className="text-center py-8 text-gray-500">読み込み中...</div>
                ) : (
                  <>
                    <DocumentMasterSelector
                      masterList={documentMasterList}
                      existingDocuments={existingDocuments}
                      selectedMasterIds={selectedMasterIds}
                      onSelectionChange={setSelectedMasterIds}
                    />

                    {/* 変更プレビュー */}
                    {hasChanges && (
                      <div className="pt-4 border-t border-zinc-200">
                        <h3 className="text-lg font-semibold text-black mb-4">変更内容</h3>
                        {changes.toAdd.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-700 mb-2">
                              新規追加: <span className="font-semibold text-green-600">{changes.toAdd.length}件</span>
                            </p>
                          </div>
                        )}
                        {changes.toDelete.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-700 mb-2">
                              削除: <span className="font-semibold text-red-600">{changes.toDelete.length}件</span>
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 確認モーダル */}
        <BulkCreateConfirmModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleConfirm}
          documentsToAdd={changes.toAdd.map((masterItem) => ({
            name: masterItem.name,
            description: masterItem.description,
            category: masterItem.category,
            source: masterItem.source,
            assignedTo: masterItem.assignedTo,
            status: masterItem.status,
            isRequiredOriginal: masterItem.isRequiredOriginal,
            masterDocumentId: masterItem.id,
          }))}
          documentsToDelete={changes.toDelete}
          isSubmitting={isSubmitting}
        />

        {/* フローティングボタン */}
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex gap-3 bg-white p-3 rounded-lg shadow-lg border border-zinc-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/projects/${projectId}`)}
          >
            キャンセル
          </Button>
          <Button
            type="button"
            onClick={() => setIsConfirmModalOpen(true)}
            disabled={!hasChanges || isSubmitting}
          >
            登録・削除を実行
          </Button>
        </div>
      </div>
    </div>
  );
}
