"use client";

import { ProjectActivityLog } from "@/types";
import { Timestamp } from "firebase/firestore";

interface ActivityLogListProps {
  logs: ProjectActivityLog[];
}

export default function ActivityLogList({ logs }: ActivityLogListProps) {
  const formatDate = (date: Date | Timestamp): string => {
    const dateObj = date instanceof Date ? date : date.toDate();
    return dateObj.toLocaleString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionIcon = (actionType: ProjectActivityLog["actionType"]): string => {
    switch (actionType) {
      case "project_created":
        return "📝";
      case "project_updated":
        return "✏️";
      case "project_deleted":
        return "🗑️";
      case "document_created":
      case "documents_bulk_created":
        return "📄";
      case "document_updated":
        return "📝";
      case "document_deleted":
      case "documents_bulk_deleted":
        return "🗑️";
      case "document_file_uploaded":
        return "📎";
      default:
        return "⚙️";
    }
  };

  if (logs.length === 0) {
    return (
      <div className="border border-zinc-200 rounded-lg p-8 text-center text-gray-700">
        操作履歴がありません
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <div
          key={log.id}
          className="border border-zinc-200 rounded-lg p-4 hover:bg-zinc-50 transition-colors"
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl">{getActionIcon(log.actionType)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-gray-900">
                  {log.description}
                </p>
                <p className="text-xs text-gray-500 ml-4 whitespace-nowrap">
                  {formatDate(log.createdAt)}
                </p>
              </div>
              {log.performedByName && (
                <p className="text-xs text-gray-600 mb-2">
                  実行者: {log.performedByName}
                </p>
              )}
              {log.details && Object.keys(log.details).length > 0 && (
                <div className="mt-2 text-xs text-gray-600 space-y-1">
                  {/* 案件更新時の変更内容を表示 */}
                  {log.details.title && (
                    <div>
                      <span className="font-medium">案件名:</span>{" "}
                      {log.details.title.oldValue && (
                        <span className="line-through text-red-500">
                          {String(log.details.title.oldValue)}
                        </span>
                      )}{" "}
                      {log.details.title.newValue && (
                        <span className="text-green-600">
                          → {String(log.details.title.newValue)}
                        </span>
                      )}
                    </div>
                  )}
                  {log.details.name && (
                    <div>
                      <span className="font-medium">氏名:</span>{" "}
                      {log.details.name.oldValue && (
                        <span className="line-through text-red-500">
                          {String(log.details.name.oldValue)}
                        </span>
                      )}{" "}
                      {log.details.name.newValue && (
                        <span className="text-green-600">
                          → {String(log.details.name.newValue)}
                        </span>
                      )}
                    </div>
                  )}
                  {log.details.nationality && (
                    <div>
                      <span className="font-medium">国籍:</span>{" "}
                      {log.details.nationality.oldValue && (
                        <span className="line-through text-red-500">
                          {String(log.details.nationality.oldValue)}
                        </span>
                      )}{" "}
                      {log.details.nationality.newValue && (
                        <span className="text-green-600">
                          → {String(log.details.nationality.newValue)}
                        </span>
                      )}
                    </div>
                  )}
                  {log.details.visaType && (
                    <div>
                      <span className="font-medium">申請予定の資格:</span>{" "}
                      {log.details.visaType.oldValue && (
                        <span className="line-through text-red-500">
                          {String(log.details.visaType.oldValue)}
                        </span>
                      )}{" "}
                      {log.details.visaType.newValue && (
                        <span className="text-green-600">
                          → {String(log.details.visaType.newValue)}
                        </span>
                      )}
                    </div>
                  )}
                  {log.details.expiryDate && (
                    <div>
                      <span className="font-medium">在留期限:</span>{" "}
                      {log.details.expiryDate.oldValue && (
                        <span className="line-through text-red-500">
                          {String(log.details.expiryDate.oldValue)}
                        </span>
                      )}{" "}
                      {log.details.expiryDate.newValue && (
                        <span className="text-green-600">
                          → {String(log.details.expiryDate.newValue)}
                        </span>
                      )}
                    </div>
                  )}
                  {log.details.status && (
                    <div>
                      <span className="font-medium">ステータス:</span>{" "}
                      {log.details.status.oldValue && (
                        <span className="line-through text-red-500">
                          {String(log.details.status.oldValue)}
                        </span>
                      )}{" "}
                      {log.details.status.newValue && (
                        <span className="text-green-600">
                          → {String(log.details.status.newValue)}
                        </span>
                      )}
                    </div>
                  )}
                  {/* 書類関連の詳細 */}
                  {log.details.documentName && (
                    <div>
                      書類: <span className="font-medium">{log.details.documentName}</span>
                    </div>
                  )}
                  {log.details.fileName && (
                    <div>
                      ファイル: <span className="font-medium">{log.details.fileName}</span>
                    </div>
                  )}
                  {log.details.count !== undefined && (
                    <div>
                      件数: <span className="font-medium">{log.details.count}件</span>
                    </div>
                  )}
                  {log.details.documentNames && log.details.documentNames.length > 0 && (
                    <div>
                      削除した書類: <span className="font-medium">{log.details.documentNames.join("、")}</span>
                      {log.details.count && log.details.count > log.details.documentNames.length && (
                        <span> 他{log.details.count - log.details.documentNames.length}件</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

