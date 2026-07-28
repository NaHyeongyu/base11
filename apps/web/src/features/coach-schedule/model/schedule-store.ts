"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  calendarEvents,
  defaultTrainingPlan,
  defaultTrainingPlayerData,
  initialTrainingTemplates,
  weekCalendarEvents,
  type CalendarEvent,
  type TrainingTemplate,
} from "@/features/coach-schedule/data/schedule-preview-data";

const EVENT_STORAGE_KEY = "base11.coach.schedule.events.v1";
const TEMPLATE_STORAGE_KEY = "base11.coach.schedule.templates.v1";

function cloneEvent(event: CalendarEvent): CalendarEvent {
  return {
    ...event,
    planBlocks: event.planBlocks?.map((block) => ({ ...block })),
    playerData: event.playerData?.map((player) => ({ ...player })),
  };
}

function normalizeEvent(event: CalendarEvent): CalendarEvent {
  if (event.type !== "training") return cloneEvent(event);
  return {
    ...cloneEvent(event),
    location: event.location ?? "보조구장",
    objective: event.objective ?? `${event.title}의 핵심 원칙을 반복하고 경기 상황에 연결합니다.`,
    coachingPoints: event.coachingPoints ?? "받기 전 시야 확보 / 첫 터치 방향 / 행동 후 빠른 전환",
    memo: event.memo ?? "세션 전 제한 참여 선수와 부상 상태를 다시 확인합니다.",
    planBlocks: event.planBlocks?.length ? event.planBlocks.map((block) => ({ ...block })) : defaultTrainingPlan.map((block) => ({ ...block })),
    playerData: event.playerData?.length ? event.playerData.map((player) => ({ ...player })) : defaultTrainingPlayerData.map((player) => ({ ...player })),
  };
}

function buildInitialEvents() {
  const seen = new Set<string>();
  return [...calendarEvents, ...weekCalendarEvents]
    .filter((event) => {
      if (seen.has(event.id)) return false;
      seen.add(event.id);
      return true;
    })
    .map(normalizeEvent);
}

function cloneTemplate(template: TrainingTemplate): TrainingTemplate {
  return { ...template, planBlocks: template.planBlocks.map((block) => ({ ...block })) };
}

function readStoredValue<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeStoredValue<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function createId(prefix: string) {
  const suffix = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Date.now().toString(36);
  return `${prefix}-${suffix}`;
}

export function useScheduleStore() {
  const [events, setEvents] = useState<CalendarEvent[]>(buildInitialEvents);
  const [templates, setTemplates] = useState<TrainingTemplate[]>(() => initialTrainingTemplates.map(cloneTemplate));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedEvents = readStoredValue<CalendarEvent[]>(EVENT_STORAGE_KEY, buildInitialEvents()).map(normalizeEvent);
    const storedTemplates = readStoredValue<TrainingTemplate[]>(TEMPLATE_STORAGE_KEY, initialTrainingTemplates).map(cloneTemplate);
    setEvents(storedEvents);
    setTemplates(storedTemplates);
    setHydrated(true);
  }, []);

  const commitEvents = useCallback((updater: (current: CalendarEvent[]) => CalendarEvent[]) => {
    setEvents((current) => {
      const next = updater(current);
      writeStoredValue(EVENT_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const commitTemplates = useCallback((updater: (current: TrainingTemplate[]) => TrainingTemplate[]) => {
    setTemplates((current) => {
      const next = updater(current);
      writeStoredValue(TEMPLATE_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const createEvent = useCallback((event: Omit<CalendarEvent, "id">) => {
    const id = createId(event.type);
    const created = normalizeEvent({ ...event, id });
    commitEvents((current) => [...current, created]);
    return id;
  }, [commitEvents]);

  const updateEvent = useCallback((id: string, updates: Partial<CalendarEvent>) => {
    commitEvents((current) => current.map((event) => event.id === id ? normalizeEvent({ ...event, ...updates, id }) : event));
  }, [commitEvents]);

  const deleteEvent = useCallback((id: string) => {
    commitEvents((current) => current.filter((event) => event.id !== id));
  }, [commitEvents]);

  const createTemplate = useCallback((template: Omit<TrainingTemplate, "id" | "builtIn">) => {
    const created: TrainingTemplate = { ...template, id: createId("template"), builtIn: false };
    commitTemplates((current) => [...current, created]);
    return created.id;
  }, [commitTemplates]);

  const deleteTemplate = useCallback((id: string) => {
    commitTemplates((current) => current.filter((template) => template.id !== id || template.builtIn));
  }, [commitTemplates]);

  const eventsById = useMemo(() => new Map(events.map((event) => [event.id, event])), [events]);

  return {
    events,
    eventsById,
    templates,
    hydrated,
    createEvent,
    updateEvent,
    deleteEvent,
    createTemplate,
    deleteTemplate,
  };
}
