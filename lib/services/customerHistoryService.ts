import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  addDoc, 
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";
import { CustomerActivityLog } from "@/types";

/**
 * 顧客の操作履歴を取得する
 * @param customerId 顧客ID
 * @returns 操作履歴の配列（新しい順）
 */
export async function getCustomerHistory(customerId: string): Promise<CustomerActivityLog[]> {
  try {
    const logsRef = collection(db, `customers/${customerId}/history`);
    const q = query(logsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        customerId: customerId,
        actionType: data.actionType,
        description: data.description,
        details: data.details || {},
        performedBy: data.performedBy,
        performedByName: data.performedByName || undefined,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as CustomerActivityLog;
    });
  } catch (error) {
    console.error("Error fetching customer history:", error);
    return [];
  }
}

/**
 * 操作履歴を記録する
 * @param customerId 顧客ID
 * @param logData 操作履歴データ
 * @returns 作成されたドキュメントID
 */
export async function createCustomerHistory(
  customerId: string,
  logData: Omit<CustomerActivityLog, "id" | "customerId" | "createdAt">
): Promise<string> {
  try {
    const logsRef = collection(db, `customers/${customerId}/history`);
    const now = serverTimestamp();
    
    const historyData = {
      customerId: customerId,
      actionType: logData.actionType,
      description: logData.description,
      details: logData.details || {},
      performedBy: logData.performedBy,
      performedByName: logData.performedByName || null,
      createdAt: now,
    };

    const docRef = await addDoc(logsRef, historyData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating customer history:", error);
    throw error;
  }
}

