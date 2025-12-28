import { collection, getDocs, query, orderBy, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { Task } from "../types/task";

export async function getTasks(): Promise<Task[]> {
  try {
    const tasksRef = collection(db, "tasks");
    const q = query(tasksRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      deadline: doc.data().deadline?.toDate() || null,
    })) as Task[];
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
}

export async function createTask(
  data: Omit<Task, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const tasksRef = collection(db, "tasks");
    const now = Timestamp.now();
    
    const taskData = {
      title: data.title,
      client: data.client,
      status: data.status || null,
      description: data.description || null,
      deadline: data.deadline ? Timestamp.fromDate(new Date(data.deadline)) : null,
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

