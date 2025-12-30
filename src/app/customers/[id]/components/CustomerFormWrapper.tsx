"use client";

import { useRouter } from "next/navigation";
import { Customer } from "@/types";
import { updateCustomerAction } from "../../actions";
import CustomerForm from "./CustomerForm";
import { toast } from "sonner";

interface CustomerFormWrapperProps {
  customerId: string;
  customer: Customer;
}

export default function CustomerFormWrapper({
  customerId,
  customer,
}: CustomerFormWrapperProps) {
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    const result = await updateCustomerAction(customerId, formData);
    if (result?.error) {
      toast.error(result.error);
      return result;
    } else if (result?.success) {
      toast.success("顧客情報を更新しました");
      router.refresh();
      return result;
    }
    return result;
  };

  return (
    <CustomerForm
      customer={customer}
      onSubmit={handleSubmit}
      onCancel={() => {}}
      isCreating={false}
    />
  );
}

