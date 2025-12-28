"use server";

import { createContact } from "@/lib/services/contactService";

export async function createContactAction(formData: FormData) {
  const title = formData.get("title") as string;
  const client = formData.get("client") as string;
  const status = formData.get("status") as string | null;
  const description = formData.get("description") as string | null;
  const deadline = formData.get("deadline") as string | null;

  // バリデーション
  if (!title || !title.trim()) {
    return { error: "タイトルは必須です" };
  }
  if (!client || !client.trim()) {
    return { error: "クライアントは必須です" };
  }

  try {
    await createContact({
      title: title.trim(),
      client: client.trim(),
      status: status?.trim() || undefined,
      description: description?.trim() || undefined,
      deadline: deadline ? new Date(deadline) : null,
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating contact:", error);
    return { error: "案件の登録に失敗しました。もう一度お試しください。" };
  }
}
