"use client";

import { useState, useTransition } from "react";
import { Customer } from "@/types";
import { Timestamp } from "firebase/firestore";
import CustomerFormFields from "@/components/customers/CustomerFormFields";
import { validateCustomerName } from "@/lib/utils/customerValidation";

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  onCancel: () => void;
  isCreating?: boolean;
}

// 日付をYYYY-MM-DD形式に変換
const formatDateForInput = (date: Date | Timestamp | null | undefined): string => {
  if (!date) return "";
  let dateObj: Date;
  if (date instanceof Date) {
    dateObj = date;
  } else if (date instanceof Timestamp) {
    dateObj = date.toDate();
  } else {
    // 予期しない型の場合は空文字を返す
    return "";
  }
  return dateObj.toISOString().split("T")[0];
};

export default function CustomerForm({
  customer,
  onSubmit,
  onCancel,
  isCreating = false,
}: CustomerFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    name: customer?.name || {
      last: { en: "", ja: "", kana: "" },
      first: { en: "", ja: "", kana: "" },
    },
    nationality: customer?.nationality || "",
    birthday: formatDateForInput(customer?.birthday),
    gender: customer?.gender || "",
    residenceCardNumber: customer?.residenceCardNumber || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    address: customer?.address || "",
    notes: customer?.notes || "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // 氏名のバリデーション
    const nameValidation = validateCustomerName(formData.name);
    if (!nameValidation.isValid) {
      setFieldErrors(nameValidation.errors);
      return;
    }

    // 国籍のバリデーション
    if (!formData.nationality.trim()) {
      setFieldErrors({ nationality: "国籍は必須です" });
      return;
    }

    const formDataToSubmit = new FormData();
    formDataToSubmit.append("name.last.en", formData.name.last.en);
    formDataToSubmit.append("name.first.en", formData.name.first.en);
    formDataToSubmit.append("name.last.ja", formData.name.last.ja);
    formDataToSubmit.append("name.first.ja", formData.name.first.ja);
    formDataToSubmit.append("name.last.kana", formData.name.last.kana);
    formDataToSubmit.append("name.first.kana", formData.name.first.kana);
    formDataToSubmit.append("nationality", formData.nationality);
    formDataToSubmit.append("birthday", formData.birthday);
    formDataToSubmit.append("gender", formData.gender);
    formDataToSubmit.append("residenceCardNumber", formData.residenceCardNumber);
    formDataToSubmit.append("email", formData.email);
    formDataToSubmit.append("phone", formData.phone);
    formDataToSubmit.append("address", formData.address);
    formDataToSubmit.append("notes", formData.notes);

    startTransition(async () => {
      const result = await onSubmit(formDataToSubmit);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        onCancel();
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

  const handleNameChange = (path: string, value: string) => {
    const [, , lastOrFirst, enJaOrKana] = path.split('.');
    
    setFormData((prev) => ({
      ...prev,
      name: {
        ...prev.name,
        [lastOrFirst]: {
          ...prev.name[lastOrFirst as 'last' | 'first'],
          [enJaOrKana]: value,
        },
      },
    }));
    
    // エラーをクリア
    if (fieldErrors[path]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[path];
        return newErrors;
      });
    }
    // 一般的なnameエラーもクリア
    if (fieldErrors['name']) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors['name'];
        return newErrors;
      });
    }
    if (error) {
      setError(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <CustomerFormFields
        formData={formData}
        onChange={handleChange}
        onNameChange={handleNameChange}
        fieldErrors={fieldErrors}
        readOnly={false}
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {fieldErrors['name'] && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-600">{fieldErrors['name']}</p>
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (isCreating ? "登録中..." : "更新中...") : (isCreating ? "登録" : "更新")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="px-6 py-3 border border-zinc-200 text-black rounded-lg hover:bg-zinc-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
