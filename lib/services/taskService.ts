import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  addDoc, 
  serverTimestamp,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { db } from "../firebase";
import { Task } from "@/types";

/**
 * 指定した案件に関連するタスク一覧を取得する（createdAt順）
 * @param projectId 案件ID
 * @returns タスク一覧
 */
export async function getTasks(projectId: string): Promise<Task[]> {
  try {
    const tasksRef = collection(db, `projects/${projectId}/tasks`);
    const q = query(tasksRef, orderBy("createdAt", "asc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description || undefined,
        assigneeId: data.assigneeId || undefined,
        status: data.status || 'todo',
        priority: data.priority || 'medium',
        dueDate: data.dueDate?.toDate() || undefined,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Task;
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    // エラー時は空配列を返す
    return [];
  }
}

/**
 * タスクを作成する
 * @param projectId 案件ID
 * @param data タスクデータ
 * @returns 作成されたタスクID
 */
export async function createTask(
  projectId: string,
  data: Omit<Task, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const tasksRef = collection(db, `projects/${projectId}/tasks`);
    const now = serverTimestamp();
    
    const taskData = {
      title: data.title,
      description: data.description || null,
      assigneeId: data.assigneeId || null,
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate ? (data.dueDate instanceof Date ? Timestamp.fromDate(data.dueDate) : data.dueDate) : null,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(tasksRef, taskData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
}

/**
 * タスクを更新する
 * @param projectId 案件ID
 * @param taskId タスクID
 * @param data 更新するデータ
 */
export async function updateTask(
  projectId: string,
  taskId: string,
  data: Partial<Omit<Task, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  try {
    const taskRef = doc(db, `projects/${projectId}/tasks/${taskId}`);
    const updateData: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.assigneeId !== undefined) updateData.assigneeId = data.assigneeId || null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate 
        ? (data.dueDate instanceof Date ? Timestamp.fromDate(data.dueDate) : data.dueDate)
        : null;
    }

    await updateDoc(taskRef, updateData);
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
}

/**
 * タスクを削除する
 * @param projectId 案件ID
 * @param taskId タスクID
 */
export async function deleteTask(
  projectId: string,
  taskId: string
): Promise<void> {
  try {
    const taskRef = doc(db, `projects/${projectId}/tasks/${taskId}`);
    await deleteDoc(taskRef);
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
}

