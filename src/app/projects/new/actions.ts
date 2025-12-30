"use server";

import { createProject } from "@/lib/services/projectService";
import { createActivityLog } from "@/lib/services/activityLogService";
import { requireAuth, getCurrentUser } from "@/lib/auth/auth";
import { searchCustomers } from "@/lib/services/customerService";

export async function searchCustomersAction(query: string) {
  await requireAuth();
  try {
    const customers = await searchCustomers(query);
    return { customers };
  } catch (error) {
    console.error("Error searching customers:", error);
    return { customers: [] };
  }
}

export async function createProjectAction(formData: FormData) {
  // 認証チェック
  await requireAuth();
  const title = formData.get("title") as string;
  const customerId = formData.get("customerId") as string;
  const currentVisaType = formData.get("currentVisaType") as string | null;
  const visaType = formData.get("visaType") as string;
  const expiryDate = formData.get("expiryDate") as string | null;

  // バリデーション
  if (!title || !title.trim()) {
    return { error: "案件名は必須です" };
  }
  if (!customerId || !customerId.trim()) {
    return { error: "顧客は必須です" };
  }
  if (!visaType || !visaType.trim()) {
    return { error: "在留資格は必須です" };
  }

  try {
    const projectId = await createProject({
      title: title.trim(),
      customerId: customerId.trim(),
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

