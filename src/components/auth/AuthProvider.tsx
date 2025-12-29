"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { onAuthStateChange, getCurrentFirebaseUser } from "@/lib/auth/authClient";
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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3d25e911-5548-4daa-8038-5ea7ce13809a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/components/auth/AuthProvider.tsx:61',message:'loadUserProfile start',data:{email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    try {
      const userProfile = await getUserByEmail(email);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3d25e911-5548-4daa-8038-5ea7ce13809a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/components/auth/AuthProvider.tsx:63',message:'getUserByEmail success',data:{email,hasUserProfile:!!userProfile,userId:userProfile?.id||null,userDisplayName:userProfile?.displayName||null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      setUser(userProfile);
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3d25e911-5548-4daa-8038-5ea7ce13809a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/components/auth/AuthProvider.tsx:65',message:'getUserByEmail error',data:{email,errorName:error instanceof Error?error.name:'unknown',errorMessage:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      console.error("Error loading user profile:", error);
      setUser(null);
    } finally {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3d25e911-5548-4daa-8038-5ea7ce13809a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/components/auth/AuthProvider.tsx:69',message:'loadUserProfile finally, setting loading false',data:{email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

