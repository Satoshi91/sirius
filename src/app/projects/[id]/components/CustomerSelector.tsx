"use client";

import { useState, useEffect } from "react";
import { Customer } from "@/types";
import { searchCustomersAction } from "../actions";
import { getDisplayName, getFullNameEn } from "@/lib/utils/customerName";

interface CustomerSelectorProps {
  selectedCustomerId: string | null;
  onSelectCustomer: (customerId: string | null) => void;
  error?: string;
}

export default function CustomerSelector({
  selectedCustomerId,
  onSelectCustomer,
  error,
}: CustomerSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const loadSelectedCustomer = async () => {
      if (selectedCustomerId && !selectedCustomer) {
        try {
          const { getCustomerAction } = await import("@/app/customers/actions");
          const result = await getCustomerAction(selectedCustomerId);
          if (result.customer) {
            setSelectedCustomer(result.customer);
          }
        } catch (error) {
          console.error("Error loading customer:", error);
        }
      } else if (selectedCustomerId && customers.length > 0) {
        const customer = customers.find(c => c.id === selectedCustomerId);
        if (customer) {
          setSelectedCustomer(customer);
        }
      }
    };
    loadSelectedCustomer();
  }, [selectedCustomerId, customers, selectedCustomer]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length === 0) {
      setCustomers([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const result = await searchCustomersAction(query);
      if (result.customers) {
        setCustomers(result.customers);
        setShowDropdown(true);
      }
    } catch (error) {
      console.error("Error searching customers:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    onSelectCustomer(customer.id);
    setShowDropdown(false);
    setSearchQuery("");
  };

  const handleClearSelection = () => {
    setSelectedCustomer(null);
    onSelectCustomer(null);
    setSearchQuery("");
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-black mb-2">
        顧客 <span className="text-red-500">*</span>
      </label>
      
      {selectedCustomer ? (
        <div className="border border-zinc-200 rounded-lg p-4 bg-zinc-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="font-medium text-black">{getDisplayName(selectedCustomer)}</div>
              {getFullNameEn(selectedCustomer) && (
                <div className="text-sm text-zinc-600 mt-1">{getFullNameEn(selectedCustomer)}</div>
              )}
              <div className="text-sm text-zinc-600 mt-1">国籍: {selectedCustomer.nationality}</div>
            </div>
            <button
              type="button"
              onClick={handleClearSelection}
              className="text-sm text-zinc-600 hover:text-black ml-4"
            >
              変更
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => {
              if (customers.length > 0) {
                setShowDropdown(true);
              }
            }}
            className={`w-full px-4 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black ${
              error
                ? "border-red-500"
                : "border-zinc-200 focus:border-black"
            }`}
            placeholder="顧客を検索（氏名、英語名、国籍で検索）"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400">
              検索中...
            </div>
          )}
          
          {showDropdown && customers.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {customers.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => handleSelectCustomer(customer)}
                  className="w-full text-left px-4 py-2 hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-b-0"
                >
                  <div className="font-medium text-black">{getDisplayName(customer)}</div>
                  {getFullNameEn(customer) && (
                    <div className="text-sm text-zinc-600">{getFullNameEn(customer)}</div>
                  )}
                  <div className="text-sm text-zinc-600">国籍: {customer.nationality}</div>
                </button>
              ))}
            </div>
          )}
          
          {showDropdown && customers.length === 0 && searchQuery.trim().length > 0 && !isSearching && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg p-4 text-center text-zinc-600">
              顧客が見つかりませんでした
            </div>
          )}
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

