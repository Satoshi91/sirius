import { Timestamp } from "firebase/firestore";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { Project } from "@/types";
import { getCustomersByIds } from "./customerService";
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
 * 指定期間内の在留期限を持つプロジェクトを取得し、カレンダーイベントを生成する
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
    
    // expiryDateが指定期間内にあるプロジェクトを取得
    const projectsRef = collection(db, "projects");
    const q = query(
      projectsRef,
      where("expiryDate", ">=", startTimestamp),
      where("expiryDate", "<=", endTimestamp)
    );
    
    const querySnapshot = await getDocs(q);
    
    const projects: Project[] = querySnapshot.docs.map((doc) => {
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
        organizationId: data.organizationId,
        createdBy: data.createdBy,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Project;
    });
    
    // expiryDateがnullのプロジェクトを除外
    const validProjects = projects.filter(p => p.expiryDate !== null);
    
    if (validProjects.length === 0) {
      return [];
    }
    
    // 顧客情報を一括取得
    const customerIds = [...new Set(validProjects.map(p => p.customerId).filter(Boolean))];
    const customers = await getCustomersByIds(customerIds);
    const customerMap = new Map(customers.map(c => [c.id, c]));
    
    // カレンダーイベントを生成
    const events: CalendarEvent[] = [];
    
    for (const project of validProjects) {
      if (!project.expiryDate) continue;
      
      const expiryDate = project.expiryDate instanceof Date 
        ? project.expiryDate 
        : (project.expiryDate as Timestamp).toDate();
      
      const customer = customerMap.get(project.customerId);
      const customerName = customer ? (getFullNameJa(customer) || getDisplayName(customer)) : `顧客ID: ${project.customerId}`;
      
      // 期限日イベント（赤色）
      events.push({
        id: `expiry-${project.id}`,
        title: `${customerName} 在留期限`,
        start: expiryDate.toISOString().split('T')[0], // YYYY-MM-DD形式
        color: '#dc2626', // 赤色
        customerId: project.customerId,
        projectId: project.id,
        eventType: 'expiry',
      });
      
      // 準備開始日イベント（青色）- 3ヶ月前
      const preparationDate = subMonths(expiryDate, 3);
      
      // 準備開始日が表示期間内にある場合のみ追加
      if (preparationDate >= startDate && preparationDate <= endDate) {
        events.push({
          id: `preparation-${project.id}`,
          title: `${customerName} 更新準備開始`,
          start: preparationDate.toISOString().split('T')[0], // YYYY-MM-DD形式
          color: '#2563eb', // 青色
          customerId: project.customerId,
          projectId: project.id,
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

