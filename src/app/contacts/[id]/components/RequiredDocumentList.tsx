"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FaTrash } from "react-icons/fa";
import Modal from "@/components/Modal";
import RequiredDocumentForm from "./RequiredDocumentForm";
import { RequiredDocument } from "@/lib/types/requiredDocument";
import { deleteRequiredDocumentAction } from "../actions";

interface RequiredDocumentListProps {
  contactId: string;
  requiredDocuments: RequiredDocument[];
}

export default function RequiredDocumentList({
  contactId,
  requiredDocuments,
}: RequiredDocumentListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = (id: string, documentName: string) => {
    if (confirm(`書類「${documentName}」を削除しますか？`)) {
      startTransition(async () => {
        const result = await deleteRequiredDocumentAction(id);
        if (result?.error) {
          alert(result.error);
        } else if (result?.success) {
          router.refresh();
        }
      });
    }
  };

  return (
    <>
      <div className="bg-white border border-zinc-200 rounded-lg p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-black">必要書類一覧</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium text-sm"
          >
            新規
          </button>
        </div>
        {requiredDocuments.length === 0 ? (
          <p className="text-zinc-600 text-sm">必要書類が登録されていません</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700">
                    書類名
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700">
                    取得元
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700">
                    担当
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700">
                    進捗
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700">
                    備考
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700">
                  </th>
                </tr>
              </thead>
              <tbody>
                {requiredDocuments.map((requiredDocument) => (
                  <tr
                    key={requiredDocument.id}
                    className="border-b border-zinc-100 hover:bg-zinc-50"
                  >
                    <td className="py-3 px-4 text-sm text-black">
                      {requiredDocument.documentName}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {requiredDocument.source || "-"}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {requiredDocument.assignedTo === "Office"
                        ? "当事務所"
                        : requiredDocument.assignedTo === "Applicant"
                        ? "ご本人"
                        : "-"}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {requiredDocument.status && (
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            requiredDocument.status === "完了"
                              ? "bg-green-100 text-green-800"
                              : requiredDocument.status === "確認中"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-zinc-100 text-zinc-800"
                          }`}
                        >
                          {requiredDocument.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {requiredDocument.remarks || "-"}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <button
                        onClick={() => handleDelete(requiredDocument.id, requiredDocument.documentName)}
                        disabled={isPending}
                        className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="削除"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="必要書類の新規登録"
      >
        <RequiredDocumentForm
          contactId={contactId}
          onSuccess={() => setIsModalOpen(false)}
        />
      </Modal>
    </>
  );
}
