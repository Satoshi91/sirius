"use server";

import { getCalendarEvents } from "@/lib/services/calendarService";

/**
 * カレンダーイベントを取得するServer Action
 * @param startDate ISO date string (YYYY-MM-DD)
 * @param endDate ISO date string (YYYY-MM-DD)
 * @returns カレンダーイベントの配列
 */
export async function getCalendarEventsAction(
  startDate: string,
  endDate: string
) {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // 日付の検証
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return {
        error: "無効な日付形式です",
        events: [],
      };
    }
    
    const events = await getCalendarEvents(start, end);
    
    return {
      success: true,
      events,
    };
  } catch (error) {
    console.error("Error in getCalendarEventsAction:", error);
    return {
      error: "カレンダーイベントの取得に失敗しました",
      events: [],
    };
  }
}

