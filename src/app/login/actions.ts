"use server";

import { createUserProfile, getUserByEmail } from "@/lib/services/userService";

/**
 * ログイン後の処理（Firestoreチェック）
 * メールアドレスでFirestoreのusersコレクションをチェックし、
 * 存在しない場合はログインを拒否します
 * クライアント側でログイン成功後に呼び出す
 */
export async function handleLoginSuccess(email: string, displayName?: string) {
  try {
    if (!email) {
      return { error: "メールアドレスが取得できませんでした" };
    }

    // メールアドレスでFirestoreのusersコレクションをチェック
    const userProfile = await getUserByEmail(email);
    
    // ユーザーが存在しない場合はログイン拒否
    if (!userProfile) {
      return { error: "このアカウントは登録されていません。管理者に連絡してください。" };
    }

    // ユーザーが無効化されている場合はログイン拒否
    if (!userProfile.isActive) {
      return { error: "このアカウントは無効化されています。管理者に連絡してください。" };
    }

    // 既存のユーザー情報を更新（displayNameが変更されている場合）
    if (displayName && displayName !== userProfile.displayName) {
      // 必要に応じてdisplayNameを更新する処理を追加可能
      // 現時点では更新しない（管理者が設定した名前を優先）
    }

    return { success: true };
  } catch (error) {
    console.error("Error handling login success:", error);
    return { error: "ログイン処理に失敗しました。もう一度お試しください。" };
  }
}

