import { Timestamp } from 'firebase/firestore';

/**
 * 案件（Project）のマスタ型定義
 */
export interface Project {
  id: string;
  name: string;                    // 案件名（必須）
  nameEnglish?: string;            // 英語名（オプション、モックデータのenglishNameに相当）
  nationality: string;             // 国籍（必須）
  visaType: string;                // 申請する在留資格（必須）
  currentVisaType?: string;        // 現在の在留資格（オプション）
  expiryDate: Date | Timestamp | null;  // 有効期限（モックデータのdeadlineに相当）
  status: 'active' | 'pending' | 'completed';  // 統一されたステータス
  organizationId?: string;         // 事務所ID（将来用、オプション）
  createdBy?: string;              // 担当者UID（将来用、オプション）
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

/**
 * 書類（ProjectDocument）の統合型定義
 * 必要書類リストと実際のファイルの両方を統合管理
 */
export interface ProjectDocument {
  id: string;
  projectId: string;               // 案件ID（必須）
  
  // 基本情報
  name: string;                     // 書類名（必須）
  description?: string;             // 書類の説明
  
  // カテゴリーと分類
  category: 'personal' | 'employer' | 'office' | 'government' | 'other';
  
  // 取得元と担当の明確化
  source: 'office' | 'applicant' | 'employer' | 'government' | 'guarantor' | 'other';
  assignedTo: 'office' | 'applicant';
  
  // 年度/期間の指定（年度別書類用）
  year?: number;                    // 年度（例: 2024）
  era?: 'heisei' | 'reiwa';         // 元号
  eraYear?: number;                 // 元号年（例: 令和6年）
  period?: {                        // 期間指定（開始日-終了日）
    start?: Date | Timestamp;
    end?: Date | Timestamp;
  };
  
  // ステータス管理（統一）
  status: 'not_started' | 'in_progress' | 'waiting' | 'collected' | 'verified' | 'completed';
  
  // 原本必要フラグ
  isRequiredOriginal: boolean;      // 原本必要か
  
  // 依存関係
  dependsOn?: string[];            // 依存する書類IDの配列
  canCreateAfter?: string[];       // これらの書類が集まった後に作成可能
  
  // 構造化された説明
  instructions?: {                 // 取得手順
    steps?: string[];
    method?: string;                // 取得方法（LINE、郵送、直接取得など）
  };
  requirements?: {                 // 要件
    content?: string[];            // 記載すべき内容
    format?: string;               // 書式（自由、所定など）
    deadline?: Date | Timestamp;   // 期限
  };
  notes?: string;                  // その他の備考
  
  // 実際のファイル情報
  fileUrl?: string;                // Cloud StorageのダウンロードURL
  storagePath?: string;            // Cloud Storage内のパス
  
  // メタデータ
  createdAt: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

