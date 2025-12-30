import { Timestamp } from "firebase/firestore";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { Customer } from "@/types";
import { getProjectsByCustomerId } from "./projectService";
import { subMonths } from "date-fns";
import { getFullNameJa, getDisplayName } from "@/lib/utils/customerName";

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO date string
  color: string;
  customerId: string;
  projectId: string;
  eventType: 'expiry' | 'preparation';
}

/**
 * 指定期間内の在留期限を持つ顧客を取得し、カレンダーイベントを生成する
 * @param startDate 取得開始日
 * @param endDate 取得終了日
 * @returns カレンダーイベントの配列
 */
export async function getCalendarEvents(
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> {
  try {
    // 準備開始日も含めるため、3ヶ月前まで拡張してクエリ
    const extendedStartDate = subMonths(startDate, 3);
    
    // FirestoreのTimestampに変換
    const startTimestamp = Timestamp.fromDate(extendedStartDate);
    const endTimestamp = Timestamp.fromDate(endDate);
    
    // expiryDateが指定期間内にある顧客を取得
    const customersRef = collection(db, "customers");
    const q = query(
      customersRef,
      where("expiryDate", ">=", startTimestamp),
      where("expiryDate", "<=", endTimestamp),
      orderBy("expiryDate", "asc")
    );
    
    const querySnapshot = await getDocs(q);
    
    const customers: Customer[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || {
          last: { en: "", ja: "", kana: "" },
          first: { en: "", ja: "", kana: "" },
        },
        nationality: data.nationality,
        birthday: data.birthday?.toDate() || null,
        gender: data.gender || null,
        residenceCardNumber: data.residenceCardNumber || null,
        expiryDate: data.expiryDate?.toDate() || null,
        email: data.email,
        phone: data.phone,
        address: data.address,
        notes: data.notes,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Customer;
    });
    
    // expiryDateがnullの顧客を除外
    const validCustomers = customers.filter(c => c.expiryDate !== null);
    
    if (validCustomers.length === 0) {
      return [];
    }
    
    // カレンダーイベントを生成
    const events: CalendarEvent[] = [];
    
    for (const customer of validCustomers) {
      if (!customer.expiryDate) continue;
      
      const expiryDate = customer.expiryDate instanceof Date 
        ? customer.expiryDate 
        : (customer.expiryDate as Timestamp).toDate();
      
      const customerName = getFullNameJa(customer) || getDisplayName(customer);
      
      // 顧客に関連する最新の案件を取得（projectIdが必要なため）
      const projects = await getProjectsByCustomerId(customer.id);
      const latestProject = projects.length > 0 ? projects[0] : null;
      const projectId = latestProject?.id || customer.id;
      
      // 期限日イベント（赤色）
      events.push({
        id: `expiry-${customer.id}`,
        title: `${customerName} 在留期限`,
        start: expiryDate.toISOString().split('T')[0], // YYYY-MM-DD形式
        color: '#dc2626', // 赤色
        customerId: customer.id,
        projectId: projectId,
        eventType: 'expiry',
      });
      
      // 準備開始日イベント（青色）- 3ヶ月前
      const preparationDate = subMonths(expiryDate, 3);
      
      // 準備開始日が表示期間内にある場合のみ追加
      if (preparationDate >= startDate && preparationDate <= endDate) {
        events.push({
          id: `preparation-${customer.id}`,
          title: `${customerName} 更新準備開始`,
          start: preparationDate.toISOString().split('T')[0], // YYYY-MM-DD形式
          color: '#2563eb', // 青色
          customerId: customer.id,
          projectId: projectId,
          eventType: 'preparation',
        });
      }
    }
    
    return events;
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return [];
  }
}

