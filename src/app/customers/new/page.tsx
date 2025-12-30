"use client";

import { useRouter } from "next/navigation";
import { createCustomerAction } from "../actions";
import CustomerForm from "../[id]/components/CustomerForm";

export default function NewCustomerPage() {
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    const result = await createCustomerAction(formData);
    if (result?.success && result.customerId) {
      router.push(`/customers/${result.customerId}`);
      return result;
    }
    return result;
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">顧客作成</h1>
          <p className="text-zinc-600">新しい顧客を登録します</p>
        </div>

        <CustomerForm
          onSubmit={handleSubmit}
          onCancel={() => router.push("/customers")}
          isCreating={true}
        />
      </div>
    </div>
  );
}

