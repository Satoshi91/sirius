"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Customer } from "@/types";
import { deleteCustomerDocumentAction } from "../../actions";
import { toast } from "sonner";
import { Upload, X, Eye } from "lucide-react";
import Image from "next/image";
import CustomerDocumentUploadModal from "./CustomerDocumentUploadModal";

interface CustomerDocumentsSectionProps {
  customerId: string;
  customer: Customer;
}

export default function CustomerDocumentsSection({
  customerId,
  customer,
}: CustomerDocumentsSectionProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const documents = customer.documents || [];

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

  const handleUploadSuccess = () => {
    router.refresh();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>重要書類</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* アップロードボタン */}
            <div className="border-b pb-6">
              <Button
                onClick={() => setIsModalOpen(true)}
                className="w-full md:w-auto"
              >
                <Upload className="mr-2 h-4 w-4" />
                新規登録
              </Button>
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
                            {doc.fileUrl.match(
                              /\.(jpg|jpeg|png|gif|webp)$/i
                            ) ? (
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
                                  <p className="text-xs text-zinc-500">
                                    PDFファイル
                                  </p>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-black">
                            {doc.label}
                          </p>
                          <p className="text-xs text-zinc-500 truncate">
                            {doc.fileName}
                          </p>
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

      {/* ファイルアップロードモーダル */}
      <CustomerDocumentUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customerId={customerId}
        onSuccess={handleUploadSuccess}
      />

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
