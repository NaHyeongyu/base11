"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  defaultTrainingPlayerData,
  type CalendarEvent,
  type TrainingTemplate,
} from "@/features/coach-schedule/data/schedule-preview-data";
import { useScheduleStore } from "@/features/coach-schedule/model/schedule-store";
import { ScheduleEventEditor } from "@/features/coach-schedule/schedule-event-editor";
import { TrainingEventEditor } from "@/features/coach-schedule/training-event-editor";
import { Icon } from "@/shared/ui/icon";

const currentDay = 28;
const weekDays = [
  { label: "월", day: 14 },
  { label: "화", day: 15 },
  { label: "수", day: 16 },
  { label: "목", day: 17 },
  { label: "금", day: 18 },
  { label: "토", day: 19 },
  { label: "일", day: 20 },
];

type EditorState = {
  type: "training" | "match";
  day: number;
  seed?: CalendarEvent;
} | null;

function EventCard({ event, compact = false }: { event: CalendarEvent; compact?: boolean }) {
  const displayTitle = event.type === "training" ? "훈련" : event.title;
  return <Link
    aria-label={`${displayTitle} 상세 보기`}
    className={`calendar-pill type-${event.type}`}
    href={`/schedule/${event.id}`}
  >
    <strong>{displayTitle}</strong>
    {!compact && <small>{[event.time, event.duration ? `${event.duration}분` : event.detail].filter(Boolean).join(" · ")}</small>}
  </Link>;
}

function CalendarHeader({
  view,
  events,
  onViewChange,
  onCreate,
}: {
  view: "month" | "week";
  events: CalendarEvent[];
  onViewChange: (view: "month" | "week") => void;
  onCreate: () => void;
}) {
  const trainingCount = events.filter((event) => event.type === "training").length;
  return <>
    <div className="calendar-page-header schedule-crud-header">
      <div>
        <h1>훈련 관리</h1>
        <p>{view === "month" ? "2026년 7월" : "7월 14일–20일"} · 훈련 {trainingCount}개</p>
      </div>
      <div className="schedule-primary-actions">
        <Link className="template-button" href="/schedule/templates"><Icon name="copy" size={15} />훈련 템플릿</Link>
        <button className="training-create-button" onClick={onCreate}><Icon name="plus" size={16} />훈련 등록</button>
      </div>
    </div>
    <div className="calendar-toolbar">
      <div className="calendar-header-actions">
        <button aria-label="이전 기간">‹</button>
        <button className="today">오늘</button>
        <button aria-label="다음 기간">›</button>
      </div>
      <div className="calendar-view-toggle" aria-label="캘린더 보기">
        <button className={view === "month" ? "active" : ""} onClick={() => onViewChange("month")}>월</button>
        <button className={view === "week" ? "active" : ""} onClick={() => onViewChange("week")}>주</button>
      </div>
    </div>
  </>;
}

function MonthView({ events, onCreateAtDay }: { events: CalendarEvent[]; onCreateAtDay: (day: number) => void }) {
  const days = useMemo(() => Array.from({ length: 35 }, (_, index) => index - 2), []);
  return <div className="month-calendar">
    <div className="month-weekdays">{["월", "화", "수", "목", "금", "토", "일"].map((day) => <span key={day}>{day}</span>)}</div>
    <div className="month-days">
      {days.map((day, index) => {
        const visibleDay = day <= 0 ? 30 + day : day > 31 ? day - 31 : day;
        const outside = day <= 0 || day > 31;
        const dayEvents = outside ? [] : events.filter((event) => event.day === day);
        return <article className={`${outside ? "outside" : ""} ${day === currentDay ? "today" : ""}`} key={`${visibleDay}-${index}`}>
          <header>
            <span>{visibleDay}</span>
            {day === currentDay && <em>오늘</em>}
            {!outside && <button className="calendar-day-add" onClick={() => onCreateAtDay(day)} aria-label={`7월 ${day}일 훈련 추가`}><Icon name="plus" size={13} /></button>}
          </header>
          <div>{dayEvents.map((event) => <EventCard event={event} compact={dayEvents.length > 2} key={event.id} />)}</div>
        </article>;
      })}
    </div>
  </div>;
}

function eventPosition(event: CalendarEvent) {
  const [hour = 8, minute = 0] = (event.time ?? "08:00").split(":").map(Number);
  const startMinutes = Math.max(0, hour * 60 + minute - 8 * 60);
  return {
    top: `${startMinutes / (14 * 60) * 100}%`,
    height: `${Math.max(4.4, (event.duration ?? 30) / (14 * 60) * 100)}%`,
  };
}

function WeekView({ events, onCreateAtDay }: { events: CalendarEvent[]; onCreateAtDay: (day: number) => void }) {
  const hours = Array.from({ length: 14 }, (_, index) => `${String(index + 8).padStart(2, "0")}:00`);
  return <div className="week-time-calendar">
    <div className="week-time-head"><span />{weekDays.map((day) => <div key={day.day}><small>{day.label}</small><strong>{day.day}</strong><button onClick={() => onCreateAtDay(day.day)} aria-label={`7월 ${day.day}일 훈련 추가`}><Icon name="plus" size={12} /></button></div>)}</div>
    <div className="week-time-body">
      <div className="week-time-labels">{hours.map((hour) => <span key={hour}>{hour}</span>)}</div>
      {weekDays.map((day) => <div className="week-day-column" key={day.day}>
        {events.filter((event) => event.day === day.day).map((event) => <div className="week-event-position" key={event.id} style={eventPosition(event)}><EventCard event={event} /></div>)}
      </div>)}
      <div className="current-time-line"><i /></div>
    </div>
  </div>;
}

function templateSeed(template: TrainingTemplate): CalendarEvent {
  return {
    id: "new",
    type: "training",
    day: currentDay,
    date: `2026-07-${String(currentDay).padStart(2, "0")}`,
    time: "17:00",
    title: "훈련",
    duration: template.duration,
    intensity: template.intensity,
    location: template.location,
    objective: template.objective,
    coachingPoints: template.coachingPoints,
    memo: template.memo,
    planBlocks: template.planBlocks.map((block) => ({ ...block })),
    playerData: defaultTrainingPlayerData.map((player) => ({ ...player })),
  };
}

export function ScheduleView() {
  const [view, setView] = useState<"month" | "week">("month");
  const [editor, setEditor] = useState<EditorState>(null);
  const [notice, setNotice] = useState("");
  const queryHandled = useRef(false);
  const { events, templates, createEvent, createTemplate } = useScheduleStore();
  const trainingEvents = events.filter((event) => event.type === "training");

  useEffect(() => {
    if (queryHandled.current) return;
    const requestedType = new URLSearchParams(window.location.search).get("create");
    const templateId = new URLSearchParams(window.location.search).get("template");
    if (requestedType === "training" || requestedType === "match") {
      const template = requestedType === "training" ? templates.find((item) => item.id === templateId) : undefined;
      setEditor({ type: requestedType, day: currentDay, seed: template ? templateSeed(template) : undefined });
      queryHandled.current = true;
    }
  }, [templates]);

  function saveEvent(event: CalendarEvent) {
    const { id: _discardedId, ...input } = event;
    createEvent(input);
    setEditor(null);
    setNotice(`${event.type === "training" ? "훈련" : event.title} 일정을 만들었습니다.`);
  }

  return <div className="calendar-page">
    <CalendarHeader
      view={view}
      events={trainingEvents}
      onViewChange={setView}
      onCreate={() => setEditor({ type: "training", day: currentDay })}
    />
    {view === "month"
      ? <MonthView events={trainingEvents} onCreateAtDay={(day) => setEditor({ type: "training", day })} />
      : <WeekView events={trainingEvents} onCreateAtDay={(day) => setEditor({ type: "training", day })} />}
    {notice && <div className="schedule-toast" role="status"><Icon name="check" size={16} />{notice}<button onClick={() => setNotice("")} aria-label="알림 닫기"><Icon name="close" size={14} /></button></div>}

    {editor?.type === "training" && <TrainingEventEditor
      day={editor.day}
      initialEvent={editor.seed}
      templates={templates}
      onClose={() => setEditor(null)}
      onSave={saveEvent}
    />}

    {editor?.type === "match" && <ScheduleEventEditor
      mode="create"
      initialEvent={editor.seed}
      defaultType={editor.type}
      defaultDay={editor.day}
      templates={templates}
      onClose={() => setEditor(null)}
      onSave={saveEvent}
      onSaveTemplate={(template) => {
        createTemplate(template);
        setNotice(`${template.name} 템플릿을 저장했습니다.`);
      }}
    />}
  </div>;
}
