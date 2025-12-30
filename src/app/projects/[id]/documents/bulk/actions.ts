"use server";

import { bulkCreateDocuments, bulkDeleteDocuments, getDocuments } from "@/lib/services/documentService";
import { createActivityLog } from "@/lib/services/activityLogService";
import { ProjectDocument } from "@/types";
import { requireAuth, getCurrentUser } from "@/lib/auth/auth";

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
  // 認証チェック
  await requireAuth();
  
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

    // 操作履歴を記録
    try {
      const user = await getCurrentUser();
      if (user) {
        await createActivityLog(projectId, {
          actionType: "documents_bulk_created",
          description: `${documents.length}件の書類を一括作成しました`,
          details: {
            count: documents.length,
          },
          performedBy: user.id,
          performedByName: user.displayName,
        });
      }
    } catch (logError) {
      // 操作履歴の記録に失敗してもメイン処理は継続
      console.error("Error creating activity log:", logError);
    }

    return { success: true, count: documents.length };
  } catch (error) {
    console.error("Error bulk creating documents:", error);
    return { error: "書類の一括作成に失敗しました。もう一度お試しください。" };
  }
}

/**
 * 複数の書類を一括削除する
 * @param projectId 案件ID
 * @param documentIds 削除する書類IDの配列
 * @returns 成功/失敗の結果
 */
export async function bulkDeleteDocumentsAction(
  projectId: string,
  documentIds: string[]
): Promise<{ success?: boolean; count?: number; error?: string }> {
  // 認証チェック
  await requireAuth();
  
  // バリデーション
  if (!documentIds || documentIds.length === 0) {
    return { error: "削除する書類が選択されていません" };
  }

  try {
    // 削除前に書類情報を取得（操作履歴記録用）
    const allDocuments = await getDocuments(projectId);
    const documentsToDelete = allDocuments.filter(doc => documentIds.includes(doc.id));

    // 操作履歴を記録（削除前に記録）
    try {
      const user = await getCurrentUser();
      if (user) {
        const documentNames = documentsToDelete.map(doc => doc.name);
        await createActivityLog(projectId, {
          actionType: "documents_bulk_deleted",
          description: `${documentIds.length}件の書類を一括削除しました`,
          details: {
            count: documentIds.length,
            documentNames: documentNames.slice(0, 5), // 最初の5件の書類名を記録
          },
          performedBy: user.id,
          performedByName: user.displayName,
        });
      }
    } catch (logError) {
      // 操作履歴の記録に失敗してもメイン処理は継続
      console.error("Error creating activity log:", logError);
    }
    
    await bulkDeleteDocuments(projectId, documentIds);
    
    return { success: true, count: documentIds.length };
  } catch (error) {
    console.error("Error bulk deleting documents:", error);
    return { error: "書類の一括削除に失敗しました。もう一度お試しください。" };
  }
}

