"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Modal from "@/components/Modal";
import {
  uploadCustomerDocumentFile,
  saveCustomerDocumentMetadata,
} from "@/lib/services/customerService";
import { CustomerDocument } from "@/types";
import { toast } from "sonner";
import { Upload, X, Loader2, Image as ImageIcon, FileText } from "lucide-react";
import Image from "next/image";

const LABEL_OPTIONS = [
  { value: "passport", label: "パスポート" },
  { value: "residence_card_front", label: "在留カード表面" },
  { value: "residence_card_back", label: "在留カード裏面" },
  { value: "other", label: "その他" },
];

interface CustomerDocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  onSuccess: () => void;
}

export default function CustomerDocumentUploadModal({
  isOpen,
  onClose,
  customerId,
  onSuccess,
}: CustomerDocumentUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedFileInfo, setUploadedFileInfo] = useState<{
    fileUrl: string;
    storagePath: string;
    uuid: string;
  } | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string>("");
  const [customLabel, setCustomLabel] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  // モーダルを閉じる際にリセット
  const handleClose = useCallback(() => {
    if (!isUploading && !isRegistering) {
      setSelectedFile(null);
      setUploadedFileUrl(null);
      setUploadedFileInfo(null);
      setSelectedLabel("");
      setCustomLabel("");
      setIsDragging(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onClose();
    }
  }, [isUploading, isRegistering, onClose]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadedFileUrl(null);
      setUploadedFileInfo(null);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.type.startsWith("image/") || file.type === "application/pdf") {
        setSelectedFile(file);
        setUploadedFileUrl(null);
        setUploadedFileInfo(null);
      } else {
        toast.error("画像ファイルまたはPDFファイルを選択してください");
      }
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const result = await uploadCustomerDocumentFile(customerId, selectedFile);
      setUploadedFileUrl(result.fileUrl);
      setUploadedFileInfo(result);
      toast.success("ファイルをアップロードしました");
    } catch (error) {
      console.error("Error uploading file:", error);
      if (error instanceof Error) {
        toast.error(`ファイルのアップロードに失敗しました: ${error.message}`);
      } else {
        toast.error(
          "ファイルのアップロードに失敗しました。もう一度お試しください。"
        );
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRegister = async () => {
    if (!uploadedFileInfo || !selectedFile) return;

    // ラベルの決定
    let label = "";
    if (selectedLabel === "other") {
      label = customLabel.trim();
      if (!label) {
        toast.error("ラベルを入力してください");
        return;
      }
    } else {
      const option = LABEL_OPTIONS.find((opt) => opt.value === selectedLabel);
      label = option?.label || "";
      if (!label) {
        toast.error("ラベルを選択してください");
        return;
      }
    }

    setIsRegistering(true);
    try {
      const documentData: CustomerDocument = {
        id: uploadedFileInfo.uuid,
        label: label,
        fileUrl: uploadedFileInfo.fileUrl,
        storagePath: uploadedFileInfo.storagePath,
        fileName: selectedFile.name,
        uploadedAt: new Date(),
      };

      await saveCustomerDocumentMetadata(customerId, documentData);
      toast.success("重要書類を登録しました");
      handleClose();
      onSuccess();
    } catch (error) {
      console.error("Error registering document:", error);
      if (error instanceof Error) {
        toast.error(`登録に失敗しました: ${error.message}`);
      } else {
        toast.error("登録に失敗しました。もう一度お試しください。");
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const isImage = uploadedFileUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="重要書類をアップロード">
      <div className="space-y-6">
        {/* ファイル選択エリア */}
        {!uploadedFileUrl && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                ファイル <span className="text-red-500">*</span>
              </label>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? "border-blue-500 bg-blue-50"
                    : "border-zinc-300 hover:border-zinc-400"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                {selectedFile ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      {selectedFile.type.startsWith("image/") ? (
                        <ImageIcon className="h-12 w-12 text-blue-500" />
                      ) : (
                        <FileText className="h-12 w-12 text-blue-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-black">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="w-full"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          アップロード中...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          ファイルをアップロード
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      disabled={isUploading}
                      className="w-full"
                    >
                      別のファイルを選択
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 mx-auto text-zinc-400" />
                    <div>
                      <p className="text-sm text-zinc-600 mb-2">
                        ファイルをドラッグ＆ドロップするか、
                      </p>
                      <Button
                        onClick={handleFileSelect}
                        disabled={isUploading}
                        variant="outline"
                      >
                        ファイルを選択
                      </Button>
                    </div>
                    <p className="text-xs text-zinc-500">
                      対応形式: 画像ファイル (JPG, PNG, GIF等) または PDF
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* アップロード完了後の確認・情報入力エリア */}
        {uploadedFileUrl && (
          <div className="space-y-6">
            {/* アップロード完了メッセージ */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800 font-medium">
                ✓ ファイルのアップロードが完了しました
              </p>
            </div>

            {/* プレビュー */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                アップロードしたファイル
              </label>
              <div className="border border-zinc-200 rounded-lg p-4">
                <div className="aspect-video relative bg-zinc-100 rounded overflow-hidden mb-4">
                  {isImage ? (
                    <Image
                      src={uploadedFileUrl}
                      alt="Uploaded file"
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 500px"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <FileText className="h-8 w-8 mx-auto mb-2 text-zinc-400" />
                        <p className="text-xs text-zinc-500">PDFファイル</p>
                        <p className="text-xs text-zinc-400 mt-1">
                          {selectedFile?.name}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-zinc-600 truncate">
                  {selectedFile?.name}
                </p>
              </div>
            </div>

            {/* ラベル入力 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  ラベル <span className="text-red-500">*</span>
                </label>
                <Select
                  value={selectedLabel}
                  onValueChange={setSelectedLabel}
                  disabled={isRegistering}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="ラベルを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {LABEL_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedLabel === "other" && (
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    カスタムラベル <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    placeholder="ラベルを入力"
                    disabled={isRegistering}
                  />
                </div>
              )}
            </div>

            {/* アクションボタン */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={handleRegister}
                disabled={
                  isRegistering ||
                  !selectedLabel ||
                  (selectedLabel === "other" && !customLabel.trim())
                }
                className="flex-1"
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    登録中...
                  </>
                ) : (
                  "登録"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setUploadedFileUrl(null);
                  setUploadedFileInfo(null);
                  setSelectedFile(null);
                  setSelectedLabel("");
                  setCustomLabel("");
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                disabled={isRegistering}
              >
                やり直す
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
