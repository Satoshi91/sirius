import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ログインページとAPIルートはスキップ
  if (pathname === "/login" || pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // Cookieから認証トークンを確認
  const authToken = request.cookies.get("AuthToken")?.value;

  if (!authToken) {
    // 未認証の場合はログインページにリダイレクト
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Cookieが有効なJWT形式かどうかを簡単にチェック（軽量な処理）
  // JWTは3つの部分（header.payload.signature）に分かれているため、ドットが2つ必要
  const tokenParts = authToken.split(".");
  const isValidJWTFormat =
    tokenParts.length === 3 && tokenParts.every((part) => part.length > 0);

  if (!isValidJWTFormat) {
    // 無効なCookie形式の場合は、Cookieを削除してログインページにリダイレクト
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    // 無効なCookieを削除
    response.cookies.delete("AuthToken");
    return response;
  }

  // 認証済みの場合はそのまま通過
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
