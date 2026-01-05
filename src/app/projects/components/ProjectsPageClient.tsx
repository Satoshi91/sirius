"use client";

import { useState, useMemo, useLayoutEffect, useRef } from "react";
import { Project } from "@/types";
import ImmigrationCaseTable from "./ImmigrationCaseTable";
import { Button } from "@/components/ui/button";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

interface ProjectsPageClientProps {
  projects: Project[];
}

const ITEMS_PER_PAGE = 10;

export default function ProjectsPageClient({
  projects,
}: ProjectsPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [visaTypeFilter, setVisaTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // 在留資格の一覧を取得（重複を除去）
  const visaTypes = useMemo(() => {
    const types = new Set(
      projects.map((p) => p.visaType).filter((v): v is string => Boolean(v))
    );
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
        const nameJa =
          customer.name.last.ja && customer.name.first.ja
            ? `${customer.name.last.ja} ${customer.name.first.ja}`.toLowerCase()
            : "";
        const nameEn =
          customer.name.last.en && customer.name.first.en
            ? `${customer.name.last.en} ${customer.name.first.en}`.toLowerCase()
            : "";
        const nameMatch = nameJa.includes(query) || nameEn.includes(query);
        const nationalityMatch = customer.nationality
          ?.toLowerCase()
          .includes(query);

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

  // ページネーション計算
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const prevTotalPagesRef = useRef(totalPages);

  // 現在のページが総ページ数を超えている場合は1ページ目にリセット
  // useLayoutEffectを使用してDOM更新前に同期
  useLayoutEffect(() => {
    if (
      currentPage > totalPages &&
      totalPages > 0 &&
      prevTotalPagesRef.current !== totalPages
    ) {
      setCurrentPage(1);
    }
    prevTotalPagesRef.current = totalPages;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProjects = useMemo(() => {
    return filteredProjects.slice(startIndex, endIndex);
  }, [filteredProjects, startIndex, endIndex]);

  // フィルタ変更時にページをリセットするハンドラ
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleVisaTypeFilterChange = (visaType: string) => {
    setVisaTypeFilter(visaType);
    setCurrentPage(1);
  };

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
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
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
      <div className="rounded-md border border-blue-200 bg-white">
        <ImmigrationCaseTable
          projects={paginatedProjects}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          visaTypeFilter={visaTypeFilter}
          onVisaTypeFilterChange={handleVisaTypeFilterChange}
          visaTypes={visaTypes}
        />
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-blue-200">
            <div className="text-sm text-gray-700">
              {startIndex + 1} - {Math.min(endIndex, filteredProjects.length)} /{" "}
              {filteredProjects.length} 件
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                前へ
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // 最初のページ、最後のページ、現在のページの前後1ページを表示
                    if (page === 1 || page === totalPages) return true;
                    if (Math.abs(page - currentPage) <= 1) return true;
                    return false;
                  })
                  .map((page, index, array) => {
                    // 連続していないページの間に「...」を挿入
                    const showEllipsis =
                      index > 0 && page - array[index - 1] > 1;
                    return (
                      <div key={page} className="flex items-center gap-1">
                        {showEllipsis && (
                          <span className="px-2 text-gray-500">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={
                            currentPage === page
                              ? "bg-blue-600 hover:bg-blue-700"
                              : ""
                          }
                        >
                          {page}
                        </Button>
                      </div>
                    );
                  })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                次へ
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
