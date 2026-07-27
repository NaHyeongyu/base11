"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { calendarEvents, type CalendarEvent, type CalendarEventType, weekCalendarEvents } from "@/features/coach-schedule/data/schedule-preview-data";
import { Icon } from "@/shared/ui/icon";

const weekDays = [
  { label: "월", day: 14 },
  { label: "화", day: 15 },
  { label: "수", day: 16 },
  { label: "목", day: 17 },
  { label: "금", day: 18 },
  { label: "토", day: 19 },
  { label: "일", day: 20 },
];

const eventLabel: Record<CalendarEventType, string> = {
  training: "훈련",
  match: "경기",
  meeting: "미팅",
  recovery: "회복",
  off: "휴식",
};

function EventCard({ event, compact = false }: { event: CalendarEvent; compact?: boolean }) {
  return <Link
    aria-label={`${event.title} 상세 보기`}
    className={`calendar-pill type-${event.type}`}
    href={`/schedule/${event.id}`}
  >
    <strong>{event.title}</strong>
    {!compact && <small>{[event.time, event.duration ? `${event.duration}분` : event.detail].filter(Boolean).join(" · ")}</small>}
  </Link>;
}

function CalendarHeader({ view, onViewChange }: { view: "month" | "week"; onViewChange: (view: "month" | "week") => void }) {
  return <div className="calendar-page-header">
    <div>
      <h1>{view === "month" ? "2026년 7월" : "7월 14일–20일"}</h1>
      <p>{view === "month" ? "훈련·경기·미팅·휴식 일정을 월간 흐름으로 확인합니다." : "한 주의 시간대별 세션과 운영 충돌을 확인합니다."}</p>
    </div>
    <div className="calendar-header-actions">
      <button aria-label="이전 기간">‹</button><button aria-label="다음 기간">›</button><button className="today">오늘</button>
      <div className="calendar-view-toggle" aria-label="캘린더 보기">
        <button className={view === "month" ? "active" : ""} onClick={() => onViewChange("month")}>월</button>
        <button className={view === "week" ? "active" : ""} onClick={() => onViewChange("week")}>주</button>
      </div>
    </div>
  </div>;
}

function CalendarLegend() {
  return <div className="calendar-legend"><strong>FC 안양 U18 · 전체 일정</strong><div>{(["training", "match", "meeting", "recovery"] as CalendarEventType[]).map((type) => <span key={type}><i className={`type-${type}`} />{eventLabel[type]}</span>)}</div></div>;
}

function MonthView() {
  const days = useMemo(() => Array.from({ length: 35 }, (_, index) => index - 2), []);
  return <div className="month-calendar">
    <div className="month-weekdays">{["월", "화", "수", "목", "금", "토", "일"].map((day) => <span key={day}>{day}</span>)}</div>
    <div className="month-days">
      {days.map((day, index) => {
        const visibleDay = day <= 0 ? 30 + day : day > 31 ? day - 31 : day;
        const outside = day <= 0 || day > 31;
        const events = outside ? [] : calendarEvents.filter((event) => event.day === day);
        return <article className={`${outside ? "outside" : ""} ${day === 18 ? "today" : ""}`} key={`${visibleDay}-${index}`}>
          <header><span>{visibleDay}</span>{day === 18 && <em>오늘</em>}</header>
          <div>{events.map((event) => <EventCard event={event} compact={events.length > 2} key={event.id} />)}</div>
        </article>;
      })}
    </div>
  </div>;
}

function WeekView() {
  const hours = Array.from({ length: 14 }, (_, index) => `${String(index + 8).padStart(2, "0")}:00`);
  return <div className="week-time-calendar">
    <div className="week-time-head"><span />{weekDays.map((day) => <div className={day.day === 18 ? "today" : ""} key={day.day}><small>{day.label}</small><strong>{day.day}</strong></div>)}</div>
    <div className="week-time-body">
      <div className="week-time-labels">{hours.map((hour) => <span key={hour}>{hour}</span>)}</div>
      {weekDays.map((day) => <div className={`week-day-column ${day.day === 18 ? "today" : ""}`} key={day.day}>
        {weekCalendarEvents.filter((event) => event.day === day.day).map((event) => <div className="week-event-position" key={event.id} style={{ top: `${event.top}%`, height: `${event.height}%` }}><EventCard event={event} /></div>)}
      </div>)}
      <div className="current-time-line"><i /></div>
    </div>
  </div>;
}

export function ScheduleView() {
  const [view, setView] = useState<"month" | "week">("month");
  return <div className="calendar-page">
    <CalendarHeader view={view} onViewChange={setView} />
    <CalendarLegend />
    {view === "month" ? <MonthView /> : <WeekView />}
    <div className="calendar-footnote"><Icon name="calendar" size={15} /><span>훈련·경기를 선택하면 선수 상태, GPS, 메모와 바로 피드백이 연결된 세션 상세로 이동합니다.</span></div>
  </div>;
}
