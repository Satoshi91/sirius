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

/**
 * ゲストログイン処理（開発環境のみ）
 * 固定メールアドレス（guest@example.com）でadmin権限のゲストユーザーとしてログイン
 */
export async function handleGuestLogin() {
  try {
    // 開発環境またはstaging環境（preview環境）でのみ有効
    // 本番環境（production）では無効
    // サーバーアクション内では process.env.VERCEL_ENV を使用（Vercelが自動設定）
    const vercelEnv =
      process.env.VERCEL_ENV || process.env.NEXT_PUBLIC_VERCEL_ENV;
    const nodeEnv = process.env.NODE_ENV;
    const isProduction = nodeEnv === "production" && vercelEnv === "production";

    // デバッグログ: 環境変数の値を確認
    console.log("[handleGuestLogin] Environment check:", {
      NODE_ENV: nodeEnv,
      VERCEL_ENV: process.env.VERCEL_ENV,
      NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
      vercelEnv,
      isProduction,
    });

    if (isProduction) {
      console.log(
        "[handleGuestLogin] Blocked: Production environment detected"
      );
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
    console.log("[handleGuestLogin] Initializing Firebase Admin SDK...");
    let adminAuth;
    try {
      adminAuth = getFirebaseAdminAuth();
      console.log(
        "[handleGuestLogin] Firebase Admin SDK initialized successfully"
      );
    } catch (error) {
      console.error(
        "[handleGuestLogin] Firebase Admin SDK initialization failed:",
        error
      );
      // 環境変数の確認
      console.error("[handleGuestLogin] Environment variables check:", {
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? "✓" : "✗",
        FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? "✓" : "✗",
        FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? "✓" : "✗",
      });
      throw error;
    }
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

    // カスタムクレームとしてemailを設定
    // これにより、Storage Rulesでrequest.auth.token.emailにアクセスできるようになります
    try {
      // #region agent log
      console.log(
        `[DEBUG] Setting custom claims for guest user uid: ${guestEmail}, email: ${guestEmail}`
      );
      // #endregion
      await adminAuth.setCustomUserClaims(guestEmail, {
        email: guestEmail,
        email_verified: true,
      });
      console.log(
        "ゲストユーザーのカスタムクレームを設定しました:",
        guestEmail
      );
      // #region agent log
      console.log(
        `[DEBUG] Custom claims set successfully for guest user uid: ${guestEmail}`
      );
      // #endregion
    } catch (error) {
      // カスタムクレームの設定に失敗してもログインは継続
      console.warn("Failed to set custom claims for guest user:", error);
      // #region agent log
      console.error(
        `[DEBUG] Failed to set custom claims for guest user uid: ${guestEmail}`,
        error
      );
      // #endregion
    }

    // Firebase Admin SDKを使用してカスタムトークンを生成
    const customToken = await createCustomToken(guestEmail, guestEmail, true);

    console.log("[handleGuestLogin] Custom token generated successfully");
    return { success: true, customToken };
  } catch (error) {
    console.error("[handleGuestLogin] Error handling guest login:", error);

    // より詳細なエラー情報をログに出力
    if (error instanceof Error) {
      console.error("[handleGuestLogin] Error message:", error.message);
      console.error("[handleGuestLogin] Error stack:", error.stack);

      // Firebase Admin SDK関連のエラーの場合
      if (
        error.message.includes("Firebase Admin SDK") ||
        error.message.includes("FIREBASE")
      ) {
        console.error("[handleGuestLogin] Firebase Admin SDK error detected");
        console.error("[handleGuestLogin] Environment variables:", {
          FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID
            ? "✓ Set"
            : "✗ Missing",
          FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL
            ? "✓ Set"
            : "✗ Missing",
          FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY
            ? "✓ Set"
            : "✗ Missing",
        });
      }
    } else {
      console.error(
        "[handleGuestLogin] Unknown error type:",
        typeof error,
        error
      );
    }

    return {
      error: "ゲストログイン処理に失敗しました。もう一度お試しください。",
    };
  }
}
