import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  addDoc, 
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { db } from "../firebase";
import { ProjectActivityLog } from "@/types";

/**
 * 案件の操作履歴を取得する
 * @param projectId 案件ID
 * @returns 操作履歴の配列（新しい順）
 */
export async function getActivityLogs(projectId: string): Promise<ProjectActivityLog[]> {
  try {
    const logsRef = collection(db, `projects/${projectId}/activityLogs`);
    const q = query(logsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        projectId: projectId,
        actionType: data.actionType,
        description: data.description,
        details: data.details || {},
        performedBy: data.performedBy,
        performedByName: data.performedByName || undefined,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as ProjectActivityLog;
    });
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return [];
  }
}

/**
 * 操作履歴を記録する
 * @param projectId 案件ID
 * @param logData 操作履歴データ
 * @returns 作成されたドキュメントID
 */
export async function createActivityLog(
  projectId: string,
  logData: Omit<ProjectActivityLog, "id" | "projectId" | "createdAt">
): Promise<string> {
  try {
    const logsRef = collection(db, `projects/${projectId}/activityLogs`);
    const now = serverTimestamp();
    
    const activityLogData = {
      projectId: projectId,
      actionType: logData.actionType,
      description: logData.description,
      details: logData.details || {},
      performedBy: logData.performedBy,
      performedByName: logData.performedByName || null,
      createdAt: now,
    };

    const docRef = await addDoc(logsRef, activityLogData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating activity log:", error);
    throw error;
  }
}


