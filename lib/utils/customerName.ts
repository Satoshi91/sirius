import { Customer } from "@/types";

/**
 * 表示用の氏名を取得
 * enがある場合はそれを優先表示、ない場合はjaを表示
 */
export function getDisplayName(customer: Customer): string {
  if (customer.name.last.en && customer.name.first.en) {
    return `${customer.name.last.en} ${customer.name.first.en}`;
  }
  if (customer.name.last.ja && customer.name.first.ja) {
    return `${customer.name.last.ja} ${customer.name.first.ja}`;
  }
  // フォールバック: どちらか片方でもあれば表示
  if (customer.name.last.en || customer.name.first.en) {
    return `${customer.name.last.en || ""} ${customer.name.first.en || ""}`.trim();
  }
  if (customer.name.last.ja || customer.name.first.ja) {
    return `${customer.name.last.ja || ""} ${customer.name.first.ja || ""}`.trim();
  }
  return "-";
}

/**
 * アルファベットのフルネームを取得
 */
export function getFullNameEn(customer: Customer): string {
  if (customer.name.last.en && customer.name.first.en) {
    return `${customer.name.last.en} ${customer.name.first.en}`;
  }
  return "";
}

/**
 * 漢字のフルネームを取得
 */
export function getFullNameJa(customer: Customer): string {
  if (customer.name.last.ja && customer.name.first.ja) {
    return `${customer.name.last.ja} ${customer.name.first.ja}`;
  }
  return "";
}

/**
 * カタカナのフルネームを取得
 */
export function getFullNameKana(customer: Customer): string {
  if (customer.name.last.kana && customer.name.first.kana) {
    return `${customer.name.last.kana} ${customer.name.first.kana}`;
  }
  return "";
}

/**
 * 姓（表示用）を取得
 */
export function getLastName(customer: Customer): string {
  return customer.name.last.en || customer.name.last.ja || "";
}

/**
 * 名（表示用）を取得
 */
export function getFirstName(customer: Customer): string {
  return customer.name.first.en || customer.name.first.ja || "";
}

