import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/services/userService";

/**
 * クライアント側でサーバー側の認証状態を確認するAPIエンドポイント
 * AuthProviderで初回ロード時に呼び出される
 */
export async function GET(request: NextRequest) {
  try {
    // CookieからIDトークンを取得
    const idToken = request.cookies.get("AuthToken")?.value;

    if (!idToken) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    // JWTトークンの形式チェック
    const parts = idToken.split(".");
    if (parts.length !== 3) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    // トークンをデコード（簡易実装）
    let payload: { email?: string };
    try {
      payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
    } catch {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const email = payload.email;
    if (!email) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const user = await getUserByEmail(email);
    if (!user || !user.isActive) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    // ユーザー情報を返す（パスワード等の機密情報は除外）
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Error checking auth status:", error);
    return NextResponse.json({ authenticated: false, user: null });
  }
}
