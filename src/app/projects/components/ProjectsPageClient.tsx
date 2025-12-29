"use client";

import { useState, useMemo } from "react";
import { Project } from "@/types";
import { Timestamp } from "firebase/firestore";
import StatsCards from "./StatsCards";
import SearchFilter from "./SearchFilter";
import ImmigrationCaseTable from "./ImmigrationCaseTable";

interface ProjectsPageClientProps {
  projects: Project[];
}

export default function ProjectsPageClient({
  projects,
}: ProjectsPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [visaTypeFilter, setVisaTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updated_desc");

  // 在留資格の一覧を取得（重複を除去）
  const visaTypes = useMemo(() => {
    const types = new Set(projects.map((p) => p.visaType).filter(Boolean));
    return Array.from(types).sort();
  }, [projects]);

  // 検索・フィルタ・ソートを組み合わせて適用
  const filteredAndSortedProjects = useMemo(() => {
    let result = [...projects];

    // 1. 検索クエリでフィルタリング（依頼者名と国籍で検索）
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((project) => {
        const nameMatch = project.name?.toLowerCase().includes(query);
        const nameEnglishMatch = project.nameEnglish?.toLowerCase().includes(query);
        const nationalityMatch = project.nationality?.toLowerCase().includes(query);
        
        return nameMatch || nameEnglishMatch || nationalityMatch;
      });
    }

    // 2. ステータスでフィルタリング
    if (statusFilter !== "all") {
      result = result.filter((project) => project.status === statusFilter);
    }

    // 3. 在留資格でフィルタリング
    if (visaTypeFilter !== "all") {
      result = result.filter((project) => project.visaType === visaTypeFilter);
    }

    // 4. ソート
    const [sortField, sortOrder] = sortBy.split("_");
    result.sort((a, b) => {
      let aValue: Date | number | null = null;
      let bValue: Date | number | null = null;

      if (sortField === "deadline") {
        aValue = a.expiryDate
          ? a.expiryDate instanceof Date
            ? a.expiryDate
            : (a.expiryDate as Timestamp).toDate()
          : null;
        bValue = b.expiryDate
          ? b.expiryDate instanceof Date
            ? b.expiryDate
            : (b.expiryDate as Timestamp).toDate()
          : null;
        
        // nullは最後に配置
        if (aValue === null && bValue === null) return 0;
        if (aValue === null && bValue !== null) return 1;
        if (aValue !== null && bValue === null) return -1;
        
        const aTime = (aValue as Date).getTime();
        const bTime = (bValue as Date).getTime();
        return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
      } else if (sortField === "updated") {
        aValue = a.updatedAt instanceof Date
          ? a.updatedAt
          : (a.updatedAt as Timestamp).toDate();
        bValue = b.updatedAt instanceof Date
          ? b.updatedAt
          : (b.updatedAt as Timestamp).toDate();
        
        const aTime = (aValue as Date).getTime();
        const bTime = (bValue as Date).getTime();
        return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
      } else if (sortField === "created") {
        aValue = a.createdAt instanceof Date
          ? a.createdAt
          : (a.createdAt as Timestamp).toDate();
        bValue = b.createdAt instanceof Date
          ? b.createdAt
          : (b.createdAt as Timestamp).toDate();
        
        const aTime = (aValue as Date).getTime();
        const bTime = (bValue as Date).getTime();
        return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
      }

      return 0;
    });

    return result;
  }, [projects, searchQuery, statusFilter, visaTypeFilter, sortBy]);

  return (
    <div className="space-y-6">
      <StatsCards projects={projects} />
      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        visaTypeFilter={visaTypeFilter}
        onVisaTypeFilterChange={setVisaTypeFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        visaTypes={visaTypes}
      />
      <ImmigrationCaseTable projects={filteredAndSortedProjects} />
    </div>
  );
}

