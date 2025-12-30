"use client";

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
import { Eye, Trash2 } from "lucide-react";
import { getDisplayName, getFullNameJa, getFullNameKana, getFullNameEn } from "@/lib/utils/customerName";

interface CustomerListProps {
  customers: Customer[];
  onDelete: (customerId: string) => void;
}

export default function CustomerList({
  customers,
  onDelete,
}: CustomerListProps) {
  if (customers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">顧客がありません</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-blue-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-blue-50">
            <TableHead>氏名（漢字）</TableHead>
            <TableHead>氏名（カタカナ）</TableHead>
            <TableHead>氏名（英語）</TableHead>
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
                <div className="font-medium text-black">{getDisplayName(customer)}</div>
              </TableCell>
              <TableCell>
                <div className="text-gray-700">{getFullNameKana(customer) || "-"}</div>
              </TableCell>
              <TableCell>
                <div className="text-gray-700">
                  {getFullNameEn(customer) || getFullNameJa(customer) || "-"}
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
                <div className="flex justify-end gap-2">
                  <Link href={`/customers/${customer.id}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="h-3 w-3" />
                      詳細
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onDelete(customer.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                    削除
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

