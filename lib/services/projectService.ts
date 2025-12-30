import { collection, getDocs, query, orderBy, addDoc, Timestamp, getDoc, doc, updateDoc, deleteDoc, where, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";
import { Project, Note } from "@/types";
import { getCustomersByIds, getCustomer } from "./customerService";

// Firestoreから取得したNoteの型（Timestampを含む）
interface FirestoreNote {
  id: string;
  content: string;
  createdAt: Timestamp | Date;
  authorName: string;
}

export async function getProjects(): Promise<Project[]> {
  try {
    const projectsRef = collection(db, "projects");
    const q = query(projectsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const projects = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || '',
        customerId: data.customerId,
        visaType: data.visaType,
        currentVisaType: data.currentVisaType,
        expiryDate: data.expiryDate?.toDate() || null,
        applicationDate: data.applicationDate?.toDate() || null,
        status: data.status || 'pending',
        paymentStatus: data.paymentStatus,
        organizationId: data.organizationId,
        createdBy: data.createdBy,
        notes: data.notes ? (data.notes as FirestoreNote[]).map((n) => ({
          id: n.id,
          content: n.content,
          createdAt: n.createdAt instanceof Timestamp ? n.createdAt.toDate() : (n.createdAt instanceof Date ? n.createdAt : new Date()),
          authorName: n.authorName,
        })) : undefined,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Project;
    });
    
    // 顧客情報を一括取得して結合
    const customerIds = [...new Set(projects.map(p => p.customerId).filter(Boolean))];
    if (customerIds.length > 0) {
      const customers = await getCustomersByIds(customerIds);
      const customerMap = new Map(customers.map(c => [c.id, c]));
      projects.forEach(project => {
        if (project.customerId) {
          project.customer = customerMap.get(project.customerId);
        }
      });
    }
    
    return projects;
  } catch (error) {
    console.error("Error fetching projects:", error);
    // エラー時は空配列を返す（デモでエラーが表示されないように）
    return [];
  }
}

export async function getProject(id: string): Promise<Project | null> {
  try {
    const projectRef = doc(db, "projects", id);
    const projectSnap = await getDoc(projectRef);
    
    if (!projectSnap.exists()) {
      return null;
    }
    
    const data = projectSnap.data();
    const project: Project = {
      id: projectSnap.id,
      title: data.title || '',
      customerId: data.customerId,
      visaType: data.visaType,
      currentVisaType: data.currentVisaType,
      expiryDate: data.expiryDate?.toDate() || null,
      applicationDate: data.applicationDate?.toDate() || null,
      status: data.status || 'pending',
      paymentStatus: data.paymentStatus,
      organizationId: data.organizationId,
      createdBy: data.createdBy,
      notes: data.notes ? (data.notes as FirestoreNote[]).map((n) => {
        let createdAt: Date;
        if (n.createdAt instanceof Date) {
          createdAt = n.createdAt;
        } else if (n.createdAt && typeof n.createdAt === 'object' && 'toDate' in n.createdAt && typeof n.createdAt.toDate === 'function') {
          createdAt = n.createdAt.toDate();
        } else {
          createdAt = new Date();
        }
        return {
          id: n.id,
          content: n.content,
          createdAt,
          authorName: n.authorName,
        };
      }) : undefined,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
    
    // 顧客情報を取得して結合
    if (project.customerId) {
      const customer = await getCustomer(project.customerId);
      project.customer = customer || undefined;
    }
    
    return project;
  } catch (error) {
    console.error("Error fetching project:", error);
    return null;
  }
}

export async function createProject(
  data: Omit<Project, "id" | "createdAt" | "updatedAt" | "customer">
): Promise<string> {
  try {
    const projectsRef = collection(db, "projects");
    const now = Timestamp.now();
    
    const projectData: Record<string, unknown> = {
      title: data.title,
      customerId: data.customerId,
      visaType: data.visaType,
      expiryDate: data.expiryDate ? Timestamp.fromDate(data.expiryDate instanceof Date ? data.expiryDate : data.expiryDate.toDate()) : null,
      status: data.status || 'pending',
      createdAt: now,
      updatedAt: now,
    };
    
    // Only include optional fields if they have values (Firebase rejects undefined)
    if (data.currentVisaType !== undefined && data.currentVisaType !== null) {
      projectData.currentVisaType = data.currentVisaType;
    }
    if (data.applicationDate !== undefined && data.applicationDate !== null) {
      projectData.applicationDate = data.applicationDate instanceof Date 
        ? Timestamp.fromDate(data.applicationDate) 
        : data.applicationDate;
    }
    if (data.organizationId !== undefined && data.organizationId !== null) {
      projectData.organizationId = data.organizationId;
    }
    if (data.createdBy !== undefined && data.createdBy !== null) {
      projectData.createdBy = data.createdBy;
    }
    if (data.paymentStatus !== undefined && data.paymentStatus !== null) {
      projectData.paymentStatus = data.paymentStatus;
    }

    const docRef = await addDoc(projectsRef, projectData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
}

export async function updateProject(
  id: string,
  data: Partial<Omit<Project, "id" | "createdAt" | "customer">>
): Promise<void> {
  try {
    const projectRef = doc(db, "projects", id);
    const now = Timestamp.now();
    
    const updateData: Record<string, unknown> = {
      updatedAt: now,
    };
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.customerId !== undefined) updateData.customerId = data.customerId;
    if (data.visaType !== undefined) updateData.visaType = data.visaType;
    if (data.currentVisaType !== undefined) updateData.currentVisaType = data.currentVisaType || null;
    if (data.expiryDate !== undefined) {
      updateData.expiryDate = data.expiryDate ? Timestamp.fromDate(data.expiryDate instanceof Date ? data.expiryDate : data.expiryDate.toDate()) : null;
    }
    if (data.applicationDate !== undefined) {
      updateData.applicationDate = data.applicationDate 
        ? (data.applicationDate instanceof Date ? Timestamp.fromDate(data.applicationDate) : data.applicationDate)
        : null;
    }
    if (data.status !== undefined) updateData.status = data.status;
    if (data.paymentStatus !== undefined) updateData.paymentStatus = data.paymentStatus;
    
    await updateDoc(projectRef, updateData);
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    const projectRef = doc(db, "projects", id);
    await deleteDoc(projectRef);
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
}

export async function getProjectsByCustomerId(customerId: string): Promise<Project[]> {
  try {
    const projectsRef = collection(db, "projects");
    const q = query(projectsRef, where("customerId", "==", customerId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || '',
        customerId: data.customerId,
        visaType: data.visaType,
        currentVisaType: data.currentVisaType,
        expiryDate: data.expiryDate?.toDate() || null,
        applicationDate: data.applicationDate?.toDate() || null,
        status: data.status || 'pending',
        paymentStatus: data.paymentStatus,
        organizationId: data.organizationId,
        createdBy: data.createdBy,
        notes: data.notes ? (data.notes as FirestoreNote[]).map((n) => ({
          id: n.id,
          content: n.content,
          createdAt: n.createdAt instanceof Timestamp ? n.createdAt.toDate() : (n.createdAt instanceof Date ? n.createdAt : new Date()),
          authorName: n.authorName,
        })) : undefined,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Project;
    });
  } catch (error) {
    console.error("Error fetching projects by customer ID:", error);
    return [];
  }
}

/**
 * 案件にメモを追加する
 * @param projectId 案件ID
 * @param note 追加するメモ
 */
export async function addProjectNote(
  projectId: string,
  note: Omit<Note, "id" | "createdAt">
): Promise<void> {
  try {
    const projectRef = doc(db, "projects", projectId);
    const now = Timestamp.now();
    
    const newNote: Note = {
      id: crypto.randomUUID(),
      content: note.content,
      createdAt: now,
      authorName: note.authorName,
    };
    
    await updateDoc(projectRef, {
      notes: arrayUnion(newNote),
      updatedAt: now,
    });
  } catch (error) {
    console.error("Error adding project note:", error);
    throw error;
  }
}

