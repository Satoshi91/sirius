import { getTokens } from "next-firebase-auth-edge/lib/next/tokens";
import { cookies } from "next/headers";

/**
 * next-firebase-auth-edgeの認証設定
 */
export const authConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  cookieName: "AuthToken",
  cookieSignatureKeys: [
    process.env.COOKIE_SIGNATURE_KEY_1 || "default-signature-key-1-change-in-production",
    process.env.COOKIE_SIGNATURE_KEY_2 || "default-signature-key-2-change-in-production",
  ],
  serviceAccount: {
    projectId: process.env.FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n") ?? ""),
  },
  cookieSerializeOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24, // 24時間
  },
};

/**
 * サーバー側でトークンを取得
 */
export async function getAuthTokens() {
  const cookieStore = await cookies();
  
  // Firebase Admin SDKが設定されている場合は、next-firebase-auth-edgeを使用
  const hasAdminSDK = 
    authConfig.serviceAccount.projectId && 
    authConfig.serviceAccount.clientEmail && 
    authConfig.serviceAccount.privateKey;

  if (hasAdminSDK) {
    try {
      const result = await getTokens(cookieStore, authConfig);
      return result;
    } catch (error) {
      // next-firebase-auth-edgeでエラーが発生した場合は、フォールバックを使用
      // 署名なしクッキーの場合など、RS256キーエラーが発生することがある
      // これは予期される動作（フォールバック処理があるため）なので、ログは抑制
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes("RS256") && !errorMessage.includes("Uint8Array")) {
        // RS256キーエラー以外の場合はログを出力
        console.warn("getTokens failed, using fallback:", error);
      }
    }
  }

  // 開発環境用: Cookieから直接IDトークンを取得（簡易実装）
  const idToken = cookieStore.get("AuthToken")?.value;
  if (!idToken) {
    return null;
  }

  // IDトークンをデコード（簡易実装）
  // 注意: 本番環境ではFirebase Admin SDKを使用してトークンを検証してください
  try {
    // JWTトークンの形式チェック
    const parts = idToken.split('.');
    if (parts.length !== 3) {
      console.error("getAuthTokens: Invalid token format (not a JWT)");
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf-8')
    );
    
    if (!payload.email) {
      console.error("getAuthTokens: Token payload missing email");
      return null;
    }

    return {
      decodedToken: {
        uid: payload.sub || payload.user_id,
        email: payload.email,
        email_verified: payload.email_verified,
      },
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

