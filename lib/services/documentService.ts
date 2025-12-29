import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  addDoc, 
  serverTimestamp,
  Timestamp,
  writeBatch,
  doc,
  updateDoc
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import { ProjectDocument } from "@/types";
import { mockDocuments } from "../mockData";

/**
 * 案件に関連する書類をCloud Storageにアップロードし、Firestoreにメタデータを保存する
 * @param projectId 案件ID
 * @param file アップロードするファイル
 * @returns 作成されたドキュメントID
 */
export async function uploadDocument(
  projectId: string,
  file: File
): Promise<string> {
  try {
    // UUIDを生成してファイル名を作成
    const uuid = crypto.randomUUID();
    const fileExtension = file.name.split('.').pop() || '';
    const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    const fileName = `${fileNameWithoutExt}_${uuid}.${fileExtension}`;
    const storagePath = `projects/${projectId}/documents/${fileName}`;
    
    // Cloud Storageにアップロード
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file);
    
    // ダウンロードURLを取得
    const fileUrl = await getDownloadURL(storageRef);
    
    // Firestoreのサブコレクションにメタデータを保存
    const documentsRef = collection(db, `projects/${projectId}/documents`);
    const now = serverTimestamp();
    
    const documentData = {
      projectId: projectId,
      name: file.name, // 元のファイル名
      category: 'other' as const,
      source: 'applicant' as const,
      assignedTo: 'applicant' as const,
      status: 'collected' as const,
      isRequiredOriginal: false,
      fileUrl: fileUrl,
      storagePath: storagePath,
      createdAt: now,
    };

    const docRef = await addDoc(documentsRef, documentData);
    return docRef.id;
  } catch (error) {
    console.error("Error uploading document:", error);
    throw error;
  }
}

/**
 * 既存の書類にファイルをアップロードする
 * @param projectId 案件ID
 * @param documentId 書類ID
 * @param file アップロードするファイル
 */
export async function uploadFileToDocument(
  projectId: string,
  documentId: string,
  file: File
): Promise<void> {
  try {
    // UUIDを生成してファイル名を作成
    const uuid = crypto.randomUUID();
    const fileExtension = file.name.split('.').pop() || '';
    const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    const fileName = `${fileNameWithoutExt}_${uuid}.${fileExtension}`;
    const storagePath = `projects/${projectId}/documents/${fileName}`;
    
    // Cloud Storageにアップロード
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file);
    
    // ダウンロードURLを取得
    const fileUrl = await getDownloadURL(storageRef);
    
    // Firestoreの既存書類を更新
    const docRef = doc(db, `projects/${projectId}/documents/${documentId}`);
    await updateDoc(docRef, {
      fileUrl: fileUrl,
      storagePath: storagePath,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error uploading file to document:", error);
    throw error;
  }
}

/**
 * 指定した案件に関連する書類一覧を取得する（createdAt順）
 * @param projectId 案件ID
 * @returns 書類一覧
 */
export async function getDocuments(projectId: string): Promise<ProjectDocument[]> {
  // モックデータから該当プロジェクトIDの書類を検索（デバッグ用）
  // const projectDocuments = mockDocuments
  //   .filter(doc => doc.projectId === projectId)
  //   .sort((a, b) => {
  //     const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
  //     const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
  //     return aTime - bTime;
  //   });
  // return projectDocuments;

  try {
    const documentsRef = collection(db, `projects/${projectId}/documents`);
    const q = query(documentsRef, orderBy("createdAt", "asc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        projectId: projectId,
        name: data.name,
        description: data.description,
        category: data.category || 'other',
        source: data.source || 'applicant',
        assignedTo: data.assignedTo || 'applicant',
        year: data.year,
        era: data.era,
        eraYear: data.eraYear,
        period: data.period,
        status: data.status || 'not_started',
        isRequiredOriginal: data.isRequiredOriginal ?? false,
        dependsOn: data.dependsOn,
        canCreateAfter: data.canCreateAfter,
        instructions: data.instructions,
        requirements: data.requirements,
        notes: data.notes,
        fileUrl: data.fileUrl || undefined,
        storagePath: data.storagePath || undefined,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
      } as ProjectDocument;
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    // エラー時は空配列を返す（デモでエラーが表示されないように）
    return [];
  }
}

/**
 * 書類を作成する（ファイルなし）
 * @param projectId 案件ID
 * @param data 書類データ
 * @returns 作成されたドキュメントID
 */
export async function createDocument(
  projectId: string,
  data: Omit<ProjectDocument, "id" | "createdAt" | "updatedAt" | "fileUrl" | "storagePath">
): Promise<string> {
  // TODO: Firebase接続時にコメントアウトを外してモックデータ部分をコメントアウトする
  // モックデータに追加（デバッグ用）
  const newId = `mock-doc-${Date.now()}`;
  const newDocument: ProjectDocument = {
    id: newId,
    projectId: projectId,
    name: data.name,
    description: data.description,
    category: data.category,
    source: data.source,
    assignedTo: data.assignedTo,
    year: data.year,
    era: data.era,
    eraYear: data.eraYear,
    period: data.period,
    status: data.status,
    isRequiredOriginal: data.isRequiredOriginal,
    dependsOn: data.dependsOn,
    canCreateAfter: data.canCreateAfter,
    instructions: data.instructions,
    requirements: data.requirements,
    notes: data.notes,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockDocuments.push(newDocument);
  return newId;

  /* Firebase接続時は以下のコードを有効化
  try {
    const documentsRef = collection(db, `projects/${projectId}/documents`);
    const now = serverTimestamp();
    
    const documentData = {
      projectId: projectId,
      name: data.name,
      description: data.description || null,
      category: data.category,
      source: data.source,
      assignedTo: data.assignedTo,
      year: data.year || null,
      era: data.era || null,
      eraYear: data.eraYear || null,
      period: data.period || null,
      status: data.status,
      isRequiredOriginal: data.isRequiredOriginal,
      dependsOn: data.dependsOn || null,
      canCreateAfter: data.canCreateAfter || null,
      instructions: data.instructions || null,
      requirements: data.requirements || null,
      notes: data.notes || null,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(documentsRef, documentData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating document:", error);
    throw error;
  }
  */
}

/**
 * 複数の書類を一括作成する（ファイルなし）
 * @param projectId 案件ID
 * @param documents 書類データの配列
 * @returns 作成されたドキュメントIDの配列
 */
export async function bulkCreateDocuments(
  projectId: string,
  documents: Omit<ProjectDocument, "id" | "createdAt" | "updatedAt" | "fileUrl" | "storagePath">[]
): Promise<string[]> {
  // TODO: Firebase接続時にコメントアウトを外してモックデータ部分をコメントアウトする
  // モックデータに追加（デバッグ用）
  const createdIds: string[] = [];
  const now = new Date();
  
  documents.forEach((data) => {
    const newId = `mock-doc-${Date.now()}-${Math.random()}`;
    const newDocument: ProjectDocument = {
      id: newId,
      projectId: projectId,
      name: data.name,
      description: data.description,
      category: data.category,
      source: data.source,
      assignedTo: data.assignedTo,
      year: data.year,
      era: data.era,
      eraYear: data.eraYear,
      period: data.period,
      status: data.status,
      isRequiredOriginal: data.isRequiredOriginal,
      dependsOn: data.dependsOn,
      canCreateAfter: data.canCreateAfter,
      instructions: data.instructions,
      requirements: data.requirements,
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    };
    mockDocuments.push(newDocument);
    createdIds.push(newId);
  });
  
  return createdIds;

  /* Firebase接続時は以下のコードを有効化
  try {
    const documentsRef = collection(db, `projects/${projectId}/documents`);
    const batch = writeBatch(db);
    const now = serverTimestamp();
    const createdIds: string[] = [];

    documents.forEach((data) => {
      const docRef = doc(documentsRef);
      createdIds.push(docRef.id);
      
      const documentData = {
        projectId: projectId,
        name: data.name,
        description: data.description || null,
        category: data.category,
        source: data.source,
        assignedTo: data.assignedTo,
        year: data.year || null,
        era: data.era || null,
        eraYear: data.eraYear || null,
        period: data.period || null,
        status: data.status,
        isRequiredOriginal: data.isRequiredOriginal,
        dependsOn: data.dependsOn || null,
        canCreateAfter: data.canCreateAfter || null,
        instructions: data.instructions || null,
        requirements: data.requirements || null,
        notes: data.notes || null,
        createdAt: now,
        updatedAt: now,
      };

      batch.set(docRef, documentData);
    });

    await batch.commit();
    return createdIds;
  } catch (error) {
    console.error("Error bulk creating documents:", error);
    throw error;
  }
  */
}

