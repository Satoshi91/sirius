import { collection, getDocs, query, orderBy, addDoc, Timestamp, getDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Project } from "@/types";

export async function getProjects(): Promise<Project[]> {
  try {
    const projectsRef = collection(db, "projects");
    const q = query(projectsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        nameEnglish: data.nameEnglish,
        nationality: data.nationality,
        visaType: data.visaType,
        currentVisaType: data.currentVisaType,
        expiryDate: data.expiryDate?.toDate() || null,
        status: data.status || 'pending',
        organizationId: data.organizationId,
        createdBy: data.createdBy,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Project;
    });
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
    return {
      id: projectSnap.id,
      name: data.name,
      nameEnglish: data.nameEnglish,
      nationality: data.nationality,
      visaType: data.visaType,
      currentVisaType: data.currentVisaType,
      expiryDate: data.expiryDate?.toDate() || null,
      status: data.status || 'pending',
      organizationId: data.organizationId,
      createdBy: data.createdBy,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Project;
  } catch (error) {
    console.error("Error fetching project:", error);
    return null;
  }
}

export async function createProject(
  data: Omit<Project, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const projectsRef = collection(db, "projects");
    const now = Timestamp.now();
    
    const projectData: any = {
      name: data.name,
      nationality: data.nationality,
      visaType: data.visaType,
      expiryDate: data.expiryDate ? Timestamp.fromDate(new Date(data.expiryDate)) : null,
      status: data.status || 'pending',
      createdAt: now,
      updatedAt: now,
    };
    
    // Only include optional fields if they have values (Firebase rejects undefined)
    if (data.nameEnglish !== undefined && data.nameEnglish !== null) {
      projectData.nameEnglish = data.nameEnglish;
    }
    if (data.currentVisaType !== undefined && data.currentVisaType !== null) {
      projectData.currentVisaType = data.currentVisaType;
    }
    if (data.organizationId !== undefined && data.organizationId !== null) {
      projectData.organizationId = data.organizationId;
    }
    if (data.createdBy !== undefined && data.createdBy !== null) {
      projectData.createdBy = data.createdBy;
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
  data: Partial<Omit<Project, "id" | "createdAt">>
): Promise<void> {
  try {
    const projectRef = doc(db, "projects", id);
    const now = Timestamp.now();
    
    const updateData: any = {
      updatedAt: now,
    };
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.nameEnglish !== undefined) updateData.nameEnglish = data.nameEnglish || null;
    if (data.nationality !== undefined) updateData.nationality = data.nationality;
    if (data.visaType !== undefined) updateData.visaType = data.visaType;
    if (data.currentVisaType !== undefined) updateData.currentVisaType = data.currentVisaType || null;
    if (data.expiryDate !== undefined) {
      updateData.expiryDate = data.expiryDate ? Timestamp.fromDate(new Date(data.expiryDate)) : null;
    }
    if (data.status !== undefined) updateData.status = data.status;
    
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

