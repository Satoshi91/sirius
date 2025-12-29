"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createProjectAction } from "./actions";

export default function NewProjectPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    title: "",
    name: "",
    nameEnglish: "",
    nationality: "",
    currentVisaType: "",
    visaType: "",
    expiryDate: "",
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
    if (!formData.name.trim()) {
      newErrors.name = "氏名は必須です";
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
    formDataToSubmit.append("title", formData.title);
    formDataToSubmit.append("name", formData.name);
    formDataToSubmit.append("nameEnglish", formData.nameEnglish);
    formDataToSubmit.append("nationality", formData.nationality);
    formDataToSubmit.append("currentVisaType", formData.currentVisaType);
    formDataToSubmit.append("visaType", formData.visaType);
    formDataToSubmit.append("expiryDate", formData.expiryDate);

    startTransition(async () => {
      const result = await createProjectAction(formDataToSubmit);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        router.push("/projects");
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
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">案件作成</h1>
          <p className="text-zinc-600">新しい案件を登録します</p>
        </div>

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

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-black mb-2"
            >
              氏名 <span className="text-red-500">*</span>
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
              placeholder="氏名を入力"
            />
            {fieldErrors.name && (
              <p className="mt-1 text-sm text-red-500">{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="nameEnglish"
              className="block text-sm font-medium text-black mb-2"
            >
              氏名（英語）
            </label>
            <input
              type="text"
              id="nameEnglish"
              name="nameEnglish"
              value={formData.nameEnglish}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              placeholder="氏名（英語）を入力"
            />
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
              htmlFor="currentVisaType"
              className="block text-sm font-medium text-black mb-2"
            >
              現在の在留資格
            </label>
            <input
              type="text"
              id="currentVisaType"
              name="currentVisaType"
              value={formData.currentVisaType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              placeholder="現在の在留資格を入力"
            />
          </div>

          <div>
            <label
              htmlFor="visaType"
              className="block text-sm font-medium text-black mb-2"
            >
              申請予定の資格 <span className="text-red-500">*</span>
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
              placeholder="申請予定の資格を入力"
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
              在留期限
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
              {isPending ? "登録中..." : "登録"}
            </button>
            <Link
              href="/projects"
              className="px-6 py-3 border border-zinc-200 text-black rounded-lg hover:bg-zinc-50 transition-colors font-medium text-center"
            >
              キャンセル
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

