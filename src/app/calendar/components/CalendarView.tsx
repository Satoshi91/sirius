"use client";

import { useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg } from "@fullcalendar/core";
import jaLocale from "@fullcalendar/core/locales/ja";
import { useRouter } from "next/navigation";
import { getCalendarEventsAction } from "../actions";
import { CalendarEvent } from "@/lib/services/calendarService";

export default function CalendarView() {
  const router = useRouter();
  const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // カレンダーイベントを取得
  const fetchEvents = async (start: Date, end: Date) => {
    try {
      setLoading(true);
      const startStr = start.toISOString().split('T')[0];
      const endStr = end.toISOString().split('T')[0];
      
      const result = await getCalendarEventsAction(startStr, endStr);
      
      if (result.error) {
        console.error("Error fetching events:", result.error);
        setEvents([]);
      } else {
        setEvents(result.events || []);
      }
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // カレンダーの表示期間が変更されたときにイベントを取得
  const handleDatesSet = (arg: { start: Date; end: Date }) => {
    fetchEvents(arg.start, arg.end);
  };

  // イベントクリック時の処理
  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    const customerId = event.extendedProps.customerId;
    
    if (customerId) {
      router.push(`/customers/${customerId}`);
    }
  };

  // FullCalendar用のイベント形式に変換
  const calendarEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: event.start,
    color: event.color,
    extendedProps: {
      customerId: event.customerId,
      projectId: event.projectId,
      eventType: event.eventType,
    },
  }));

  return (
    <div className="w-full">
      {loading && (
        <div className="mb-4 text-center text-gray-600">
          読み込み中...
        </div>
      )}
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth",
        }}
        locale={jaLocale}
        events={calendarEvents}
        eventClick={handleEventClick}
        datesSet={handleDatesSet}
        height="auto"
        contentHeight="auto"
        aspectRatio={1.8}
        eventDisplay="block"
        dayMaxEvents={true}
        moreLinkClick="popover"
        buttonText={{
          today: "今日",
          month: "月",
          week: "週",
          day: "日",
        }}
        titleFormat={{
          year: "numeric",
          month: "long",
        }}
      />
    </div>
  );
}

