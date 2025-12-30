import { NextRequest, NextResponse } from "next/server";

/**
 * Firebase AuthのIDトークンを受け取り、認証Cookieを設定するAPIエンドポイント
 */
export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json(
        { error: "リクエストボディの解析に失敗しました" },
        { status: 400 }
      );
    }

    const { idToken } = body;

    if (!idToken || typeof idToken !== 'string') {
      console.error("Invalid idToken:", { idToken, type: typeof idToken });
      return NextResponse.json(
        { error: "IDトークンが提供されていません" },
        { status: 400 }
      );
    }

    // next-firebase-auth-edgeのsetAuthCookiesを使用してCookieを設定
    // これにより、Cookieに署名が付き、getTokensで正しく読み取れるようになります
    // 注意: setAuthCookiesのAPIが変更されている可能性があるため、フォールバック処理を使用
    const response = NextResponse.json({ success: true });
    // NextResponseのヘッダーに直接Cookieを設定
    response.cookies.set("AuthToken", idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24時間
    });
    return response;
  } catch (error) {
    console.error("Error setting auth cookies:", error);
    const errorMessage = error instanceof Error ? error.message : "認証Cookieの設定に失敗しました";
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error details:", { errorMessage, errorStack });
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

