"use server";

import { requireAdmin, requireAuth } from "@/lib/auth/auth";
import { createUserProfile, updateUser, deactivateUser, getAllUsers, getUserByEmail, normalizeEmail } from "@/lib/services/userService";

/**
 * 全ユーザー一覧を取得（認証済みユーザー全員）
 */
export async function getUsersAction() {
  try {
    await requireAuth();
    const users = await getAllUsers();
    return { success: true, users };
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return { error: error.message || "職員の取得に失敗しました" };
  }
}

/**
 * 新規ユーザーを作成（adminのみ）
 * メールアドレスをドキュメントIDとしてFirestoreに追加
 */
export async function createUserAction(formData: FormData) {
  try {
    const currentUser = await requireAdmin();
    
    const email = formData.get("email") as string;
    const displayName = formData.get("displayName") as string;
    const role = formData.get("role") as 'admin' | 'staff';

    // バリデーション
    if (!email || !email.trim()) {
      return { error: "メールアドレスは必須です" };
    }
    if (!displayName || !displayName.trim()) {
      return { error: "名前は必須です" };
    }
    if (!role || !['admin', 'staff'].includes(role)) {
      return { error: "権限は必須です" };
    }

    // メールアドレスを正規化
    const normalizedEmail = normalizeEmail(email);

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return { error: "有効なメールアドレスを入力してください" };
    }

    // 重複チェック（既に同じメールアドレスが存在するか）
    const existingUser = await getUserByEmail(normalizedEmail);
    if (existingUser) {
      return { error: "このメールアドレスは既に登録されています" };
    }

    // Firestoreにユーザーを作成（メールアドレスをドキュメントIDとして使用）
    await createUserProfile(normalizedEmail, {
      displayName: displayName.trim(),
      role: role,
      createdBy: currentUser.id,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error creating user:", error);
    return { error: error.message || "職員の作成に失敗しました" };
  }
}

/**
 * ユーザー情報を更新（adminのみ）
 * userIdはメールアドレス（ドキュメントID）
 */
export async function updateUserAction(userId: string, formData: FormData) {
  try {
    await requireAdmin();
    
    const displayName = formData.get("displayName") as string;
    const role = formData.get("role") as 'admin' | 'staff';

    // バリデーション
    if (!displayName || !displayName.trim()) {
      return { error: "名前は必須です" };
    }
    if (!role || !['admin', 'staff'].includes(role)) {
      return { error: "権限は必須です" };
    }

    // userIdはメールアドレス（ドキュメントID）
    await updateUser(userId, {
      displayName: displayName.trim(),
      role,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error updating user:", error);
    return { error: error.message || "職員の更新に失敗しました" };
  }
}

/**
 * ユーザーを無効化（adminのみ）
 * userIdはメールアドレス（ドキュメントID）
 */
export async function deactivateUserAction(userId: string) {
  try {
    const currentUser = await requireAdmin();
    
    // 自分自身を無効化できないようにする
    if (userId === currentUser.id) {
      return { error: "自分自身を無効化することはできません" };
    }

    // userIdはメールアドレス（ドキュメントID）
    await deactivateUser(userId);
    return { success: true };
  } catch (error: any) {
    console.error("Error deactivating user:", error);
    return { error: error.message || "職員の無効化に失敗しました" };
  }
}

