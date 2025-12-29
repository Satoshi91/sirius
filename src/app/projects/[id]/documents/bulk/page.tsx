"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectDocument } from "@/types";
import { documentTemplates } from "@/lib/templates/documentTemplates";
import DocumentBulkEditor from "./components/DocumentBulkEditor";
import BulkCreateConfirmModal from "./components/BulkCreateConfirmModal";
import { bulkCreateDocumentsAction } from "./actions";
import { ArrowLeft } from "lucide-react";

export default function BulkDocumentPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number | null>(null);
  const [documents, setDocuments] = useState<
    Omit<ProjectDocument, "id" | "projectId" | "createdAt" | "updatedAt" | "fileUrl" | "storagePath">[]
  >([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // テンプレート選択時に書類リストを更新
  useEffect(() => {
    if (selectedTemplateIndex !== null && documentTemplates[selectedTemplateIndex]) {
      const template = documentTemplates[selectedTemplateIndex];
      // テンプレートの書類をコピー（深いコピー）
      setDocuments(
        template.documents.map((doc) => ({
          ...doc,
        }))
      );
    } else {
      setDocuments([]);
    }
  }, [selectedTemplateIndex]);

  const handleTemplateChange = (value: string) => {
    const index = parseInt(value, 10);
    setSelectedTemplateIndex(isNaN(index) ? null : index);
  };

  const handleConfirm = async () => {
    if (documents.length === 0) {
      alert("書類が選択されていません");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await bulkCreateDocumentsAction(projectId, documents);
      
      if (result?.error) {
        alert(result.error);
      } else if (result?.success) {
        alert(`${result.count}件の書類を登録しました`);
        router.push(`/projects/${projectId}`);
        router.refresh();
      }
    } catch (error) {
      console.error("Error creating documents:", error);
      alert("書類の登録に失敗しました");
    } finally {
      setIsSubmitting(false);
      setIsConfirmModalOpen(false);
    }
  };

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

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">書類一括登録</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* テンプレート選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                テンプレートを選択
              </label>
              <Select
                value={selectedTemplateIndex !== null ? selectedTemplateIndex.toString() : ""}
                onValueChange={handleTemplateChange}
              >
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder="テンプレートを選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {documentTemplates.map((template, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {template.visaType} ({template.documents.length}件)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 書類リスト編集エリア */}
            {documents.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-black mb-4">書類リスト</h3>
                <DocumentBulkEditor documents={documents} onChange={setDocuments} />
              </div>
            )}

            {/* 登録実行ボタン */}
            {documents.length > 0 && (
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200">
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
                  disabled={isSubmitting}
                >
                  登録実行
                </Button>
              </div>
            )}

            {documents.length === 0 && selectedTemplateIndex === null && (
              <div className="text-center py-12 text-gray-500">
                テンプレートを選択すると、書類リストが表示されます
              </div>
            )}
          </CardContent>
        </Card>

        {/* 確認モーダル */}
        <BulkCreateConfirmModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleConfirm}
          documents={documents}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}

