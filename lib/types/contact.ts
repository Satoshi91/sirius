export interface Contact {
  id: string;
  title: string;
  client: string;
  applicant?: string; // 申請人
  residenceStatus?: string; // 在留資格
  status?: string;
  description?: string;
  deadline?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
