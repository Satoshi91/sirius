"use client";

import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProjectDocument } from "@/types";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

interface DocumentBulkEditorProps {
  documents: Omit<ProjectDocument, "id" | "projectId" | "createdAt" | "updatedAt" | "fileUrl" | "storagePath">[];
  onChange: (documents: Omit<ProjectDocument, "id" | "projectId" | "createdAt" | "updatedAt" | "fileUrl" | "storagePath">[]) => void;
}

export default function DocumentBulkEditor({
  documents,
  onChange,
}: DocumentBulkEditorProps) {
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  // カテゴリー別にグループ化
  const groupedDocuments = useMemo(() => {
    const groups: Record<string, { index: number; doc: Omit<ProjectDocument, "id" | "projectId" | "createdAt" | "updatedAt" | "fileUrl" | "storagePath"> }[]> = {
      '本人書類': [],
      '勤務先書類': [],
      '当事務所作成書類': [],
      '公的機関書類': [],
      'その他': [],
    };

    documents.forEach((doc, index) => {
      const categoryName = getCategoryName(doc.category);
      if (categoryName in groups) {
        groups[categoryName].push({ index, doc });
      } else {
        groups['その他'].push({ index, doc });
      }
    });

    return groups;
  }, [documents]);

  const toggleCategory = (category: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(category)) {
      newCollapsed.delete(category);
    } else {
      newCollapsed.add(category);
    }
    setCollapsedCategories(newCollapsed);
  };

  const updateDocument = (index: number, field: keyof Omit<ProjectDocument, "id" | "projectId" | "createdAt" | "updatedAt" | "fileUrl" | "storagePath">, value: any) => {
    const newDocuments = [...documents];
    newDocuments[index] = {
      ...newDocuments[index],
      [field]: value,
    };
    onChange(newDocuments);
  };

  const addDocument = (category: ProjectDocument["category"] = "personal") => {
    const newDocument: Omit<ProjectDocument, "id" | "projectId" | "createdAt" | "updatedAt" | "fileUrl" | "storagePath"> = {
      name: "",
      description: "",
      category,
      source: "applicant",
      assignedTo: "applicant",
      status: "not_started",
      isRequiredOriginal: false,
    };
    onChange([...documents, newDocument]);
  };

  const removeDocument = (index: number) => {
    const newDocuments = documents.filter((_, i) => i !== index);
    onChange(newDocuments);
  };

  return (
    <div className="space-y-6">
      {(['本人書類', '勤務先書類', '当事務所作成書類', '公的機関書類', 'その他'] as const).map((category) => {
        const categoryDocs = groupedDocuments[category];
        const isCollapsed = collapsedCategories.has(category);

        if (categoryDocs.length === 0) {
          return null;
        }

        return (
          <div key={category}>
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => toggleCategory(category)}
                className="flex items-center gap-2 text-lg font-semibold text-black hover:text-gray-700 transition-colors"
              >
                {isCollapsed ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronUp className="h-5 w-5" />
                )}
                {category}
                <Badge variant="outline" className="ml-2">
                  {categoryDocs.length} 件
                </Badge>
              </button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const categoryValue = getCategoryValue(category);
                  addDocument(categoryValue);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                追加
              </Button>
            </div>
            <Separator className="mb-4" />
            {!isCollapsed && (
              <div className="border border-zinc-200 rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">書類名</TableHead>
                      <TableHead className="w-[150px]">説明</TableHead>
                      <TableHead className="w-[120px]">取得元</TableHead>
                      <TableHead className="w-[100px]">担当</TableHead>
                      <TableHead className="w-[120px]">ステータス</TableHead>
                      <TableHead className="w-[100px]">原本必要</TableHead>
                      <TableHead className="w-[80px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryDocs.map(({ index, doc }) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            value={doc.name}
                            onChange={(e) => updateDocument(index, "name", e.target.value)}
                            placeholder="書類名"
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={doc.description || ""}
                            onChange={(e) => updateDocument(index, "description", e.target.value)}
                            placeholder="説明"
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <select
                            value={doc.source}
                            onChange={(e) => updateDocument(index, "source", e.target.value as ProjectDocument["source"])}
                            className="w-full px-2 py-1 border border-zinc-300 rounded-md text-sm"
                          >
                            <option value="office">当事務所</option>
                            <option value="applicant">ご本人</option>
                            <option value="employer">勤務先</option>
                            <option value="government">公的機関</option>
                            <option value="guarantor">身元保証人</option>
                            <option value="other">その他</option>
                          </select>
                        </TableCell>
                        <TableCell>
                          <select
                            value={doc.assignedTo}
                            onChange={(e) => updateDocument(index, "assignedTo", e.target.value as ProjectDocument["assignedTo"])}
                            className="w-full px-2 py-1 border border-zinc-300 rounded-md text-sm"
                          >
                            <option value="office">当事務所</option>
                            <option value="applicant">ご本人</option>
                          </select>
                        </TableCell>
                        <TableCell>
                          <select
                            value={doc.status}
                            onChange={(e) => updateDocument(index, "status", e.target.value as ProjectDocument["status"])}
                            className="w-full px-2 py-1 border border-zinc-300 rounded-md text-sm"
                          >
                            <option value="not_started">未着手</option>
                            <option value="in_progress">進行中</option>
                            <option value="waiting">待機中</option>
                            <option value="collected">回収済み</option>
                            <option value="verified">確認済み</option>
                            <option value="completed">完了</option>
                          </select>
                        </TableCell>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={doc.isRequiredOriginal}
                            onChange={(e) => updateDocument(index, "isRequiredOriginal", e.target.checked)}
                            className="w-4 h-4"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeDocument(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function getCategoryName(category: ProjectDocument["category"]): string {
  const categoryMap: Record<ProjectDocument["category"], string> = {
    'personal': '本人書類',
    'employer': '勤務先書類',
    'office': '当事務所作成書類',
    'government': '公的機関書類',
    'other': 'その他',
  };
  return categoryMap[category];
}

function getCategoryValue(categoryName: string): ProjectDocument["category"] {
  const categoryMap: Record<string, ProjectDocument["category"]> = {
    '本人書類': 'personal',
    '勤務先書類': 'employer',
    '当事務所作成書類': 'office',
    '公的機関書類': 'government',
    'その他': 'other',
  };
  return categoryMap[categoryName] || 'personal';
}

