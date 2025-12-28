export interface Task {
  id: string;
  title: string;
  client: string;
  status?: string;
  description?: string;
  deadline?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

