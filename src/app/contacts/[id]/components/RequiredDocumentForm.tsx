"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createRequiredDocumentAction } from "../actions";

interface RequiredDocumentFormProps {
  contactId: string;
  onSuccess: () => void;
}

export default function RequiredDocumentForm({
  contactId,
  onSuccess,
}: RequiredDocumentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    documentName: "",
    source: "",
    assignedTo: "",
    status: "",
    remarks: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // クライアント側バリデーション
    const newErrors: Record<string, string> = {};
    if (!formData.documentName.trim()) {
      newErrors.documentName = "書類名は必須です";
    }
    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    const formDataToSubmit = new FormData();
    formDataToSubmit.append("documentName", formData.documentName);
    formDataToSubmit.append("source", formData.source);
    formDataToSubmit.append("assignedTo", formData.assignedTo);
    formDataToSubmit.append("status", formData.status);
    formDataToSubmit.append("remarks", formData.remarks);

    startTransition(async () => {
      const result = await createRequiredDocumentAction(
        contactId,
        formDataToSubmit
      );
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        // フォームをリセット
        setFormData({
          documentName: "",
          source: "",
          assignedTo: "",
          status: "",
          remarks: "",
        });
        // ページをリロードして新しいデータを表示
        router.refresh();
        // モーダルを閉じる
        onSuccess();
      }
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="documentName"
          className="block text-sm font-medium text-black mb-2"
        >
          書類名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="documentName"
          name="documentName"
          value={formData.documentName}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
          placeholder="例: 永住許可申請書"
        />
        {fieldErrors.documentName && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.documentName}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="source"
          className="block text-sm font-medium text-black mb-2"
        >
          取得元
        </label>
        <input
          type="text"
          id="source"
          name="source"
          value={formData.source}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
          placeholder="例: 当事務所、ご本人"
        />
      </div>

      <div>
        <label
          htmlFor="assignedTo"
          className="block text-sm font-medium text-black mb-2"
        >
          担当
        </label>
        <select
          id="assignedTo"
          name="assignedTo"
          value={formData.assignedTo}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
        >
          <option value="">選択してください</option>
          <option value="Office">当事務所</option>
          <option value="Applicant">ご本人</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="status"
          className="block text-sm font-medium text-black mb-2"
        >
          進捗
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
        >
          <option value="">選択してください</option>
          <option value="準備中">準備中</option>
          <option value="待機中">待機中</option>
          <option value="確認中">確認中</option>
          <option value="完了">完了</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="remarks"
          className="block text-sm font-medium text-black mb-2"
        >
          備考
        </label>
        <textarea
          id="remarks"
          name="remarks"
          value={formData.remarks}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black resize-none"
          placeholder="備考を入力"
        />
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "登録中..." : "登録"}
        </button>
      </div>
    </form>
  );
}
