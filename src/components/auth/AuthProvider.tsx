"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
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

  useEffect(() => {
    // 認証状態の変更を監視（onAuthStateChangeは初期状態も発火する）
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser && firebaseUser.email) {
        // Firebase Authのユーザーが存在する場合、Firestoreからユーザープロファイルを取得
        await loadUserProfile(firebaseUser.email);
      } else {
        // ユーザーが存在しない場合
        setUser(null);
        setLoading(false);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

