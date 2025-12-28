"use server";

import { createRequiredDocument, deleteRequiredDocument } from "@/lib/services/requiredDocumentService";

export async function createRequiredDocumentAction(
  contactId: string,
  formData: FormData
) {
  const documentName = formData.get("documentName") as string;
  const source = formData.get("source") as string | null;
  const assignedTo = formData.get("assignedTo") as string | null;
  const status = formData.get("status") as string | null;
  const remarks = formData.get("remarks") as string | null;

  // バリデーション
  if (!documentName || !documentName.trim()) {
    return { error: "書類名は必須です" };
  }

  try {
    await createRequiredDocument({
      contactId,
      documentName: documentName.trim(),
      source: source?.trim() || undefined,
      assignedTo: (assignedTo === "Office" || assignedTo === "Applicant") 
        ? assignedTo 
        : undefined,
      status: (status === "準備中" || status === "完了" || status === "待機中" || status === "確認中") 
        ? status 
        : undefined,
      remarks: remarks?.trim() || undefined,
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating required document:", error);
    return { error: "必要書類の登録に失敗しました。もう一度お試しください。" };
  }
}

export async function deleteRequiredDocumentAction(id: string) {
  try {
    await deleteRequiredDocument(id);
    return { success: true };
  } catch (error) {
    console.error("Error deleting required document:", error);
    return { error: "必要書類の削除に失敗しました。もう一度お試しください。" };
  }
}
