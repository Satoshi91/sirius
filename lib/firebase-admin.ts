import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

/**
 * Firebase Admin SDKの初期化
 * 既に初期化されている場合は既存のインスタンスを返す
 */
function getFirebaseAdminApp(): App {
  // 既に初期化されている場合は既存のインスタンスを返す
  const existingApp = getApps()[0];
  if (existingApp) {
    return existingApp;
  }

  // 環境変数からサービスアカウント情報を取得
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin SDKの初期化に必要な環境変数が設定されていません。FIREBASE_PROJECT_ID、FIREBASE_CLIENT_EMAIL、FIREBASE_PRIVATE_KEYを設定してください。"
    );
  }

  // Firebase Admin SDKを初期化
  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

/**
 * Firebase Admin Authインスタンスを取得
 */
export function getFirebaseAdminAuth() {
  const app = getFirebaseAdminApp();
  return getAuth(app);
}

/**
 * カスタムトークンを生成
 * @param uid ユーザーID（メールアドレス）
 * @param email メールアドレス
 * @param emailVerified メールアドレスが検証済みかどうか
 */
export async function createCustomToken(
  uid: string,
  email: string,
  emailVerified: boolean = true
): Promise<string> {
  const auth = getFirebaseAdminAuth();
  
  // カスタムクレームを設定（必要に応じて）
  const customClaims = {
    email,
    email_verified: emailVerified,
  };

  return auth.createCustomToken(uid, customClaims);
}

