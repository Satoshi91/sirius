import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, Timestamp, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Project, Customer } from "../src/types";

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
function toTimestamp(date: Date | Timestamp | null | undefined): Timestamp | null {
  if (!date) return null;
  if (date instanceof Timestamp) return date;
  return Timestamp.fromDate(date instanceof Date ? date : new Date(date));
}

// 古い形式のcategoryを新しい形式に変換（未使用のためコメントアウト）
// function convertCategory(oldCategory: string | ProjectDocument["category"]): ProjectDocument["category"] {
//   if (typeof oldCategory !== "string") {
//     return oldCategory;
//   }
//   
//   const categoryMap: Record<string, ProjectDocument["category"]> = {
//     "本人書類": "personal",
//     "勤務先書類": "employer",
//     "作成書類": "office",
//     "公的機関書類": "government",
//   };
//   
//   return categoryMap[oldCategory] || "other";
// }

// 古い形式のstatusを新しい形式に変換（未使用のため削除）

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

// シード用の顧客データ（seedFirebase.ts専用）
const seedCustomersData: Omit<Customer, "id" | "createdAt" | "updatedAt">[] = [
  { name: { last: { en: "Tanaka", ja: "田中", kana: "タナカ" }, first: { en: "Taro", ja: "太郎", kana: "タロウ" } }, nationality: "日本" },
  { name: { last: { en: "Smith", ja: "", kana: "" }, first: { en: "John", ja: "", kana: "" } }, nationality: "アメリカ" },
  { name: { last: { en: "Sato", ja: "佐藤", kana: "サトウ" }, first: { en: "Hanako", ja: "花子", kana: "ハナコ" } }, nationality: "日本" },
  { name: { last: { en: "Li", ja: "李", kana: "" }, first: { en: "Xiaoming", ja: "小明", kana: "" } }, nationality: "中国" },
  { name: { last: { en: "Park", ja: "", kana: "" }, first: { en: "Min-ji", ja: "", kana: "" } }, nationality: "韓国" },
  { name: { last: { en: "Yamada", ja: "山田", kana: "ヤマダ" }, first: { en: "Jiro", ja: "次郎", kana: "ジロウ" } }, nationality: "日本" },
  { name: { last: { en: "Nguyen", ja: "", kana: "" }, first: { en: "Van A", ja: "", kana: "" } }, nationality: "ベトナム" },
  { name: { last: { en: "Garcia", ja: "", kana: "" }, first: { en: "Maria", ja: "", kana: "" } }, nationality: "フィリピン" },
  { name: { last: { en: "Patel", ja: "", kana: "" }, first: { en: "Raj", ja: "", kana: "" } }, nationality: "インド" },
  { name: { last: { en: "Suthipong", ja: "", kana: "" }, first: { en: "Somchai", ja: "", kana: "" } }, nationality: "タイ" },
  { name: { last: { en: "Widodo", ja: "", kana: "" }, first: { en: "Budi", ja: "", kana: "" } }, nationality: "インドネシア" },
  { name: { last: { en: "Chen", ja: "陳", kana: "" }, first: { en: "Wei", ja: "偉", kana: "" } }, nationality: "中国" },
  { name: { last: { en: "Kim", ja: "", kana: "" }, first: { en: "Soo-jin", ja: "", kana: "" } }, nationality: "韓国" },
  { name: { last: { en: "Williams", ja: "", kana: "" }, first: { en: "David", ja: "", kana: "" } }, nationality: "アメリカ" },
  { name: { last: { en: "Tran", ja: "", kana: "" }, first: { en: "Thi B", ja: "", kana: "" } }, nationality: "ベトナム" },
];

// シード用の案件データ（seedFirebase.ts専用）
const seedProjectsData: Omit<Project, "id" | "createdAt" | "updatedAt">[] = [
  { title: "技術・人文知識・国際業務の申請", customerId: "", visaType: "技術・人文知識・国際業務", currentVisaType: "技術・人文知識・国際業務", expiryDate: null, status: "pending" },
  { title: "経営・管理ビザの申請", customerId: "", visaType: "経営・管理", currentVisaType: "技術・人文知識・国際業務", expiryDate: null, status: "active" },
  { title: "永住許可の申請", customerId: "", visaType: "永住許可", currentVisaType: "技術・人文知識・国際業務", expiryDate: null, status: "pending" },
  { title: "留学ビザの申請", customerId: "", visaType: "留学", currentVisaType: "短期滞在", expiryDate: null, status: "pending" },
  { title: "高度専門職ビザの申請", customerId: "", visaType: "高度専門職", currentVisaType: "技術・人文知識・国際業務", expiryDate: null, status: "active" },
  { title: "家族滞在ビザの申請", customerId: "", visaType: "家族滞在", currentVisaType: "短期滞在", expiryDate: null, status: "completed" },
  { title: "技能実習ビザの申請", customerId: "", visaType: "技能実習", currentVisaType: "短期滞在", expiryDate: null, status: "pending" },
  { title: "定住者ビザの申請", customerId: "", visaType: "定住者", currentVisaType: "家族滞在", expiryDate: null, status: "active" },
  { title: "技術・人文知識・国際業務の申請", customerId: "", visaType: "技術・人文知識・国際業務", currentVisaType: "留学", expiryDate: null, status: "pending" },
  { title: "日本人の配偶者等ビザの申請", customerId: "", visaType: "日本人の配偶者等", currentVisaType: "短期滞在", expiryDate: null, status: "active" },
  { title: "永住者の配偶者等ビザの申請", customerId: "", visaType: "永住者の配偶者等", currentVisaType: "定住者", expiryDate: null, status: "completed" },
  { title: "特定活動ビザの申請", customerId: "", visaType: "特定活動", currentVisaType: "技術・人文知識・国際業務", expiryDate: null, status: "pending" },
  { title: "技術・人文知識・国際業務の申請", customerId: "", visaType: "技術・人文知識・国際業務", currentVisaType: "留学", expiryDate: null, status: "active" },
  { title: "経営・管理ビザの申請", customerId: "", visaType: "経営・管理", currentVisaType: "技術・人文知識・国際業務", expiryDate: null, status: "completed" },
  { title: "定住者ビザの申請", customerId: "", visaType: "定住者", currentVisaType: "技能実習", expiryDate: null, status: "completed" },
];

// 顧客データを投入
async function seedCustomers(): Promise<Record<number, string>> {
  console.log("顧客データを投入中...");
  
  const customerIdMap: Record<number, string> = {}; // インデックス -> 顧客ID のマッピング
  
  try {
    for (let i = 0; i < seedCustomersData.length; i++) {
      const customer = seedCustomersData[i];
      const now = Timestamp.now();
      
      const customerData = {
        name: customer.name,
        nationality: customer.nationality,
        birthday: customer.birthday ? toTimestamp(customer.birthday) : null,
        gender: customer.gender || null,
        residenceCardNumber: customer.residenceCardNumber || null,
        email: customer.email || null,
        phone: customer.phone || null,
        address: customer.address || null,
        notes: customer.notes || null,
        createdAt: now,
        updatedAt: now,
      };
      
      const docRef = await addDoc(collection(db, "customers"), customerData);
      customerIdMap[i] = docRef.id;
      console.log(`  顧客を追加: ${customer.name} (${docRef.id})`);
    }
    
    console.log(`✅ ${seedCustomersData.length}件の顧客を投入しました`);
    return customerIdMap;
  } catch (error) {
    console.error("顧客データの投入中にエラーが発生しました:", error);
    throw error;
  }
}

// 案件データを投入
async function seedProjects(customerIdMap: Record<number, string>): Promise<Record<number, string>> {
  console.log("案件データを投入中...");
  
  const projectIdMap: Record<number, string> = {}; // インデックス -> 新ID のマッピング
  
  try {
    for (let i = 0; i < seedProjectsData.length; i++) {
      const project = seedProjectsData[i];
      const customerId = customerIdMap[i] || customerIdMap[0]; // 対応する顧客ID、なければ最初の顧客
      
      const projectData = {
        title: project.title,
        customerId: customerId,
        visaType: project.visaType,
        currentVisaType: project.currentVisaType || null,
        expiryDate: toTimestamp(project.expiryDate),
        status: project.status,
        organizationId: project.organizationId || null,
        createdBy: project.createdBy || null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      const docRef = await addDoc(collection(db, "projects"), projectData);
      projectIdMap[i] = docRef.id;
      console.log(`  案件を追加: ${project.title} (${docRef.id})`);
    }
    
    console.log(`✅ ${seedProjectsData.length}件の案件を投入しました`);
    return projectIdMap;
  } catch (error) {
    console.error("案件データの投入中にエラーが発生しました:", error);
    throw error;
  }
}

// 書類データを投入（オプション - 必要に応じて追加）
async function seedDocuments(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _projectIdMap: Record<number, string>
) {
  console.log("書類データを投入中...");
  
  // 必要に応じて書類データを追加できます
  // 現時点では空の実装
  
  console.log("✅ 書類データの投入をスキップしました（必要に応じて実装してください）");
}

// メイン処理
async function main() {
  const shouldClear = process.argv.includes("--clear");
  
  try {
    console.log("🚀 Firebaseシード処理を開始します...");
    
    if (shouldClear) {
      await clearExistingData();
    }
    
    // 顧客データを投入
    const customerIdMap = await seedCustomers();
    
    // 案件データを投入
    const projectIdMap = await seedProjects(customerIdMap);
    
    // 書類データを投入
    await seedDocuments(projectIdMap);
    
    console.log("✅ シード処理が完了しました");
    process.exit(0);
  } catch (error) {
    console.error("❌ シード処理でエラーが発生しました:", error);
    process.exit(1);
  }
}

main();

