"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Project } from "@/types";
import { updateProjectAction } from "../actions";

interface ProjectEditFormProps {
  project: Project;
  onSuccess: () => void;
}

export default function ProjectEditForm({
  project,
  onSuccess,
}: ProjectEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  // 日付をYYYY-MM-DD形式に変換
  const formatDateForInput = (date: Date | null | undefined): string => {
    if (!date) return "";
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    name: project.name,
    nationality: project.nationality,
    visaType: project.visaType,
    expiryDate: formatDateForInput(project.expiryDate),
    status: project.status,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // クライアント側バリデーション
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "案件名は必須です";
    }
    if (!formData.nationality.trim()) {
      newErrors.nationality = "国籍は必須です";
    }
    if (!formData.visaType.trim()) {
      newErrors.visaType = "在留資格は必須です";
    }
    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    const formDataToSubmit = new FormData();
    formDataToSubmit.append("name", formData.name);
    formDataToSubmit.append("nationality", formData.nationality);
    formDataToSubmit.append("visaType", formData.visaType);
    formDataToSubmit.append("expiryDate", formData.expiryDate);
    formDataToSubmit.append("status", formData.status);

    startTransition(async () => {
      const result = await updateProjectAction(project.id, formDataToSubmit);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        onSuccess();
        router.refresh();
      }
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // エラーをクリア
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    if (error) {
      setError(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-black mb-2"
        >
          案件名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black ${
            fieldErrors.name
              ? "border-red-500"
              : "border-zinc-200 focus:border-black"
          }`}
          placeholder="案件名を入力"
        />
        {fieldErrors.name && (
          <p className="mt-1 text-sm text-red-500">{fieldErrors.name}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="nationality"
          className="block text-sm font-medium text-black mb-2"
        >
          国籍 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="nationality"
          name="nationality"
          value={formData.nationality}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black ${
            fieldErrors.nationality
              ? "border-red-500"
              : "border-zinc-200 focus:border-black"
          }`}
          placeholder="国籍を入力"
        />
        {fieldErrors.nationality && (
          <p className="mt-1 text-sm text-red-500">{fieldErrors.nationality}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="visaType"
          className="block text-sm font-medium text-black mb-2"
        >
          在留資格 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="visaType"
          name="visaType"
          value={formData.visaType}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black ${
            fieldErrors.visaType
              ? "border-red-500"
              : "border-zinc-200 focus:border-black"
          }`}
          placeholder="在留資格を入力"
        />
        {fieldErrors.visaType && (
          <p className="mt-1 text-sm text-red-500">{fieldErrors.visaType}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="expiryDate"
          className="block text-sm font-medium text-black mb-2"
        >
          有効期限
        </label>
        <input
          type="date"
          id="expiryDate"
          name="expiryDate"
          value={formData.expiryDate}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
        />
      </div>

      <div>
        <label
          htmlFor="status"
          className="block text-sm font-medium text-black mb-2"
        >
          ステータス
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
        >
          <option value="pending">保留中</option>
          <option value="active">進行中</option>
          <option value="completed">完了</option>
        </select>
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
          className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "更新中..." : "更新"}
        </button>
        <button
          type="button"
          onClick={onSuccess}
          disabled={isPending}
          className="px-6 py-3 border border-zinc-200 text-black rounded-lg hover:bg-zinc-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}

