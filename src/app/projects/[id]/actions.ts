"use server";

import { uploadDocument, createDocument, uploadFileToDocument, getDocuments } from "@/lib/services/documentService";
import { updateProject, deleteProject, getProject } from "@/lib/services/projectService";
import { createActivityLog } from "@/lib/services/activityLogService";
import { ProjectDocument, Project } from "@/types";
import { requireAuth, getCurrentUser } from "@/lib/auth/auth";

export async function uploadDocumentAction(
  projectId: string,
  documentId: string,
  formData: FormData
) {
  // 認証チェック
  await requireAuth();
  
  const file = formData.get("file") as File | null;

  if (!file) {
    return { error: "ファイルが選択されていません" };
  }

  try {
    await uploadFileToDocument(projectId, documentId, file);
    
    // 操作履歴を記録
    try {
      const user = await getCurrentUser();
      if (user) {
        // 書類名を取得するために書類一覧を取得
        const documents = await getDocuments(projectId);
        const document = documents.find(doc => doc.id === documentId);
        
        await createActivityLog(projectId, {
          actionType: "document_file_uploaded",
          description: document 
            ? `書類「${document.name}」にファイル「${file.name}」をアップロードしました`
            : `書類（ID: ${documentId}）にファイル「${file.name}」をアップロードしました`,
          details: {
            documentId: documentId,
            documentName: document?.name,
            fileName: file.name,
          },
          performedBy: user.id,
          performedByName: user.displayName,
        });
      }
    } catch (logError) {
      // 操作履歴の記録に失敗してもメイン処理は継続
      console.error("Error creating activity log:", logError);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error uploading document:", error);
    return { error: "ファイルのアップロードに失敗しました。もう一度お試しください。" };
  }
}

export async function createDocumentAction(
  projectId: string,
  formData: FormData
) {
  // 認証チェック
  await requireAuth();
  
  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;
  const category = formData.get("category") as ProjectDocument["category"] | null;
  const source = formData.get("source") as ProjectDocument["source"] | null;
  const assignedTo = formData.get("assignedTo") as ProjectDocument["assignedTo"] | null;
  const status = formData.get("status") as ProjectDocument["status"] | null;
  const isRequiredOriginal = formData.get("isRequiredOriginal") === "true";
  const notes = formData.get("notes") as string | null;

  // バリデーション
  if (!name || !name.trim()) {
    return { error: "書類名は必須です" };
  }

  if (!category || !['personal', 'employer', 'office', 'government', 'other'].includes(category)) {
    return { error: "カテゴリーは必須です" };
  }

  if (!source || !['office', 'applicant', 'employer', 'government', 'guarantor', 'other'].includes(source)) {
    return { error: "取得元は必須です" };
  }

  if (!assignedTo || !['office', 'applicant'].includes(assignedTo)) {
    return { error: "担当は必須です" };
  }

  if (!status || !['not_started', 'in_progress', 'waiting', 'collected', 'verified', 'completed'].includes(status)) {
    return { error: "ステータスは必須です" };
  }

  try {
    const documentId = await createDocument(projectId, {
      projectId,
      name: name.trim(),
      description: description?.trim() || undefined,
      category,
      source,
      assignedTo,
      status,
      isRequiredOriginal,
      notes: notes?.trim() || undefined,
    });

    // 操作履歴を記録
    try {
      const user = await getCurrentUser();
      if (user) {
        await createActivityLog(projectId, {
          actionType: "document_created",
          description: `書類「${name.trim()}」を作成しました`,
          details: {
            documentId: documentId,
            documentName: name.trim(),
          },
          performedBy: user.id,
          performedByName: user.displayName,
        });
      }
    } catch (logError) {
      // 操作履歴の記録に失敗してもメイン処理は継続
      console.error("Error creating activity log:", logError);
    }

    return { success: true };
  } catch (error) {
    console.error("Error creating document:", error);
    return { error: "書類の作成に失敗しました。もう一度お試しください。" };
  }
}

export async function updateProjectAction(
  id: string,
  formData: FormData
) {
  // 認証チェック
  await requireAuth();
  
  const title = formData.get("title") as string;
  const name = formData.get("name") as string;
  const nationality = formData.get("nationality") as string;
  const visaType = formData.get("visaType") as string;
  const expiryDate = formData.get("expiryDate") as string | null;
  const status = formData.get("status") as Project["status"] | null;

  // バリデーション
  if (!title || !title.trim()) {
    return { error: "案件名は必須です" };
  }
  if (!name || !name.trim()) {
    return { error: "氏名は必須です" };
  }
  if (!nationality || !nationality.trim()) {
    return { error: "国籍は必須です" };
  }
  if (!visaType || !visaType.trim()) {
    return { error: "在留資格は必須です" };
  }

  try {
    // 既存の案件情報を取得（変更前の値を記録するため）
    const existingProject = await getProject(id);
    
    await updateProject(id, {
      title: title.trim(),
      name: name.trim(),
      nationality: nationality.trim(),
      visaType: visaType.trim(),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      status: status || 'pending',
    });

    // 操作履歴を記録
    try {
      const user = await getCurrentUser();
      if (user && existingProject) {
        const changedFields: string[] = [];
        const details: any = {};
        
        if (title.trim() !== existingProject.title) {
          changedFields.push("案件名");
          details.title = { oldValue: existingProject.title, newValue: title.trim() };
        }
        if (name.trim() !== existingProject.name) {
          changedFields.push("氏名");
          details.name = { oldValue: existingProject.name, newValue: name.trim() };
        }
        if (nationality.trim() !== existingProject.nationality) {
          changedFields.push("国籍");
          details.nationality = { oldValue: existingProject.nationality, newValue: nationality.trim() };
        }
        if (visaType.trim() !== existingProject.visaType) {
          changedFields.push("申請予定の資格");
          details.visaType = { oldValue: existingProject.visaType, newValue: visaType.trim() };
        }
        const newExpiryDate = expiryDate ? new Date(expiryDate) : null;
        const existingExpiryDate = existingProject.expiryDate ? (existingProject.expiryDate instanceof Date ? existingProject.expiryDate : existingProject.expiryDate.toDate()) : null;
        if ((newExpiryDate?.getTime() || null) !== (existingExpiryDate?.getTime() || null)) {
          changedFields.push("在留期限");
          details.expiryDate = { 
            oldValue: existingExpiryDate?.toISOString().split('T')[0] || null, 
            newValue: newExpiryDate?.toISOString().split('T')[0] || null 
          };
        }
        const newStatus = status || 'pending';
        if (newStatus !== existingProject.status) {
          changedFields.push("ステータス");
          details.status = { oldValue: existingProject.status, newValue: newStatus };
        }
        
        await createActivityLog(id, {
          actionType: "project_updated",
          description: changedFields.length > 0 
            ? `${changedFields.join("、")}を更新しました`
            : "案件情報を更新しました",
          details: details,
          performedBy: user.id,
          performedByName: user.displayName,
        });
      }
    } catch (logError) {
      // 操作履歴の記録に失敗してもメイン処理は継続
      console.error("Error creating activity log:", logError);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error updating project:", error);
    return { error: "案件の更新に失敗しました。もう一度お試しください。" };
  }
}

export async function deleteProjectAction(id: string) {
  // 認証チェック
  await requireAuth();
  
  try {
    // 削除前に案件情報を取得（操作履歴記録用）
    const project = await getProject(id);
    
    // 操作履歴を記録（削除前に記録する必要がある）
    try {
      const user = await getCurrentUser();
      if (user && project) {
        await createActivityLog(id, {
          actionType: "project_deleted",
          description: `案件「${project.title}」を削除しました`,
          performedBy: user.id,
          performedByName: user.displayName,
        });
      }
    } catch (logError) {
      // 操作履歴の記録に失敗してもメイン処理は継続
      console.error("Error creating activity log:", logError);
    }
    
    await deleteProject(id);
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting project:", error);
    return { error: "案件の削除に失敗しました。もう一度お試しください。" };
  }
}

