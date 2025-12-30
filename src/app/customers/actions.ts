"use server";

import { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer, searchCustomers, uploadCustomerDocument, deleteCustomerDocument, addCustomerNote } from "@/lib/services/customerService";
import { getProjectsByCustomerId } from "@/lib/services/projectService";
import { requireAuth, getCurrentUser } from "@/lib/auth/auth";
import { validateCustomerName } from "@/lib/utils/customerValidation";

export async function getCustomersAction() {
  await requireAuth();
  try {
    const customers = await getCustomers();
    return { customers };
  } catch (error) {
    console.error("Error fetching customers:", error);
    return { error: "顧客一覧の取得に失敗しました", customers: [] };
  }
}

export async function getCustomerAction(id: string) {
  await requireAuth();
  try {
    const customer = await getCustomer(id);
    if (!customer) {
      return { error: "顧客が見つかりませんでした" };
    }
    return { customer };
  } catch (error) {
    console.error("Error fetching customer:", error);
    return { error: "顧客情報の取得に失敗しました" };
  }
}

export async function createCustomerAction(formData: FormData) {
  await requireAuth();
  
  const name = {
    last: {
      en: (formData.get("name.last.en") as string) || "",
      ja: (formData.get("name.last.ja") as string) || "",
      kana: (formData.get("name.last.kana") as string) || "",
    },
    first: {
      en: (formData.get("name.first.en") as string) || "",
      ja: (formData.get("name.first.ja") as string) || "",
      kana: (formData.get("name.first.kana") as string) || "",
    },
  };
  const nationality = formData.get("nationality") as string;
  const birthday = formData.get("birthday") as string | null;
  const gender = formData.get("gender") as string | null;
  const residenceCardNumber = formData.get("residenceCardNumber") as string | null;
  const email = formData.get("email") as string | null;
  const phone = formData.get("phone") as string | null;
  const address = formData.get("address") as string | null;
  const notes = formData.get("notes") as string | null;

  // 氏名のバリデーション
  const nameValidation = validateCustomerName(name);
  if (!nameValidation.isValid) {
    const firstError = Object.values(nameValidation.errors)[0];
    return { error: firstError || "氏名の入力に誤りがあります" };
  }

  // 国籍のバリデーション
  if (!nationality || !nationality.trim()) {
    return { error: "国籍は必須です" };
  }

  try {
    const customerId = await createCustomer({
      name: {
        last: {
          en: name.last.en.trim(),
          ja: name.last.ja.trim(),
          kana: name.last.kana.trim(),
        },
        first: {
          en: name.first.en.trim(),
          ja: name.first.ja.trim(),
          kana: name.first.kana.trim(),
        },
      },
      nationality: nationality.trim(),
      birthday: birthday ? new Date(birthday) : null,
      gender: gender?.trim() || null,
      residenceCardNumber: residenceCardNumber?.trim() || null,
      email: email?.trim() || undefined,
      phone: phone?.trim() || undefined,
      address: address?.trim() || undefined,
      notes: notes?.trim() || undefined,
    });

    return { success: true, customerId };
  } catch (error) {
    console.error("Error creating customer:", error);
    return { error: "顧客の登録に失敗しました。もう一度お試しください。" };
  }
}

export async function updateCustomerAction(id: string, formData: FormData) {
  await requireAuth();
  
  const name = {
    last: {
      en: (formData.get("name.last.en") as string) || "",
      ja: (formData.get("name.last.ja") as string) || "",
      kana: (formData.get("name.last.kana") as string) || "",
    },
    first: {
      en: (formData.get("name.first.en") as string) || "",
      ja: (formData.get("name.first.ja") as string) || "",
      kana: (formData.get("name.first.kana") as string) || "",
    },
  };
  const nationality = formData.get("nationality") as string;
  const birthday = formData.get("birthday") as string | null;
  const gender = formData.get("gender") as string | null;
  const residenceCardNumber = formData.get("residenceCardNumber") as string | null;
  const email = formData.get("email") as string | null;
  const phone = formData.get("phone") as string | null;
  const address = formData.get("address") as string | null;
  const notes = formData.get("notes") as string | null;

  // 氏名のバリデーション
  const nameValidation = validateCustomerName(name);
  if (!nameValidation.isValid) {
    const firstError = Object.values(nameValidation.errors)[0];
    return { error: firstError || "氏名の入力に誤りがあります" };
  }

  // 国籍のバリデーション
  if (!nationality || !nationality.trim()) {
    return { error: "国籍は必須です" };
  }

  try {
    await updateCustomer(id, {
      name: {
        last: {
          en: name.last.en.trim(),
          ja: name.last.ja.trim(),
          kana: name.last.kana.trim(),
        },
        first: {
          en: name.first.en.trim(),
          ja: name.first.ja.trim(),
          kana: name.first.kana.trim(),
        },
      },
      nationality: nationality.trim(),
      birthday: birthday ? new Date(birthday) : null,
      gender: gender?.trim() || null,
      residenceCardNumber: residenceCardNumber?.trim() || null,
      email: email?.trim() || undefined,
      phone: phone?.trim() || undefined,
      address: address?.trim() || undefined,
      notes: notes?.trim() || undefined,
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating customer:", error);
    return { error: "顧客情報の更新に失敗しました。もう一度お試しください。" };
  }
}

export async function deleteCustomerAction(id: string) {
  await requireAuth();
  
  try {
    // 関連する案件があるかチェック
    const projects = await getProjectsByCustomerId(id);
    if (projects.length > 0) {
      return { 
        error: `この顧客には${projects.length}件の案件が関連付けられています。先に案件を削除するか、別の顧客に変更してください。`,
        hasProjects: true,
        projectCount: projects.length
      };
    }

    await deleteCustomer(id);
    return { success: true };
  } catch (error) {
    console.error("Error deleting customer:", error);
    return { error: "顧客の削除に失敗しました。もう一度お試しください。" };
  }
}

export async function getCustomerProjectsAction(customerId: string) {
  await requireAuth();
  try {
    const projects = await getProjectsByCustomerId(customerId);
    return { projects };
  } catch (error) {
    console.error("Error fetching customer projects:", error);
    return { error: "案件一覧の取得に失敗しました", projects: [] };
  }
}

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

export async function uploadCustomerDocumentAction(
  customerId: string,
  formData: FormData
) {
  await requireAuth();
  
  const file = formData.get("file") as File | null;
  const label = formData.get("label") as string | null;

  if (!file) {
    return { error: "ファイルが選択されていません" };
  }

  if (!label || !label.trim()) {
    return { error: "ラベルは必須です" };
  }

  try {
    await uploadCustomerDocument(customerId, file, label.trim());
    return { success: true };
  } catch (error) {
    console.error("Error uploading customer document:", error);
    return { error: "ファイルのアップロードに失敗しました。もう一度お試しください。" };
  }
}

export async function deleteCustomerDocumentAction(
  customerId: string,
  documentId: string
) {
  await requireAuth();
  
  try {
    await deleteCustomerDocument(customerId, documentId);
    return { success: true };
  } catch (error) {
    console.error("Error deleting customer document:", error);
    return { error: "ファイルの削除に失敗しました。もう一度お試しください。" };
  }
}

export async function addCustomerNoteAction(
  customerId: string,
  content: string
) {
  await requireAuth();
  
  if (!content || !content.trim()) {
    return { error: "メモの内容を入力してください" };
  }
  
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "ユーザー情報の取得に失敗しました" };
    }
    
    await addCustomerNote(customerId, {
      content: content.trim(),
      authorName: user.displayName || user.email,
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error adding customer note:", error);
    return { error: "メモの追加に失敗しました。もう一度お試しください。" };
  }
}

