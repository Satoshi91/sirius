import { NextRequest, NextResponse } from "next/server";

/**
 * 認証Cookieを削除するAPIエンドポイント
 * ログアウト時に呼び出される
 */
export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true });
    // Cookieを削除
    response.cookies.delete("AuthToken");
    return response;
  } catch (error) {
    console.error("Error clearing auth cookies:", error);
    const errorMessage =
      error instanceof Error ? error.message : "認証Cookieの削除に失敗しました";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
