"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Project, PROJECT_STATUS_OPTIONS } from "@/types";
import { Timestamp } from "firebase/firestore";
import { updateProjectAction } from "../actions";
import CustomerSelector from "./CustomerSelector";

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
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(project.customerId || null);
  
  // 日付をYYYY-MM-DD形式に変換
  const formatDateForInput = (date: Date | Timestamp | null | undefined): string => {
    if (!date) return "";
    const dateObj = date instanceof Timestamp ? date.toDate() : date instanceof Date ? date : new Date(date);
    return dateObj.toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    title: project.title,
    visaType: project.visaType,
    expiryDate: formatDateForInput(project.expiryDate),
    status: project.status,
    paymentStatus: project.paymentStatus || '',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // クライアント側バリデーション
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = "案件名は必須です";
    }
    if (!selectedCustomerId) {
      newErrors.customerId = "顧客は必須です";
    }
    if (!formData.visaType.trim()) {
      newErrors.visaType = "在留資格は必須です";
    }
    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    const formDataToSubmit = new FormData();
    formDataToSubmit.append("title", formData.title);
    formDataToSubmit.append("customerId", selectedCustomerId!);
    formDataToSubmit.append("visaType", formData.visaType);
    formDataToSubmit.append("expiryDate", formData.expiryDate);
    formDataToSubmit.append("status", formData.status);
    if (formData.paymentStatus) {
      formDataToSubmit.append("paymentStatus", formData.paymentStatus);
    }

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
          htmlFor="title"
          className="block text-sm font-medium text-black mb-2"
        >
          案件名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black ${
            fieldErrors.title
              ? "border-red-500"
              : "border-zinc-200 focus:border-black"
          }`}
          placeholder="案件名を入力"
        />
        {fieldErrors.title && (
          <p className="mt-1 text-sm text-red-500">{fieldErrors.title}</p>
        )}
      </div>

      <CustomerSelector
        selectedCustomerId={selectedCustomerId}
        onSelectCustomer={setSelectedCustomerId}
        error={fieldErrors.customerId}
      />

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
          {PROJECT_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="paymentStatus"
          className="block text-sm font-medium text-black mb-2"
        >
          入金ステータス
        </label>
        <select
          id="paymentStatus"
          name="paymentStatus"
          value={formData.paymentStatus}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
        >
          <option value="">未設定</option>
          <option value="unclaimed">未請求</option>
          <option value="claimed">請求済み</option>
          <option value="paid">入金済み</option>
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

