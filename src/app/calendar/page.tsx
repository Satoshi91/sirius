import { requireAuth } from "@/lib/auth/auth";
import CalendarView from "./components/CalendarView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  await requireAuth();

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">期限管理カレンダー</CardTitle>
          </CardHeader>
          <CardContent>
            <CalendarView />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
