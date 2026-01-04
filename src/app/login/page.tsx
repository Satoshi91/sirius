"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithCustomToken,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { handleLoginSuccess, handleGuestLogin } from "./actions";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // 既にログインしている場合はリダイレクト
  // 認証状態の読み込みが完了してからリダイレクトを実行（無限ループを防ぐため）
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/projects");
    }
  }, [user, authLoading, router]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();

      // Firebase AuthenticationでGoogleログイン
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;

      if (!firebaseUser.email) {
        throw new Error(
          "Googleアカウントからメールアドレスを取得できませんでした"
        );
      }

      // IDトークンを取得
      const idToken = await firebaseUser.getIdToken();

      if (!idToken) {
        throw new Error("IDトークンの取得に失敗しました");
      }

      // next-firebase-auth-edgeのAPIエンドポイントにIDトークンを送信してCookieを設定
      const cookieResponse = await fetch("/api/auth/set-cookies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      if (!cookieResponse.ok) {
        let errorData;
        try {
          errorData = await cookieResponse.json();
        } catch {
          errorData = {
            error: `HTTP ${cookieResponse.status}: ${cookieResponse.statusText}`,
          };
        }
        console.error("Cookie setting error:", errorData);
        throw new Error(errorData.error || "認証Cookieの設定に失敗しました");
      }

      // サーバーアクションでログイン処理（Firestoreチェック含む）
      const result = await handleLoginSuccess(
        firebaseUser.email,
        firebaseUser.displayName || undefined
      );

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // カスタムクレームが設定された可能性があるため、IDトークンを再取得
      // これにより、Storage Rulesでrequest.auth.token.emailにアクセスできるようになります
      await firebaseUser.getIdToken(true);

      toast.success("ログインに成功しました");
      // ページをリロードしてFirebase Authの状態を確実に同期
      window.location.href = "/projects";
    } catch (error: unknown) {
      console.error("Error logging in:", error);

      // エラーメッセージを日本語化
      let errorMessage = "ログインに失敗しました。もう一度お試しください。";
      const firebaseError = error as { code?: string; message?: string };
      if (firebaseError.code === "auth/popup-closed-by-user") {
        errorMessage = "ログインがキャンセルされました。";
      } else if (firebaseError.code === "auth/popup-blocked") {
        errorMessage =
          "ポップアップがブロックされました。ブラウザの設定を確認してください。";
      } else if (
        firebaseError.code === "auth/account-exists-with-different-credential"
      ) {
        errorMessage =
          "このメールアドレスは既に別の認証方法で登録されています。";
      } else if (firebaseError.message) {
        errorMessage = firebaseError.message;
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      // サーバーアクションでゲストログイン処理（カスタムトークン生成）
      const result = await handleGuestLogin();

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      if (!result.customToken) {
        throw new Error("カスタムトークンの取得に失敗しました");
      }

      // Firebase Authenticationでカスタムトークンを使用してログイン
      const userCredential = await signInWithCustomToken(
        auth,
        result.customToken
      );
      const firebaseUser = userCredential.user;

      if (!firebaseUser.email) {
        throw new Error(
          "ゲストユーザーからメールアドレスを取得できませんでした"
        );
      }

      // IDトークンを取得
      const idToken = await firebaseUser.getIdToken();

      if (!idToken) {
        throw new Error("IDトークンの取得に失敗しました");
      }

      // next-firebase-auth-edgeのAPIエンドポイントにIDトークンを送信してCookieを設定
      const cookieResponse = await fetch("/api/auth/set-cookies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      if (!cookieResponse.ok) {
        let errorData;
        try {
          errorData = await cookieResponse.json();
        } catch {
          errorData = {
            error: `HTTP ${cookieResponse.status}: ${cookieResponse.statusText}`,
          };
        }
        console.error("Cookie setting error:", errorData);
        throw new Error(errorData.error || "認証Cookieの設定に失敗しました");
      }

      // サーバーアクションでログイン処理（Firestoreチェック含む）
      const loginResult = await handleLoginSuccess(
        firebaseUser.email,
        firebaseUser.displayName || undefined
      );

      if (loginResult.error) {
        setError(loginResult.error);
        setLoading(false);
        return;
      }

      // カスタムクレームが設定された可能性があるため、IDトークンを再取得
      // これにより、Storage Rulesでrequest.auth.token.emailにアクセスできるようになります
      await firebaseUser.getIdToken(true);

      toast.success("ゲストログインに成功しました");
      // ページをリロードしてFirebase Authの状態を確実に同期
      window.location.href = "/projects";
    } catch (error: unknown) {
      console.error("Error logging in as guest:", error);

      // エラーメッセージを日本語化
      let errorMessage =
        "ゲストログインに失敗しました。もう一度お試しください。";
      const firebaseError = error as { message?: string };
      if (firebaseError.message) {
        errorMessage = firebaseError.message;
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  // 開発環境かどうかを判定（クライアント側）
  const isDevelopment = process.env.NODE_ENV !== "production";

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-black">
          案件管理システム
        </h1>
        <h2 className="text-xl font-semibold text-center mb-8 text-zinc-700">
          ログイン
        </h2>

        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            {loading ? "ログイン中..." : "Googleでログイン"}
          </Button>

          {isDevelopment && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-zinc-500">または</span>
                </div>
              </div>

              <Button
                onClick={handleGuestSignIn}
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                {loading ? "ログイン中..." : "ゲストログイン（開発用）"}
              </Button>

              <p className="text-xs text-zinc-500 text-center">
                ゲストログインは開発環境でのみ利用可能です
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
