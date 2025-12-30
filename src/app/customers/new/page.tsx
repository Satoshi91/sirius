"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createCustomerAction } from "../actions";
import CustomerForm from "../[id]/components/CustomerForm";

export default function NewCustomerPage() {
  console.log("[NewCustomerPage] Component rendered");
  const router = useRouter();

  const handleSubmit = useCallback(async (formData: FormData) => {
    console.log("[NewCustomerPage] handleSubmit called");
    const result = await createCustomerAction(formData);
    if (result?.success && result.customerId) {
      router.push(`/customers/${result.customerId}`);
      return result;
    }
    return result;
  }, [router]);

  const handleCancel = useCallback(() => {
    router.push("/customers");
  }, [router]);

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* パンくずリスト */}
        <div className="mb-6">
          <Link
            href="/customers"
            className="text-gray-700 hover:text-black transition-colors"
          >
            ← 顧客管理に戻る
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">顧客作成</h1>
          <p className="text-zinc-600">新しい顧客を登録します</p>
        </div>

        <CustomerForm
          key="new-customer-form"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isCreating={true}
        />
      </div>
    </div>
  );
}

