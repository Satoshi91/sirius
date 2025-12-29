import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, Timestamp, getDocs, deleteDoc, doc } from "firebase/firestore";
import { mockProjects, mockDocuments } from "../lib/mockData";
import { Project, ProjectDocument } from "../src/types";

// Firebase設定（環境変数から読み込む、フォールバックとしてlib/firebase.tsの設定を使用）
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCyjOZ0BLsVrq49-O_ihwMq1kO9ZO_Aoeg",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "sirius-cf574.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "sirius-cf574",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "sirius-cf574.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "753671151982",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:753671151982:web:457a1dd3d208b39b1ca17f",
};

// Firebase初期化
if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const db = getFirestore();

// 日付をFirebase Timestampに変換
function toTimestamp(date: Date | null | undefined): Timestamp | null {
  if (!date) return null;
  return Timestamp.fromDate(date instanceof Date ? date : new Date(date));
}

// 古い形式のcategoryを新しい形式に変換
function convertCategory(oldCategory: string | ProjectDocument["category"]): ProjectDocument["category"] {
  if (typeof oldCategory !== "string") {
    return oldCategory;
  }
  
  const categoryMap: Record<string, ProjectDocument["category"]> = {
    "本人書類": "personal",
    "勤務先書類": "employer",
    "作成書類": "office",
    "公的機関書類": "government",
  };
  
  return categoryMap[oldCategory] || "other";
}

// 古い形式のstatusを新しい形式に変換
function convertStatus(oldStatus: string | ProjectDocument["status"]): ProjectDocument["status"] {
  if (typeof oldStatus !== "string") {
    return oldStatus;
  }
  
  const statusMap: Record<string, ProjectDocument["status"]> = {
    "uploaded": "collected",
    "verified": "verified",
    "pending": "not_started",
  };
  
  return statusMap[oldStatus] || (oldStatus as ProjectDocument["status"]);
}

// 既存データをクリア（オプション）
async function clearExistingData() {
  console.log("既存データをクリア中...");
  
  try {
    // すべての案件を取得
    const projectsSnapshot = await getDocs(collection(db, "projects"));
    
    // 各案件の書類サブコレクションを削除
    for (const projectDoc of projectsSnapshot.docs) {
      const documentsRef = collection(db, `projects/${projectDoc.id}/documents`);
      const documentsSnapshot = await getDocs(documentsRef);
      
      for (const docRef of documentsSnapshot.docs) {
        await deleteDoc(doc(db, `projects/${projectDoc.id}/documents/${docRef.id}`));
      }
      
      // 案件を削除
      await deleteDoc(doc(db, `projects/${projectDoc.id}`));
    }
    
    console.log(`既存データをクリアしました（案件: ${projectsSnapshot.docs.length}件）`);
  } catch (error) {
    console.error("既存データのクリア中にエラーが発生しました:", error);
    throw error;
  }
}

// 案件データを投入
async function seedProjects(): Promise<Record<string, string>> {
  console.log("案件データを投入中...");
  
  const projectIdMap: Record<string, string> = {}; // 旧ID -> 新ID のマッピング
  
  try {
    for (const project of mockProjects) {
      const projectData = {
        title: project.title,
        name: project.name,
        nameEnglish: project.nameEnglish || null,
        nationality: project.nationality,
        visaType: project.visaType,
        currentVisaType: project.currentVisaType || null,
        expiryDate: toTimestamp(project.expiryDate),
        status: project.status,
        organizationId: project.organizationId || null,
        createdBy: project.createdBy || null,
        createdAt: toTimestamp(project.createdAt as Date) || Timestamp.now(),
        updatedAt: toTimestamp(project.updatedAt as Date) || Timestamp.now(),
      };
      
      const docRef = await addDoc(collection(db, "projects"), projectData);
      projectIdMap[project.id] = docRef.id;
      console.log(`  案件を追加: ${project.name} (${docRef.id})`);
    }
    
    console.log(`✅ ${mockProjects.length}件の案件を投入しました`);
    return projectIdMap;
  } catch (error) {
    console.error("案件データの投入中にエラーが発生しました:", error);
    throw error;
  }
}

// 書類データを投入
async function seedDocuments(
  projectIdMap: Record<string, string>,
  documentIdMap: Record<string, string>
) {
  console.log("書類データを投入中...");
  
  let successCount = 0;
  let errorCount = 0;
  
  try {
    for (const document of mockDocuments) {
      const newProjectId = projectIdMap[document.projectId];
      if (!newProjectId) {
        console.warn(`  警告: 案件IDが見つかりません: ${document.projectId} (書類: ${document.name})`);
        errorCount++;
        continue;
      }
      
      // 古い形式のデータを新しい形式に変換
      const category = convertCategory(document.category as any);
      const status = convertStatus(document.status as any);
      
      // デフォルト値の設定
      const source = (document as any).source || "applicant";
      const assignedTo = (document as any).assignedTo || "applicant";
      
      // canCreateAfterのIDを新IDに変換
      let canCreateAfter: string[] | null = null;
      if ((document as any).canCreateAfter && Array.isArray((document as any).canCreateAfter)) {
        canCreateAfter = (document as any).canCreateAfter
          .map((oldDocId: string) => documentIdMap[oldDocId])
          .filter((newDocId: string | undefined) => newDocId !== undefined) as string[];
        if (canCreateAfter.length === 0) {
          canCreateAfter = null;
        }
      }
      
      const documentData: any = {
        projectId: newProjectId,
        name: document.name,
        description: (document as any).description || null,
        category: category,
        source: source,
        assignedTo: assignedTo,
        year: (document as any).year || null,
        era: (document as any).era || null,
        eraYear: (document as any).eraYear || null,
        period: (document as any).period || null,
        status: status,
        isRequiredOriginal: (document as any).isRequiredOriginal ?? false,
        dependsOn: (document as any).dependsOn || null,
        canCreateAfter: canCreateAfter,
        instructions: (document as any).instructions || null,
        requirements: (document as any).requirements || null,
        notes: (document as any).notes || null,
        fileUrl: (document as any).fileUrl || null,
        storagePath: (document as any).storagePath || null,
        createdAt: toTimestamp(document.createdAt as Date) || Timestamp.now(),
        updatedAt: (document as any).updatedAt ? toTimestamp((document as any).updatedAt as Date) : null,
      };
      
      const docRef = await addDoc(collection(db, `projects/${newProjectId}/documents`), documentData);
      documentIdMap[document.id] = docRef.id;
      successCount++;
    }
    
    console.log(`✅ ${successCount}件の書類を投入しました`);
    if (errorCount > 0) {
      console.warn(`⚠️  ${errorCount}件の書類の投入に失敗しました`);
    }
  } catch (error) {
    console.error("書類データの投入中にエラーが発生しました:", error);
    throw error;
  }
}

// メイン処理
async function main() {
  const shouldClear = process.argv.includes("--clear");
  
  try {
    console.log("🚀 Firebaseシード処理を開始します...");
    
    if (shouldClear) {
      await clearExistingData();
    }
    
    // 案件データを投入
    const projectIdMap = await seedProjects();
    
    // 書類データを投入（書類IDマッピングも作成）
    const documentIdMap: Record<string, string> = {};
    await seedDocuments(projectIdMap, documentIdMap);
    
    console.log("✅ シード処理が完了しました");
    process.exit(0);
  } catch (error) {
    console.error("❌ シード処理でエラーが発生しました:", error);
    process.exit(1);
  }
}

main();

