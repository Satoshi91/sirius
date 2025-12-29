"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  visaTypeFilter: string;
  onVisaTypeFilterChange: (visaType: string) => void;
  sortBy: string;
  onSortByChange: (sortBy: string) => void;
  visaTypes: string[];
}

export default function SearchFilter({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  visaTypeFilter,
  onVisaTypeFilterChange,
  sortBy,
  onSortByChange,
  visaTypes,
}: SearchFilterProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="依頼者名や国籍で検索..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 w-full max-w-md border-blue-200 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div className="flex flex-wrap gap-4">
        <div className="w-full sm:w-auto min-w-[180px]">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="ステータス" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全て</SelectItem>
              <SelectItem value="pending">準備中</SelectItem>
              <SelectItem value="active">申請中</SelectItem>
              <SelectItem value="completed">完了</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-auto min-w-[200px]">
          <Select value={visaTypeFilter} onValueChange={onVisaTypeFilterChange}>
            <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="在留資格" />
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
        <div className="w-full sm:w-auto min-w-[180px]">
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="ソート" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="deadline_asc">期限順（昇順）</SelectItem>
              <SelectItem value="deadline_desc">期限順（降順）</SelectItem>
              <SelectItem value="updated_asc">更新日順（昇順）</SelectItem>
              <SelectItem value="updated_desc">更新日順（降順）</SelectItem>
              <SelectItem value="created_asc">作成日順（昇順）</SelectItem>
              <SelectItem value="created_desc">作成日順（降順）</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

