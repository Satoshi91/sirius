"use server";

import { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer, searchCustomers, uploadCustomerDocument, deleteCustomerDocument, addCustomerNote } from "@/lib/services/customerService";
import { getProjectsByCustomerId } from "@/lib/services/projectService";
import { requireAuth, getCurrentUser } from "@/lib/auth/auth";
import { validateCustomerName } from "@/lib/utils/customerValidation";
import { createCustomerHistory, getCustomerHistory } from "@/lib/services/customerHistoryService";

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
  const expiryDate = formData.get("expiryDate") as string | null;
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
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      email: email?.trim() || undefined,
      phone: phone?.trim() || undefined,
      address: address?.trim() || undefined,
      notes: notes?.trim() || undefined,
    });

    // 操作履歴を記録
    try {
      const user = await getCurrentUser();
      if (user) {
        const customerName = `${name.last.ja || name.last.en} ${name.first.ja || name.first.en}`.trim();
        await createCustomerHistory(customerId, {
          actionType: "customer_created",
          description: `顧客「${customerName}」を新規登録しました`,
          details: {},
          performedBy: user.id,
          performedByName: user.displayName || user.email,
        });
      }
    } catch (logError) {
      // 操作履歴の記録に失敗してもメイン処理は継続
      console.error("Error creating customer history:", logError);
    }

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
  const expiryDate = formData.get("expiryDate") as string | null;
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
    // 既存の顧客情報を取得（変更前の値を記録するため）
    const existingCustomer = await getCustomer(id);
    if (!existingCustomer) {
      return { error: "顧客が見つかりませんでした" };
    }

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
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      email: email?.trim() || undefined,
      phone: phone?.trim() || undefined,
      address: address?.trim() || undefined,
      notes: notes?.trim() || undefined,
    });

    // 操作履歴を記録
    try {
      const user = await getCurrentUser();
      if (user) {
        const changedFields: string[] = [];
        const details: Record<string, unknown> = {};

        // 氏名の変更を検出
        const newNameStr = `${name.last.ja || name.last.en} ${name.first.ja || name.first.en}`.trim();
        const oldNameStr = `${existingCustomer.name.last.ja || existingCustomer.name.last.en} ${existingCustomer.name.first.ja || existingCustomer.name.first.en}`.trim();
        if (newNameStr !== oldNameStr) {
          changedFields.push("氏名");
          details.name = { oldValue: oldNameStr, newValue: newNameStr };
        }

        // 国籍の変更を検出
        const newNationality = nationality.trim();
        if (newNationality !== existingCustomer.nationality) {
          changedFields.push("国籍");
          details.nationality = { oldValue: existingCustomer.nationality, newValue: newNationality };
        }

        // 生年月日の変更を検出
        const newBirthday = birthday ? new Date(birthday).toISOString().split("T")[0] : null;
        const oldBirthday = existingCustomer.birthday 
          ? (existingCustomer.birthday instanceof Date 
              ? existingCustomer.birthday.toISOString().split("T")[0]
              : existingCustomer.birthday.toDate().toISOString().split("T")[0])
          : null;
        if (newBirthday !== oldBirthday) {
          changedFields.push("生年月日");
          details.birthday = { oldValue: oldBirthday, newValue: newBirthday };
        }

        // 性別の変更を検出
        const newGender = gender?.trim() || null;
        if (newGender !== existingCustomer.gender) {
          changedFields.push("性別");
          details.gender = { oldValue: existingCustomer.gender, newValue: newGender };
        }

        // 在留カード番号の変更を検出
        const newResidenceCardNumber = residenceCardNumber?.trim() || null;
        if (newResidenceCardNumber !== existingCustomer.residenceCardNumber) {
          changedFields.push("在留カード番号");
          details.residenceCardNumber = { oldValue: existingCustomer.residenceCardNumber, newValue: newResidenceCardNumber };
        }

        // 在留期限の変更を検出
        const newExpiryDate = expiryDate ? new Date(expiryDate).toISOString().split("T")[0] : null;
        const oldExpiryDate = existingCustomer.expiryDate 
          ? (existingCustomer.expiryDate instanceof Date 
              ? existingCustomer.expiryDate.toISOString().split("T")[0]
              : existingCustomer.expiryDate.toDate().toISOString().split("T")[0])
          : null;
        if (newExpiryDate !== oldExpiryDate) {
          changedFields.push("在留期限");
          details.expiryDate = { oldValue: oldExpiryDate, newValue: newExpiryDate };
        }

        // メールアドレスの変更を検出
        const newEmail = email?.trim() || null;
        if (newEmail !== existingCustomer.email) {
          changedFields.push("メールアドレス");
          details.email = { oldValue: existingCustomer.email, newValue: newEmail };
        }

        // 電話番号の変更を検出
        const newPhone = phone?.trim() || null;
        if (newPhone !== existingCustomer.phone) {
          changedFields.push("電話番号");
          details.phone = { oldValue: existingCustomer.phone, newValue: newPhone };
        }

        // 住所の変更を検出
        const newAddress = address?.trim() || null;
        if (newAddress !== existingCustomer.address) {
          changedFields.push("住所");
          details.address = { oldValue: existingCustomer.address, newValue: newAddress };
        }

        // 備考の変更を検出
        const newNotes = notes?.trim() || null;
        if (newNotes !== existingCustomer.notes) {
          changedFields.push("備考");
          details.notes = { oldValue: existingCustomer.notes, newValue: newNotes };
        }

        await createCustomerHistory(id, {
          actionType: "customer_updated",
          description: changedFields.length > 0 
            ? `${changedFields.join("、")}を更新しました`
            : "顧客情報を更新しました",
          details: details,
          performedBy: user.id,
          performedByName: user.displayName || user.email,
        });
      }
    } catch (logError) {
      // 操作履歴の記録に失敗してもメイン処理は継続
      console.error("Error creating customer history:", logError);
    }

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

export async function getCustomerHistoryAction(customerId: string) {
  await requireAuth();
  try {
    const history = await getCustomerHistory(customerId);
    return { history };
  } catch (error) {
    console.error("Error fetching customer history:", error);
    return { error: "履歴の取得に失敗しました", history: [] };
  }
}

