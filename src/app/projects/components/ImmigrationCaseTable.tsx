"use client";

import { Project, PROJECT_STATUS_LABELS } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertCircle, Eye } from "lucide-react";
import { getDisplayName, getFullNameEn } from "@/lib/utils/customerName";
import { Timestamp } from "firebase/firestore";
import PaymentStatusToggle from "./PaymentStatusToggle";

interface ImmigrationCaseTableProps {
  projects: Project[];
}

export default function ImmigrationCaseTable({
  projects,
}: ImmigrationCaseTableProps) {
  const now = new Date();
  const sevenDaysLater = new Date(now);
  sevenDaysLater.setDate(now.getDate() + 7);

  const formatShortDate = (date: Date | Timestamp | null | undefined): string => {
    if (!date) return "-";
    const dateObj = date instanceof Date ? date : (date as Timestamp).toDate();
    return dateObj.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };

  const isDeadlineNear = (expiryDate: Date | Timestamp | null | undefined): boolean => {
    if (!expiryDate) return false;
    const expiryDateObj = expiryDate instanceof Date ? expiryDate : (expiryDate as Timestamp).toDate();
    const expiry = expiryDateObj;
    return expiry >= now && expiry <= sevenDaysLater;
  };

  const getStatusBadgeVariant = (status: 'active' | 'pending' | 'completed') => {
    if (status === "completed") return "default";
    if (status === "active") return "secondary";
    return "outline";
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">案件がありません</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-blue-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-blue-50">
            <TableHead className="w-[120px]">期限</TableHead>
            <TableHead>案件名</TableHead>
            <TableHead>依頼者名</TableHead>
            <TableHead className="w-[100px]">国籍</TableHead>
            <TableHead className="w-[150px]">ビザの種類</TableHead>
            <TableHead className="w-[120px]">進捗ステータス</TableHead>
            <TableHead className="w-[120px]">入金ステータス</TableHead>
            <TableHead className="w-[150px]">最終更新日</TableHead>
            <TableHead className="w-[100px] text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => {
            const expiryDate = project.expiryDate;
            const deadlineNear = isDeadlineNear(expiryDate);
            const updatedAt = project.updatedAt instanceof Date 
              ? project.updatedAt 
              : (project.updatedAt as Timestamp).toDate();
            return (
              <TableRow
                key={project.id}
                className="hover:bg-blue-50/50 transition-colors"
              >
                <TableCell>
                  {expiryDate ? (
                    <div className="flex items-center gap-2">
                      {deadlineNear && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span
                        className={deadlineNear ? "text-red-600 font-semibold" : "text-gray-700"}
                      >
                        {formatShortDate(expiryDate)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-700">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium text-black">
                    {project.title}
                  </div>
                </TableCell>
                <TableCell>
                  {project.customer ? (
                    <div>
                      <div className="font-medium text-black">
                        {getDisplayName(project.customer)}
                      </div>
                      {getFullNameEn(project.customer) && (
                        <div className="text-sm text-black">
                          {getFullNameEn(project.customer)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-700">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {project.customer?.nationality ? (
                    <Badge variant="outline" className="bg-blue-50 border-blue-200 text-gray-700">
                      {project.customer.nationality}
                    </Badge>
                  ) : (
                    <span className="text-gray-700">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {project.visaType ? (
                    <span className="text-gray-700">{project.visaType}</span>
                  ) : (
                    <span className="text-gray-700">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={getStatusBadgeVariant(project.status)}
                    className={getStatusBadgeVariant(project.status) === "outline" ? "text-gray-700" : ""}
                  >
                    {PROJECT_STATUS_LABELS[project.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <PaymentStatusToggle project={project} />
                </TableCell>
                <TableCell className="text-gray-700">
                  {formatShortDate(updatedAt)}
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/projects/${project.id}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="h-3 w-3" />
                      詳細
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

