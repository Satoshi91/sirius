"use client";

import { ProjectDocument } from "@/types";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BulkCreateConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  documents: Omit<ProjectDocument, "id" | "projectId" | "createdAt" | "updatedAt" | "fileUrl" | "storagePath">[];
  isSubmitting?: boolean;
}

export default function BulkCreateConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  documents,
  isSubmitting = false,
}: BulkCreateConfirmModalProps) {
  // カテゴリー別の内訳を計算
  const categoryCounts = documents.reduce((acc, doc) => {
    const categoryName = getCategoryName(doc.category);
    acc[categoryName] = (acc[categoryName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="書類一括登録の確認"
    >
      <div className="space-y-6">
        <div>
          <p className="text-sm text-gray-700 mb-4">
            以下の書類を一括登録します。よろしいですか？
          </p>
          <div className="bg-zinc-50 rounded-lg p-4 mb-4">
            <div className="text-lg font-semibold text-black mb-2">
              登録件数: <span className="text-blue-600">{documents.length}</span> 件
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">カテゴリー別内訳</h3>
          <div className="space-y-2">
            {Object.entries(categoryCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([category, count]) => (
                <div
                  key={category}
                  className="flex items-center justify-between py-2 px-3 bg-zinc-50 rounded-md"
                >
                  <span className="text-sm text-gray-700">{category}</span>
                  <Badge variant="outline" className="bg-white">
                    {count} 件
                  </Badge>
                </div>
              ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "登録中..." : "登録実行"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function getCategoryName(category: ProjectDocument["category"]): string {
  const categoryMap: Record<ProjectDocument["category"], string> = {
    'personal': '本人書類',
    'employer': '勤務先書類',
    'office': '当事務所作成書類',
    'government': '公的機関書類',
    'other': 'その他',
  };
  return categoryMap[category];
}

