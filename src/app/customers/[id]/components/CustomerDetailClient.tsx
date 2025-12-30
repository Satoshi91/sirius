"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomerInfoDisplay from "@/components/customers/CustomerInfoDisplay";
import CustomerTabs from "./CustomerTabs";
import { Customer, Project, CustomerActivityLog } from "@/types";

interface CustomerDetailClientProps {
  customerId: string;
  customer: Customer;
  projects: Project[];
  history: CustomerActivityLog[];
}

export default function CustomerDetailClient({
  customerId,
  customer,
  projects,
  history,
}: CustomerDetailClientProps) {
  const [activeTab, setActiveTab] = useState("details");

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダーエリア: 戻るボタンとタブを横並び */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            href="/customers"
            className="text-gray-700 hover:text-black transition-colors whitespace-nowrap"
          >
            ← 顧客一覧に戻る
          </Link>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="details">詳細・編集</TabsTrigger>
              <TabsTrigger value="documents">重要書類</TabsTrigger>
              <TabsTrigger value="projects">関連案件</TabsTrigger>
              <TabsTrigger value="notes">メモ</TabsTrigger>
              <TabsTrigger value="history">履歴</TabsTrigger>
            </TabsList>
          </Tabs>
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
              customerId={customerId}
              customer={customer}
              projects={projects}
              history={history}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

