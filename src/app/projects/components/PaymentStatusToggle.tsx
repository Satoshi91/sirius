"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Project } from "@/types";
import { updatePaymentStatusAction } from "../[id]/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface PaymentStatusToggleProps {
  project: Project;
}

const getPaymentStatusLabel = (status: Project["paymentStatus"]): string => {
  switch (status) {
    case 'unclaimed':
      return '未請求';
    case 'claimed':
      return '請求済み';
    case 'paid':
      return '入金済み';
    default:
      return '未設定';
  }
};

const getPaymentStatusVariant = (status: Project["paymentStatus"]): "default" | "secondary" | "outline" => {
  switch (status) {
    case 'unclaimed':
      return 'outline';
    case 'claimed':
      return 'secondary';
    case 'paid':
      return 'default';
    default:
      return 'outline';
  }
};

const getPaymentStatusColor = (status: Project["paymentStatus"]): string => {
  switch (status) {
    case 'unclaimed':
      return 'text-gray-700 border-gray-400';
    case 'claimed':
      return 'text-orange-700 bg-orange-50 border-orange-200';
    case 'paid':
      return 'text-green-700 bg-green-50 border-green-200';
    default:
      return 'text-gray-700 border-gray-400';
  }
};

export default function PaymentStatusToggle({ project }: PaymentStatusToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: Project["paymentStatus"]) => {
    if (newStatus === project.paymentStatus) return;

    startTransition(async () => {
      const result = await updatePaymentStatusAction(project.id, newStatus);
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success(`入金ステータスを「${getPaymentStatusLabel(newStatus)}」に変更しました`);
        router.refresh();
      }
    });
  };

  const currentStatus = project.paymentStatus;
  const currentLabel = getPaymentStatusLabel(currentStatus);
  const currentVariant = getPaymentStatusVariant(currentStatus);
  const currentColor = getPaymentStatusColor(currentStatus);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={isPending}
          className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Badge
            variant={currentVariant}
            className={`${currentColor} ${isPending ? 'opacity-50' : ''}`}
          >
            {currentLabel}
          </Badge>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem
          onClick={() => handleStatusChange('unclaimed')}
          disabled={currentStatus === 'unclaimed' || isPending}
        >
          未請求
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleStatusChange('claimed')}
          disabled={currentStatus === 'claimed' || isPending}
        >
          請求済み
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleStatusChange('paid')}
          disabled={currentStatus === 'paid' || isPending}
        >
          入金済み
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

