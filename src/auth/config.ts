import { getTokens } from "next-firebase-auth-edge/lib/next/tokens";
import { cookies } from "next/headers";

// #region agent log
fetch('http://127.0.0.1:7242/ingest/3d25e911-5548-4daa-8038-5ea7ce13809a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/auth/config.ts:7',message:'cookieSignatureKeys config initialization',data:{key1Type:typeof (process.env.COOKIE_SIGNATURE_KEY_1 || "default-signature-key-1-change-in-production"),key1Length:(process.env.COOKIE_SIGNATURE_KEY_1 || "default-signature-key-1-change-in-production").length,key2Type:typeof (process.env.COOKIE_SIGNATURE_KEY_2 || "default-signature-key-2-change-in-production"),key2Length:(process.env.COOKIE_SIGNATURE_KEY_2 || "default-signature-key-2-change-in-production").length,hasEnvKey1:!!process.env.COOKIE_SIGNATURE_KEY_1,hasEnvKey2:!!process.env.COOKIE_SIGNATURE_KEY_2},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
// #endregion

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
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")!,
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

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/3d25e911-5548-4daa-8038-5ea7ce13809a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/auth/config.ts:32',message:'getAuthTokens entry',data:{hasAdminSDK,hasProjectId:!!authConfig.serviceAccount.projectId,hasClientEmail:!!authConfig.serviceAccount.clientEmail,hasPrivateKey:!!authConfig.serviceAccount.privateKey,cookieSignatureKeysType:typeof authConfig.cookieSignatureKeys,cookieSignatureKeysIsArray:Array.isArray(authConfig.cookieSignatureKeys),cookieSignatureKeysLength:authConfig.cookieSignatureKeys?.length,firstKeyType:typeof authConfig.cookieSignatureKeys?.[0],firstKeyIsString:typeof authConfig.cookieSignatureKeys?.[0]==='string'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  if (hasAdminSDK) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3d25e911-5548-4daa-8038-5ea7ce13809a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/auth/config.ts:40',message:'Before getTokens call',data:{cookieSignatureKeysValue:authConfig.cookieSignatureKeys,serviceAccountPresent:!!authConfig.serviceAccount,hasApiKey:!!authConfig.apiKey},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    try {
      const result = await getTokens(cookieStore, authConfig);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3d25e911-5548-4daa-8038-5ea7ce13809a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/auth/config.ts:42',message:'getTokens success',data:{hasResult:!!result},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      return result;
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3d25e911-5548-4daa-8038-5ea7ce13809a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/auth/config.ts:43',message:'getTokens error details',data:{errorName:error instanceof Error?error.name:'unknown',errorMessage:error instanceof Error?error.message:String(error),errorStack:error instanceof Error?error.stack:undefined,errorType:typeof error},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      // next-firebase-auth-edgeでエラーが発生した場合は、フォールバックを使用
      console.warn("getTokens failed, using fallback:", error);
    }
  }

  // 開発環境用: Cookieから直接IDトークンを取得（簡易実装）
  const idToken = cookieStore.get("AuthToken")?.value;
  if (!idToken) {
    console.log("getAuthTokens: No AuthToken cookie found");
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

