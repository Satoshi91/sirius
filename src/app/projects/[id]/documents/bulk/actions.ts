"use server";

import { bulkCreateDocuments } from "@/lib/services/documentService";
import { ProjectDocument } from "@/types";

/**
 * 複数の書類を一括作成する
 * @param projectId 案件ID
 * @param documents 書類データの配列
 * @returns 成功/失敗の結果
 */
export async function bulkCreateDocumentsAction(
  projectId: string,
  documents: Omit<ProjectDocument, "id" | "projectId" | "createdAt" | "updatedAt" | "fileUrl" | "storagePath">[]
) {
  // バリデーション
  if (!documents || documents.length === 0) {
    return { error: "書類が選択されていません" };
  }

  // 各書類の必須フィールドをチェック
  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];
    
    if (!doc.name || !doc.name.trim()) {
      return { error: `${i + 1}件目の書類名は必須です` };
    }

    if (!doc.category || !['personal', 'employer', 'office', 'government', 'other'].includes(doc.category)) {
      return { error: `${i + 1}件目のカテゴリーは必須です` };
    }

    if (!doc.source || !['office', 'applicant', 'employer', 'government', 'guarantor', 'other'].includes(doc.source)) {
      return { error: `${i + 1}件目の取得元は必須です` };
    }

    if (!doc.assignedTo || !['office', 'applicant'].includes(doc.assignedTo)) {
      return { error: `${i + 1}件目の担当は必須です` };
    }

    if (!doc.status || !['not_started', 'in_progress', 'waiting', 'collected', 'verified', 'completed'].includes(doc.status)) {
      return { error: `${i + 1}件目のステータスは必須です` };
    }
  }

  try {
    // 各書類にprojectIdを設定
    const documentsWithProjectId = documents.map(doc => ({
      ...doc,
      projectId,
    }));

    await bulkCreateDocuments(projectId, documentsWithProjectId);
    return { success: true, count: documents.length };
  } catch (error) {
    console.error("Error bulk creating documents:", error);
    return { error: "書類の一括作成に失敗しました。もう一度お試しください。" };
  }
}

