"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  calendarEvents,
  defaultMatchPlayerData,
  defaultTrainingPlan,
  defaultTrainingPlayerData,
  initialTrainingDrills,
  initialTrainingTemplates,
  matchMoments,
  weekCalendarEvents,
  type CalendarEvent,
  type TrainingDrill,
  type TrainingTemplate,
} from "@/features/coach-schedule/data/schedule-preview-data";
import { toConditionScore } from "@/features/players/model/player";

const EVENT_STORAGE_KEY = "base11.coach.schedule.events.v4";
const TEMPLATE_STORAGE_KEY = "base11.coach.schedule.templates.v3";
const DRILL_STORAGE_KEY = "base11.coach.schedule.drills.v1";

const featuredMatchPositions: Record<number, string> = {
  1: "GK",
  2: "LB",
  4: "CB",
  18: "CB",
  8: "RB",
  14: "DM",
  20: "CM",
  10: "AM",
  7: "RW",
  9: "ST",
  11: "LW",
};

function cloneEvent(event: CalendarEvent): CalendarEvent {
  return {
    ...event,
    matchMoments: event.matchMoments?.map((moment) => ({ ...moment })),
    matchPlayerData: event.matchPlayerData?.map((player) => ({ ...player })),
    trainingExceptions: event.trainingExceptions?.map((exception) => ({ ...exception })),
    planBlocks: event.planBlocks?.map((block) => ({
      ...block,
      keyPoints: block.keyPoints ? [...block.keyPoints] : undefined,
      board: block.board ? {
        pitchPreset: block.board.pitchPreset ?? "full",
        items: block.board.items.map((item) => ({ ...item })),
        lines: block.board.lines.map((line) => ({ ...line, points: line.points?.map((point) => ({ ...point })) })),
      } : undefined,
    })),
    playerData: event.playerData?.map((player) => ({ ...player })),
  };
}

function normalizeEvent(event: CalendarEvent): CalendarEvent {
  if (event.type === "match") {
    const featuredMatch = event.id === "match-20260720";
    const operationalStatus = event.matchStatus === "경기 진행" || event.matchStatus === "진행 중" || event.matchStatus === "정리 필요" || event.matchStatus === "결과 확인" || event.matchStatus === "완료" || event.matchStatus === "연기" || event.matchStatus === "취소";
    const publishedByUser = event.matchPublicationStatus === "공개" && (event.playerReadCount ?? 0) <= 1;
    const previewStatus = operationalStatus || publishedByUser ? event.matchStatus : event.id === "match-0725" ? "정리 필요"
      : event.id === "match-0728" ? "팀 공개"
        : event.id === "match-0731" ? "지도자 공유"
          : undefined;
    const matchStatus = previewStatus ?? event.matchStatus ?? (event.day <= 20 ? "완료" : "팀 공개");
    const completed = matchStatus === "완료" || matchStatus === "결과 확인" || matchStatus === "정리 필요";
    const seededUnpublished = (event.id === "match-0725" && matchStatus === "정리 필요") || (event.id === "match-0731" && matchStatus === "지도자 공유");
    return {
      ...cloneEvent(event),
      date: event.date ?? `2026-07-${String(event.day).padStart(2, "0")}`,
      opponent: event.opponent ?? (featuredMatch ? "수원 FC U15" : "상대 팀"),
      competition: event.competition ?? event.detail ?? "경기",
      matchStatus,
      homeScore: event.homeScore ?? (featuredMatch ? 2 : event.id === "match-0725" ? 3 : 0),
      awayScore: event.awayScore ?? (featuredMatch ? 1 : event.id === "match-0725" ? 2 : 0),
      formation: event.formation ?? "4-3-3",
      homeAway: event.homeAway ?? (event.id === "match-0728" || event.id === "match-0731" ? "중립" : event.detail?.includes("원정") ? "원정" : event.detail?.includes("중립") ? "중립" : "홈"),
      gatheringTime: event.gatheringTime ?? (event.id === "match-0728" ? "07:40" : event.time ? "킥오프 2시간 30분 전" : "미정"),
      gatheringPlace: event.gatheringPlace ?? (event.id === "match-0728" ? "충주 숙소 1층 로비" : event.location ?? "미정"),
      matchEquipment: event.matchEquipment ?? "팀 유니폼 · 축구화 · 개인 물통",
      matchObjective: event.matchObjective ?? "경기 초반 압박 방향을 맞추고 볼을 되찾은 뒤 빠르게 전진합니다.",
      matchCoachNote: event.matchCoachNote ?? "선발 명단과 참가 제한 선수를 공개 전에 다시 확인합니다.",
      matchReviewStatus: event.matchReviewStatus ?? (event.id === "match-0728" || completed ? "확인 완료" : "검토 요청"),
      matchPublicationStatus: seededUnpublished ? "미공개" : event.matchPublicationStatus ?? (matchStatus === "작성 중" || matchStatus === "지도자 공유" ? "미공개" : "공개"),
      playerReadCount: seededUnpublished ? 0 : event.playerReadCount ?? (completed ? 24 : 21),
      parentReadCount: seededUnpublished ? 0 : event.parentReadCount ?? (completed ? 23 : 19),
      memo: event.memo ?? "경기에서 확인한 전술 변화와 다음 훈련에 반영할 내용을 기록합니다.",
      matchMoments: (event.matchMoments?.length ? event.matchMoments : featuredMatch ? matchMoments : []).map((moment) => ({ ...moment })),
      matchPlayerData: (event.matchPlayerData?.length ? event.matchPlayerData : defaultMatchPlayerData).map((player) => ({
        ...player,
        position: featuredMatch ? featuredMatchPositions[player.number] ?? player.position : player.position,
        minutes: completed ? player.minutes : 0,
        distance: completed ? player.distance : null,
        hsr: completed ? player.hsr : null,
        sprints: completed ? player.sprints : null,
        maxSpeed: completed ? player.maxSpeed : null,
        feedbackSent: completed ? player.feedbackSent : false,
      })),
    };
  }
  if (event.type !== "training") return cloneEvent(event);
  const intensity = event.intensity ?? ((event.duration ?? 90) <= 70 ? "Low" : (event.duration ?? 90) >= 105 ? "High" : "Medium");
  const inferredStatus = event.id === "training-20260718" ? "팀 공개"
    : event.id === "training-0722" ? "정리 필요"
      : event.id === "training-0724" ? "지도자 공유"
        : event.day < 18 ? "완료" : "팀 공개";
  const trainingStatus = event.trainingStatus ?? inferredStatus;
  const completed = trainingStatus === "완료";
  const plannedIntensityScore = event.plannedIntensityScore ?? (intensity === "Low" ? 4 : intensity === "High" ? 8 : 6);
  return {
    ...cloneEvent(event),
    title: event.title?.trim() || "새 훈련",
    date: event.date ?? `2026-07-${String(event.day).padStart(2, "0")}`,
    intensity,
    trainingStatus,
    trainingReviewStatus: event.trainingReviewStatus ?? (completed ? "확인 완료" : trainingStatus === "작성 중" ? "작성 중" : "검토 요청"),
    trainingPublicationStatus: event.trainingPublicationStatus ?? (trainingStatus === "작성 중" || trainingStatus === "지도자 공유" ? "미공개" : "공개"),
    trainingGatheringTime: event.trainingGatheringTime ?? event.time ?? "시간 미정",
    trainingGroup: event.trainingGroup ?? "U15 전체",
    trainingEquipment: event.trainingEquipment ?? "축구화 · 개인 물통 · 팀 조끼",
    trainingCoachNote: event.trainingCoachNote ?? "제한 참여 선수와 블록별 그룹 구성을 시작 전에 다시 확인합니다.",
    trainingPlayerReadCount: event.trainingPlayerReadCount ?? (trainingStatus === "작성 중" || trainingStatus === "지도자 공유" ? 0 : completed ? 24 : 21),
    trainingParentReadCount: event.trainingParentReadCount ?? (trainingStatus === "작성 중" || trainingStatus === "지도자 공유" ? 0 : completed ? 23 : 19),
    plannedIntensityScore,
    actualDuration: event.actualDuration ?? (completed ? event.duration ?? 90 : undefined),
    actualIntensityScore: event.actualIntensityScore ?? (completed ? plannedIntensityScore : undefined),
    trainingPlanCompletion: event.trainingPlanCompletion ?? (completed ? "계획대로" : undefined),
    trainingExceptions: event.trainingExceptions?.map((exception) => ({ ...exception })) ?? [],
    location: event.location ?? "보조구장",
    objective: event.objective ?? "이번 세션의 핵심 원칙을 반복하고 경기 상황에 연결합니다.",
    coachingPoints: event.coachingPoints ?? "받기 전 시야 확보 / 첫 터치 방향 / 행동 후 빠른 전환",
    memo: event.memo ?? "세션 전 제한 참여 선수와 부상 상태를 다시 확인합니다.",
    planBlocks: (event.planBlocks?.length ? event.planBlocks : defaultTrainingPlan).map((block) => ({
      ...block,
      intensity: block.intensity ?? "Medium",
      group: block.group ?? "전체",
      setup: block.setup ?? "구역과 장비를 입력하세요.",
    })),
    playerData: event.playerData?.length ? event.playerData.map((player) => ({
      ...player,
      condition: toConditionScore(player.condition > 10 ? player.condition / 10 : player.condition),
    })) : defaultTrainingPlayerData.map((player) => ({ ...player })),
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
  return {
    ...template,
    intensity: template.intensity ?? "Medium",
    planBlocks: template.planBlocks.map((block) => ({
      ...block,
      keyPoints: block.keyPoints ? [...block.keyPoints] : undefined,
      board: block.board ? {
        pitchPreset: block.board.pitchPreset ?? "full",
        items: block.board.items.map((item) => ({ ...item })),
        lines: block.board.lines.map((line) => ({ ...line, points: line.points?.map((point) => ({ ...point })) })),
      } : undefined,
      intensity: block.intensity ?? "Medium",
      group: block.group ?? "전체",
      setup: block.setup ?? "구역과 장비를 입력하세요.",
    })),
  };
}

function cloneDrill(drill: TrainingDrill): TrainingDrill {
  return {
    ...drill,
    category: drill.category ?? "training",
    intensity: drill.intensity ?? "Medium",
    group: drill.group ?? "전체",
    setup: drill.setup ?? "구역과 장비를 입력하세요.",
    keyPoints: drill.keyPoints ? [...drill.keyPoints] : undefined,
    board: drill.board ? {
      pitchPreset: drill.board.pitchPreset ?? "full",
      items: drill.board.items.map((item) => ({ ...item })),
      lines: drill.board.lines.map((line) => ({ ...line, points: line.points?.map((point) => ({ ...point })) })),
    } : undefined,
  };
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
  const [drills, setDrills] = useState<TrainingDrill[]>(() => initialTrainingDrills.map(cloneDrill));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedEvents = readStoredValue<CalendarEvent[]>(EVENT_STORAGE_KEY, buildInitialEvents()).map(normalizeEvent);
    const storedTemplates = readStoredValue<TrainingTemplate[]>(TEMPLATE_STORAGE_KEY, initialTrainingTemplates).map(cloneTemplate);
    const persistedDrills = readStoredValue<TrainingDrill[]>(DRILL_STORAGE_KEY, initialTrainingDrills);
    const storedDrills = [
      ...initialTrainingDrills.filter((drill) => drill.builtIn),
      ...persistedDrills.filter((drill) => !drill.builtIn),
    ].map(cloneDrill);
    writeStoredValue(EVENT_STORAGE_KEY, storedEvents);
    writeStoredValue(DRILL_STORAGE_KEY, storedDrills);
    setEvents(storedEvents);
    setTemplates(storedTemplates);
    setDrills(storedDrills);
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

  const commitDrills = useCallback((updater: (current: TrainingDrill[]) => TrainingDrill[]) => {
    setDrills((current) => {
      const next = updater(current);
      writeStoredValue(DRILL_STORAGE_KEY, next);
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
    const created = cloneTemplate({ ...template, id: createId("template"), builtIn: false });
    commitTemplates((current) => [...current, created]);
    return created.id;
  }, [commitTemplates]);

  const updateTemplate = useCallback((id: string, updates: Partial<Omit<TrainingTemplate, "id" | "builtIn">>) => {
    commitTemplates((current) => current.map((template) => template.id === id
      ? cloneTemplate({ ...template, ...updates, id: template.id, builtIn: template.builtIn })
      : template));
  }, [commitTemplates]);

  const deleteTemplate = useCallback((id: string) => {
    commitTemplates((current) => current.filter((template) => template.id !== id || template.builtIn));
  }, [commitTemplates]);

  const createDrill = useCallback((drill: Omit<TrainingDrill, "id" | "builtIn">) => {
    const created = cloneDrill({ ...drill, id: createId("drill"), builtIn: false });
    commitDrills((current) => [...current, created]);
    return created.id;
  }, [commitDrills]);

  const updateDrill = useCallback((id: string, updates: Partial<Omit<TrainingDrill, "id" | "builtIn">>) => {
    commitDrills((current) => current.map((drill) => drill.id === id
      ? cloneDrill({ ...drill, ...updates, id: drill.id, builtIn: drill.builtIn })
      : drill));
  }, [commitDrills]);

  const deleteDrill = useCallback((id: string) => {
    commitDrills((current) => current.filter((drill) => drill.id !== id || drill.builtIn));
  }, [commitDrills]);

  const eventsById = useMemo(() => new Map(events.map((event) => [event.id, event])), [events]);

  return {
    events,
    eventsById,
    templates,
    drills,
    hydrated,
    createEvent,
    updateEvent,
    deleteEvent,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    createDrill,
    updateDrill,
    deleteDrill,
  };
}
