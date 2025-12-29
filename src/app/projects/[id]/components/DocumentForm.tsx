"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjectDocument } from "@/types";
import { createDocumentAction } from "../actions";
import { toast } from "sonner";

interface DocumentFormProps {
  projectId: string;
  onSuccess: () => void;
}

export default function DocumentForm({
  projectId,
  onSuccess,
}: DocumentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "personal" as ProjectDocument["category"],
    source: "applicant" as ProjectDocument["source"],
    assignedTo: "applicant" as ProjectDocument["assignedTo"],
    status: "not_started" as ProjectDocument["status"],
    isRequiredOriginal: false,
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      if (formData.description) {
        formDataToSend.append("description", formData.description);
      }
      formDataToSend.append("category", formData.category);
      formDataToSend.append("source", formData.source);
      formDataToSend.append("assignedTo", formData.assignedTo);
      formDataToSend.append("status", formData.status);
      formDataToSend.append("isRequiredOriginal", formData.isRequiredOriginal.toString());
      if (formData.notes) {
        formDataToSend.append("notes", formData.notes);
      }

      const result = await createDocumentAction(projectId, formDataToSend);
      
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        onSuccess();
        router.refresh();
      }
    } catch (error) {
      console.error("Error creating document:", error);
      toast.error("書類の作成に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-1">
          書類名 <span className="text-red-500">*</span>
        </label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-zinc-700 mb-1">
          説明
        </label>
        <Input
          id="description"
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-zinc-700 mb-1">
          カテゴリー <span className="text-red-500">*</span>
        </label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as ProjectDocument["category"] })}
          required
          className="w-full px-3 py-2 border border-zinc-300 rounded-md"
        >
          <option value="personal">本人書類</option>
          <option value="employer">勤務先書類</option>
          <option value="office">当事務所作成書類</option>
          <option value="government">公的機関書類</option>
          <option value="other">その他</option>
        </select>
      </div>

      <div>
        <label htmlFor="source" className="block text-sm font-medium text-zinc-700 mb-1">
          取得元 <span className="text-red-500">*</span>
        </label>
        <select
          id="source"
          value={formData.source}
          onChange={(e) => setFormData({ ...formData, source: e.target.value as ProjectDocument["source"] })}
          required
          className="w-full px-3 py-2 border border-zinc-300 rounded-md"
        >
          <option value="office">当事務所</option>
          <option value="applicant">ご本人</option>
          <option value="employer">勤務先</option>
          <option value="government">公的機関</option>
          <option value="guarantor">身元保証人</option>
          <option value="other">その他</option>
        </select>
      </div>

      <div>
        <label htmlFor="assignedTo" className="block text-sm font-medium text-zinc-700 mb-1">
          担当 <span className="text-red-500">*</span>
        </label>
        <select
          id="assignedTo"
          value={formData.assignedTo}
          onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value as ProjectDocument["assignedTo"] })}
          required
          className="w-full px-3 py-2 border border-zinc-300 rounded-md"
        >
          <option value="office">当事務所</option>
          <option value="applicant">ご本人</option>
        </select>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-zinc-700 mb-1">
          ステータス <span className="text-red-500">*</span>
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectDocument["status"] })}
          required
          className="w-full px-3 py-2 border border-zinc-300 rounded-md"
        >
          <option value="not_started">未着手</option>
          <option value="in_progress">進行中</option>
          <option value="waiting">待機中</option>
          <option value="collected">回収済み</option>
          <option value="verified">確認済み</option>
          <option value="completed">完了</option>
        </select>
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isRequiredOriginal}
            onChange={(e) => setFormData({ ...formData, isRequiredOriginal: e.target.checked })}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium text-zinc-700">原本必要</span>
        </label>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-zinc-700 mb-1">
          備考
        </label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-zinc-300 rounded-md"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          disabled={isSubmitting}
        >
          キャンセル
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "作成中..." : "作成"}
        </Button>
      </div>
    </form>
  );
}

