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
import { FileText } from "lucide-react";
import { Timestamp } from "firebase/firestore";

interface CustomerProjectsListProps {
  projects: Project[];
}

export default function CustomerProjectsList({
  projects,
}: CustomerProjectsListProps) {
  const formatDate = (date: Date | Timestamp | null | undefined): string => {
    if (!date) return "-";
    const dateObj = date instanceof Date ? date : (date as Timestamp).toDate();
    return dateObj.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };

  const getStatusBadgeVariant = (status: 'active' | 'pending' | 'completed') => {
    if (status === "completed") return "default";
    if (status === "active") return "secondary";
    return "outline";
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">関連する案件がありません</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-blue-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-blue-50">
            <TableHead>案件名</TableHead>
            <TableHead>在留資格</TableHead>
            <TableHead>在留期限</TableHead>
            <TableHead>ステータス</TableHead>
            <TableHead className="w-[100px] text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow
              key={project.id}
              className="hover:bg-blue-50/50 transition-colors"
            >
              <TableCell>
                <div className="font-medium text-black">{project.title}</div>
              </TableCell>
              <TableCell>
                <div className="text-gray-700">{project.visaType}</div>
              </TableCell>
              <TableCell>
                <div className="text-gray-700">{formatDate(project.customer?.expiryDate)}</div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={getStatusBadgeVariant(project.status)}
                  className={getStatusBadgeVariant(project.status) === "outline" ? "text-gray-700" : ""}
                >
                  {PROJECT_STATUS_LABELS[project.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/projects/${project.id}`}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <FileText className="h-3 w-3" />
                    詳細
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

