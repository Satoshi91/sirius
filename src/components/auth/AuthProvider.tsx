"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from "react";
import { User as FirebaseUser } from "firebase/auth";
import { onAuthStateChange } from "@/lib/auth/authClient";
import { User } from "@/types";
import { getUserByEmail } from "@/lib/services/userService";

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  user: null,
  loading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [serverAuthInitialized, setServerAuthInitialized] = useState(false);
  const [firebaseAuthInitialized, setFirebaseAuthInitialized] = useState(false);
  const serverAuthInitializedRef = useRef(false);

  // 両方の認証チェックが完了したらloadingをfalseにする
  useEffect(() => {
    if (serverAuthInitialized && firebaseAuthInitialized) {
      setLoading(false);
    }
  }, [serverAuthInitialized, firebaseAuthInitialized]);

  // 初回ロード時にサーバー側の認証状態を確認
  useEffect(() => {
    const checkServerAuth = async () => {
      try {
        const response = await fetch("/api/auth/check");
        const data = await response.json();

        if (data.authenticated && data.user) {
          // サーバー側で認証されている場合、ユーザー情報を設定
          setUser(data.user as User);
        } else {
          // サーバー側で認証されていない場合
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking server auth:", error);
        setUser(null);
      } finally {
        serverAuthInitializedRef.current = true;
        setServerAuthInitialized(true);
      }
    };

    checkServerAuth();
  }, []);

  useEffect(() => {
    // 認証状態の変更を監視（onAuthStateChangeは初期状態も発火する）
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      setFirebaseAuthInitialized(true);

      if (firebaseUser && firebaseUser.email) {
        // Firebase Authのユーザーが存在する場合、Firestoreからユーザープロファイルを取得
        await loadUserProfile(firebaseUser.email);
      } else {
        // ユーザーが存在しない場合
        // サーバー側の認証状態も確認済みの場合のみnullに設定
        if (serverAuthInitializedRef.current) {
          setUser(null);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const loadUserProfile = async (email: string) => {
    try {
      const userProfile = await getUserByEmail(email);
      setUser(userProfile);
    } catch (error) {
      console.error("Error loading user profile:", error);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
