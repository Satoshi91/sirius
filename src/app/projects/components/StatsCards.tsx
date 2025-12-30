"use client";

import { Project } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { Timestamp } from "firebase/firestore";

interface StatsCardsProps {
  projects: Project[];
}

export default function StatsCards({ projects }: StatsCardsProps) {
  const now = new Date();
  const sevenDaysLater = new Date(now);
  sevenDaysLater.setDate(now.getDate() + 7);

  // 期限間近: 7日以内に期限が来る案件
  const nearDeadlineCount = projects.filter((project) => {
    if (!project.customer?.expiryDate) return false;
    const expiryDate = project.customer.expiryDate instanceof Date 
      ? project.customer.expiryDate 
      : (project.customer.expiryDate as Timestamp).toDate();
    return expiryDate >= now && expiryDate <= sevenDaysLater;
  }).length;

  // 申請中: ステータスが'active'の案件
  const inProgressCount = projects.filter(
    (project) => project.status === "active"
  ).length;

  // 完了: ステータスが'completed'の案件
  const completedCount = projects.filter(
    (project) => project.status === "completed"
  ).length;

  return (
    <div className="flex flex-col gap-4">
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-900">
            期限間近
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-700">{nearDeadlineCount}</div>
          <p className="text-xs text-blue-600 mt-1">7日以内に期限が来る案件</p>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-900">
            申請中
          </CardTitle>
          <Clock className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-700">{inProgressCount}</div>
          <p className="text-xs text-blue-600 mt-1">現在申請中の案件</p>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-900">
            完了
          </CardTitle>
          <CheckCircle2 className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-700">{completedCount}</div>
          <p className="text-xs text-blue-600 mt-1">完了した案件</p>
        </CardContent>
      </Card>
    </div>
  );
}

