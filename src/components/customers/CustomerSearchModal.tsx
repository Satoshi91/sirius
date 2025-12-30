"use client";

import { useState, useEffect, useRef } from "react";
import { Customer } from "@/types";
import Modal from "@/components/Modal";
import { searchCustomersAction } from "@/app/customers/actions";
import { getDisplayName, getFullNameEn } from "@/lib/utils/customerName";

interface CustomerSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (customer: Customer) => void;
}

export default function CustomerSearchModal({
  isOpen,
  onClose,
  onSelect,
}: CustomerSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentSearchRef = useRef<string>("");

  useEffect(() => {
    // モーダルが閉じられたときに状態をリセット
    if (!isOpen) {
      setSearchQuery("");
      setCustomers([]);
      setIsSearching(false);
      setHasSearched(false);
      currentSearchRef.current = "";
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    }
  }, [isOpen]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    // 既存のタイマーをクリア
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    if (query.trim().length === 0) {
      setCustomers([]);
      setIsSearching(false);
      setHasSearched(false);
      currentSearchRef.current = "";
      return;
    }

    // デバウンス処理（300ms待機）
    searchTimeoutRef.current = setTimeout(async () => {
      const trimmedQuery = query.trim();
      if (trimmedQuery.length === 0) {
        setCustomers([]);
        setIsSearching(false);
        setHasSearched(false);
        return;
      }

      // 現在の検索クエリを記録
      currentSearchRef.current = trimmedQuery;
      setIsSearching(true);
      setHasSearched(false);

      try {
        const result = await searchCustomersAction(trimmedQuery);
        
        // 検索が完了した時点で、このリクエストが最新のものであることを確認
        if (currentSearchRef.current === trimmedQuery) {
          if (result.customers) {
            setCustomers(result.customers);
          } else {
            setCustomers([]);
          }
          setHasSearched(true);
        }
      } catch (error) {
        console.error("Error searching customers:", error);
        // エラー時も、このリクエストが最新のものであることを確認
        if (currentSearchRef.current === trimmedQuery) {
          setCustomers([]);
          setHasSearched(true);
        }
      } finally {
        // このリクエストが最新のものであることを確認
        if (currentSearchRef.current === trimmedQuery) {
          setIsSearching(false);
        }
      }
    }, 300);
  };

  const handleSelectCustomer = (customer: Customer) => {
    onSelect(customer);
    setSearchQuery("");
    setCustomers([]);
    onClose();
  };

  const handleClose = () => {
    setSearchQuery("");
    setCustomers([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="既存の顧客を選択">
      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            placeholder="顧客を検索（氏名、英語名、国籍で検索）"
            autoFocus
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400">
              検索中...
            </div>
          )}
        </div>

        {customers.length > 0 && (
          <div className="border border-zinc-200 rounded-lg max-h-[400px] overflow-y-auto">
            {customers.map((customer) => (
              <button
                key={customer.id}
                type="button"
                onClick={() => handleSelectCustomer(customer)}
                className="w-full text-left px-4 py-3 hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-b-0"
              >
                <div className="font-medium text-black">{getDisplayName(customer)}</div>
                {getFullNameEn(customer) && (
                  <div className="text-sm text-zinc-600 mt-1">
                    {getFullNameEn(customer)}
                  </div>
                )}
                <div className="text-sm text-zinc-600 mt-1">
                  国籍: {customer.nationality}
                </div>
                {customer.email && (
                  <div className="text-sm text-zinc-600 mt-1">
                    メール: {customer.email}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {searchQuery.trim().length > 0 &&
          customers.length === 0 &&
          !isSearching &&
          hasSearched && (
            <div className="text-center text-zinc-600 py-8">
              顧客が見つかりませんでした
            </div>
          )}

        {searchQuery.trim().length === 0 && !isSearching && (
          <div className="text-center text-zinc-600 py-8">
            検索キーワードを入力してください
          </div>
        )}
      </div>
    </Modal>
  );
}

