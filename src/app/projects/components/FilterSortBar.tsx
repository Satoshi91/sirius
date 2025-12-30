"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Project, PROJECT_STATUS_OPTIONS } from "@/types";

interface FilterSortBarProps {
  statusFilter: string;
  visaTypeFilter: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onStatusFilterChange: (value: string) => void;
  onVisaTypeFilterChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onSortOrderChange: (value: "asc" | "desc") => void;
  projects: Project[];
}

export default function FilterSortBar({
  statusFilter,
  visaTypeFilter,
  sortBy,
  sortOrder,
  onStatusFilterChange,
  onVisaTypeFilterChange,
  onSortByChange,
  onSortOrderChange,
  projects,
}: FilterSortBarProps) {
  // ユニークな在留資格のリストを取得
  const uniqueVisaTypes = Array.from(
    new Set(projects.map((p) => p.visaType).filter(Boolean))
  ).sort();

  return (
    <div className="flex flex-wrap gap-4 items-end mb-6 p-4 bg-blue-50/50 rounded-md border border-blue-200">
      <div className="flex-1 min-w-[200px]">
        <label className="text-sm font-medium text-blue-900 mb-2 block">
          ステータス
        </label>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-full border-blue-200 focus:border-blue-500 focus:ring-blue-500">
            <SelectValue placeholder="すべて" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            {PROJECT_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[200px]">
        <label className="text-sm font-medium text-blue-900 mb-2 block">
          在留資格
        </label>
        <Select value={visaTypeFilter} onValueChange={onVisaTypeFilterChange}>
          <SelectTrigger className="w-full border-blue-200 focus:border-blue-500 focus:ring-blue-500">
            <SelectValue placeholder="すべて" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            {uniqueVisaTypes.map((visaType) => (
              <SelectItem key={visaType} value={visaType}>
                {visaType}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[200px]">
        <label className="text-sm font-medium text-blue-900 mb-2 block">
          ソート
        </label>
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="w-full border-blue-200 focus:border-blue-500 focus:ring-blue-500">
            <SelectValue placeholder="ソート順" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="expiryDate">期限順</SelectItem>
            <SelectItem value="updatedAt">更新日順</SelectItem>
            <SelectItem value="createdAt">作成日順</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[150px]">
        <label className="text-sm font-medium text-blue-900 mb-2 block">
          並び順
        </label>
        <Select
          value={sortOrder}
          onValueChange={(value) => onSortOrderChange(value as "asc" | "desc")}
        >
          <SelectTrigger className="w-full border-blue-200 focus:border-blue-500 focus:ring-blue-500">
            <SelectValue placeholder="並び順" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">昇順</SelectItem>
            <SelectItem value="desc">降順</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

