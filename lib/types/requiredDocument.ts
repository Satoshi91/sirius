export interface RequiredDocument {
  id: string;
  contactId: string; // 案件ID
  documentName: string; // 書類名
  source?: string; // 取得元（当事務所、ご本人など）
  assignedTo?: "Office" | "Applicant"; // 担当（当事務所/ご本人）
  status?: "準備中" | "完了" | "待機中" | "確認中"; // 進捗ステータス
  remarks?: string; // 備考
  createdAt: Date;
  updatedAt: Date;
}
