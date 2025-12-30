"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Customer } from "@/types";
import { uploadCustomerDocumentAction, deleteCustomerDocumentAction } from "../../actions";
import { toast } from "sonner";
import { Upload, X, Eye, Loader2 } from "lucide-react";
import Image from "next/image";

interface CustomerDocumentsSectionProps {
  customerId: string;
  customer: Customer;
}

const LABEL_OPTIONS = [
  { value: "passport", label: "パスポート" },
  { value: "residence_card_front", label: "在留カード表面" },
  { value: "residence_card_back", label: "在留カード裏面" },
  { value: "other", label: "その他" },
];

export default function CustomerDocumentsSection({
  customerId,
  customer,
}: CustomerDocumentsSectionProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string>("");
  const [customLabel, setCustomLabel] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const documents = customer.documents || [];

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("label", label);

      const result = await uploadCustomerDocumentAction(customerId, formData);
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success("ファイルをアップロードしました");
        router.refresh();
        // フォームをリセット
        setSelectedLabel("");
        setCustomLabel("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("ファイルのアップロードに失敗しました");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm("このファイルを削除してもよろしいですか？")) {
      return;
    }

    try {
      const result = await deleteCustomerDocumentAction(customerId, documentId);
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success("ファイルを削除しました");
        router.refresh();
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("ファイルの削除に失敗しました");
    }
  };

  const handlePreview = (fileUrl: string) => {
    setPreviewUrl(fileUrl);
  };

  const closePreview = () => {
    setPreviewUrl(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>重要書類</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* アップロードフォーム */}
            <div className="space-y-4 border-b pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    ラベル <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={selectedLabel}
                    onValueChange={setSelectedLabel}
                    disabled={isUploading}
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
                      disabled={isUploading}
                    />
                  </div>
                )}

                <div className={selectedLabel === "other" ? "md:col-span-2" : ""}>
                  <label className="block text-sm font-medium text-black mb-2">
                    ファイル <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={isUploading}
                    />
                    <Button
                      type="button"
                      onClick={handleFileSelect}
                      disabled={isUploading || !selectedLabel || (selectedLabel === "other" && !customLabel.trim())}
                      className="flex-1"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          アップロード中...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          ファイルを選択
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* アップロード済みファイル一覧 */}
            {documents.length > 0 ? (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">
                  アップロード済み ({documents.length}件)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="border border-zinc-200 rounded-lg p-4 space-y-3"
                    >
                      <div className="aspect-video relative bg-zinc-100 rounded overflow-hidden">
                        {doc.fileUrl && (
                          <>
                            {doc.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                              <Image
                                src={doc.fileUrl}
                                alt={doc.label}
                                fill
                                className="object-contain"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                  <Eye className="h-8 w-8 mx-auto mb-2 text-zinc-400" />
                                  <p className="text-xs text-zinc-500">PDFファイル</p>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-black">{doc.label}</p>
                          <p className="text-xs text-zinc-500 truncate">{doc.fileName}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreview(doc.fileUrl)}
                            className="flex-1"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            プレビュー
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(doc.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-500">
                <p>アップロード済みのファイルはありません</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* プレビューモーダル */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={closePreview}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-4 right-4 z-10">
              <Button
                variant="outline"
                size="icon"
                onClick={closePreview}
                className="bg-white/90 hover:bg-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              {previewUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <div className="relative w-full h-[80vh]">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-contain"
                    sizes="90vw"
                  />
                </div>
              ) : (
                <iframe
                  src={previewUrl}
                  className="w-full h-[80vh] border-0"
                  title="Preview"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

