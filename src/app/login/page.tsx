"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { handleLoginSuccess } from "./actions";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  // 既にログインしている場合はリダイレクト
  useEffect(() => {
    if (user) {
      router.push("/projects");
    }
  }, [user, router]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      
      // Firebase AuthenticationでGoogleログイン
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;

      if (!firebaseUser.email) {
        throw new Error("Googleアカウントからメールアドレスを取得できませんでした");
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
        } catch (e) {
          errorData = { error: `HTTP ${cookieResponse.status}: ${cookieResponse.statusText}` };
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

      toast.success("ログインに成功しました");
      // ページをリロードしてFirebase Authの状態を確実に同期
      window.location.href = "/projects";
    } catch (error: any) {
      console.error("Error logging in:", error);
      
      // エラーメッセージを日本語化
      let errorMessage = "ログインに失敗しました。もう一度お試しください。";
      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "ログインがキャンセルされました。";
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "ポップアップがブロックされました。ブラウザの設定を確認してください。";
      } else if (error.code === "auth/account-exists-with-different-credential") {
        errorMessage = "このメールアドレスは既に別の認証方法で登録されています。";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

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
        </div>
      </div>
    </div>
  );
}

