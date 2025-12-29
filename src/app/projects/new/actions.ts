"use server";

import { createProject } from "@/lib/services/projectService";
import { createActivityLog } from "@/lib/services/activityLogService";
import { requireAuth, getCurrentUser } from "@/lib/auth/auth";

export async function createProjectAction(formData: FormData) {
  // 認証チェック
  await requireAuth();
  const title = formData.get("title") as string;
  const name = formData.get("name") as string;
  const nameEnglish = formData.get("nameEnglish") as string | null;
  const nationality = formData.get("nationality") as string;
  const currentVisaType = formData.get("currentVisaType") as string | null;
  const visaType = formData.get("visaType") as string;
  const expiryDate = formData.get("expiryDate") as string | null;

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
    const projectId = await createProject({
      title: title.trim(),
      name: name.trim(),
      nameEnglish: nameEnglish?.trim() || undefined,
      nationality: nationality.trim(),
      currentVisaType: currentVisaType?.trim() || undefined,
      visaType: visaType.trim(),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      status: 'pending',
    });

    // 操作履歴を記録
    try {
      const user = await getCurrentUser();
      if (user) {
        await createActivityLog(projectId, {
          actionType: "project_created",
          description: `案件「${title.trim()}」を作成しました`,
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
    console.error("Error creating project:", error);
    return { error: "案件の登録に失敗しました。もう一度お試しください。" };
  }
}

