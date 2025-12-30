"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import CustomerFormWrapper from "./CustomerFormWrapper";
import CustomerProjectsList from "./CustomerProjectsList";
import CustomerDocumentsSection from "./CustomerDocumentsSection";
import NoteTimeline from "@/components/notes/NoteTimeline";
import { Customer, Project } from "@/types";
import { addCustomerNoteAction } from "@/app/customers/actions";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface CustomerTabsProps {
  customerId: string;
  customer: Customer;
  projects: Project[];
}

export default function CustomerTabs({
  customerId,
  customer,
  projects,
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
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="details">詳細・編集</TabsTrigger>
        <TabsTrigger value="documents">重要書類</TabsTrigger>
        <TabsTrigger value="projects">関連案件</TabsTrigger>
        <TabsTrigger value="notes">メモ</TabsTrigger>
      </TabsList>

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
    </Tabs>
  );
}

