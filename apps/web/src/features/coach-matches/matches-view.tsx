"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { matches } from "@/features/coach-matches/data/matches-preview-data";
import { useScheduleStore } from "@/features/coach-schedule/model/schedule-store";
import type { CalendarEvent, MatchStatus } from "@/features/coach-schedule/data/schedule-preview-data";
import { Badge, PageHeader } from "@/shared/ui/components";
import { Icon } from "@/shared/ui/icon";

type MatchFilter = "upcoming" | "review" | "completed";

const filterLabels: Array<{ id: MatchFilter; label: string }> = [
  { id: "upcoming", label: "예정 경기" },
  { id: "review", label: "정리 필요" },
  { id: "completed", label: "완료 경기" },
];

function filterForStatus(status: MatchStatus | undefined): MatchFilter {
  if (status === "완료") return "completed";
  if (status === "정리 필요" || status === "결과 확인") return "review";
  return "upcoming";
}

function statusTone(status: MatchStatus | undefined) {
  if (status === "완료") return "green" as const;
  if (status === "정리 필요" || status === "결과 확인") return "orange" as const;
  if (status === "취소") return "red" as const;
  if (status === "지도자 공유" || status === "작성 중") return "gray" as const;
  return "blue" as const;
}

function nextAction(match: CalendarEvent) {
  if (match.matchStatus === "완료") return "리뷰 보기";
  if (match.matchStatus === "정리 필요" || match.matchStatus === "결과 확인") return "경기 마감";
  if (match.matchStatus === "경기 진행" || match.matchStatus === "진행 중") return "기록 계속";
  if (match.matchPublicationStatus === "미공개") return "검토·공개";
  return "경기 준비";
}

function matchDate(match: CalendarEvent) {
  return `7월 ${match.day}일`;
}

export function MatchesView() {
  const { events } = useScheduleStore();
  const [filter, setFilter] = useState<MatchFilter>("upcoming");
  const [query, setQuery] = useState("");
  const matchEvents = useMemo(() => events
    .filter((event) => event.type === "match")
    .sort((a, b) => a.day - b.day || (a.time ?? "00:00").localeCompare(b.time ?? "00:00")), [events]);

  const counts = useMemo(() => matchEvents.reduce<Record<MatchFilter, number>>((result, match) => {
    result[filterForStatus(match.matchStatus)] += 1;
    return result;
  }, { upcoming: 0, review: 0, completed: 0 }), [matchEvents]);

  const visibleMatches = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return matchEvents
      .filter((match) => filterForStatus(match.matchStatus) === filter)
      .filter((match) => !normalizedQuery || `${match.opponent} ${match.competition} ${match.location}`.toLowerCase().includes(normalizedQuery))
      .sort((a, b) => filter === "completed" ? b.day - a.day : a.day - b.day);
  }, [filter, matchEvents, query]);

  const focusMatch = matchEvents.find((match) => match.id === "match-0728")
    ?? matchEvents.find((match) => filterForStatus(match.matchStatus) === "upcoming")
    ?? matchEvents[0];

  const wins = matches.filter((match) => match.result === "승").length;
  const draws = matches.filter((match) => match.result === "무").length;
  const losses = matches.filter((match) => match.result === "패").length;
  const goalsFor = matches.reduce((sum, match) => sum + match.home, 0);
  const goalsAgainst = matches.reduce((sum, match) => sum + match.away, 0);

  return <div className="match-hub-page">
    <PageHeader
      eyebrow="FC 성남 U15 · 2026 시즌"
      title="경기"
      description="경기 준비와 현장 기록, 종료 후 리뷰를 같은 경기에서 이어서 관리합니다."
      action={<Link className="action-button match-create-link" href="/schedule?create=match"><Icon name="plus" size={17} />경기 등록</Link>}
    />

    {focusMatch && <section className="match-focus-card">
      <div className="match-focus-copy">
        <div><Badge tone={statusTone(focusMatch.matchStatus)}>{focusMatch.matchStatus ?? "예정"}</Badge><span>{focusMatch.competition ?? "경기"}</span></div>
        <h2>{focusMatch.opponent ?? "상대 팀"}전</h2>
        <p>{matchDate(focusMatch)} {focusMatch.time ?? "시간 미정"} · {focusMatch.location ?? "장소 미정"}</p>
      </div>
      <div className="match-focus-progress" aria-label="다음 경기 준비 현황">
        <span><small>지도자 검토</small><strong>{focusMatch.matchReviewStatus ?? "작성 중"}</strong></span>
        <span><small>엔트리</small><strong>{focusMatch.matchPlayerData?.length ?? 0}<b>명</b></strong></span>
        <span><small>선수 확인</small><strong>{focusMatch.playerReadCount ?? 0}<b>/24</b></strong></span>
        <span><small>학부모 확인</small><strong>{focusMatch.parentReadCount ?? 0}<b>/24</b></strong></span>
      </div>
      <div className="match-focus-actions">
        <Link href={`/matches/${focusMatch.id}`}><span>{nextAction(focusMatch)}</span><Icon name="chevron" size={16} /></Link>
        <small>{focusMatch.matchPublicationStatus === "공개" ? "팀에 공개됨" : "팀 공개 전"}</small>
      </div>
    </section>}

    <section className="match-browser-card">
      <header className="match-browser-toolbar">
        <nav aria-label="경기 상태 필터">
          {filterLabels.map((item) => <button key={item.id} className={filter === item.id ? "active" : ""} onClick={() => setFilter(item.id)}>{item.label}<span>{counts[item.id]}</span></button>)}
        </nav>
        <label><Icon name="search" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="상대팀·대회·장소 검색" /></label>
      </header>

      <div className="match-browser-list">
        {visibleMatches.length ? visibleMatches.map((match) => <Link href={`/matches/${match.id}`} key={match.id}>
          <time><strong>{String(match.day).padStart(2, "0")}</strong><small>7월</small></time>
          <div className="match-browser-opponent"><span><Badge tone={statusTone(match.matchStatus)}>{match.matchStatus ?? "예정"}</Badge><small>{match.competition ?? "경기"}</small></span><strong>{match.opponent ?? match.title}</strong><p>{match.time ?? "시간 미정"} · {match.location ?? "장소 미정"} · {match.homeAway ?? "홈"}</p></div>
          {match.matchStatus === "완료" || match.matchStatus === "정리 필요" || match.matchStatus === "결과 확인" ? <div className="match-browser-score"><small>스코어</small><strong>{match.homeScore ?? 0}<em>:</em>{match.awayScore ?? 0}</strong></div> : <div className="match-browser-readiness"><small>공유 상태</small><strong>{match.matchPublicationStatus ?? "미공개"}</strong><span>선수 {match.playerReadCount ?? 0}/24</span></div>}
          <span className="match-browser-action">{nextAction(match)}<Icon name="chevron" size={15} /></span>
        </Link>) : <div className="match-browser-empty"><span><Icon name="match" size={22} /></span><strong>조건에 맞는 경기가 없습니다.</strong><p>다른 상태를 선택하거나 검색어를 지워보세요.</p></div>}
      </div>
    </section>

    <section className="match-season-summary">
      <header><div><h2>시즌 요약</h2><p>완료된 경기 기준</p></div><span>{matches.length}경기</span></header>
      <div>
        <span><small>전적</small><strong>{wins}승 {draws}무 {losses}패</strong></span>
        <span><small>득실</small><strong>{goalsFor}득점 · {goalsAgainst}실점</strong></span>
        <span><small>경기당 득점</small><strong>{(goalsFor / matches.length).toFixed(2)}</strong></span>
        <span><small>최근 4경기</small><strong>3승 1무</strong></span>
      </div>
    </section>
  </div>;
}
