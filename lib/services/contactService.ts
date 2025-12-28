import { collection, getDocs, query, orderBy, addDoc, Timestamp, getDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { Contact } from "../types/contact";

export async function getContacts(): Promise<Contact[]> {
  try {
    const contactsRef = collection(db, "contacts");
    const q = query(contactsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      deadline: doc.data().deadline?.toDate() || null,
    })) as Contact[];
  } catch (error) {
    console.error("Error fetching contacts:", error);
    throw error;
  }
}

export async function getContact(id: string): Promise<Contact | null> {
  try {
    const contactRef = doc(db, "contacts", id);
    const contactSnap = await getDoc(contactRef);
    
    if (!contactSnap.exists()) {
      return null;
    }
    
    const data = contactSnap.data();
    return {
      id: contactSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      deadline: data.deadline?.toDate() || null,
    } as Contact;
  } catch (error) {
    console.error("Error fetching contact:", error);
    throw error;
  }
}

export async function createContact(
  data: Omit<Contact, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const contactsRef = collection(db, "contacts");
    const now = Timestamp.now();
    
    const contactData = {
      title: data.title,
      client: data.client,
      status: data.status || null,
      description: data.description || null,
      deadline: data.deadline ? Timestamp.fromDate(new Date(data.deadline)) : null,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(contactsRef, contactData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating contact:", error);
    throw error;
  }
}
