"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DocumentMasterItem } from "@/lib/masters/documentMaster";
import { ProjectDocument } from "@/types";

interface DocumentMasterSelectorProps {
  masterList: DocumentMasterItem[];
  existingDocuments: ProjectDocument[];
  selectedMasterIds: Set<string>;
  onSelectionChange: (selectedIds: Set<string>) => void;
}

export default function DocumentMasterSelector({
  masterList,
  existingDocuments,
  selectedMasterIds,
  onSelectionChange,
}: DocumentMasterSelectorProps) {
  // 既存書類のmasterDocumentIdをセットに変換（マッチング用）
  const existingMasterIds = useMemo(() => {
    return new Set(
      existingDocuments
        .map((doc) => doc.masterDocumentId)
        .filter((id): id is string => !!id)
    );
  }, [existingDocuments]);

  // カテゴリー名を取得する関数
  const getCategoryName = (category: DocumentMasterItem["category"]): string => {
    const categoryMap: Record<DocumentMasterItem["category"], string> = {
      'personal': '本人書類',
      'employer': '勤務先書類',
      'office': '当事務所作成書類',
      'government': '公的機関書類',
      'other': 'その他',
    };
    return categoryMap[category];
  };

  // カテゴリー別にグループ化してソート
  const sortedDocuments = useMemo(() => {
    const categoryOrder = ['本人書類', '勤務先書類', '当事務所作成書類', '公的機関書類', 'その他'];
    const categoryMap: Record<string, DocumentMasterItem[]> = {
      '本人書類': [],
      '勤務先書類': [],
      '当事務所作成書類': [],
      '公的機関書類': [],
      'その他': [],
    };

    masterList.forEach((item) => {
      const categoryName = getCategoryName(item.category);
      if (categoryName in categoryMap) {
        categoryMap[categoryName].push(item);
      } else {
        categoryMap['その他'].push(item);
      }
    });

    // カテゴリー順に並べた配列を作成
    const result: Array<{ category: string; item: DocumentMasterItem }> = [];
    categoryOrder.forEach((category) => {
      categoryMap[category].forEach((item) => {
        result.push({ category, item });
      });
    });

    return result;
  }, [masterList]);

  // カテゴリー別の選択数を計算
  const categoryCounts = useMemo(() => {
    const counts: Record<string, { total: number; selected: number }> = {
      '本人書類': { total: 0, selected: 0 },
      '勤務先書類': { total: 0, selected: 0 },
      '当事務所作成書類': { total: 0, selected: 0 },
      '公的機関書類': { total: 0, selected: 0 },
      'その他': { total: 0, selected: 0 },
    };

    sortedDocuments.forEach(({ category, item }) => {
      counts[category].total++;
      if (selectedMasterIds.has(item.id)) {
        counts[category].selected++;
      }
    });

    return counts;
  }, [sortedDocuments, selectedMasterIds]);

  const handleCheckboxChange = (masterId: string, checked: boolean) => {
    const newSelected = new Set(selectedMasterIds);
    if (checked) {
      newSelected.add(masterId);
    } else {
      newSelected.delete(masterId);
    }
    onSelectionChange(newSelected);
  };

  const handleSelectAll = () => {
    const allIds = new Set(masterList.map((item) => item.id));
    onSelectionChange(allIds);
  };

  const handleDeselectAll = () => {
    onSelectionChange(new Set());
  };

  const selectedCount = selectedMasterIds.size;
  const totalCount = masterList.length;

  // 前の行のカテゴリーを追跡して、カテゴリーヘッダーを表示するか判断
  let prevCategory = "";

  return (
    <div className="space-y-4">
      {/* 全選択/全解除ボタン */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          選択中: {selectedCount} / {totalCount} 件
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            全選択
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={handleDeselectAll}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            全解除
          </button>
        </div>
      </div>

      <Separator />

      {/* 表形式の書類リスト */}
      <div className="border border-zinc-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <input
                  type="checkbox"
                  checked={selectedCount === totalCount && totalCount > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleSelectAll();
                    } else {
                      handleDeselectAll();
                    }
                  }}
                  className="w-4 h-4 text-black border-zinc-300 rounded focus:ring-2 focus:ring-black"
                />
              </TableHead>
              <TableHead className="w-[120px]">カテゴリー</TableHead>
              <TableHead>書類名</TableHead>
              <TableHead className="w-[200px]">説明</TableHead>
              <TableHead className="w-[150px]">ステータス</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedDocuments.map(({ category, item }) => {
              const isChecked = selectedMasterIds.has(item.id);
              const isExisting = existingMasterIds.has(item.id);
              const showCategoryHeader = prevCategory !== category;
              if (showCategoryHeader) {
                prevCategory = category;
              }

              return (
                <TableRow key={item.id} className="hover:bg-zinc-50">
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => handleCheckboxChange(item.id, e.target.checked)}
                      className="w-4 h-4 text-black border-zinc-300 rounded focus:ring-2 focus:ring-black"
                    />
                  </TableCell>
                  <TableCell>
                    {showCategoryHeader ? (
                      <div>
                        <div className="font-semibold text-gray-900">{category}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {categoryCounts[category].selected} / {categoryCounts[category].total}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">└</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900">{item.name}</div>
                  </TableCell>
                  <TableCell>
                    {item.description && (
                      <div className="text-sm text-gray-600">{item.description}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {isExisting && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          既存
                        </Badge>
                      )}
                      {item.isRequiredOriginal && (
                        <Badge variant="destructive" className="text-xs">
                          原本必要
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

