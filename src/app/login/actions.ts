"use server";

import { createUserProfile, getUserByEmail } from "@/lib/services/userService";
import { createCustomToken, getFirebaseAdminAuth } from "@/lib/firebase-admin";

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

/**
 * ゲストログイン処理（開発環境のみ）
 * 固定メールアドレス（guest@example.com）でadmin権限のゲストユーザーとしてログイン
 */
export async function handleGuestLogin() {
  try {
    // 開発環境のみで有効
    if (process.env.NODE_ENV === "production") {
      return { error: "ゲストログインは開発環境でのみ利用可能です。" };
    }

    const guestEmail = "guest@example.com";
    const guestDisplayName = "ゲストユーザー";

    // Firestoreのusersコレクションにゲストユーザーが存在するか確認
    const userProfile = await getUserByEmail(guestEmail);

    // ゲストユーザーが存在しない場合は作成
    if (!userProfile) {
      await createUserProfile(guestEmail, {
        displayName: guestDisplayName,
        role: "admin",
      });
      console.log("ゲストユーザーを作成しました:", guestEmail);
    } else {
      // 既存のゲストユーザーが無効化されている場合は有効化
      if (!userProfile.isActive) {
        const { updateUser } = await import("@/lib/services/userService");
        await updateUser(guestEmail, { isActive: true });
        console.log("ゲストユーザーを有効化しました:", guestEmail);
      }
    }

    // Firebase Admin SDKでFirebase Authのユーザーを作成または更新
    // これにより、カスタムトークンでログインした際にメールアドレスが取得できるようになります
    const adminAuth = getFirebaseAdminAuth();
    try {
      // 既存のユーザーを取得
      await adminAuth.getUser(guestEmail);
      // 既存ユーザーのメールアドレスを更新
      await adminAuth.updateUser(guestEmail, {
        email: guestEmail,
        emailVerified: true,
        displayName: guestDisplayName,
      });
      console.log("Firebase Authのゲストユーザーを更新しました:", guestEmail);
    } catch (error: unknown) {
      // ユーザーが存在しない場合は作成
      const firebaseError = error as { code?: string };
      if (firebaseError.code === "auth/user-not-found") {
        await adminAuth.createUser({
          uid: guestEmail,
          email: guestEmail,
          emailVerified: true,
          displayName: guestDisplayName,
        });
        console.log("Firebase Authのゲストユーザーを作成しました:", guestEmail);
      } else {
        throw error;
      }
    }

    // Firebase Admin SDKを使用してカスタムトークンを生成
    const customToken = await createCustomToken(guestEmail, guestEmail, true);

    return { success: true, customToken };
  } catch (error) {
    console.error("Error handling guest login:", error);
    return { error: "ゲストログイン処理に失敗しました。もう一度お試しください。" };
  }
}

