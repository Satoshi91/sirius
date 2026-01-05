"use server";

import { getUserByEmail } from "@/lib/services/userService";
import { getFirebaseAdminAuth } from "@/lib/firebase-admin";

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
      return {
        error: "このアカウントは登録されていません。管理者に連絡してください。",
      };
    }

    // ユーザーが無効化されている場合はログイン拒否
    if (!userProfile.isActive) {
      return {
        error: "このアカウントは無効化されています。管理者に連絡してください。",
      };
    }

    // Firebase Admin SDKでカスタムクレームとしてemailを設定
    // これにより、Storage Rulesでrequest.auth.token.emailにアクセスできるようになります
    try {
      const adminAuth = getFirebaseAdminAuth();
      // ユーザーのUIDを取得（メールアドレスをUIDとして使用している場合）
      let uid: string;
      try {
        const userRecord = await adminAuth.getUserByEmail(email);
        uid = userRecord.uid;
      } catch (error: unknown) {
        const firebaseError = error as { code?: string };
        // ユーザーが存在しない場合は、メールアドレスをUIDとして使用
        if (firebaseError.code === "auth/user-not-found") {
          uid = email;
        } else {
          throw error;
        }
      }

      // カスタムクレームとしてemailを設定
      // #region agent log
      console.log(
        `[DEBUG] Setting custom claims for uid: ${uid}, email: ${email}`
      );
      // #endregion
      await adminAuth.setCustomUserClaims(uid, {
        email: email,
        email_verified: true,
      });
      // #region agent log
      console.log(
        `[DEBUG] Custom claims set successfully for uid: ${uid}, email: ${email}`
      );
      // #endregion
    } catch (error) {
      // カスタムクレームの設定に失敗してもログインは継続
      // Storage Rulesでrequest.auth.token.emailが利用できない場合のフォールバックがあるため
      console.warn("Failed to set custom claims:", error);
      // #region agent log
      console.error(
        `[DEBUG] Failed to set custom claims for email: ${email}`,
        error
      );
      // #endregion
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
