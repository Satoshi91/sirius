"use client";

import { auth } from "@/lib/firebase";
import { User as FirebaseUser, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { User } from "@/types";
import { getUser } from "@/lib/services/userService";

/**
 * 認証状態の変更を監視
 */
export function onAuthStateChange(
  callback: (user: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * 現在のFirebase Authユーザーを取得
 */
export function getCurrentFirebaseUser(): FirebaseUser | null {
  return auth.currentUser;
}

/**
 * ログアウト
 * next-firebase-auth-edgeがCookieを自動管理するため、Firebase AuthのsignOutのみ実行
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
  // Cookieはnext-firebase-auth-edgeが自動的にクリアする
}

