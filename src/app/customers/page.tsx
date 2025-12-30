import { requireAuth } from "@/lib/auth/auth";
import { getCustomersAction } from "./actions";
import CustomersPageClient from "./components/CustomersPageClient";

export default async function CustomersPage() {
  // 認証チェック
  await requireAuth();
  const result = await getCustomersAction();
  
  if (result.error) {
    return (
      <div className="p-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{result.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-900 mb-8">
          顧客管理
        </h1>
        <CustomersPageClient 
          initialCustomers={result.customers || []} 
        />
      </div>
    </div>
  );
}

