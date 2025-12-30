"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortByChange: (sortBy: string) => void;
}

export default function SearchFilter({
  searchQuery: _searchQuery, // eslint-disable-line @typescript-eslint/no-unused-vars
  onSearchChange: _onSearchChange, // eslint-disable-line @typescript-eslint/no-unused-vars
  sortBy,
  onSortByChange,
}: SearchFilterProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="w-full sm:w-auto min-w-[180px]">
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500">
            <SelectValue placeholder="ソート" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="deadline_asc">期限順（昇順）</SelectItem>
            <SelectItem value="deadline_desc">期限順（降順）</SelectItem>
            <SelectItem value="created_asc">作成日順（昇順）</SelectItem>
            <SelectItem value="created_desc">作成日順（降順）</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

