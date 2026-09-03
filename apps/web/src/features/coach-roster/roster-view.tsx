"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePlayerHealthStore } from "@/features/coach-wellbeing/model/player-health-store";
import { players } from "@/features/players/data/player-preview-data";
import { ActionButton, PageHeader } from "@/shared/ui/components";
import { Icon } from "@/shared/ui/icon";

type PlayerStatus = { label: string; tone: "normal" | "watch" | "rehab"; reason?: string; guidance?: string };

const normalStatus: PlayerStatus = { label: "정상", tone: "normal" };

function getConditionLabel(condition: number) {
  if (condition >= 8) return "좋음";
  if (condition >= 7) return "보통";
  if (condition >= 6) return "확인";
  return "주의";
}

function getConditionTone(condition: number) {
  if (condition >= 8) return "good";
  if (condition >= 7) return "steady";
  return "low";
}

function getConditionScore(condition: number) {
  return condition;
}

export function RosterView() {
  const { recordsByPlayerId } = usePlayerHealthStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "normal" | "attention">("all");
  const [gradeFilter, setGradeFilter] = useState<"all" | "1학년" | "2학년" | "3학년">("all");
  const [positionFilter, setPositionFilter] = useState<"all" | "GK" | "DF" | "MF" | "FW">("all");
  const playerStatuses = useMemo(() => new Map(players.map((player) => {
    const health = recordsByPlayerId.get(player.id);
    if (!health || health.status === "정상") return [player.id, normalStatus] as const;
    const status: PlayerStatus = {
      label: health.status,
      tone: health.status === "재활" ? "rehab" : "watch",
      reason: health.injuryStatus === "없음" ? health.source : `${health.painArea} ${health.painScore}/10`,
      guidance: `${health.availability} · ${health.restriction}`,
    };
    return [player.id, status] as const;
  })), [recordsByPlayerId]);
  const attentionPlayers = useMemo(() => [...players].filter((player) => playerStatuses.get(player.id)?.tone !== "normal").sort((a, b) => a.number - b.number), [playerStatuses]);
  const attentionCount = attentionPlayers.length;
  const normalCount = players.length - attentionCount;
  const visiblePlayers = useMemo(() => {
    const sortedPlayers = [...players].sort((a, b) => a.number - b.number);
    return sortedPlayers.filter((player) => {
      const needsAttention = playerStatuses.get(player.id)?.tone !== "normal";
      const matchesFilter = filter === "all" || (filter === "attention" ? needsAttention : !needsAttention);
      const matchesGrade = gradeFilter === "all" || player.grade === gradeFilter;
      const matchesPosition = positionFilter === "all" || player.position === positionFilter;
      const matchesQuery = `${player.name} ${player.number} ${player.position} ${player.grade}`.toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesGrade && matchesPosition && matchesQuery;
    });
  }, [filter, gradeFilter, playerStatuses, positionFilter, query]);
  return <div className="squad-page">
    <PageHeader eyebrow="FC 성남 U15 · 2026 시즌" title="선수단" action={<ActionButton>선수 추가</ActionButton>} />

    <section className="roster-attention" aria-labelledby="roster-attention-title">
      <header>
        <div><h2 id="roster-attention-title">오늘 확인</h2><p>훈련 전 참여 범위를 결정할 선수입니다.</p></div>
        <span>{attentionPlayers.length}명</span>
      </header>
      <div className="roster-attention-grid">
        {attentionPlayers.map((player) => {
          const status = playerStatuses.get(player.id) ?? normalStatus;
          return <Link href={`/roster/${player.id}`} className="roster-attention-card" key={player.id}>
            <span className="roster-attention-number">{player.number}</span>
            <span className="roster-attention-copy">
              <span><strong>{player.name}</strong><em className={`roster-status status-${status.tone}`}><i />{status.label}</em></span>
              <small>{player.position} · {player.grade}</small>
              <b>{status.reason}</b>
              <p>{status.guidance}</p>
            </span>
          </Link>;
        })}
      </div>
    </section>

    <div className="roster-controls">
      <label className="roster-search-field">
        <Icon name="search" size={18} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="이름 또는 등번호 검색" />
      </label>
      <div className="roster-grade-group" role="group" aria-label="학년별 보기">
        <button className={gradeFilter === "all" ? "active" : ""} onClick={() => setGradeFilter("all")}>전체</button>
        <button className={gradeFilter === "1학년" ? "active" : ""} onClick={() => setGradeFilter("1학년")}>1학년</button>
        <button className={gradeFilter === "2학년" ? "active" : ""} onClick={() => setGradeFilter("2학년")}>2학년</button>
        <button className={gradeFilter === "3학년" ? "active" : ""} onClick={() => setGradeFilter("3학년")}>3학년</button>
      </div>
      <label className="roster-select-control">
        <select value={filter} onChange={(event) => setFilter(event.target.value as "all" | "normal" | "attention")} aria-label="선수 상태">
          <option value="all">전체 상태</option>
          <option value="normal">정상 {normalCount}</option>
          <option value="attention">확인 필요 {attentionCount}</option>
        </select>
      </label>
      <label className="roster-select-control">
        <select value={positionFilter} onChange={(event) => setPositionFilter(event.target.value as "all" | "GK" | "DF" | "MF" | "FW")} aria-label="선수 포지션">
          <option value="all">전체 포지션</option>
          <option value="GK">GK</option>
          <option value="DF">DF</option>
          <option value="MF">MF</option>
          <option value="FW">FW</option>
        </select>
      </label>
    </div>

    <section className="roster-board" aria-label="선수 명단">
      <header className="roster-list-title"><h2>전체 선수</h2><span>{visiblePlayers.length}명</span></header>
      {visiblePlayers.length > 0 ? <div className="roster-table">
        <div className="roster-table-list">
          {visiblePlayers.map((player) => {
            const status = playerStatuses.get(player.id) ?? normalStatus;
            const condition = recordsByPlayerId.get(player.id)?.condition ?? player.condition;
            const conditionTone = getConditionTone(condition);
            return <Link href={`/roster/${player.id}`} className={`roster-list-card status-${status.tone}`} key={player.id}>
              <span className="roster-number">{player.number}</span>
              <span className="roster-player-copy"><strong>{player.name}</strong><small>{player.position} · {player.grade}</small></span>
              <span className={`roster-condition condition-${conditionTone}`}>
                <small>컨디션</small><strong>{getConditionScore(condition)}<b>/10</b></strong><em>{getConditionLabel(condition)}</em>
              </span>
              <span className={`roster-status status-${status.tone}`}><i />{status.label}</span>
            </Link>;
          })}
        </div>
      </div> : <div className="roster-empty"><strong>검색 결과가 없습니다</strong><p>이름이나 등번호를 다시 확인해 주세요.</p></div>}
    </section>
  </div>;
}
