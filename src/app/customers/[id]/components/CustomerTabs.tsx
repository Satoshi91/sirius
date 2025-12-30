"use client";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import CustomerFormWrapper from "./CustomerFormWrapper";
import CustomerProjectsList from "./CustomerProjectsList";
import CustomerDocumentsSection from "./CustomerDocumentsSection";
import CustomerHistoryList from "./CustomerHistoryList";
import NoteTimeline from "@/components/notes/NoteTimeline";
import { Customer, Project, CustomerActivityLog } from "@/types";
import { addCustomerNoteAction } from "@/app/customers/actions";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface CustomerTabsProps {
  customerId: string;
  customer: Customer;
  projects: Project[];
  history: CustomerActivityLog[];
  activeTab: string;
  onTabChange: (value: string) => void;
}

export default function CustomerTabs({
  customerId,
  customer,
  projects,
  history,
  activeTab,
  onTabChange,
}: CustomerTabsProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const handleAddNote = async (content: string) => {
    return await addCustomerNoteAction(customerId, content);
  };

  const handleNoteAdded = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsContent value="details">
        <Card>
          <CardHeader>
            <CardTitle>顧客情報の編集</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerFormWrapper customerId={customerId} customer={customer} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="documents">
        <CustomerDocumentsSection customerId={customerId} customer={customer} />
      </TabsContent>

      <TabsContent value="projects">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>関連案件 ({projects.length}件)</CardTitle>
              <Link href={`/projects/new?customerId=${customerId}`}>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  新規案件
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <CustomerProjectsList projects={projects} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notes">
        <Card>
          <CardHeader>
            <CardTitle>メモ</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <NoteTimeline
              notes={customer.chatNotes}
              onAddNote={async (content) => {
                const result = await handleAddNote(content);
                if (result.success) {
                  handleNoteAdded();
                }
                return result;
              }}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="history">
        <Card>
          <CardHeader>
            <CardTitle>履歴</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerHistoryList logs={history} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

