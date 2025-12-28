import { Contact } from "@/lib/types/contact";
import Link from "next/link";

interface ContactListProps {
  contacts: Contact[];
}

export default function ContactList({ contacts }: ContactListProps) {
  if (contacts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-600">
          案件がありません
        </p>
      </div>
    );
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
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-white">
        <thead>
          <tr className="border-b border-zinc-200">
            <th className="px-4 py-3 text-left text-sm font-semibold text-black">
              タイトル
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-black">
              クライアント
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-black">
              ステータス
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-black">
              期限
            </th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr
              key={contact.id}
              className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/contacts/${contact.id}`}
                  className="text-black font-medium hover:text-zinc-700"
                >
                  {contact.title}
                </Link>
              </td>
              <td className="px-4 py-3 text-zinc-700">
                {contact.client}
              </td>
              <td className="px-4 py-3">
                {contact.status ? (
                  <span className="px-2 py-1 text-xs rounded-full bg-zinc-100 text-black">
                    {contact.status}
                  </span>
                ) : (
                  <span className="text-zinc-400">-</span>
                )}
              </td>
              <td className="px-4 py-3 text-zinc-700">
                {formatDate(contact.deadline)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
