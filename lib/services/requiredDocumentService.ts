import { collection, getDocs, query, where, addDoc, Timestamp, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { RequiredDocument } from "../types/requiredDocument";

export async function getRequiredDocumentsByContactId(contactId: string): Promise<RequiredDocument[]> {
  try {
    const requiredDocumentsRef = collection(db, "requiredDocuments");
    const q = query(
      requiredDocumentsRef,
      where("contactId", "==", contactId)
    );
    const querySnapshot = await getDocs(q);
    
    const requiredDocuments = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        contactId: data.contactId,
        documentName: data.documentName,
        source: data.source || undefined,
        assignedTo: data.assignedTo || undefined,
        status: data.status || undefined,
        remarks: data.remarks || undefined,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as RequiredDocument;
    });
    
    // 作成日時順にソート
    return requiredDocuments.sort((a, b) => {
      const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
      const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
      return aTime - bTime;
    });
  } catch (error) {
    console.error("Error fetching required documents:", error);
    throw error;
  }
}

export async function createRequiredDocument(
  data: Omit<RequiredDocument, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const requiredDocumentsRef = collection(db, "requiredDocuments");
    const now = Timestamp.now();
    
    const requiredDocumentData = {
      contactId: data.contactId,
      documentName: data.documentName,
      source: data.source || null,
      assignedTo: data.assignedTo || null,
      status: data.status || null,
      remarks: data.remarks || null,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(requiredDocumentsRef, requiredDocumentData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating required document:", error);
    throw error;
  }
}

export async function deleteRequiredDocument(id: string): Promise<void> {
  try {
    const requiredDocumentRef = doc(db, "requiredDocuments", id);
    await deleteDoc(requiredDocumentRef);
  } catch (error) {
    console.error("Error deleting required document:", error);
    throw error;
  }
}
