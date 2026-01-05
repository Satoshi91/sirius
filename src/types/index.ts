import { Timestamp } from "firebase/firestore";

/**
 * メモ（Note）の型定義
 * 顧客・案件の時系列メモ機能で使用
 */
export interface Note {
  id: string;
  content: string;
  createdAt: Date | Timestamp;
  authorName: string;
}

/**
 * 顧客重要書類（CustomerDocument）の型定義
 */
export interface CustomerDocument {
  id: string; // 一意のID（UUID）
  label: string; // ラベル（例：「パスポート」「在留カード表面」「在留カード裏面」）
  fileUrl: string; // Firebase StorageのダウンロードURL
  storagePath: string; // Storage内のパス
  fileName: string; // 元のファイル名
  uploadedAt: Date | Timestamp; // アップロード日時
}

/**
 * 顧客（Customer）の型定義
 * マスターデータ：その人自身の不変情報
 */
export interface Customer {
  id: string;
  // 姓名オブジェクト（3形式 × 姓名）
  // ミドルネームは first.en に「名 + ミドルネーム」をまとめて入力する運用
  name: {
    last: {
      en: string; // 姓（アルファベット/パスポート表記）
      ja: string; // 姓（漢字）
      kana: string; // 姓（カタカナ）
    };
    first: {
      en: string; // 名（アルファベット/ミドルネーム含む）
      ja: string; // 名（漢字）
      kana: string; // 名（カタカナ）
    };
  };
  // 基本属性
  nationality: string; // 国籍（必須）
  birthday?: Date | Timestamp | null; // 生年月日
  gender?: string | null; // 性別
  // 在留カード情報
  residenceCardNumber?: string | null; // 在留カード番号（最新のものをマスターで保持）
  expiryDate?: Date | Timestamp | null; // 在留期限（最新のものをマスターで保持）
  // 連絡先
  email?: string; // メールアドレス（オプション）
  phone?: string; // 電話番号（オプション）
  address?: string; // 住所（オプション）
  // その他
  notes?: string; // 備考・メモ（オプション）
  chatNotes?: Note[]; // 時系列メモ（チャット形式）（オプション）
  // 重要書類
  documents?: CustomerDocument[]; // 重要書類の画像配列（パスポート、在留カード等）
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

/**
 * 案件ステータスの型定義
 */
export type ProjectStatus = "active" | "pending" | "completed";

/**
 * 案件ステータスのラベルマッピング
 */
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: "申請中",
  pending: "準備中",
  completed: "完了",
} as const;

/**
 * 案件ステータスのオプション配列（フィルターなどで使用）
 */
export const PROJECT_STATUS_OPTIONS: Array<{
  value: ProjectStatus;
  label: string;
}> = Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => ({
  value: value as ProjectStatus,
  label,
}));

/**
 * 案件（Project）のマスタ型定義
 */
export interface Project {
  id: string;
  title: string; // 案件名（必須）
  customerId: string; // 顧客ID（必須）
  customer?: Customer; // 顧客情報（オプション、サービス層で取得した顧客情報を格納）
  // 申請情報
  visaType?: string; // 申請する在留資格（オプション）
  currentVisaType?: string; // 申請時の在留資格（履歴として保持）
  applicationDate?: Date | Timestamp | null; // 申請日
  // 進捗管理
  status: ProjectStatus; // 統一されたステータス
  // 入金管理
  paymentStatus?: "unclaimed" | "claimed" | "paid"; // 入金ステータス
  // その他
  organizationId?: string; // 事務所ID（将来用、オプション）
  createdBy?: string; // 担当者UID（将来用、オプション）
  notes?: Note[]; // 時系列メモ（チャット形式）（オプション）
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

/**
 * 書類（ProjectDocument）の統合型定義
 * 必要書類リストと実際のファイルの両方を統合管理
 */
export interface ProjectDocument {
  id: string;
  projectId: string; // 案件ID（必須）

  // 基本情報
  name: string; // 書類名（必須）
  description?: string; // 書類の説明

  // カテゴリーと分類
  category: "personal" | "employer" | "office" | "government" | "other";

  // 取得元と担当の明確化
  source:
    | "office"
    | "applicant"
    | "employer"
    | "government"
    | "guarantor"
    | "other";
  assignedTo: "office" | "applicant";

  // 年度/期間の指定（年度別書類用）
  year?: number; // 年度（例: 2024）
  era?: "heisei" | "reiwa"; // 元号
  eraYear?: number; // 元号年（例: 令和6年）
  period?: {
    // 期間指定（開始日-終了日）
    start?: Date | Timestamp;
    end?: Date | Timestamp;
  };

  // ステータス管理（統一）
  status:
    | "not_started"
    | "in_progress"
    | "waiting"
    | "collected"
    | "verified"
    | "completed";

  // 原本必要フラグ
  isRequiredOriginal: boolean; // 原本必要か

  // マスタ書類ID
  masterDocumentId?: string; // 必要書類マスタのIDへの参照

  // 依存関係
  dependsOn?: string[]; // 依存する書類IDの配列
  canCreateAfter?: string[]; // これらの書類が集まった後に作成可能

  // 構造化された説明
  instructions?: {
    // 取得手順
    steps?: string[];
    method?: string; // 取得方法（LINE、郵送、直接取得など）
  };
  requirements?: {
    // 要件
    content?: string[]; // 記載すべき内容
    format?: string; // 書式（自由、所定など）
    deadline?: Date | Timestamp; // 期限
  };
  notes?: string; // その他の備考

  // 実際のファイル情報
  fileUrl?: string; // Cloud StorageのダウンロードURL
  storagePath?: string; // Cloud Storage内のパス

  // メタデータ
  createdAt: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

/**
 * ユーザー（User）の型定義
 */
export interface User {
  id: string; // メールアドレス（FirestoreのドキュメントID）
  email: string;
  displayName: string;
  role: "admin" | "staff"; // ロール
  isActive: boolean; // 有効/無効
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  createdBy?: string; // 作成者のメールアドレス（adminのみ）
}

/**
 * タスク（Task）の型定義
 * 案件に関連する具体的な作業やプロセスを管理
 */
export interface Task {
  id: string;
  title: string; // タスク名（必須）
  description?: string; // 詳細メモ
  assigneeId?: string; // 担当者のユーザーID（メールアドレス）
  status: "todo" | "in_progress" | "awaiting_approval" | "completed";
  priority: "high" | "medium" | "low";
  dueDate?: Date | Timestamp | null; // 期限
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

/**
 * タスクステータスの型定義
 */
export type TaskStatus =
  | "todo"
  | "in_progress"
  | "awaiting_approval"
  | "completed";

/**
 * タスクステータスのラベルマッピング
 */
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "未着手",
  in_progress: "進行中",
  awaiting_approval: "承認待ち",
  completed: "完了",
} as const;

/**
 * タスクステータスのオプション配列
 */
export const TASK_STATUS_OPTIONS: Array<{ value: TaskStatus; label: string }> =
  Object.entries(TASK_STATUS_LABELS).map(([value, label]) => ({
    value: value as TaskStatus,
    label,
  }));

/**
 * タスク優先度の型定義
 */
export type TaskPriority = "high" | "medium" | "low";

/**
 * タスク優先度のラベルマッピング
 */
export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: "高",
  medium: "中",
  low: "低",
} as const;

/**
 * タスク優先度のオプション配列
 */
export const TASK_PRIORITY_OPTIONS: Array<{
  value: TaskPriority;
  label: string;
}> = Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => ({
  value: value as TaskPriority,
  label,
}));

/**
 * 案件操作履歴の型定義
 */
export interface ProjectActivityLog {
  id: string;
  projectId: string; // 案件ID
  actionType: // 操作の種類
    | "project_created" // 案件作成
    | "project_updated" // 案件更新
    | "project_deleted" // 案件削除
    | "document_created" // 書類作成
    | "document_updated" // 書類更新
    | "document_deleted" // 書類削除
    | "document_file_uploaded" // 書類ファイルアップロード
    | "documents_bulk_created" // 書類一括作成
    | "documents_bulk_deleted" // 書類一括削除
    | "task_created" // タスク作成
    | "task_updated" // タスク更新
    | "task_deleted"; // タスク削除
  description: string; // 操作の説明（例: "案件情報を更新しました"）
  details?: {
    // 操作の詳細情報（任意）
    field?: string; // 変更されたフィールド名
    oldValue?: string | number | null; // 変更前の値
    newValue?: string | number | null; // 変更後の値
    documentId?: string; // 関連する書類ID
    documentName?: string; // 関連する書類名
    taskId?: string; // 関連するタスクID
    taskTitle?: string; // 関連するタスク名
    count?: number; // 一括操作の件数
    documentNames?: string[]; // 書類名の配列（一括削除時など）
    fileName?: string; // ファイル名
    title?: { oldValue?: string | null; newValue?: string | null }; // 案件名の変更
    name?: { oldValue?: string | null; newValue?: string | null }; // 氏名の変更
    nationality?: { oldValue?: string | null; newValue?: string | null }; // 国籍の変更
    visaType?: { oldValue?: string | null; newValue?: string | null }; // 在留資格の変更
    expiryDate?: { oldValue?: string | null; newValue?: string | null }; // 在留期限の変更
    status?: { oldValue?: string | null; newValue?: string | null }; // ステータスの変更
    paymentStatus?: { oldValue?: string | null; newValue?: string | null }; // 入金ステータスの変更
  };
  performedBy: string; // 実行したユーザーのメールアドレス
  performedByName?: string; // 実行したユーザーの表示名（オプション）
  createdAt: Date | Timestamp;
}

/**
 * 顧客操作履歴の型定義
 */
export interface CustomerActivityLog {
  id: string;
  customerId: string; // 顧客ID
  actionType: // 操作の種類
    | "customer_created" // 顧客作成
    | "customer_updated" // 顧客更新
    | "customer_deleted"; // 顧客削除
  description: string; // 操作の説明（例: "顧客情報を更新しました"）
  details?: {
    // 操作の詳細情報（任意）
    field?: string; // 変更されたフィールド名
    oldValue?: string | number | null; // 変更前の値
    newValue?: string | number | null; // 変更後の値
    name?: { oldValue?: string | null; newValue?: string | null }; // 氏名の変更
    nationality?: { oldValue?: string | null; newValue?: string | null }; // 国籍の変更
    birthday?: { oldValue?: string | null; newValue?: string | null }; // 生年月日の変更
    gender?: { oldValue?: string | null; newValue?: string | null }; // 性別の変更
    residenceCardNumber?: {
      oldValue?: string | null;
      newValue?: string | null;
    }; // 在留カード番号の変更
    expiryDate?: { oldValue?: string | null; newValue?: string | null }; // 在留期限の変更
    email?: { oldValue?: string | null; newValue?: string | null }; // メールアドレスの変更
    phone?: { oldValue?: string | null; newValue?: string | null }; // 電話番号の変更
    address?: { oldValue?: string | null; newValue?: string | null }; // 住所の変更
    notes?: { oldValue?: string | null; newValue?: string | null }; // 備考の変更
  };
  performedBy: string; // 実行したユーザーのメールアドレス
  performedByName?: string; // 実行したユーザーの表示名（オプション）
  createdAt: Date | Timestamp;
}
