"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createContactAction } from "./actions";

export default function NewContactPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    title: "",
    client: "",
    status: "",
    description: "",
    deadline: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // クライアント側バリデーション
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = "タイトルは必須です";
    }
    if (!formData.client.trim()) {
      newErrors.client = "クライアントは必須です";
    }
    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    const formDataToSubmit = new FormData();
    formDataToSubmit.append("title", formData.title);
    formDataToSubmit.append("client", formData.client);
    formDataToSubmit.append("status", formData.status);
    formDataToSubmit.append("description", formData.description);
    formDataToSubmit.append("deadline", formData.deadline);

    startTransition(async () => {
      const result = await createContactAction(formDataToSubmit);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        router.push("/contacts");
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
              タイトル <span className="text-red-500">*</span>
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
              placeholder="案件のタイトルを入力"
            />
            {fieldErrors.title && (
              <p className="mt-1 text-sm text-red-500">{fieldErrors.title}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="client"
              className="block text-sm font-medium text-black mb-2"
            >
              クライアント <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="client"
              name="client"
              value={formData.client}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black ${
                fieldErrors.client
                  ? "border-red-500"
                  : "border-zinc-200 focus:border-black"
              }`}
              placeholder="クライアント名を入力"
            />
            {fieldErrors.client && (
              <p className="mt-1 text-sm text-red-500">{fieldErrors.client}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-black mb-2"
            >
              ステータス
            </label>
            <input
              type="text"
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              placeholder="例: 進行中、完了、保留など"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-black mb-2"
            >
              説明
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black resize-none"
              placeholder="案件の詳細説明を入力"
            />
          </div>

          <div>
            <label
              htmlFor="deadline"
              className="block text-sm font-medium text-black mb-2"
            >
              期限
            </label>
            <input
              type="date"
              id="deadline"
              name="deadline"
              value={formData.deadline}
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
              href="/contacts"
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
