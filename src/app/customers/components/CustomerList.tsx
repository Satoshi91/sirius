"use client";

import { useState, useTransition } from "react";
import { Customer } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Trash2 } from "lucide-react";
import { getDisplayName, getFullNameKana } from "@/lib/utils/customerName";
import ConfirmDialog from "@/components/ConfirmDialog";
import { deleteCustomerAction } from "../actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CustomerListProps {
  customers: Customer[];
}

export default function CustomerList({ customers }: CustomerListProps) {
  const router = useRouter();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<string | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  // 開発モードの判定
  const isDevelopment = process.env.NODE_ENV !== "production";

  const handleDeleteClick = (customerId: string) => {
    setDeleteConfirmOpen(customerId);
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(null);
  };

  const handleDeleteConfirm = (customerId: string) => {
    startTransition(async () => {
      const result = await deleteCustomerAction(customerId);
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success("顧客を削除しました");
        router.refresh();
      }
    });
  };

  if (customers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">顧客がありません</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border border-blue-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-blue-50">
              <TableHead>氏名</TableHead>
              <TableHead>氏名(カタカナ)</TableHead>
              <TableHead>国籍</TableHead>
              <TableHead>メールアドレス</TableHead>
              <TableHead>電話番号</TableHead>
              <TableHead className="w-[150px] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow
                key={customer.id}
                className="hover:bg-blue-50/50 transition-colors"
              >
                <TableCell>
                  <div className="font-medium text-black">
                    {getDisplayName(customer)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-gray-700">
                    {getFullNameKana(customer) || "-"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-gray-700">{customer.nationality}</div>
                </TableCell>
                <TableCell>
                  <div className="text-gray-700">{customer.email || "-"}</div>
                </TableCell>
                <TableCell>
                  <div className="text-gray-700">{customer.phone || "-"}</div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Link href={`/customers/${customer.id}`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <FileText className="h-3 w-3" />
                        詳細
                      </Button>
                    </Link>
                    {isDevelopment && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleDeleteClick(customer.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-3 w-3" />
                        削除
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {deleteConfirmOpen &&
        (() => {
          const customerToDelete = customers.find(
            (c) => c.id === deleteConfirmOpen
          );
          return customerToDelete ? (
            <ConfirmDialog
              isOpen={true}
              onClose={handleCloseDeleteConfirm}
              onConfirm={() => handleDeleteConfirm(deleteConfirmOpen)}
              title="顧客の削除"
              message={`顧客「${getDisplayName(customerToDelete)}」を削除してもよろしいですか？\nこの操作は取り消せません。`}
              confirmText="削除"
              cancelText="キャンセル"
              variant="destructive"
            />
          ) : null;
        })()}
    </>
  );
}
