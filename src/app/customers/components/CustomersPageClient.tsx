"use client";

import { useState } from "react";
import { Customer } from "@/types";
import CustomerList from "./CustomerList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
// CustomersPageClient - 顧客一覧ページのクライアントコンポーネント

interface CustomersPageClientProps {
  initialCustomers: Customer[];
}

export default function CustomersPageClient({
  initialCustomers,
}: CustomersPageClientProps) {
  const router = useRouter();
  const [customers] = useState<Customer[]>(initialCustomers);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCustomers = customers.filter((customer) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      customer.name.last.en.toLowerCase().includes(query) ||
      customer.name.first.en.toLowerCase().includes(query) ||
      customer.name.last.ja.includes(searchQuery) ||
      customer.name.first.ja.includes(searchQuery) ||
      customer.name.last.kana.includes(searchQuery) ||
      customer.name.first.kana.includes(searchQuery) ||
      customer.nationality.toLowerCase().includes(query) ||
      (customer.email && customer.email.toLowerCase().includes(query)) ||
      (customer.phone && customer.phone.includes(searchQuery)) ||
      (customer.residenceCardNumber && customer.residenceCardNumber.includes(searchQuery))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold text-blue-900 whitespace-nowrap">
          顧客管理
        </h1>
        <div className="flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="顧客を検索（氏名、英語名、国籍、メール、電話番号）"
            className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
          />
        </div>
        <Button
          onClick={() => router.push("/customers/new")}
          className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap ml-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          新規登録
        </Button>
      </div>

      <CustomerList customers={filteredCustomers} />
    </div>
  );
}

