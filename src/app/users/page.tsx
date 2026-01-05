import { requireAuth } from "@/lib/auth/auth";
import { getUsersAction } from "./actions";
import UsersPageClient from "./components/UsersPageClient";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  // 認証チェック（全員が閲覧可能）
  // requireAuth()は未認証の場合に自動的にログインページにリダイレクトする
  const currentUser = await requireAuth();
  const result = await getUsersAction();

  if (result.error) {
    return (
      <div className="p-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{result.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-900 mb-8">職員管理</h1>
        <UsersPageClient
          initialUsers={result.users || []}
          currentUserId={currentUser.id}
        />
      </div>
    </div>
  );
}
