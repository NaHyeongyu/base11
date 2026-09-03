"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { players } from "@/features/players/data/player-preview-data";

export type PlayerRecordKind = "body" | "physical" | "counseling" | "note" | "feedback" | "goal" | "medical";
export type PlayerRecordStatus = "초안" | "확정" | "진행 중" | "완료" | "정정됨" | "취소됨";
export type PlayerRecordVisibility = "지도자 내부" | "선수 공개" | "학부모 공개";

export type PlayerRecordRevision = {
  revision: number;
  updatedAt: string;
  title: string;
  content: string;
  value?: number;
  unit?: string;
  status: PlayerRecordStatus;
};

export type PlayerDetailRecord = {
  id: string;
  playerId: number;
  kind: PlayerRecordKind;
  date: string;
  title: string;
  content: string;
  author: string;
  visibility: PlayerRecordVisibility;
  status: PlayerRecordStatus;
  metric?: string;
  value?: number;
  unit?: string;
  condition?: string;
  followUp?: string;
  reviewDate?: string;
  sourceEventId?: string;
  revision: number;
  updatedAt: string;
  history?: PlayerRecordRevision[];
};

export type PlayerProfileOverride = {
  playerId: number;
  school: string;
  birthDate: string;
  number: number;
  position: string;
  grade: string;
  dominantFoot: "오른발" | "왼발";
  height: number;
  weight: number;
  registrationStatus: "활동 중" | "일시 중지" | "등록 종료" | "졸업" | "이적";
  squad: string;
  updatedAt: string;
};

const RECORD_STORAGE_KEY = "base11.coach.player-detail-records.v1";
const PROFILE_STORAGE_KEY = "base11.coach.player-profile-overrides.v1";
const CHANGE_EVENT = "base11:player-detail-change";

const kindTitles: Record<PlayerRecordKind, string> = {
  body: "신체 측정",
  physical: "피지컬 테스트",
  counseling: "개인 상담",
  note: "지도자 메모",
  feedback: "선수 피드백",
  goal: "개인 목표",
  medical: "부상·재활 기록",
};

function initialProfiles(): PlayerProfileOverride[] {
  return players.map((player) => ({
    playerId: player.id,
    school: "성남중학교",
    birthDate: `201${player.grade === "3학년" ? "0" : player.grade === "2학년" ? "1" : "2"}-0${(player.id % 8) + 1}-15`,
    number: player.number,
    position: player.position,
    grade: player.grade,
    dominantFoot: player.dominantFoot,
    height: player.height,
    weight: player.weight,
    registrationStatus: "활동 중",
    squad: "U15",
    updatedAt: "2026-08-24",
  }));
}

function makeRecord(playerId: number, index: number, record: Partial<PlayerDetailRecord> & Pick<PlayerDetailRecord, "kind" | "date" | "title" | "content">): PlayerDetailRecord {
  return {
    id: `player-record-${playerId}-${index}`,
    playerId,
    author: "김태호",
    visibility: record.kind === "feedback" ? "선수 공개" : "지도자 내부",
    status: "확정",
    revision: 1,
    updatedAt: record.date,
    ...record,
  };
}

function initialRecords(): PlayerDetailRecord[] {
  return players.flatMap((player) => {
    const base = [
      makeRecord(player.id, 1, { kind: "body", date: "2026-07-20", title: "정기 신체 측정", content: "동일 시간대·동일 측정 장비", metric: "신장", value: player.height, unit: "cm", condition: "오전 훈련 전" }),
      makeRecord(player.id, 2, { kind: "body", date: "2026-07-20", title: "정기 신체 측정", content: "동일 시간대·동일 측정 장비", metric: "체중", value: player.weight, unit: "kg", condition: "오전 훈련 전" }),
      makeRecord(player.id, 3, { kind: "physical", date: "2026-07-20", title: "30m 스프린트", content: "천연잔디·전자 계측", metric: "30m 스프린트", value: Number((4.05 + (player.id % 7) * .04).toFixed(2)), unit: "초", condition: "천연잔디·전자 계측" }),
      makeRecord(player.id, 4, { kind: "physical", date: "2026-07-20", title: "CMJ 점프", content: "점프 매트 3회 중 최고값", metric: "CMJ", value: 38 + (player.id % 8), unit: "cm", condition: "점프 매트" }),
      makeRecord(player.id, 5, { kind: "feedback", date: "2026-07-23", title: "훈련 피드백", content: "첫 터치 전에 다음 패스 방향을 먼저 확인하자.", visibility: "선수 공개", sourceEventId: "training-20260718" }),
      makeRecord(player.id, 6, { kind: "goal", date: "2026-07-24", title: "전환 전 첫 터치 방향", content: "압박이 오기 전에 몸을 열고 전진 방향으로 첫 터치를 준비합니다.", followUp: "훈련 영상 3장면 확인", reviewDate: "2026-08-30", visibility: "선수 공개", status: "진행 중" }),
      makeRecord(player.id, 7, { kind: "counseling", date: "2026-08-15", title: "월간 개인 상담", content: "최근 출전 경험과 다음 달 개인 목표를 함께 확인했습니다.", followUp: "훈련 후 10분 대화", reviewDate: "2026-08-30" }),
    ];
    if (player.id === 3) base.push(makeRecord(player.id, 8, { kind: "medical", date: "2026-07-21", title: "오른쪽 발목 통증 확인", content: "경기 68분 교체 후 통증 3/10 확인", followUp: "훈련 종료 후 재확인", reviewDate: "2026-07-24", sourceEventId: "match-20260720" }));
    return base;
  });
}

function readValue<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeValue<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

function createId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? `player-record-${crypto.randomUUID().slice(0, 8)}`
    : `player-record-${Date.now().toString(36)}`;
}

function revisionSnapshot(record: PlayerDetailRecord): PlayerRecordRevision {
  return {
    revision: record.revision,
    updatedAt: record.updatedAt,
    title: record.title,
    content: record.content,
    value: record.value,
    unit: record.unit,
    status: record.status,
  };
}

export const playerRecordKindLabels = kindTitles;

export function usePlayerDetailStore() {
  const [records, setRecords] = useState<PlayerDetailRecord[]>(initialRecords);
  const [profiles, setProfiles] = useState<PlayerProfileOverride[]>(initialProfiles);

  useEffect(() => {
    const sync = () => {
      setRecords(readValue(RECORD_STORAGE_KEY, initialRecords()));
      setProfiles(readValue(PROFILE_STORAGE_KEY, initialProfiles()));
    };
    sync();
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const commitRecords = useCallback((updater: (current: PlayerDetailRecord[]) => PlayerDetailRecord[]) => {
    setRecords((current) => {
      const next = updater(current);
      writeValue(RECORD_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const addRecord = useCallback((record: Omit<PlayerDetailRecord, "id" | "revision" | "updatedAt">) => {
    const created: PlayerDetailRecord = { ...record, id: createId(), revision: 1, updatedAt: "방금" };
    commitRecords((current) => [created, ...current]);
    return created.id;
  }, [commitRecords]);

  const updateRecord = useCallback((id: string, updates: Partial<Omit<PlayerDetailRecord, "id" | "playerId">>) => {
    commitRecords((current) => current.map((record) => {
      if (record.id !== id) return record;
      const keepAsDraft = record.status === "초안" && (updates.status ?? record.status) === "초안";
      return {
        ...record,
        ...updates,
        history: keepAsDraft ? record.history : [...(record.history ?? []), revisionSnapshot(record)],
        revision: keepAsDraft ? record.revision : record.revision + 1,
        updatedAt: "방금",
      };
    }));
  }, [commitRecords]);

  const deleteDraft = useCallback((id: string) => {
    commitRecords((current) => current.filter((record) => record.id !== id || record.status !== "초안"));
  }, [commitRecords]);

  const cancelRecord = useCallback((id: string) => {
    commitRecords((current) => current.map((record) => record.id === id ? {
      ...record,
      history: [...(record.history ?? []), revisionSnapshot(record)],
      status: "취소됨",
      revision: record.revision + 1,
      updatedAt: "방금",
    } : record));
  }, [commitRecords]);

  const updateProfile = useCallback((playerId: number, updates: Partial<Omit<PlayerProfileOverride, "playerId">>) => {
    setProfiles((current) => {
      const fallback = initialProfiles().find((profile) => profile.playerId === playerId)!;
      const exists = current.some((profile) => profile.playerId === playerId);
      const next = exists
        ? current.map((profile) => profile.playerId === playerId ? { ...profile, ...updates, updatedAt: "방금" } : profile)
        : [...current, { ...fallback, ...updates, playerId, updatedAt: "방금" }];
      writeValue(PROFILE_STORAGE_KEY, next);
      return next;
    });
  }, []);

  return {
    records,
    recordsByPlayerId: useMemo(() => {
      const map = new Map<number, PlayerDetailRecord[]>();
      records.forEach((record) => map.set(record.playerId, [...(map.get(record.playerId) ?? []), record]));
      return map;
    }, [records]),
    profilesByPlayerId: useMemo(() => new Map(profiles.map((profile) => [profile.playerId, profile])), [profiles]),
    addRecord,
    updateRecord,
    deleteDraft,
    cancelRecord,
    updateProfile,
  };
}
