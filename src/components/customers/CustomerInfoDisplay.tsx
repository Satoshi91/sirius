"use client";

import { useState } from "react";
import { Customer } from "@/types";
import { Timestamp } from "firebase/firestore";
import { getDisplayName, getFullNameJa, getFullNameKana, getFullNameEn } from "@/lib/utils/customerName";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

interface CustomerInfoDisplayProps {
  customer: Customer;
  showFullInfo?: boolean; // 全情報表示か基本情報のみか
}

export default function CustomerInfoDisplay({ 
  customer, 
  showFullInfo = true 
}: CustomerInfoDisplayProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handlePhoneCall = () => {
    if (customer.phone) {
      window.location.href = `tel:${customer.phone}`;
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-1">氏名（表示名）</h3>
          <p className="text-black font-medium">{getDisplayName(customer)}</p>
        </div>

        {getFullNameJa(customer) && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">氏名（漢字）</h3>
            <p className="text-black">{getFullNameJa(customer)}</p>
          </div>
        )}

        {getFullNameKana(customer) && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">氏名（カタカナ）</h3>
            <p className="text-black">{getFullNameKana(customer)}</p>
          </div>
        )}

        {getFullNameEn(customer) && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">氏名（英語）</h3>
            <p className="text-black">{getFullNameEn(customer)}</p>
          </div>
        )}

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-1">国籍</h3>
          <p className="text-black">{customer.nationality}</p>
        </div>

        {showFullInfo && customer.birthday && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">生年月日</h3>
            <p className="text-black">
              {customer.birthday instanceof Date 
                ? customer.birthday.toLocaleDateString('ja-JP')
                : (customer.birthday instanceof Timestamp)
                  ? customer.birthday.toDate().toLocaleDateString('ja-JP')
                  : ""}
            </p>
          </div>
        )}

        {showFullInfo && customer.gender && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">性別</h3>
            <p className="text-black">
              {customer.gender === 'male' ? '男性' : 
               customer.gender === 'female' ? '女性' : 
               customer.gender === 'other' ? 'その他' : customer.gender}
            </p>
          </div>
        )}

        {showFullInfo && customer.residenceCardNumber && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">在留カード番号</h3>
            <p className="text-black">{customer.residenceCardNumber}</p>
          </div>
        )}

        {customer.email && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">メールアドレス</h3>
            <p className="text-black">{customer.email}</p>
          </div>
        )}

        {customer.phone && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">電話番号</h3>
            <div className="flex items-center gap-2">
              <p className="text-black">{customer.phone}</p>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsConfirmOpen(true)}
                className="h-8 w-8"
                title="電話を発信"
              >
                <Phone className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {customer.address && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">住所</h3>
            <p className="text-black">{customer.address}</p>
          </div>
        )}

        {showFullInfo && customer.notes && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">備考・メモ</h3>
            <p className="text-black whitespace-pre-wrap">{customer.notes}</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handlePhoneCall}
        title="電話発信"
        message={`${getDisplayName(customer)}様に電話を発信しますか？`}
        confirmText="発信"
        cancelText="キャンセル"
      />
    </>
  );
}

