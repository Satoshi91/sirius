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
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/3d25e911-5548-4daa-8038-5ea7ce13809a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:12',message:'bulkCreateDocumentsAction entry',data:{projectId,documentsCount:documents?.length,firstDoc:documents?.[0]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  // バリデーション
  if (!documents || documents.length === 0) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3d25e911-5548-4daa-8038-5ea7ce13809a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:18',message:'Validation failed: empty documents',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    return { error: "書類が選択されていません" };
  }

  // 各書類の必須フィールドをチェック
  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];
    
    if (!doc.name || !doc.name.trim()) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3d25e911-5548-4daa-8038-5ea7ce13809a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:26',message:'Validation failed: missing name',data:{index:i,doc},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      return { error: `${i + 1}件目の書類名は必須です` };
    }

    if (!doc.category || !['personal', 'employer', 'office', 'government', 'other'].includes(doc.category)) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3d25e911-5548-4daa-8038-5ea7ce13809a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:30',message:'Validation failed: invalid category',data:{index:i,category:doc.category},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      return { error: `${i + 1}件目のカテゴリーは必須です` };
    }

    if (!doc.source || !['office', 'applicant', 'employer', 'government', 'guarantor', 'other'].includes(doc.source)) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3d25e911-5548-4daa-8038-5ea7ce13809a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:34',message:'Validation failed: invalid source',data:{index:i,source:doc.source},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      return { error: `${i + 1}件目の取得元は必須です` };
    }

    if (!doc.assignedTo || !['office', 'applicant'].includes(doc.assignedTo)) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3d25e911-5548-4daa-8038-5ea7ce13809a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:38',message:'Validation failed: invalid assignedTo',data:{index:i,assignedTo:doc.assignedTo},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      return { error: `${i + 1}件目の担当は必須です` };
    }

    if (!doc.status || !['not_started', 'in_progress', 'waiting', 'collected', 'verified', 'completed'].includes(doc.status)) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3d25e911-5548-4daa-8038-5ea7ce13809a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:42',message:'Validation failed: invalid status',data:{index:i,status:doc.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      return { error: `${i + 1}件目のステータスは必須です` };
    }
  }

  try {
    // 各書類にprojectIdを設定
    const documentsWithProjectId = documents.map(doc => ({
      ...doc,
      projectId,
    }));

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3d25e911-5548-4daa-8038-5ea7ce13809a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:53',message:'Before bulkCreateDocuments call',data:{projectId,documentsCount:documentsWithProjectId.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    await bulkCreateDocuments(projectId, documentsWithProjectId);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3d25e911-5548-4daa-8038-5ea7ce13809a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:54',message:'After bulkCreateDocuments call',data:{projectId,documentsCount:documents.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3d25e911-5548-4daa-8038-5ea7ce13809a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:56',message:'Error in bulkCreateDocumentsAction',data:{error:String(error),errorStack:error instanceof Error?error.stack:undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
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

