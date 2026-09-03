"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { players } from "@/features/players/data/player-preview-data";
import { toConditionScore, type ConditionScore } from "@/features/players/model/player";
import { env } from "@/shared/config/env";

export type HealthStatus = "정상" | "관찰" | "제한" | "재활";
export type Availability = "전체 참여" | "제한 참여" | "훈련 제외";
export type InjuryStatus = "없음" | "통증 관찰" | "치료 중" | "재활 중" | "복귀 검토";
export type HealthSyncState = "connecting" | "synced" | "saving" | "offline";

export type PlayerHealthRecord = {
  playerId: number;
  membershipId?: string;
  condition: ConditionScore;
  status: HealthStatus;
  availability: Availability;
  injuryStatus: InjuryStatus;
  painArea: string;
  painScore: ConditionScore;
  restriction: string;
  owner: string;
  reviewAt?: string;
  recordedOn?: string;
  activeCaseId?: string;
  caseVersion?: number;
  updatedAt: string;
  source: string;
  note: string;
};

export type PlayerHealthChange = {
  id: string;
  playerId: number;
  entityType: "readiness" | "availability" | "injury_case" | string;
  action: string;
  beforeValue: Record<string, unknown> | null;
  afterValue: Record<string, unknown>;
  source: string;
  createdAt: string;
};

export type HealthUpdateResult = {
  ok: boolean;
  synced: boolean;
  message?: string;
};

type ApiReadiness = {
  recorded_on: string;
  condition_score: number;
  pain_score: number;
  pain_area: string | null;
  note: string | null;
  source_kind: string;
  created_at: string;
};

type ApiAvailability = {
  status: string;
  availability: string;
  restriction: string;
  review_at: string | null;
  source_kind: string;
  version: number;
};

type ApiInjuryCase = {
  id: string;
  status: string;
  stage: string;
  body_area: string;
  operational_summary: string;
  review_at: string | null;
  version: number;
};

type ApiPlayerWellbeing = {
  player_membership_id: string;
  player_name: string;
  squad_number: number | null;
  readiness: ApiReadiness | null;
  availability: ApiAvailability | null;
  active_injury: ApiInjuryCase | null;
};

type ApiWellbeingOverview = {
  players: ApiPlayerWellbeing[];
};

type ApiHealthChange = {
  id: string;
  player_membership_id: string;
  entity_type: string;
  action: string;
  before_value: Record<string, unknown> | null;
  after_value: Record<string, unknown>;
  source: string;
  created_at: string;
};

type ApiWellbeingUpdate = {
  player: ApiPlayerWellbeing;
  changes: ApiHealthChange[];
};

const TEAM_ID = "11111111-1111-4111-8111-111111111111";
const TEAM_TIME_ZONE = "Asia/Seoul";
const STORAGE_KEY = "base11.coach.player-health.v2";
const LEGACY_STORAGE_KEY = "base11.coach.player-health.v1";
const CHANGE_EVENT = "base11:player-health-change";

const statusToApi: Record<HealthStatus, string> = {
  정상: "normal",
  관찰: "monitor",
  제한: "limited",
  재활: "rehab",
};

const statusFromApi: Record<string, HealthStatus> = {
  normal: "정상",
  monitor: "관찰",
  limited: "제한",
  rehab: "재활",
};

const availabilityToApi: Record<Availability, string> = {
  "전체 참여": "full",
  "제한 참여": "limited",
  "훈련 제외": "unavailable",
};

const availabilityFromApi: Record<string, Availability> = {
  full: "전체 참여",
  limited: "제한 참여",
  unavailable: "훈련 제외",
};

const injuryToApi: Record<InjuryStatus, string> = {
  없음: "none",
  "통증 관찰": "pain_observation",
  "치료 중": "treatment",
  "재활 중": "rehab",
  "복귀 검토": "return_review",
};

const injuryFromApi: Record<string, InjuryStatus> = {
  none: "없음",
  pain_observation: "통증 관찰",
  treatment: "치료 중",
  rehab: "재활 중",
  return_review: "복귀 검토",
  returned: "없음",
};

const sourceToApi: Record<string, string> = {
  "부상·컨디션 관리": "wellbeing",
  "선수 상세": "player_detail",
  "훈련 선수 기록": "training",
  "경기 선수 기록": "match",
  "메디컬 기록": "medical",
};

const sourceFromApi: Record<string, string> = {
  wellbeing: "부상·컨디션 관리",
  player_detail: "선수 상세",
  training: "훈련 선수 기록",
  match: "경기 선수 기록",
  medical: "메디컬 기록",
};

export function teamToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TEAM_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function nextReviewAt() {
  const date = new Date(`${teamToday()}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return `${date.toISOString().slice(0, 10)}T09:00`;
}

function toTeamDateTimeInput(value?: string | null) {
  if (!value) return undefined;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TEAM_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

function toApiDateTime(value?: string) {
  return value ? new Date(`${value}:00+09:00`).toISOString() : null;
}

function relativeTime(value?: string) {
  if (!value) return "기록 없음";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const diffMinutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60_000));
  if (diffMinutes < 1) return "방금";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}시간 전`;
  return new Intl.DateTimeFormat("ko-KR", { month: "numeric", day: "numeric" }).format(date);
}

function defaultRecord(playerId: number): PlayerHealthRecord {
  const player = players.find((item) => item.id === playerId) ?? players[0];
  const special: Partial<Record<number, Partial<PlayerHealthRecord>>> = {
    3: {
      condition: 5,
      status: "관찰",
      availability: "제한 참여",
      injuryStatus: "통증 관찰",
      painArea: "오른쪽 발목",
      painScore: 3,
      restriction: "최대 60분 · 급격한 방향 전환 제한",
      owner: "최은지",
      reviewAt: nextReviewAt(),
      updatedAt: "오늘 08:18",
      source: "메디컬 기록",
      note: "훈련 종료 후 통증을 다시 확인합니다.",
    },
    7: {
      condition: 5,
      status: "재활",
      availability: "훈련 제외",
      injuryStatus: "재활 중",
      painArea: "왼쪽 햄스트링",
      painScore: 2,
      restriction: "팀 러닝 제외 · 패스와 전술 설명만 참여",
      owner: "최은지",
      reviewAt: nextReviewAt(),
      updatedAt: "오늘 07:52",
      source: "메디컬 기록",
      note: "재활 3주차. 다음 주 피치 복귀 검토 예정입니다.",
    },
    17: {
      condition: 7,
      status: "관찰",
      availability: "제한 참여",
      injuryStatus: "없음",
      painArea: "통증 없음",
      painScore: 0,
      restriction: "고강도 반복 수 20% 제한",
      owner: "김태호",
      reviewAt: nextReviewAt(),
      updatedAt: "어제 18:40",
      source: "훈련 선수 기록",
      note: "부하는 높지만 통증은 없습니다. 세션 RPE를 확인합니다.",
    },
  };

  return {
    playerId,
    condition: player.condition,
    status: player.status === "부상" ? "재활" : player.status,
    availability: player.status === "정상" ? "전체 참여" : "제한 참여",
    injuryStatus: player.status === "부상" ? "재활 중" : "없음",
    painArea: "통증 없음",
    painScore: 0,
    restriction: "제한 없음",
    owner: "김태호",
    recordedOn: teamToday(),
    updatedAt: "오늘 08:00",
    source: "오늘 컨디션 체크",
    note: "",
    ...special[playerId],
  };
}

export const initialPlayerHealth = players.map((player) => defaultRecord(player.id));

function cloneRecords(records: PlayerHealthRecord[]) {
  return records.map((record) => ({ ...record }));
}

function readRecords() {
  if (typeof window === "undefined") return cloneRecords(initialPlayerHealth);
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) as PlayerHealthRecord[] : [];
    const byId = new Map(parsed.map((record) => [record.playerId, record]));
    return initialPlayerHealth.map((fallback) => {
      const storedRecord = byId.get(fallback.playerId);
      return storedRecord ? {
        ...fallback,
        ...storedRecord,
        condition: toConditionScore(storedRecord.condition),
        painScore: toConditionScore(storedRecord.painScore),
      } : { ...fallback };
    });
  } catch {
    return cloneRecords(initialPlayerHealth);
  }
}

function writeRecords(records: PlayerHealthRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: cloneRecords(records) }));
}

function normalizeRecord(record: PlayerHealthRecord): PlayerHealthRecord {
  if (record.status === "정상") {
    return {
      ...record,
      availability: "전체 참여",
      injuryStatus: "없음",
      painArea: "통증 없음",
      painScore: 0,
      restriction: "제한 없음",
      reviewAt: undefined,
    };
  }
  if (!record.reviewAt) return { ...record, reviewAt: nextReviewAt() };
  return record;
}

export function validatePlayerHealth(record: PlayerHealthRecord) {
  if (record.status === "정상" && record.availability !== "전체 참여") return "정상 상태는 전체 참여만 선택할 수 있습니다.";
  if (record.status === "정상" && (record.painScore > 0 || record.injuryStatus !== "없음")) return "통증이나 부상 단계가 있으면 정상으로 저장할 수 없습니다.";
  if ((record.status === "제한" || record.status === "재활") && record.availability === "전체 참여") return "제한·재활 선수는 전체 참여로 저장할 수 없습니다.";
  if (record.status === "재활" && !["재활 중", "복귀 검토"].includes(record.injuryStatus)) return "재활 상태에는 재활 단계 또는 복귀 검토가 필요합니다.";
  if (record.status !== "정상" && (!record.restriction.trim() || record.restriction === "제한 없음")) return "확인할 선수는 참여 제한이나 확인 사항을 적어주세요.";
  if (record.status !== "정상" && !record.reviewAt) return "다음 확인 시점을 지정해주세요.";
  if (record.painScore > 0 && (!record.painArea.trim() || record.painArea === "통증 없음")) return "통증이 있으면 부위를 적어주세요.";
  return null;
}

function mergeApiPlayer(fallback: PlayerHealthRecord, api: ApiPlayerWellbeing): PlayerHealthRecord {
  const readiness = api.readiness;
  const availability = api.availability;
  const injury = api.active_injury;
  return {
    ...fallback,
    membershipId: api.player_membership_id,
    condition: readiness ? toConditionScore(readiness.condition_score) : fallback.condition,
    painScore: readiness ? toConditionScore(readiness.pain_score) : 0,
    painArea: readiness?.pain_area ?? injury?.body_area ?? "통증 없음",
    note: readiness?.note ?? "",
    recordedOn: readiness?.recorded_on,
    status: availability ? statusFromApi[availability.status] ?? "정상" : "정상",
    availability: availability ? availabilityFromApi[availability.availability] ?? "전체 참여" : "전체 참여",
    restriction: availability?.restriction ?? injury?.operational_summary ?? "제한 없음",
    reviewAt: toTeamDateTimeInput(availability?.review_at ?? injury?.review_at),
    activeCaseId: injury?.status === "open" ? injury.id : undefined,
    caseVersion: injury?.version,
    injuryStatus: injury?.status === "open" ? injuryFromApi[injury.stage] ?? "통증 관찰" : "없음",
    updatedAt: readiness || availability ? relativeTime(readiness?.created_at) : "오늘 미기록",
    source: sourceFromApi[availability?.source_kind ?? readiness?.source_kind ?? ""] ?? "상태 기록 필요",
  };
}

function mapChanges(changes: ApiHealthChange[], membershipMap: Map<string, number>): PlayerHealthChange[] {
  return changes.flatMap((change) => {
    const playerId = membershipMap.get(change.player_membership_id);
    return playerId === undefined ? [] : [{
      id: change.id,
      playerId,
      entityType: change.entity_type,
      action: change.action,
      beforeValue: change.before_value,
      afterValue: change.after_value,
      source: sourceFromApi[change.source] ?? change.source,
      createdAt: change.created_at,
    }];
  });
}

async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => null) as { detail?: string | Array<{ msg?: string }> } | null;
    const detail = Array.isArray(error?.detail) ? error.detail.map((item) => item.msg).filter(Boolean).join(" · ") : error?.detail;
    throw new Error(detail || `서버 응답 오류 (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export function usePlayerHealthStore() {
  const [records, setRecords] = useState<PlayerHealthRecord[]>(() => cloneRecords(initialPlayerHealth));
  const [changes, setChanges] = useState<PlayerHealthChange[]>([]);
  const [syncState, setSyncState] = useState<HealthSyncState>("connecting");
  const [lastError, setLastError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setSyncState("connecting");
    try {
      const [overview, apiChanges] = await Promise.all([
        getJson<ApiWellbeingOverview>(`/teams/${TEAM_ID}/wellbeing`),
        getJson<ApiHealthChange[]>(`/teams/${TEAM_ID}/wellbeing-changes?limit=100`),
      ]);
      const bySquadNumber = new Map(overview.players.flatMap((item) => item.squad_number === null ? [] : [[item.squad_number, item] as const]));
      const next = readRecords().map((record) => {
        const player = players.find((item) => item.id === record.playerId);
        const apiPlayer = player ? bySquadNumber.get(player.number) : undefined;
        return apiPlayer ? mergeApiPlayer(record, apiPlayer) : {
          ...record,
          membershipId: undefined,
          recordedOn: undefined,
          updatedAt: "DB 소속 미연결",
          source: "소속 연결 필요",
        };
      });
      const membershipMap = new Map(next.flatMap((record) => record.membershipId ? [[record.membershipId, record.playerId] as const] : []));
      setRecords(next);
      writeRecords(next);
      setChanges(mapChanges(apiChanges, membershipMap));
      setSyncState("synced");
      setLastError(null);
    } catch (error) {
      setRecords(readRecords());
      setSyncState("offline");
      setLastError(error instanceof Error ? error.message : "서버에 연결하지 못했습니다.");
    }
  }, []);

  useEffect(() => {
    setRecords(readRecords());
    void refresh();
    const sync = (event: Event) => {
      const customEvent = event as CustomEvent<PlayerHealthRecord[]>;
      setRecords(customEvent.detail ? cloneRecords(customEvent.detail) : readRecords());
    };
    const syncStorage = () => setRecords(readRecords());
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", syncStorage);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", syncStorage);
    };
  }, [refresh]);

  const updateHealth = useCallback(async (playerId: number, updates: Partial<Omit<PlayerHealthRecord, "playerId">>): Promise<HealthUpdateResult> => {
    const current = records.find((record) => record.playerId === playerId);
    if (!current) return { ok: false, synced: false, message: "선수 상태를 찾지 못했습니다." };

    if ((updates.source === "훈련 선수 기록" || updates.source === "경기 선수 기록") && current.injuryStatus !== "없음" && updates.status === "정상") {
      return { ok: false, synced: false, message: "부상·재활 종료는 부상·컨디션 관리에서 확인 후 변경해주세요." };
    }

    const nextRecord = normalizeRecord({
      ...current,
      ...updates,
      condition: updates.condition === undefined ? current.condition : toConditionScore(updates.condition),
      painScore: updates.painScore === undefined ? current.painScore : toConditionScore(updates.painScore),
      updatedAt: "방금",
      recordedOn: teamToday(),
    });
    const validationError = validatePlayerHealth(nextRecord);
    if (validationError) return { ok: false, synced: false, message: validationError };

    const optimistic = records.map((record) => record.playerId === playerId ? nextRecord : record);
    setRecords(optimistic);
    writeRecords(optimistic);
    const localChange: PlayerHealthChange = {
      id: `local-${Date.now()}`,
      playerId,
      entityType: "availability",
      action: "superseded",
      beforeValue: { status: current.status, availability: current.availability, restriction: current.restriction },
      afterValue: { status: nextRecord.status, availability: nextRecord.availability, restriction: nextRecord.restriction },
      source: nextRecord.source,
      createdAt: new Date().toISOString(),
    };
    setChanges((items) => [localChange, ...items]);

    if (!nextRecord.membershipId) {
      setSyncState("offline");
      setLastError("이 선수는 아직 DB 소속 정보와 연결되지 않았습니다.");
      return { ok: true, synced: false, message: "기기에 저장했습니다. DB 소속 연결 후 자동 동기화가 필요합니다." };
    }

    setSyncState("saving");
    try {
      const response = await getJson<ApiWellbeingUpdate>(`/teams/${TEAM_ID}/players/${nextRecord.membershipId}/wellbeing-updates`, {
        method: "POST",
        body: JSON.stringify({
          condition_score: nextRecord.condition,
          pain_score: nextRecord.painScore,
          pain_area: nextRecord.painScore > 0 || nextRecord.injuryStatus !== "없음" ? nextRecord.painArea : null,
          status: statusToApi[nextRecord.status],
          availability: availabilityToApi[nextRecord.availability],
          injury_stage: injuryToApi[nextRecord.injuryStatus],
          restriction: nextRecord.restriction,
          review_at: toApiDateTime(nextRecord.reviewAt),
          note: nextRecord.note || null,
          source_kind: sourceToApi[nextRecord.source] ?? "wellbeing",
          source_ref: `web-player-${playerId}`,
        }),
      });
      const savedRecord = mergeApiPlayer(nextRecord, response.player);
      const savedRecords = optimistic.map((record) => record.playerId === playerId ? savedRecord : record);
      const membershipMap = new Map(savedRecords.flatMap((record) => record.membershipId ? [[record.membershipId, record.playerId] as const] : []));
      setRecords(savedRecords);
      writeRecords(savedRecords);
      setChanges((items) => [...mapChanges(response.changes, membershipMap), ...items.filter((item) => item.id !== localChange.id)]);
      setSyncState("synced");
      setLastError(null);
      return { ok: true, synced: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "서버 저장에 실패했습니다.";
      setSyncState("offline");
      setLastError(message);
      return { ok: true, synced: false, message: "기기에 저장했지만 서버 동기화는 완료하지 못했습니다." };
    }
  }, [records]);

  const recordsByPlayerId = useMemo(() => new Map(records.map((record) => [record.playerId, record])), [records]);
  const activeCases = useMemo(() => records.filter((record) => record.activeCaseId || record.injuryStatus !== "없음"), [records]);

  return { records, recordsByPlayerId, activeCases, changes, syncState, lastError, refresh, updateHealth };
}
