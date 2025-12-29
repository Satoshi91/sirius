"use server";

import { createProject } from "@/lib/services/projectService";

export async function createProjectAction(formData: FormData) {
  const name = formData.get("name") as string;
  const nameEnglish = formData.get("nameEnglish") as string | null;
  const nationality = formData.get("nationality") as string;
  const currentVisaType = formData.get("currentVisaType") as string | null;
  const visaType = formData.get("visaType") as string;
  const expiryDate = formData.get("expiryDate") as string | null;

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
    await createProject({
      name: name.trim(),
      nameEnglish: nameEnglish?.trim() || undefined,
      nationality: nationality.trim(),
      currentVisaType: currentVisaType?.trim() || undefined,
      visaType: visaType.trim(),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      status: 'pending',
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating project:", error);
    return { error: "案件の登録に失敗しました。もう一度お試しください。" };
  }
}

