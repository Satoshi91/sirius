"use client";

import { useState, useMemo } from "react";
import { Project } from "@/types";
import ImmigrationCaseTable from "./ImmigrationCaseTable";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

interface ProjectsPageClientProps {
  projects: Project[];
}

export default function ProjectsPageClient({
  projects,
}: ProjectsPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [visaTypeFilter, setVisaTypeFilter] = useState("all");

  // 在留資格の一覧を取得（重複を除去）
  const visaTypes = useMemo(() => {
    const types = new Set(projects.map((p) => p.visaType).filter(Boolean));
    return Array.from(types).sort();
  }, [projects]);

  // 検索・フィルタを組み合わせて適用
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // 1. 検索クエリでフィルタリング（依頼者名と国籍で検索）
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((project) => {
        if (!project.customer) return false;
        const customer = project.customer;
        const nameJa = customer.name.last.ja && customer.name.first.ja 
          ? `${customer.name.last.ja} ${customer.name.first.ja}`.toLowerCase()
          : "";
        const nameEn = customer.name.last.en && customer.name.first.en
          ? `${customer.name.last.en} ${customer.name.first.en}`.toLowerCase()
          : "";
        const nameMatch = nameJa.includes(query) || nameEn.includes(query);
        const nationalityMatch = customer.nationality?.toLowerCase().includes(query);
        
        return nameMatch || nationalityMatch;
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

    return result;
  }, [projects, searchQuery, statusFilter, visaTypeFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold text-blue-900 whitespace-nowrap">
          案件管理
        </h1>
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="依頼者名や国籍で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full border-blue-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <Link href="/projects/new" className="ml-auto">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap">
            <Plus className="h-4 w-4 mr-2" />
            新規登録
          </Button>
        </Link>
      </div>
      <ImmigrationCaseTable 
        projects={filteredProjects}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        visaTypeFilter={visaTypeFilter}
        onVisaTypeFilterChange={setVisaTypeFilter}
        visaTypes={visaTypes}
      />
    </div>
  );
}

