import { requireAuth } from "@/lib/auth/auth";
import { getCustomerAction, getCustomerProjectsAction } from "../actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CustomerInfoDisplay from "@/components/customers/CustomerInfoDisplay";
import CustomerTabs from "./components/CustomerTabs";

interface CustomerDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  await requireAuth();
  
  const { id } = await params;
  const customerResult = await getCustomerAction(id);
  const projectsResult = await getCustomerProjectsAction(id);

  if (customerResult.error || !customerResult.customer) {
    notFound();
  }

  const customer = customerResult.customer;
  const projects = projectsResult.projects || [];

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* パンくずリスト */}
        <div className="mb-6">
          <Link
            href="/customers"
            className="text-gray-700 hover:text-black transition-colors"
          >
            ← 顧客一覧に戻る
          </Link>
        </div>

        {/* 2カラムレイアウト */}
        <div className="grid grid-cols-12 gap-6">
          {/* 左カラム: 顧客基本情報カード（約30%） */}
          <div className="col-span-12 lg:col-span-3">
            <div className="sticky top-4 z-30">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">顧客基本情報</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CustomerInfoDisplay customer={customer} showFullInfo={true} />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 右カラム: メインコンテンツエリア（約70%） */}
          <div className="col-span-12 lg:col-span-9">
            <CustomerTabs
              customerId={id}
              customer={customer}
              projects={projects}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

