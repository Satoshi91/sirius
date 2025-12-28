import { getContact } from "@/lib/services/contactService";
import { getRequiredDocumentsByContactId } from "@/lib/services/requiredDocumentService";
import { notFound } from "next/navigation";
import Link from "next/link";
import RequiredDocumentList from "./components/RequiredDocumentList";

interface ContactDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ContactDetailPage({ params }: ContactDetailPageProps) {
  const { id } = await params;
  const contact = await getContact(id);

  if (!contact) {
    notFound();
  }

  let requiredDocuments = [];
  try {
    requiredDocuments = await getRequiredDocumentsByContactId(id);
  } catch (error) {
    console.error("Error fetching required documents:", error);
    // エラーが発生した場合は空配列を使用
    requiredDocuments = [];
  }

  const formatDate = (date: Date | null | undefined): string => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/contacts"
            className="text-zinc-600 hover:text-black transition-colors"
          >
            ← 案件一覧に戻る
          </Link>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-black mb-2">
              {contact.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-zinc-600">
              <span>作成日: {formatDate(contact.createdAt)}</span>
              {contact.updatedAt && contact.createdAt?.getTime() !== contact.updatedAt?.getTime() && (
                <span>更新日: {formatDate(contact.updatedAt)}</span>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-zinc-700 mb-2">クライアント</h2>
              <p className="text-black">{contact.client}</p>
            </div>

            {contact.applicant && (
              <div>
                <h2 className="text-sm font-semibold text-zinc-700 mb-2">申請人</h2>
                <p className="text-black">{contact.applicant}</p>
              </div>
            )}

            {contact.residenceStatus && (
              <div>
                <h2 className="text-sm font-semibold text-zinc-700 mb-2">在留資格</h2>
                <p className="text-black">{contact.residenceStatus}</p>
              </div>
            )}

            {contact.status && (
              <div>
                <h2 className="text-sm font-semibold text-zinc-700 mb-2">ステータス</h2>
                <span className="px-3 py-1 text-sm rounded-full bg-zinc-100 text-black inline-block">
                  {contact.status}
                </span>
              </div>
            )}

            {contact.deadline && (
              <div>
                <h2 className="text-sm font-semibold text-zinc-700 mb-2">期限</h2>
                <p className="text-black">{formatDate(contact.deadline)}</p>
              </div>
            )}

            {contact.description && (
              <div>
                <h2 className="text-sm font-semibold text-zinc-700 mb-2">説明</h2>
                <p className="text-black whitespace-pre-wrap">{contact.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* 必要書類一覧セクション */}
        <RequiredDocumentList
          contactId={id}
          requiredDocuments={requiredDocuments}
        />
      </div>
    </div>
  );
}
