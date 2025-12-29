"use server";

import { uploadDocument, createDocument, uploadFileToDocument } from "@/lib/services/documentService";
import { updateProject, deleteProject } from "@/lib/services/projectService";
import { ProjectDocument, Project } from "@/types";

export async function uploadDocumentAction(
  projectId: string,
  documentId: string,
  formData: FormData
) {
  const file = formData.get("file") as File | null;

  if (!file) {
    return { error: "ファイルが選択されていません" };
  }

  try {
    await uploadFileToDocument(projectId, documentId, file);
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
    await createDocument(projectId, {
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
  const name = formData.get("name") as string;
  const nationality = formData.get("nationality") as string;
  const visaType = formData.get("visaType") as string;
  const expiryDate = formData.get("expiryDate") as string | null;
  const status = formData.get("status") as Project["status"] | null;

  // バリデーション
  if (!name || !name.trim()) {
    return { error: "案件名は必須です" };
  }
  if (!nationality || !nationality.trim()) {
    return { error: "国籍は必須です" };
  }
  if (!visaType || !visaType.trim()) {
    return { error: "在留資格は必須です" };
  }

  try {
    await updateProject(id, {
      name: name.trim(),
      nationality: nationality.trim(),
      visaType: visaType.trim(),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      status: status || 'pending',
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating project:", error);
    return { error: "案件の更新に失敗しました。もう一度お試しください。" };
  }
}

export async function deleteProjectAction(id: string) {
  try {
    await deleteProject(id);
    return { success: true };
  } catch (error) {
    console.error("Error deleting project:", error);
    return { error: "案件の削除に失敗しました。もう一度お試しください。" };
  }
}

