"use server";

import { User } from "@/types";
import { getUserByEmail } from "@/lib/services/userService";
import { getAuthTokens } from "@/auth/config";
import { redirect } from "next/navigation";

/**
 * サーバー側で現在のユーザーを取得
 * next-firebase-auth-edgeのgetTokensを使用してトークンからメールアドレスを取得
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const tokens = await getAuthTokens();
    if (!tokens) {
      console.log("getCurrentUser: No tokens returned from getAuthTokens");
      return null;
    }

    const email = tokens.decodedToken.email;
    if (!email) {
      console.log("getCurrentUser: No email in decoded token");
      return null;
    }

    const user = await getUserByEmail(email);
    if (!user) {
      console.log(`getCurrentUser: No user found for email: ${email}`);
      return null;
    }
    
    if (!user.isActive) {
      console.log(`getCurrentUser: User ${email} is not active`);
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * ユーザーのロールを取得
 */
export async function getUserRole(): Promise<'admin' | 'staff' | null> {
  const user = await getCurrentUser();
  return user?.role || null;
}

/**
 * 認証必須チェック
 * 未認証の場合はログインページにリダイレクト
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (!user.isActive) {
    redirect("/login?error=inactive");
  }
  return user;
}

/**
 * Admin権限チェック
 * Adminでない場合はログインページにリダイレクト
 */
export async function requireAdmin(): Promise<User> {
  const user = await requireAuth();
  if (user.role !== 'admin') {
    redirect("/login?error=admin_required");
  }
  return user;
}

