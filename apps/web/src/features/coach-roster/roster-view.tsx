"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { players } from "@/features/players/data/player-preview-data";
import { ActionButton, Badge, MetricCard, PageHeader, ProgressBar } from "@/shared/ui/components";
import { Icon } from "@/shared/ui/icon";

const playerNotes: Record<number, { availability: string; note: string; feedback: string }> = {
  7: { availability: "재활 중", note: "햄스트링 · 러닝 제외", feedback: "메모 연결" },
  3: { availability: "제한 참여", note: "발목 통증 3/10 · 최대 60분", feedback: "우선 작성" },
  4: { availability: "관찰", note: "최근 7일 부하 상위", feedback: "확인" },
};

export function RosterView() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"attention" | "all">("attention");
  const visiblePlayers = useMemo(() => {
    const filteredByStatus = filter === "attention"
      ? players.filter((player) => Boolean(playerNotes[player.id]))
      : players;
    return filteredByStatus.filter((player) => {
      const matchesQuery = `${player.name} ${player.number} ${player.position}`.toLowerCase().includes(query.toLowerCase());
      return matchesQuery;
    });
  }, [filter, query]);

  return <div className="squad-page">
    <PageHeader eyebrow="SQUAD · 2026. 07. 24" title="선수단 현황" description="출석 대신 오늘의 가용 상태, 컨디션·부상 예외, 최근 부하를 기준으로 선수를 확인합니다." action={<ActionButton>선수 추가</ActionButton>} />
    <div className="metric-grid four compact squad-metrics">
      <MetricCard label="등록 선수" value="26명" helper="필드 23 · GK 3" tone="blue" />
      <MetricCard label="오늘 참여 가능" value="23명" helper="정상 훈련 기준" tone="green" />
      <MetricCard label="확인 필요" value="3명" helper="재활 1 · 관찰 2" tone="red" />
      <MetricCard label="신체 측정 필요" value="4명" helper="이번 달 미측정" tone="orange" />
    </div>
    <div className="squad-toolbar">
      <label><Icon name="search" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="이름·등번호·포지션 검색" /></label>
      <button className={filter === "attention" ? "active" : ""} onClick={() => setFilter("attention")}>오늘 확인 3</button>
      <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>전체 26</button>
      <button>포지션</button><button>학년</button><span>마지막 동기화 10:42</span>
    </div>
    <div className="squad-layout">
      <section className="squad-table-panel">
        <header><div><h2>전체 선수</h2><p>예외 선수가 상단에 정렬됩니다.</p></div><Badge tone="gray">{visiblePlayers.length}명 표시</Badge></header>
        <div className="squad-table-scroll"><div className="squad-table">
          <div className="squad-table-head"><span>선수</span><span>오늘 컨디션</span><span>가용 상태</span><span>특이사항</span><span>최근 부하</span><span>피드백</span></div>
          {visiblePlayers.map((player) => {
            const note = playerNotes[player.id] ?? { availability: "정상", note: "—", feedback: "완료" };
            return <Link href={`/roster/${player.id}`} className={`squad-player-row ${player.status !== "정상" ? "exception" : ""}`} key={player.id}>
              <div className="squad-player"><span className={`position-${player.position.toLowerCase()}`}>{player.number}</span><div><strong>{player.name}</strong><small>{player.position} · {player.grade}</small></div></div>
              <div className="condition-cell"><strong>{player.condition}</strong><ProgressBar value={player.condition} tone={player.condition < 60 ? "red" : player.condition < 75 ? "orange" : "green"} /></div>
              <Badge tone={note.availability === "정상" ? "green" : note.availability === "재활 중" ? "red" : "orange"}>{note.availability}</Badge>
              <span className={player.status !== "정상" ? "attention" : ""}>{note.note}</span><strong>{player.sessionLoad} AU</strong><span>{note.feedback}</span>
            </Link>;
          })}
        </div></div>
      </section>
      <aside className="squad-attention-panel">
        <header><div><h2>오늘 확인</h2><p>세션 전 판단이 필요한 선수</p></div><Badge tone="red">3명</Badge></header>
        <article className="danger"><Badge tone="red">윤시우 · 재활</Badge><strong>햄스트링 · 러닝 제외</strong><p>패스·전술 설명만 참여</p><Link href="/roster/7">상세 보기</Link></article>
        <article className="warning"><Badge tone="orange">이도윤 · 관찰</Badge><strong>오른쪽 발목 통증 3/10</strong><p>최대 60분 · 고강도 80%</p><Link href="/roster/3">판단 확인</Link></article>
        <article className="info"><Badge tone="purple">최우진 · 부하</Badge><strong>최근 7일 89 AU</strong><p>고강도 블록 반복 수 제한</p><Link href="/roster/4">부하 보기</Link></article>
        <footer><span>상태 기준</span><div><Badge tone="green">정상 23</Badge><Badge tone="orange">관찰 2</Badge><Badge tone="red">재활 1</Badge></div></footer>
      </aside>
    </div>
  </div>;
}
