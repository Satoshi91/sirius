import { Customer } from "@/types";

export interface NameValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * 顧客の氏名をバリデーション
 * 
 * ルール:
 * 1. 「アルファベット（en）」または「漢字（ja）」のどちらかのペアが必須
 * 2. 片方の形式が入力されている場合、その「姓」と「名」の両方が必須
 * 3. 「カナ（kana）」は任意（推奨）
 */
export function validateCustomerName(name: Customer['name']): NameValidationResult {
  const errors: Record<string, string> = {};

  // en形式のチェック
  const hasLastEn = !!name.last.en?.trim();
  const hasFirstEn = !!name.first.en?.trim();
  const hasEnPair = hasLastEn && hasFirstEn;
  const hasPartialEn = hasLastEn || hasFirstEn;

  // ja形式のチェック
  const hasLastJa = !!name.last.ja?.trim();
  const hasFirstJa = !!name.first.ja?.trim();
  const hasJaPair = hasLastJa && hasFirstJa;
  const hasPartialJa = hasLastJa || hasFirstJa;

  // ルール1: enまたはjaのペアが必須
  if (!hasEnPair && !hasJaPair) {
    if (hasPartialEn) {
      // enの片方だけ入力されている場合
      if (!hasLastEn) {
        errors['name.last.en'] = "姓（アルファベット）を入力してください";
      }
      if (!hasFirstEn) {
        errors['name.first.en'] = "名（アルファベット）を入力してください";
      }
    } else if (hasPartialJa) {
      // jaの片方だけ入力されている場合
      if (!hasLastJa) {
        errors['name.last.ja'] = "姓（漢字）を入力してください";
      }
      if (!hasFirstJa) {
        errors['name.first.ja'] = "名（漢字）を入力してください";
      }
    } else {
      // どちらも入力されていない場合
      errors['name'] = "アルファベットまたは漢字のどちらかの形式で、姓と名の両方を入力してください";
    }
  }

  // ルール2: 片方の形式が入力されている場合、その「姓」と「名」の両方が必須
  if (hasLastEn && !hasFirstEn) {
    errors['name.first.en'] = "名（アルファベット）を入力してください";
  }
  if (hasFirstEn && !hasLastEn) {
    errors['name.last.en'] = "姓（アルファベット）を入力してください";
  }
  if (hasLastJa && !hasFirstJa) {
    errors['name.first.ja'] = "名（漢字）を入力してください";
  }
  if (hasFirstJa && !hasLastJa) {
    errors['name.last.ja'] = "姓（漢字）を入力してください";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * カナフィールドの推奨チェック（警告レベル）
 */
export function checkKanaRecommendation(name: Customer['name']): {
  hasKana: boolean;
  recommendation: string | null;
} {
  const hasLastKana = !!name.last.kana?.trim();
  const hasFirstKana = !!name.first.kana?.trim();
  const hasKana = hasLastKana && hasFirstKana;

  if (!hasKana) {
    return {
      hasKana: false,
      recommendation: "カタカナの入力が推奨されます（国内実務での利便性のため）",
    };
  }

  return {
    hasKana: true,
    recommendation: null,
  };
}


