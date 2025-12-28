import { getContacts } from "@/lib/services/contactService";
import ContactList from "./components/ContactList";
import Link from "next/link";

export default async function ContactsPage() {
  const contacts = await getContacts();

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">
              案件一覧
            </h1>
            <p className="text-zinc-600">
              すべての案件を表示しています
            </p>
          </div>
          <Link
            href="/contacts/new"
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium"
          >
            新規
          </Link>
        </div>
        <ContactList contacts={contacts} />
      </div>
    </div>
  );
}
