"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResidenceCardNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const RESIDENCE_CARD_NUMBER_REGEX = /^[A-Z]{2}[0-9]{8}[A-Z]{2}$/;
const MAX_LENGTH = 12;

export default function ResidenceCardNumberInput({
  value,
  onChange,
  error: externalError,
  disabled = false,
  className,
}: ResidenceCardNumberInputProps) {
  const [inputValue, setInputValue] = useState(value || "");
  const [confirmValue, setConfirmValue] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  // 入力値を正規化（大文字変換、英数字以外を除去、最大12文字）
  const normalizeInput = useCallback((rawValue: string): string => {
    return rawValue
      .replace(/[^A-Z0-9]/gi, "")
      .toUpperCase()
      .slice(0, MAX_LENGTH);
  }, []);

  // 入力フィールドの変更ハンドラー
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const normalized = normalizeInput(e.target.value);
      setInputValue(normalized);
      onChange(normalized);
    },
    [normalizeInput, onChange]
  );

  // 確認フィールドの変更ハンドラー
  const handleConfirmChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const normalized = normalizeInput(e.target.value);
      setConfirmValue(normalized);
    },
    [normalizeInput]
  );

  // フォーカスアウト時の処理
  const handleInputBlur = useCallback(() => {
    setInputFocused(false);
  }, []);

  const handleConfirmBlur = useCallback(() => {
    setConfirmFocused(false);
  }, []);

  // フォーカス時の処理
  const handleInputFocus = useCallback(() => {
    setInputFocused(true);
  }, []);

  const handleConfirmFocus = useCallback(() => {
    setConfirmFocused(true);
  }, []);

  // バリデーション状態の計算
  const validationState = useMemo(() => {
    const hasInputValue = inputValue.length > 0;
    const hasConfirmValue = confirmValue.length > 0;
    const inputIsValid = inputValue.length === MAX_LENGTH && RESIDENCE_CARD_NUMBER_REGEX.test(inputValue);
    const confirmIsValid = confirmValue.length === MAX_LENGTH && RESIDENCE_CARD_NUMBER_REGEX.test(confirmValue);
    const valuesMatch = inputValue === confirmValue && inputValue.length === MAX_LENGTH;

    // 形式エラー
    const hasFormatError = 
      (!inputFocused && inputValue && !inputIsValid) ||
      (!confirmFocused && confirmValue && !confirmIsValid);

    // 不一致エラー（両方に入力があり、値が異なる場合）
    const hasMismatchError = 
      hasInputValue && 
      hasConfirmValue && 
      inputValue !== confirmValue &&
      !inputFocused &&
      !confirmFocused;

    // 成功状態（両方とも12桁で形式が正しく、一致している場合）
    const isSuccess = 
      inputIsValid && 
      confirmIsValid && 
      valuesMatch &&
      !inputFocused &&
      !confirmFocused;

    return {
      hasFormatError,
      hasMismatchError,
      isSuccess,
      inputIsValid,
      confirmIsValid,
      valuesMatch,
    };
  }, [inputValue, confirmValue, inputFocused, confirmFocused]);

  // エラーメッセージの生成
  const errorMessage = useMemo(() => {
    if (externalError) return externalError;
    
    if (validationState.hasMismatchError) {
      return "在留カード番号が一致しません";
    }
    
    if (!inputFocused && inputValue && !validationState.inputIsValid) {
      return "在留カード番号の形式が正しくありません（AB12345678CD）";
    }
    
    if (!confirmFocused && confirmValue && !validationState.confirmIsValid) {
      return "在留カード番号の形式が正しくありません（AB12345678CD）";
    }
    
    return null;
  }, [
    externalError,
    validationState.hasMismatchError,
    validationState.inputIsValid,
    validationState.confirmIsValid,
    inputFocused,
    confirmFocused,
    inputValue,
    confirmValue,
  ]);

  // value propの変更に追従
  useEffect(() => {
    const normalizedValue = value || "";
    if (normalizedValue !== inputValue) {
      setInputValue(normalizedValue);
      setConfirmValue("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const inputBorderColor = validationState.isSuccess
    ? "border-green-500 focus:border-green-500"
    : errorMessage || validationState.hasFormatError
    ? "border-red-500 focus:border-red-500"
    : "border-zinc-200 focus:border-black";

  const confirmBorderColor = validationState.isSuccess
    ? "border-green-500 focus:border-green-500"
    : errorMessage || validationState.hasFormatError
    ? "border-red-500 focus:border-red-500"
    : "border-zinc-200 focus:border-black";

  return (
    <div className={cn("space-y-4", className)}>
      {/* 入力フィールド */}
      <div>
        <label
          htmlFor="zairyu-no-99x-input"
          className="block text-sm font-medium text-black mb-2"
        >
          在留カード番号
        </label>
        <div className="relative">
          <input
            id="zairyu-no-99x-input"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            disabled={disabled}
            maxLength={MAX_LENGTH}
            placeholder="AB12345678CD"
            autoComplete="off"
            className={cn(
              "w-full px-4 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black font-mono",
              inputBorderColor,
              disabled && "bg-zinc-100 cursor-not-allowed"
            )}
          />
          {validationState.isSuccess && inputValue.length === MAX_LENGTH && (
            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
          )}
        </div>
      </div>

      {/* 確認フィールド */}
      <div>
        <label
          htmlFor="zairyu-no-99x-confirm"
          className="block text-sm font-medium text-black mb-2"
        >
          在留カード番号（確認）
        </label>
        <div className="relative">
          <input
            id="zairyu-no-99x-confirm"
            type="text"
            value={confirmValue}
            onChange={handleConfirmChange}
            onFocus={handleConfirmFocus}
            onBlur={handleConfirmBlur}
            disabled={disabled}
            maxLength={MAX_LENGTH}
            placeholder="AB12345678CD"
            autoComplete="off"
            className={cn(
              "w-full px-4 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black font-mono",
              confirmBorderColor,
              disabled && "bg-zinc-100 cursor-not-allowed"
            )}
          />
          {validationState.isSuccess && confirmValue.length === MAX_LENGTH && (
            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
          )}
        </div>
      </div>

      {/* エラーメッセージ */}
      {errorMessage && (
        <p className="text-sm text-red-500">{errorMessage}</p>
      )}
    </div>
  );
}

