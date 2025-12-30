import { collection, getDocs, query, orderBy, Timestamp, getDoc, doc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { User } from "@/types";

/**
 * メールアドレスを正規化（小文字化とトリム）
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * メールアドレスでユーザー情報を取得
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const normalizedEmail = normalizeEmail(email);
    const userRef = doc(db, "users", normalizedEmail);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return null;
    }
    
    const data = userSnap.data();
    return {
      id: userSnap.id,
      email: data.email,
      displayName: data.displayName,
      role: data.role || 'staff',
      isActive: data.isActive !== false, // デフォルトはtrue
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      createdBy: data.createdBy || undefined,
    } as User;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

/**
 * UIDでユーザー情報を取得（後方互換性のため残す）
 * @deprecated メールアドレスベースのgetUserByEmailを使用してください
 */
export async function getUser(uid: string): Promise<User | null> {
  // 後方互換性のため、UIDをメールアドレスとして扱う（既存データ移行用）
  return getUserByEmail(uid);
}

/**
 * ユーザープロファイルを作成（メールアドレスをドキュメントIDとして使用）
 */
export async function createUserProfile(
  email: string,
  data: {
    displayName: string;
    role?: 'admin' | 'staff';
    createdBy?: string;
  }
): Promise<void> {
  try {
    const normalizedEmail = normalizeEmail(email);
    const userRef = doc(db, "users", normalizedEmail);
    const now = Timestamp.now();
    
    const userData: Record<string, unknown> = {
      email: normalizedEmail,
      displayName: data.displayName,
      role: data.role || 'staff',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    
    if (data.createdBy !== undefined && data.createdBy !== null) {
      userData.createdBy = data.createdBy;
    }

    await setDoc(userRef, userData);
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
}

/**
 * ユーザー情報を更新
 */
export async function updateUser(
  email: string,
  data: Partial<Omit<User, "id" | "createdAt">>
): Promise<void> {
  try {
    const normalizedEmail = normalizeEmail(email);
    const userRef = doc(db, "users", normalizedEmail);
    const now = Timestamp.now();
    
    const updateData: Record<string, unknown> = {
      updatedAt: now,
    };
    
    // メールアドレスの更新は許可しない（ドキュメントIDなので）
    if (data.displayName !== undefined) updateData.displayName = data.displayName;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    
    await updateDoc(userRef, updateData);
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

/**
 * 全ユーザー一覧を取得（admin用）
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        displayName: data.displayName,
        role: data.role || 'staff',
        isActive: data.isActive !== false,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        createdBy: data.createdBy || undefined,
      } as User;
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

/**
 * ユーザーを無効化（削除ではなく）
 */
export async function deactivateUser(email: string): Promise<void> {
  try {
    await updateUser(email, { isActive: false });
  } catch (error) {
    console.error("Error deactivating user:", error);
    throw error;
  }
}


