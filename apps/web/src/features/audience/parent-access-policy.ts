import type {
  CalendarEvent,
  MatchPlayerData,
  TrainingPlayerData,
} from "@/features/coach-schedule/data/schedule-preview-data";

export const parentHiddenData = [
  "전체 라인업",
  "전술·세션 설계",
  "지도자 내부 메모",
  "다른 선수 기록",
  "구단 운영 정보",
] as const;

export type ParentTrainingView = {
  kind: "training";
  playerId: number;
  playerName: string;
  date: string;
  time: string;
  location: string;
  participation: TrainingPlayerData["participation"];
  condition: number;
  rpe: number;
  feedback: string | null;
};

export type ParentMatchView = {
  kind: "match";
  playerId: number;
  playerName: string;
  date: string;
  opponent: string;
  score: string;
  role: MatchPlayerData["role"];
  minutes: number;
  rating: number;
  distance: number | null;
  feedback: string | null;
};

function eventDate(event: CalendarEvent) {
  return event.date ?? `2026-07-${String(event.day).padStart(2, "0")}`;
}

export function buildParentTrainingView(event: CalendarEvent, playerId: number): ParentTrainingView | null {
  const player = event.playerData?.find((item) => item.playerId === playerId);
  if (!player) return null;
  return {
    kind: "training",
    playerId: player.playerId,
    playerName: player.name,
    date: eventDate(event),
    time: event.time ?? "시간 미정",
    location: event.location ?? "장소 미정",
    participation: player.participation,
    condition: player.condition,
    rpe: player.rpe,
    feedback: player.feedbackSent && player.feedbackVisibleToParent && player.feedback.trim() ? player.feedback : null,
  };
}

export function buildParentMatchView(event: CalendarEvent, playerId: number): ParentMatchView | null {
  const player = event.matchPlayerData?.find((item) => item.playerId === playerId);
  if (!player) return null;
  return {
    kind: "match",
    playerId: player.playerId,
    playerName: player.name,
    date: eventDate(event),
    opponent: event.opponent ?? "상대 팀",
    score: `${event.homeScore ?? 0} : ${event.awayScore ?? 0}`,
    role: player.role,
    minutes: player.minutes,
    rating: player.rating,
    distance: player.distance,
    feedback: player.feedbackSent && player.feedbackVisibleToParent && player.feedback.trim() ? player.feedback : null,
  };
}
