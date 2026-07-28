"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  defaultTrainingPlayerData,
  type CalendarEvent,
  type CalendarEventType,
  type TrainingTemplate,
} from "@/features/coach-schedule/data/schedule-preview-data";
import { useScheduleStore } from "@/features/coach-schedule/model/schedule-store";
import { ScheduleEventEditor } from "@/features/coach-schedule/schedule-event-editor";
import { TrainingTemplateLibrary } from "@/features/coach-schedule/training-template-library";
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

const eventLabel: Record<CalendarEventType, string> = {
  training: "훈련",
  match: "경기",
  meeting: "미팅",
  recovery: "회복",
  off: "휴식",
};

type EditorState = {
  type: "training" | "match";
  day: number;
  seed?: CalendarEvent;
} | null;

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

function CalendarHeader({
  view,
  onViewChange,
  onCreate,
  onOpenTemplates,
}: {
  view: "month" | "week";
  onViewChange: (view: "month" | "week") => void;
  onCreate: (type: "training" | "match") => void;
  onOpenTemplates: () => void;
}) {
  return <div className="calendar-page-header schedule-crud-header">
    <div>
      <h1>{view === "month" ? "2026년 7월" : "7월 14일–20일"}</h1>
      <p>{view === "month" ? "훈련·경기를 만들고 월간 운영 흐름을 관리합니다." : "한 주의 시간대별 세션과 운영 충돌을 확인합니다."}</p>
    </div>
    <div className="schedule-primary-actions">
      <button className="template-button" onClick={onOpenTemplates}><Icon name="download" size={16} />훈련 템플릿</button>
      <button className="match-create-button" onClick={() => onCreate("match")}><Icon name="match" size={16} />경기 추가</button>
      <button className="training-create-button" onClick={() => onCreate("training")}><Icon name="plus" size={16} />훈련 추가</button>
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

function CalendarLegend({ events }: { events: CalendarEvent[] }) {
  const trainingCount = events.filter((event) => event.type === "training").length;
  const matchCount = events.filter((event) => event.type === "match").length;
  return <div className="calendar-legend">
    <strong>FC 안양 U18 · 전체 일정 <small>훈련 {trainingCount} · 경기 {matchCount}</small></strong>
    <div>{(["training", "match", "meeting", "recovery"] as CalendarEventType[]).map((type) => <span key={type}><i className={`type-${type}`} />{eventLabel[type]}</span>)}</div>
  </div>;
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
    time: "17:00",
    title: template.title,
    duration: template.duration,
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
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const { events, templates, createEvent, createTemplate, deleteTemplate } = useScheduleStore();

  function saveEvent(event: CalendarEvent) {
    const { id: _discardedId, ...input } = event;
    createEvent(input);
    setEditor(null);
    setNotice(`${event.title} 일정을 만들었습니다.`);
  }

  return <div className="calendar-page">
    <CalendarHeader
      view={view}
      onViewChange={setView}
      onCreate={(type) => setEditor({ type, day: currentDay })}
      onOpenTemplates={() => setTemplatesOpen(true)}
    />
    <CalendarLegend events={events} />
    {view === "month"
      ? <MonthView events={events} onCreateAtDay={(day) => setEditor({ type: "training", day })} />
      : <WeekView events={events} onCreateAtDay={(day) => setEditor({ type: "training", day })} />}
    <div className="calendar-footnote"><Icon name="calendar" size={15} /><span>일정을 선택하면 훈련·경기 데이터 편집, 선수별 퀵 피드백, 삭제까지 상세에서 관리할 수 있습니다.</span></div>
    {notice && <div className="schedule-toast" role="status"><Icon name="check" size={16} />{notice}<button onClick={() => setNotice("")} aria-label="알림 닫기"><Icon name="close" size={14} /></button></div>}

    {editor && <ScheduleEventEditor
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

    {templatesOpen && <TrainingTemplateLibrary
      templates={templates}
      onClose={() => setTemplatesOpen(false)}
      onDelete={(id) => {
        deleteTemplate(id);
        setNotice("내 템플릿을 삭제했습니다.");
      }}
      onUse={(template) => {
        setTemplatesOpen(false);
        setEditor({ type: "training", day: currentDay, seed: templateSeed(template) });
      }}
    />}
  </div>;
}
