"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createProjectAction } from "./actions";
import { createCustomerAction } from "../../customers/actions";
import { Customer } from "@/types";
import { Timestamp } from "firebase/firestore";
import CustomerFormFields from "@/components/customers/CustomerFormFields";
import CustomerSearchModal from "@/components/customers/CustomerSearchModal";
import { DateInput } from "@/components/forms/DateInput";
import { validateCustomerName } from "@/lib/utils/customerValidation";

// フォームスキーマ定義
const projectFormSchema = z.object({
  title: z.string().min(1, "案件名は必須です"),
  currentVisaType: z.string().optional(),
  visaType: z.string().min(1, "在留資格は必須です"),
  expiryDate: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

export default function NewProjectPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [customerMode, setCustomerMode] = useState<"new" | "existing">("new");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [newCustomerFormData, setNewCustomerFormData] = useState({
    name: {
      last: { en: "", ja: "", kana: "" },
      first: { en: "", ja: "", kana: "" },
    },
    nationality: "",
    birthday: "",
    gender: "",
    residenceCardNumber: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [newCustomerFieldErrors, setNewCustomerFieldErrors] = useState<Record<string, string>>({});

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: "",
      currentVisaType: "",
      visaType: "",
      expiryDate: "",
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    setError(null);
    setNewCustomerFieldErrors({});

    // 顧客情報のバリデーション
    if (customerMode === "new") {
      const nameValidation = validateCustomerName(newCustomerFormData.name);
      if (!nameValidation.isValid) {
        setNewCustomerFieldErrors(nameValidation.errors);
        return;
      }
      if (!newCustomerFormData.nationality.trim()) {
        setNewCustomerFieldErrors({ nationality: "国籍は必須です" });
        return;
      }
    } else if (customerMode === "existing" && !selectedCustomer) {
      setError("既存の顧客を選択してください");
      return;
    }

    startTransition(async () => {
      let customerId: string;

      // 新規顧客の場合は先に顧客を作成
      if (customerMode === "new") {
        const customerFormData = new FormData();
        customerFormData.append("name.last.en", newCustomerFormData.name.last.en);
        customerFormData.append("name.first.en", newCustomerFormData.name.first.en);
        customerFormData.append("name.last.ja", newCustomerFormData.name.last.ja);
        customerFormData.append("name.first.ja", newCustomerFormData.name.first.ja);
        customerFormData.append("name.last.kana", newCustomerFormData.name.last.kana);
        customerFormData.append("name.first.kana", newCustomerFormData.name.first.kana);
        customerFormData.append("nationality", newCustomerFormData.nationality);
        customerFormData.append("birthday", newCustomerFormData.birthday);
        customerFormData.append("gender", newCustomerFormData.gender);
        customerFormData.append("residenceCardNumber", newCustomerFormData.residenceCardNumber);
        customerFormData.append("email", newCustomerFormData.email);
        customerFormData.append("phone", newCustomerFormData.phone);
        customerFormData.append("address", newCustomerFormData.address);
        customerFormData.append("notes", newCustomerFormData.notes);

        const customerResult = await createCustomerAction(customerFormData);
        if (customerResult?.error) {
          setError(customerResult.error);
          return;
        }
        if (!customerResult?.customerId) {
          setError("顧客の登録に失敗しました");
          return;
        }
        customerId = customerResult.customerId;
      } else {
        // 既存顧客の場合
        customerId = selectedCustomer!.id;
      }

      // 案件を作成
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("title", data.title);
      formDataToSubmit.append("customerId", customerId);
      formDataToSubmit.append("currentVisaType", data.currentVisaType || "");
      formDataToSubmit.append("visaType", data.visaType);
      formDataToSubmit.append("expiryDate", data.expiryDate || "");

      const result = await createProjectAction(formDataToSubmit);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        router.push("/projects");
      }
    });
  };


  const handleCustomerFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewCustomerFormData((prev) => ({ ...prev, [name]: value }));
    // エラーをクリア
    if (newCustomerFieldErrors[name]) {
      setNewCustomerFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCustomerNameChange = (path: string, value: string) => {
    const [, , lastOrFirst, enJaOrKana] = path.split('.');
    
    setNewCustomerFormData((prev) => ({
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
    if (newCustomerFieldErrors[path]) {
      setNewCustomerFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[path];
        return newErrors;
      });
    }
    // 一般的なnameエラーもクリア
    if (newCustomerFieldErrors['name']) {
      setNewCustomerFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors['name'];
        return newErrors;
      });
    }
  };

  const handleSelectExistingCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerMode("existing");
    if (error) {
      setError(null);
    }
  };

  const handleBackToNewCustomer = () => {
    setSelectedCustomer(null);
    setCustomerMode("new");
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              {...register("title")}
              className={`w-full px-4 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black ${
                errors.title
                  ? "border-red-500"
                  : "border-zinc-200 focus:border-black"
              }`}
              placeholder="案件名を入力"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* 顧客情報セクション */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-black">顧客情報</h2>
                {customerMode === "new" && (
                  <button
                    type="button"
                    onClick={() => setIsSearchModalOpen(true)}
                    className="px-4 py-2 rounded-lg border border-zinc-200 text-black hover:bg-zinc-50 transition-colors font-medium text-sm"
                  >
                    既存の顧客を選択
                  </button>
                )}
              </div>
            </div>

            {customerMode === "new" && (
              <div className="border border-zinc-200 rounded-lg p-6 bg-zinc-50">
                <CustomerFormFields
                  formData={newCustomerFormData}
                  onChange={handleCustomerFormChange}
                  onNameChange={handleCustomerNameChange}
                  fieldErrors={newCustomerFieldErrors}
                  readOnly={false}
                />
              </div>
            )}

            {customerMode === "existing" && selectedCustomer && (
              <div className="border border-zinc-200 rounded-lg p-6 bg-zinc-50">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-md font-semibold text-black">選択された顧客</h3>
                  <button
                    type="button"
                    onClick={handleBackToNewCustomer}
                    className="text-sm text-zinc-600 hover:text-black"
                  >
                    新規登録に戻る
                  </button>
                </div>
                <CustomerFormFields
                  formData={{
                    name: selectedCustomer.name,
                    nationality: selectedCustomer.nationality,
                    birthday: selectedCustomer.birthday 
                      ? (selectedCustomer.birthday instanceof Date 
                          ? selectedCustomer.birthday.toISOString().split("T")[0]
                          : (selectedCustomer.birthday instanceof Timestamp)
                            ? selectedCustomer.birthday.toDate().toISOString().split("T")[0]
                            : "")
                      : "",
                    gender: selectedCustomer.gender || "",
                    residenceCardNumber: selectedCustomer.residenceCardNumber || "",
                    email: selectedCustomer.email || "",
                    phone: selectedCustomer.phone || "",
                    address: selectedCustomer.address || "",
                    notes: selectedCustomer.notes || "",
                  }}
                  readOnly={true}
                />
              </div>
            )}

          </div>

          <CustomerSearchModal
            isOpen={isSearchModalOpen}
            onClose={() => setIsSearchModalOpen(false)}
            onSelect={handleSelectExistingCustomer}
          />

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
              {...register("currentVisaType")}
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
              {...register("visaType")}
              className={`w-full px-4 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black ${
                errors.visaType
                  ? "border-red-500"
                  : "border-zinc-200 focus:border-black"
              }`}
              placeholder="申請予定の資格を入力"
            />
            {errors.visaType && (
              <p className="mt-1 text-sm text-red-500">{errors.visaType.message}</p>
            )}
          </div>

          <DateInput
            name="expiryDate"
            control={control}
            label="在留期限"
            placeholder="在留期限を選択"
            error={errors.expiryDate?.message}
          />

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

