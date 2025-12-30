"use client";

import { Project, PROJECT_STATUS_LABELS, PROJECT_STATUS_OPTIONS } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertCircle, FileText, Trash2 } from "lucide-react";
import { getDisplayName, getFullNameEn } from "@/lib/utils/customerName";
import { Timestamp } from "firebase/firestore";
import PaymentStatusToggle from "./PaymentStatusToggle";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteProjectAction } from "../[id]/actions";

interface ImmigrationCaseTableProps {
  projects: Project[];
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  visaTypeFilter: string;
  onVisaTypeFilterChange: (visaType: string) => void;
  visaTypes: string[];
}

export default function ImmigrationCaseTable({
  projects,
  statusFilter,
  onStatusFilterChange,
  visaTypeFilter,
  onVisaTypeFilterChange,
  visaTypes,
}: ImmigrationCaseTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isDevelopment = process.env.NODE_ENV === "development";
  
  const now = new Date();
  const sevenDaysLater = new Date(now);
  sevenDaysLater.setDate(now.getDate() + 7);

  const handleDelete = (projectId: string) => {
    if (!isDevelopment) return;
    
    startTransition(async () => {
      const result = await deleteProjectAction(projectId);
      if (result?.error) {
        console.error("削除エラー:", result.error);
        alert(result.error);
      } else if (result?.success) {
        router.refresh();
      }
    });
  };

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
            <TableHead>依頼者名</TableHead>
            <TableHead className="w-[100px]">国籍</TableHead>
            <TableHead className="w-[150px]">
              <div className="flex flex-col gap-2">
                <span>申請在留資格</span>
                <Select value={visaTypeFilter} onValueChange={onVisaTypeFilterChange}>
                  <SelectTrigger className="h-8 text-xs border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="全て" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全て</SelectItem>
                    {visaTypes.map((visaType) => (
                      <SelectItem key={visaType} value={visaType}>
                        {visaType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TableHead>
            <TableHead className="w-[120px]">
              <div className="flex flex-col gap-2">
                <span>進捗ステータス</span>
                <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                  <SelectTrigger className="h-8 text-xs border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="全て" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全て</SelectItem>
                    {PROJECT_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TableHead>
            <TableHead className="w-[120px]">入金ステータス</TableHead>
            <TableHead className="w-[100px] text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => {
            const expiryDate = project.customer?.expiryDate;
            const deadlineNear = isDeadlineNear(expiryDate);
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
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/projects/${project.id}`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <FileText className="h-3 w-3" />
                        詳細
                      </Button>
                    </Link>
                    {isDevelopment && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleDelete(project.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-3 w-3" />
                        削除
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

