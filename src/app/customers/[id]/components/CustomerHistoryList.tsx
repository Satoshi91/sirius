"use client";

import { CustomerActivityLog } from "@/types";
import { Timestamp } from "firebase/firestore";
import { FilePlus, Pencil, Trash2, Settings } from "lucide-react";

interface CustomerHistoryListProps {
  logs: CustomerActivityLog[];
}

export default function CustomerHistoryList({ logs }: CustomerHistoryListProps) {
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

  const getActionIcon = (actionType: CustomerActivityLog["actionType"]) => {
    switch (actionType) {
      case "customer_created":
        return <FilePlus className="h-6 w-6 text-blue-600" />;
      case "customer_updated":
        return <Pencil className="h-6 w-6 text-gray-600" />;
      case "customer_deleted":
        return <Trash2 className="h-6 w-6 text-red-600" />;
      default:
        return <Settings className="h-6 w-6 text-gray-400" />;
    }
  };

  if (logs.length === 0) {
    return (
      <div className="border border-zinc-200 rounded-lg p-8 text-center text-gray-700">
        履歴がありません
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
            <div className="flex-shrink-0">{getActionIcon(log.actionType)}</div>
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
                  {/* 氏名の変更を表示 */}
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
                  {/* 国籍の変更を表示 */}
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
                  {/* 生年月日の変更を表示 */}
                  {log.details.birthday && (
                    <div>
                      <span className="font-medium">生年月日:</span>{" "}
                      {log.details.birthday.oldValue && (
                        <span className="line-through text-red-500">
                          {String(log.details.birthday.oldValue)}
                        </span>
                      )}{" "}
                      {log.details.birthday.newValue && (
                        <span className="text-green-600">
                          → {String(log.details.birthday.newValue)}
                        </span>
                      )}
                    </div>
                  )}
                  {/* 性別の変更を表示 */}
                  {log.details.gender && (
                    <div>
                      <span className="font-medium">性別:</span>{" "}
                      {log.details.gender.oldValue && (
                        <span className="line-through text-red-500">
                          {String(log.details.gender.oldValue)}
                        </span>
                      )}{" "}
                      {log.details.gender.newValue && (
                        <span className="text-green-600">
                          → {String(log.details.gender.newValue)}
                        </span>
                      )}
                    </div>
                  )}
                  {/* 在留カード番号の変更を表示 */}
                  {log.details.residenceCardNumber && (
                    <div>
                      <span className="font-medium">在留カード番号:</span>{" "}
                      {log.details.residenceCardNumber.oldValue && (
                        <span className="line-through text-red-500">
                          {String(log.details.residenceCardNumber.oldValue)}
                        </span>
                      )}{" "}
                      {log.details.residenceCardNumber.newValue && (
                        <span className="text-green-600">
                          → {String(log.details.residenceCardNumber.newValue)}
                        </span>
                      )}
                    </div>
                  )}
                  {/* 在留期限の変更を表示 */}
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
                  {/* メールアドレスの変更を表示 */}
                  {log.details.email && (
                    <div>
                      <span className="font-medium">メールアドレス:</span>{" "}
                      {log.details.email.oldValue && (
                        <span className="line-through text-red-500">
                          {String(log.details.email.oldValue)}
                        </span>
                      )}{" "}
                      {log.details.email.newValue && (
                        <span className="text-green-600">
                          → {String(log.details.email.newValue)}
                        </span>
                      )}
                    </div>
                  )}
                  {/* 電話番号の変更を表示 */}
                  {log.details.phone && (
                    <div>
                      <span className="font-medium">電話番号:</span>{" "}
                      {log.details.phone.oldValue && (
                        <span className="line-through text-red-500">
                          {String(log.details.phone.oldValue)}
                        </span>
                      )}{" "}
                      {log.details.phone.newValue && (
                        <span className="text-green-600">
                          → {String(log.details.phone.newValue)}
                        </span>
                      )}
                    </div>
                  )}
                  {/* 住所の変更を表示 */}
                  {log.details.address && (
                    <div>
                      <span className="font-medium">住所:</span>{" "}
                      {log.details.address.oldValue && (
                        <span className="line-through text-red-500">
                          {String(log.details.address.oldValue)}
                        </span>
                      )}{" "}
                      {log.details.address.newValue && (
                        <span className="text-green-600">
                          → {String(log.details.address.newValue)}
                        </span>
                      )}
                    </div>
                  )}
                  {/* 備考の変更を表示 */}
                  {log.details.notes && (
                    <div>
                      <span className="font-medium">備考:</span>{" "}
                      {log.details.notes.oldValue && (
                        <span className="line-through text-red-500">
                          {String(log.details.notes.oldValue)}
                        </span>
                      )}{" "}
                      {log.details.notes.newValue && (
                        <span className="text-green-600">
                          → {String(log.details.notes.newValue)}
                        </span>
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

