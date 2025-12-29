"use client";

import { useState, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Timestamp } from "firebase/firestore";
import { Upload, Eye, Loader2, Plus, FileStack, File, CheckCircle2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import Modal from "@/components/Modal";
import DocumentForm from "./DocumentForm";
import { ProjectDocument } from "@/types";
import { uploadDocumentAction } from "../actions";
import { toast } from "sonner";

interface DocumentListProps {
  projectId: string;
  documents: ProjectDocument[];
}

export default function DocumentList({ projectId, documents }: DocumentListProps) {
  const router = useRouter();
  const handleBulkCreate = () => {
    router.push(`/projects/${projectId}/documents/bulk`);
  };
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleUploadClick = (docId: string) => {
    const input = fileInputRefs.current[docId];
    if (input) {
      input.click();
    }
  };

  const handleFileChange = async (docId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingDocId(docId);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadDocumentAction(projectId, docId, formData);
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success("ファイルをアップロードしました");
        router.refresh();
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("ファイルのアップロードに失敗しました");
    } finally {
      setUploadingDocId(null);
      // Reset input
      if (fileInputRefs.current[docId]) {
        fileInputRefs.current[docId]!.value = "";
      }
    }
  };

  const handlePreview = (fileUrl: string) => {
    if (!fileUrl) {
      toast.error("ファイルがアップロードされていません");
      return;
    }
    window.open(fileUrl, "_blank");
  };

  // カテゴリー名のマッピング
  const getCategoryName = (category: ProjectDocument["category"]): string => {
    const categoryMap: Record<ProjectDocument["category"], string> = {
      'personal': '本人書類',
      'employer': '勤務先書類',
      'office': '当事務所作成書類',
      'government': '公的機関書類',
      'other': 'その他',
    };
    return categoryMap[category];
  };

  // 取得元名のマッピング
  const getSourceName = (source: ProjectDocument["source"]): string => {
    const sourceMap: Record<ProjectDocument["source"], string> = {
      'office': '当事務所',
      'applicant': 'ご本人',
      'employer': '勤務先',
      'government': '公的機関',
      'guarantor': '身元保証人',
      'other': 'その他',
    };
    return sourceMap[source];
  };

  // 進捗率計算
  const { completedCount, totalCount, progressPercentage } = useMemo(() => {
    const completed = documents.filter(
      doc => doc.status === 'verified' || doc.status === 'completed'
    ).length;
    const total = documents.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    return {
      completedCount: completed,
      totalCount: total,
      progressPercentage: percentage,
    };
  }, [documents]);

  // カテゴリー別にグループ化
  const groupedDocuments = useMemo(() => {
    const groups: Record<string, ProjectDocument[]> = {
      '本人書類': [],
      '勤務先書類': [],
      '当事務所作成書類': [],
      '公的機関書類': [],
      'その他': [],
    };

    documents.forEach(doc => {
      const categoryName = getCategoryName(doc.category);
      if (categoryName in groups) {
        groups[categoryName].push(doc);
      } else {
        groups['その他'].push(doc);
      }
    });

    return groups;
  }, [documents]);

  const getStatusBadge = (status: ProjectDocument["status"]) => {
    switch (status) {
      case "not_started":
        return <Badge variant="outline" className="bg-zinc-100 text-zinc-800">未着手</Badge>;
      case "in_progress":
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-200">進行中</Badge>;
      case "waiting":
        return <Badge variant="default" className="bg-orange-100 text-orange-800 border-orange-200">待機中</Badge>;
      case "collected":
        return <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">回収済み</Badge>;
      case "verified":
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">確認済み</Badge>;
      case "completed":
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">完了</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (date: Date | Timestamp): string => {
    const dateObj = date instanceof Date ? date : (date as Timestamp).toDate();
    return dateObj.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ファイル名をstoragePathから抽出
  const getFileNameFromPath = (storagePath?: string): string | null => {
    if (!storagePath) return null;
    const parts = storagePath.split('/');
    return parts[parts.length - 1] || null;
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-black">書類管理</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBulkCreate}>
                <FileStack className="mr-2 h-4 w-4" />
                書類一括登録
              </Button>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                書類を追加
              </Button>
            </div>
          </div>
          
          {/* 進捗率プログレスバー */}
          {totalCount > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">進捗率</span>
                <span className="text-sm font-semibold text-black">
                  {Math.round(progressPercentage)}% ({completedCount}/{totalCount})
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}
        </div>

      {documents.length === 0 ? (
        <div className="border border-zinc-200 rounded-lg p-8 text-center text-gray-700">
          書類が登録されていません
        </div>
      ) : (
        <div className="space-y-6">
          {(['本人書類', '勤務先書類', '当事務所作成書類', '公的機関書類', 'その他'] as const).map((category) => {
            const categoryDocs = groupedDocuments[category];

            return (
              <div key={category}>
                <h3 className="text-lg font-semibold text-black mb-3">{category}</h3>
                <Separator className="mb-4" />
                {categoryDocs.length === 0 ? (
                  <div className="border border-zinc-200 rounded-lg p-6 text-center text-gray-500">
                    このカテゴリーには書類が登録されていません
                  </div>
                ) : (
                  <div className="border border-zinc-200 rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>書類名</TableHead>
                          <TableHead>取得元</TableHead>
                          <TableHead>担当</TableHead>
                          <TableHead>ステータス</TableHead>
                          <TableHead>ファイル状態</TableHead>
                          <TableHead className="text-right">アクション</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categoryDocs.map((document) => (
                          <TableRow key={document.id}>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-700">{document.name}</span>
                                  {document.isRequiredOriginal && (
                                    <Badge variant="destructive" className="text-xs">
                                      原本必要
                                    </Badge>
                                  )}
                                  {document.status === 'waiting' && (
                                    <Badge variant="outline" className="text-xs bg-orange-50">
                                      待機中
                                    </Badge>
                                  )}
                                </div>
                                {document.description && (
                                  <span className="text-xs text-gray-700">{document.description}</span>
                                )}
                                {document.era && document.eraYear && (
                                  <span className="text-xs text-gray-700">
                                    {document.era === 'reiwa' ? '令和' : '平成'}{document.eraYear}年度分
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-700">{getSourceName(document.source)}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-700">
                                {document.assignedTo === 'office' ? '当事務所' : 'ご本人'}
                              </span>
                            </TableCell>
                            <TableCell>{getStatusBadge(document.status)}</TableCell>
                            <TableCell>
                              {document.fileUrl ? (
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                                      アップロード済み
                                    </Badge>
                                  </div>
                                  {document.storagePath && (
                                    <div className="flex items-center gap-1 text-xs text-gray-600">
                                      <File className="h-3 w-3" />
                                      <span className="truncate max-w-[200px]" title={getFileNameFromPath(document.storagePath) || ''}>
                                        {getFileNameFromPath(document.storagePath)}
                                      </span>
                                    </div>
                                  )}
                                  {document.updatedAt && (
                                    <span className="text-xs text-gray-500">
                                      {formatDate(document.updatedAt)}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <Badge variant="outline" className="bg-gray-100 text-gray-600">
                                  未アップロード
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {!document.fileUrl && (
                                  <>
                                    <input
                                      ref={(el) => (fileInputRefs.current[document.id] = el)}
                                      type="file"
                                      className="hidden"
                                      onChange={(e) => handleFileChange(document.id, e)}
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleUploadClick(document.id)}
                                      disabled={uploadingDocId === document.id}
                                    >
                                      {uploadingDocId === document.id ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          アップロード中
                                        </>
                                      ) : (
                                        <>
                                          <Upload className="mr-2 h-4 w-4" />
                                          アップロード
                                        </>
                                      )}
                                    </Button>
                                  </>
                                )}
                                {document.fileUrl && (
                                  <>
                                    <input
                                      ref={(el) => (fileInputRefs.current[document.id] = el)}
                                      type="file"
                                      className="hidden"
                                      onChange={(e) => handleFileChange(document.id, e)}
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleUploadClick(document.id)}
                                      disabled={uploadingDocId === document.id}
                                    >
                                      {uploadingDocId === document.id ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          アップロード中
                                        </>
                                      ) : (
                                        <>
                                          <Upload className="mr-2 h-4 w-4" />
                                          再アップロード
                                        </>
                                      )}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handlePreview(document.fileUrl!)}
                                    >
                                      <Eye className="mr-2 h-4 w-4" />
                                      プレビュー
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="書類の新規登録"
      >
        <DocumentForm
          projectId={projectId}
          onSuccess={() => setIsModalOpen(false)}
        />
      </Modal>
    </>
  );
}

