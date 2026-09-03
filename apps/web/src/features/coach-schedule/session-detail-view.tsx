"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  defaultTrainingPlan,
  defaultTrainingPlayerData,
  matchMoments,
  sessionPlayers,
  type CalendarEvent,
  type CalendarEventType,
  type TrainingPlanBlock,
  type TrainingPlayerData,
} from "@/features/coach-schedule/data/schedule-preview-data";
import { useScheduleStore } from "@/features/coach-schedule/model/schedule-store";
import { ScheduleEventEditor } from "@/features/coach-schedule/schedule-event-editor";
import { MatchDetailEditor, MatchDetailWorkspace } from "@/features/coach-schedule/match-detail-workspace";
import { TrainingDetailWorkspace } from "@/features/coach-schedule/training-detail-workspace";
import { TrainingPlayerDataPanel } from "@/features/coach-schedule/training-player-data-panel";
import { Badge, ProgressBar } from "@/shared/ui/components";
import { Icon } from "@/shared/ui/icon";

type SessionTab = "flow" | "players";

const tabLabels: Array<{ id: SessionTab; label: string }> = [
  { id: "flow", label: "훈련 흐름" },
  { id: "players", label: "선수 현황" },
];

const sessionTypeLabels: Record<CalendarEventType, string> = {
  training: "훈련",
  match: "경기",
  meeting: "미팅",
  recovery: "회복",
  off: "휴식",
};

const trainingIntensityLabels = {
  Low: "낮음 · Low",
  Medium: "보통 · Medium",
  High: "높음 · High",
} as const;

const fallbackSession: CalendarEvent = {
  id: "training-20260718",
  day: 18,
  date: "2026-07-18",
  time: "18:00",
  title: "훈련",
  type: "training",
  duration: 120,
  intensity: "Medium",
  location: "보조구장 B",
};

function addMinutes(time: string, minutes: number) {
  const [hour, minute] = time.split(":").map(Number);
  const total = hour * 60 + minute + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function getTrainingBlocks(session: CalendarEvent) {
  let elapsed = 0;
  let remaining = session.duration ?? 120;
  const blocks = session.planBlocks?.length ? session.planBlocks : defaultTrainingPlan;
  return blocks.flatMap((block) => {
    if (remaining <= 0) return [];
    const plannedDuration = block.duration;
    const duration = Math.min(plannedDuration, remaining);
    const adjusted = {
      ...block,
      time: addMinutes(session.time ?? "17:00", elapsed),
      duration: `${duration}분`,
      intensity: block.intensity ?? session.intensity ?? "Medium",
      group: block.group ?? "전체",
      setup: block.setup ?? "현장 구성 확인",
    };
    elapsed += duration;
    remaining -= duration;
    return [adjusted];
  });
}

function LoadSummary({ match, players }: { match: boolean; players?: TrainingPlayerData[] }) {
  const trainingPlayers = players?.length ? players : defaultTrainingPlayerData;
  const connectedGps = trainingPlayers.filter((player) => sessionPlayers.find((item) => item.number === player.number)?.distance !== "—").length;
  const items = match
    ? [["총 거리", "10.6 km"], ["고속 주행", "1.08 km"], ["스프린트", "26회"], ["최고 속도", "32.4"]]
    : [["총 거리", "8.4 km"], ["고속 주행", "782 m"], ["스프린트", "19회"], ["평균 RPE", "6.3"]];
  return <section className={`session-card session-load ${match ? "match" : ""}`}>
    <header><div><h3>팀 GPS · {match ? "경기 부하" : "RPE"}</h3><p>{match ? "Catapult · 17/18 연결" : `STATSports · ${connectedGps}/${trainingPlayers.length} 연결`}</p></div><Badge tone={match || connectedGps < trainingPlayers.length ? "orange" : "green"}>{match ? "1명 확인" : connectedGps < trainingPlayers.length ? `${trainingPlayers.length - connectedGps}명 확인` : "완료"}</Badge></header>
    <div>{items.map(([label, value]) => <article key={label}><small>{label}</small><strong>{value}</strong></article>)}</div>
  </section>;
}

function PlayerTable({ match, full = false }: { match: boolean; full?: boolean }) {
  return <div className="session-table-wrap"><div className={`session-player-table ${full ? "full" : ""}`}>
    <div className="session-player-head"><span>선수</span><span>상태</span><span>{match ? "출전" : "총 거리"}</span><span>{match ? "총 거리" : "HSR"}</span><span>{match ? "HSR" : "Sprint"}</span><span>{match ? "Max" : "RPE"}</span><span>피드백</span></div>
    {sessionPlayers.map((player) => <div className={`session-player-row ${player.status === "GPS 누락" ? "danger" : player.status === "관찰" || player.status === "재활" ? "warning" : ""}`} key={player.number}>
      <strong>{player.number} {player.name}</strong>
      <span className={`status-text status-${player.status}`}>{player.status}</span>
      <span>{match ? player.minutes : player.distance}</span>
      <span>{match ? player.distance : player.hsr}</span>
      <span>{match ? player.hsr : player.sprint}</span>
      <span>{match ? player.max : player.rpe}</span>
      <button>{player.feedback}</button>
    </div>)}
  </div></div>;
}

function OverviewTab({
  match,
  session,
  onEdit,
}: {
  match: boolean;
  session: CalendarEvent;
  onEdit: () => void;
}) {
  const sessionTrainingBlocks = getTrainingBlocks(session);
  return <div className="session-overview-grid">
    <div className="session-main-stack">
      <section className="session-card">
        <header><div><h3>{match ? "주요 경기 장면" : "오늘 훈련 내용"}</h3><p>{match ? "득점·교체·부상·전술 변경 8건" : `${sessionTrainingBlocks.length}개 블록 · 총 ${session.duration ?? 120}분 · 담당별 실행 순서`}</p></div><button onClick={onEdit}>{match ? "경기 기록 편집" : "계획 편집"}</button></header>
        {match ? <div className="match-moment-list">{matchMoments.map((moment) => <article key={`${moment.minute}-${moment.title}`}><time>{moment.minute}</time><Badge tone={moment.type === "GOAL" ? "green" : moment.type === "MEDICAL" ? "red" : "purple"}>{moment.type}</Badge><strong>{moment.title}</strong><span>{moment.detail}</span></article>)}</div> : <div className="training-block-list">{sessionTrainingBlocks.map((block) => <article key={block.id}><time>{block.time}</time><i /><strong>{block.title}</strong><span>{block.group} · {block.setup}<small>{block.point}</small></span><Badge tone={block.intensity === "High" ? "red" : block.intensity === "Low" ? "green" : "blue"}>{block.intensity}</Badge><em>{block.duration}</em></article>)}</div>}
      </section>
      {!match && <section className="session-card training-session-brief">
        <header><div><h3>훈련 목적·코칭 포인트</h3><p>지도자가 세션에서 반복할 기준입니다.</p></div></header>
        <div><article><small>훈련 목적</small><p>{session.objective}</p></article><article><small>핵심 포인트</small><p>{session.coachingPoints}</p></article><article><small>운영 메모</small><p>{session.memo}</p></article></div>
      </section>}
    </div>
    <aside className="session-side-stack">
      <LoadSummary match={match} players={session.playerData} />
      <section className="session-card session-memo-card">
        <header><h3>{match ? "감독 총평 · 메모" : "코치 메모"}</h3><button>+ 메모</button></header>
        <article><span>{match ? "총평" : "스태프"}<small>김태호 · 16:42</small></span><p>{match ? "후반 중원 수치 조정 뒤 세컨드볼 회수가 개선됨" : "전환 게임 3세트에서 공격조 반복 수 확보"}</p></article>
        <article><span>메디컬<small>최은지 · 16:51</small></span><p>{match ? "이도윤 발목 3/10, 내일 오전 재확인 예정" : "윤시우는 러닝 제외, 전술 설명과 패스만 참여"}</p></article>
      </section>
    </aside>
  </div>;
}

function SimpleTrainingEditor({
  session,
  onClose,
  onSave,
}: {
  session: CalendarEvent;
  onClose: () => void;
  onSave: (updates: Partial<CalendarEvent>) => void;
}) {
  const [date, setDate] = useState(session.date ?? `2026-07-${String(session.day).padStart(2, "0")}`);
  const [time, setTime] = useState(session.time ?? "18:00");
  const [location, setLocation] = useState(session.location ?? "");
  const [objective, setObjective] = useState(session.objective ?? "");
  const [memo, setMemo] = useState(session.memo ?? "");
  const [blocks, setBlocks] = useState<TrainingPlanBlock[]>(() => (session.planBlocks?.length ? session.planBlocks : defaultTrainingPlan).map((block) => ({ ...block })));
  const totalDuration = blocks.reduce((sum, block) => sum + block.duration, 0);

  function updateBlock(id: string, updates: Partial<TrainingPlanBlock>) {
    setBlocks((current) => current.map((block) => block.id === id ? { ...block, ...updates } : block));
  }

  return <div className="schedule-modal-backdrop" role="presentation">
    <section className="simple-training-editor-modal" role="dialog" aria-modal="true" aria-labelledby="simple-training-editor-title">
      <header>
        <div><span>훈련 수정</span><h2 id="simple-training-editor-title">훈련 정보 편집</h2><p>기본 정보와 훈련 내용, 메모만 빠르게 수정합니다.</p></div>
        <button type="button" onClick={onClose} aria-label="훈련 편집 닫기"><Icon name="close" size={18} /></button>
      </header>
      <form onSubmit={(event) => {
        event.preventDefault();
        const day = Number(date.split("-")[2]) || session.day;
        onSave({ date, day, time, location, objective, duration: totalDuration, memo, planBlocks: blocks });
      }}>
        <div className="simple-training-editor-scroll">
          <section className="simple-training-editor-section">
            <header><h3>기본 정보</h3></header>
            <div className="simple-training-basic-fields">
              <label><span>날짜</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label>
              <label><span>시작 시간</span><input type="time" value={time} onChange={(event) => setTime(event.target.value)} required /></label>
              <label className="location"><span>장소</span><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="훈련 장소" /></label>
            </div>
          </section>

          <section className="simple-training-editor-section">
            <header><div><h3>훈련 내용</h3><p>내용과 시간, 지도자가 기억할 한 가지 포인트만 입력합니다.</p></div><strong>총 {totalDuration}분</strong></header>
            <div className="simple-training-block-editor">
              {blocks.map((block, index) => <article key={block.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <label><small>훈련 내용</small><input value={block.title} onChange={(event) => updateBlock(block.id, { title: event.target.value })} required /></label>
                <label><small>시간</small><input type="number" min={1} max={180} value={block.duration} onChange={(event) => updateBlock(block.id, { duration: Math.max(1, Number(event.target.value)) })} required /></label>
                <label><small>메모·코칭 포인트</small><input value={block.point} onChange={(event) => updateBlock(block.id, { point: event.target.value })} placeholder="간단한 운영 포인트" /></label>
                <button type="button" onClick={() => setBlocks((current) => current.filter((item) => item.id !== block.id))} disabled={blocks.length === 1} aria-label={`${block.title} 삭제`}><Icon name="close" size={15} /></button>
                <details className="simple-training-block-details">
                  <summary>세션 상세 입력</summary>
                  <div>
                    <label className="full"><small>세션 목적</small><textarea value={block.objective ?? ""} onChange={(event) => updateBlock(block.id, { objective: event.target.value })} placeholder="이 세션에서 만들고 싶은 변화" /></label>
                    <label><small>공간·배치</small><input value={block.setup ?? ""} onChange={(event) => updateBlock(block.id, { setup: event.target.value })} placeholder="예: 30×25m · 3개 구역" /></label>
                    <label><small>인원</small><input value={block.playerCount ?? ""} onChange={(event) => updateBlock(block.id, { playerCount: event.target.value })} placeholder="예: 8v8+3" /></label>
                    <label className="full"><small>준비물</small><input value={block.equipment ?? ""} onChange={(event) => updateBlock(block.id, { equipment: event.target.value })} placeholder="볼 · 콘 · 조끼" /></label>
                    <label className="full"><small>진행 방법</small><textarea value={block.method ?? ""} onChange={(event) => updateBlock(block.id, { method: event.target.value })} placeholder="진행 순서와 세트 구성" /></label>
                    <label className="full"><small>규칙</small><textarea value={block.rules ?? ""} onChange={(event) => updateBlock(block.id, { rules: event.target.value })} placeholder="선수에게 전달할 핵심 규칙" /></label>
                    <label className="full"><small>코칭 포인트</small><textarea value={block.keyPoints?.join("\n") ?? ""} onChange={(event) => updateBlock(block.id, { keyPoints: event.target.value.split("\n").map((item) => item.trim()).filter(Boolean) })} placeholder={"한 줄에 하나씩 입력\n예: 받기 전 어깨 너머 확인"} /></label>
                  </div>
                </details>
              </article>)}
              <button className="simple-add-training-block" type="button" onClick={() => setBlocks((current) => [...current, {
                id: `block-${Date.now().toString(36)}`,
                title: "새 훈련 내용",
                duration: 10,
                point: "",
                group: "전체",
                intensity: session.intensity ?? "Medium",
              }])}><Icon name="plus" size={15} />훈련 내용 추가</button>
            </div>
          </section>

          <section className="simple-training-editor-section">
            <header><div><h3>훈련 목표</h3><p>이번 훈련에서 가져갈 기준을 한 문장으로 적습니다.</p></div></header>
            <label className="match-editor-long-field"><span>훈련 목표</span><textarea value={objective} onChange={(event) => setObjective(event.target.value)} placeholder="이번 훈련에서 팀이 가져갈 한 가지 목표" /></label>
          </section>

          <section className="simple-training-editor-section">
            <header><h3>훈련 메모</h3></header>
            <textarea value={memo} onChange={(event) => setMemo(event.target.value)} placeholder="훈련 운영과 다음 훈련에 반영할 내용을 남겨주세요." />
          </section>
        </div>
        <footer><button type="button" onClick={onClose}>취소</button><button type="submit"><Icon name="check" size={15} />변경사항 저장</button></footer>
      </form>
    </section>
  </div>;
}

function TrainingDataSection({
  players,
  onOpenPlayers,
}: {
  players: TrainingPlayerData[];
  onOpenPlayers: () => void;
}) {
  const playerNumbers = new Set(players.map((player) => player.number));
  const connectedGps = sessionPlayers.filter((player) => playerNumbers.has(player.number) && player.distance !== "—");
  const averageDistance = connectedGps.length
    ? connectedGps.reduce((sum, player) => sum + Number.parseFloat(player.distance), 0) / connectedGps.length
    : 0;
  const averageHsr = connectedGps.length
    ? connectedGps.reduce((sum, player) => sum + Number.parseFloat(player.hsr), 0) / connectedGps.length
    : 0;
  const totalSprints = connectedGps.reduce((sum, player) => sum + Number(player.sprint), 0);
  const averageCondition = players.reduce((sum, player) => sum + player.condition, 0) / Math.max(players.length, 1);
  const averageRpe = players.reduce((sum, player) => sum + player.rpe, 0) / Math.max(players.length, 1);

  return <section className="session-card training-data-section">
    <header>
      <div><h3>훈련 데이터</h3><p>GPS와 컨디션 핵심 수치입니다.</p></div>
      <button onClick={onOpenPlayers}>선수 데이터 보기<Icon name="chevron" size={14} /></button>
    </header>
    <div className="training-team-data-summary">
      <span><small>GPS 연결</small><strong>{connectedGps.length}/{players.length}</strong></span>
      <span><small>평균 컨디션</small><strong>{averageCondition.toFixed(1)}<b>/10</b></strong></span>
      <span><small>평균 총 거리</small><strong>{averageDistance.toFixed(1)}km</strong></span>
      <span><small>평균 HSR</small><strong>{averageHsr.toFixed(2)}km</strong></span>
      <span><small>총 스프린트</small><strong>{totalSprints}회</strong></span>
      <span><small>평균 RPE</small><strong>{averageRpe.toFixed(1)}</strong></span>
    </div>
  </section>;
}

function SimpleTrainingDetail({
  session,
  onEdit,
  onMemoSave,
  onOpenPlayers,
}: {
  session: CalendarEvent;
  onEdit: () => void;
  onMemoSave: (memo: string) => void;
  onOpenPlayers: () => void;
}) {
  const blocks = getTrainingBlocks(session);
  const players = session.playerData?.length ? session.playerData : defaultTrainingPlayerData;
  const [memo, setMemo] = useState(session.memo ?? "");
  const [memoSaved, setMemoSaved] = useState(false);

  useEffect(() => {
    setMemo(session.memo ?? "");
    setMemoSaved(false);
  }, [session.id, session.memo]);

  return <div className="training-simple-content">
    <section className="session-card training-simple-plan">
      <header>
        <div><h3>훈련 내용</h3><p>{blocks.length}개 구성 · 총 {session.duration ?? 0}분</p></div>
        <button onClick={onEdit}><Icon name="edit" size={15} />내용 수정</button>
      </header>
      <div className="training-simple-block-list">
        {blocks.map((block) => <article key={block.id}>
          <time>{block.time}</time>
          <div><strong>{block.title}</strong><p>{block.group} · {block.point}</p></div>
          <em>{block.duration}</em>
        </article>)}
      </div>
    </section>

    <TrainingDataSection players={players} onOpenPlayers={onOpenPlayers} />

    <section className="session-card training-simple-memo">
      <header><div><h3>훈련 메모</h3><p>훈련 중 확인한 내용과 다음 훈련에 반영할 사항을 남겨주세요.</p></div></header>
      <textarea value={memo} onChange={(event) => {
        setMemo(event.target.value);
        setMemoSaved(false);
      }} placeholder="예: 전환 훈련 반복 수 조정, 제한 참여 선수 상태 확인" />
      <footer>
        <span>{memoSaved ? "메모가 저장되었습니다." : "지도자 내부 기록으로 저장됩니다."}</span>
        <button onClick={() => {
          onMemoSave(memo);
          setMemoSaved(true);
        }}>{memoSaved ? <><Icon name="check" size={15} />저장됨</> : "메모 저장"}</button>
      </footer>
    </section>
  </div>;
}

const operationalCopy = {
  meeting: {
    heading: "미팅 안건",
    description: "결정 사항과 후속 작업을 한곳에 기록합니다.",
    items: ["선수 운영 및 다음 세션 공유", "컨디션·부상 예외 선수 확인", "담당 역할과 후속 작업 정리"],
    participants: "지도자 5명",
  },
  recovery: {
    heading: "회복 프로그램",
    description: "회복 활동과 선수 상태 확인 항목을 관리합니다.",
    items: ["저강도 유산소·모빌리티", "통증 및 회복 상태 체크", "개별 회복 가이드 전달"],
    participants: "선수 26명",
  },
  off: {
    heading: "휴식 운영",
    description: "팀 훈련 없이 필요한 안내와 상태 변화만 확인합니다.",
    items: ["팀 훈련 없음", "개별 회복 가이드 확인", "긴급 상태 변화만 스태프에게 보고"],
    participants: "전체 선수",
  },
} as const;

function OperationalOverview({ session }: { session: CalendarEvent }) {
  const type = session.type as keyof typeof operationalCopy;
  const copy = operationalCopy[type];
  return <div className="session-overview-grid">
    <div className="session-main-stack">
      <section className="session-card">
        <header><div><h3>{copy.heading}</h3><p>{copy.description}</p></div><button>일정 편집</button></header>
        <div className="session-note-list">
          {copy.items.map((item, index) => <article key={item}><Badge tone={index === 0 ? "blue" : "gray"}>{index + 1}</Badge><div><strong>{item}</strong><p>{index === 0 ? "담당자가 실행 전 세부 내용을 최종 확인합니다." : "완료 여부와 특이사항을 내부 메모로 남깁니다."}</p></div></article>)}
        </div>
      </section>
      <section className="session-card session-memo-card">
        <header><h3>운영 메모</h3><button>+ 메모</button></header>
        <article><span>스태프<small>김태호 · 10:24</small></span><p>일정 변경과 예외 사항은 관련 선수·보호자에게 역할별로 전달합니다.</p></article>
      </section>
    </div>
    <aside className="session-side-stack">
      <section className="session-card">
        <header><div><h3>일정 정보</h3><p>선택한 일정의 운영 기준</p></div><Badge tone="green">확정</Badge></header>
        <div className="exception-list">
          <article><strong>참여 대상</strong><span>{copy.participants}</span></article>
          <article><strong>시작 시간</strong><span>{session.time ?? "종일"}</span></article>
          <article><strong>예상 시간</strong><span>{session.duration ? `${session.duration}분` : "별도 시간 없음"}</span></article>
          <article><strong>장소·비고</strong><span>{session.location ?? session.detail ?? "팀 내부 일정"}</span></article>
        </div>
      </section>
    </aside>
  </div>;
}

function PlayersTab({
  match,
  session,
  onPlayerDataChange,
}: {
  match: boolean;
  session: CalendarEvent;
  onPlayerDataChange: (playerData: NonNullable<CalendarEvent["playerData"]>) => void;
}) {
  if (!match) {
    return <TrainingPlayerDataPanel
      players={session.playerData?.length ? session.playerData : defaultTrainingPlayerData}
      onChange={onPlayerDataChange}
    />;
  }
  return <div className="session-tab-layout">
    <section className="session-card session-roster-panel">
      <header><div><h3>{match ? "출전 선수 18명" : "훈련 대상 선수 26명"}</h3><p>컨디션과 가용 상태를 기준으로 예외 선수를 먼저 표시합니다.</p></div><button>선수 구성 편집</button></header>
      <PlayerTable match={match} full />
    </section>
    <aside className="session-tab-side">
      <section className="session-card"><header><h3>오늘 확인 필요</h3><Badge tone="red">3명</Badge></header>
        <div className="exception-list"><article><strong>윤시우</strong><span>햄스트링 재활 · 러닝 제외</span></article><article><strong>이도윤</strong><span>발목 통증 3/10 · 최대 60분</span></article><article><strong>최우진</strong><span>최근 부하 상위 · 고강도 제한</span></article></div>
      </section>
      <section className="session-card"><header><h3>가용성 요약</h3></header><div className="availability-bars"><div><span>정상 참여</span><ProgressBar value={88} tone="green" /><strong>23</strong></div><div><span>제한 참여</span><ProgressBar value={8} tone="orange" /><strong>2</strong></div><div><span>재활</span><ProgressBar value={4} tone="red" /><strong>1</strong></div></div></section>
    </aside>
  </div>;
}

function GpsTab({ match }: { match: boolean }) {
  return <div className="session-gps-layout">
    <LoadSummary match={match} />
    <section className="session-card gps-chart-card">
      <header><div><h3>선수별 부하 분포</h3><p>{match ? "경기 출전 시간 대비 총 거리" : "세션 평균 대비 총 거리와 RPE"}</p></div><Badge tone="blue">팀 평균 기준</Badge></header>
      <div className="gps-bars">{sessionPlayers.slice(0, 5).map((player, index) => <div key={player.number}><span>{player.number} {player.name}</span><i><b style={{ width: `${[86, 94, 67, 31, 78][index]}%` }} /></i><strong>{player.distance}</strong></div>)}</div>
    </section>
    <section className="session-card gps-quality-card"><header><h3>데이터 품질</h3><Badge tone={match ? "orange" : "green"}>{match ? "94%" : "100%"}</Badge></header><div><span>GPS 연결</span><strong>{match ? "17 / 18" : "26 / 26"}</strong></div><div><span>RPE 응답</span><strong>{match ? "12 / 18" : "24 / 26"}</strong></div><div><span>확인 필요</span><strong>{match ? "오세훈" : "2명 응답 대기"}</strong></div></section>
  </div>;
}

function QuickFeedback({
  match,
  players,
  onSend,
}: {
  match: boolean;
  players?: TrainingPlayerData[];
  onSend?: (playerId: number, message: string) => void;
}) {
  const feedbackPlayers = !match && players?.length ? players : defaultTrainingPlayerData;
  const [selectedId, setSelectedId] = useState(feedbackPlayers.find((player) => !player.feedbackSent)?.playerId ?? feedbackPlayers[0]?.playerId ?? 0);
  const selected = feedbackPlayers.find((player) => player.playerId === selectedId) ?? feedbackPlayers[0];
  const [sent, setSent] = useState(Boolean(selected?.feedbackSent));
  const [message, setMessage] = useState(match ? "전환 순간 첫 선택이 빨랐고, 약속한 왼발 마무리까지 연결한 점이 좋았어." : selected?.feedback ?? "");

  useEffect(() => {
    if (match || !selected) return;
    setMessage(selected.feedback);
    setSent(selected.feedbackSent);
  }, [match, selectedId, selected]);

  return <section className="session-card quick-feedback-card">
    <header><div><h3>{match ? "경기 바로 피드백" : "바로 피드백"}</h3><p>{match ? "장면·출전·GPS를 근거로 전달" : "세션 데이터와 함께 비공개 전달"}</p></div><Badge tone="orange">대기 {match ? "6" : "5"}</Badge></header>
    <label><span>선수</span><select value={selectedId} onChange={(event) => setSelectedId(Number(event.target.value))}>{feedbackPlayers.map((item) => <option value={item.playerId} key={item.playerId}>{item.number} {item.name}</option>)}</select></label>
    <div className="feedback-evidence"><small>근거</small><strong>{match ? "72′ 전환 6초 · 결승골 · 최고속도 32.4km/h" : `컨디션 ${selected?.condition ?? 0}/10 · RPE ${selected?.rpe ?? 0} · ${selected?.participation ?? "전체"} 참여`}</strong></div>
    <label><span>지도자 피드백</span><textarea value={message} onChange={(event) => {
      setMessage(event.target.value);
      setSent(false);
    }} /></label>
    <footer><label><input type="checkbox" defaultChecked />선수 기록에 연결</label><button onClick={() => {
      if (!match && selected) onSend?.(selected.playerId, message);
      setSent(true);
    }}>{sent ? <><Icon name="check" size={15} />전달 완료</> : "피드백 보내기"}</button></footer>
  </section>;
}

function FeedbackTab({
  match,
  session,
  onMemoSave,
  onQuickFeedback,
}: {
  match: boolean;
  session: CalendarEvent;
  onMemoSave: (memo: string) => void;
  onQuickFeedback: (playerId: number, message: string) => void;
}) {
  const [memo, setMemo] = useState(session.memo ?? "");
  const [memoSaved, setMemoSaved] = useState(false);

  useEffect(() => {
    setMemo(session.memo ?? "");
    setMemoSaved(false);
  }, [session.memo]);

  return <div className="session-feedback-layout">
    <QuickFeedback match={match} players={session.playerData} onSend={onQuickFeedback} />
    <section className="session-card">
      <header><div><h3>훈련 메모</h3><p>지도자 내부 기록과 선수에게 전달된 피드백을 구분합니다.</p></div></header>
      <div className="session-memo-editor"><textarea value={memo} onChange={(event) => {
        setMemo(event.target.value);
        setMemoSaved(false);
      }} placeholder="훈련 운영, 선수 반응, 다음 세션에 반영할 내용을 기록하세요." /><button onClick={() => {
        onMemoSave(memo);
        setMemoSaved(true);
      }}>{memoSaved ? <><Icon name="check" size={15} />저장됨</> : "메모 저장"}</button></div>
      <div className="session-note-list"><article><Badge tone="purple">스태프</Badge><div><strong>전환 블록 반복 수 확보</strong><p>3세트에서 공격조의 반복 수가 부족해 다음 세션에 5분을 추가합니다.</p><small>박성진 · 16:42</small></div></article><article><Badge tone="red">메디컬</Badge><div><strong>이도윤 발목 재확인</strong><p>통증 3/10. 내일 오전 상태 확인 후 주말 경기 출전 시간을 결정합니다.</p><small>최은지 · 17:26</small></div></article><article><Badge tone="blue">피드백</Badge><div><strong>박준호에게 전달 완료</strong><p>전환 순간 첫 선택과 왼발 마무리 장면을 다음 개인 미션에 연결했습니다.</p><small>김태호 · 18:02</small></div></article></div>
    </section>
  </div>;
}

export function SessionDetailView({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const { events, eventsById, templates, createEvent, updateEvent, deleteEvent, createTemplate } = useScheduleStore();
  const storedSession = eventsById.get(sessionId);
  const session = storedSession ?? {
    ...fallbackSession,
    id: sessionId,
    type: sessionId.startsWith("match") ? "match" as const : fallbackSession.type,
    planBlocks: defaultTrainingPlan,
    playerData: defaultTrainingPlayerData,
  };
  const match = session.type === "match";
  const publishedTraining = session.type === "training" && session.trainingStatus !== "작성 중";
  const detailBasePath = match ? "/matches" : "/schedule";
  const performanceSession = session.type === "training" || match;
  const [tab, setTab] = useState<SessionTab>("flow");
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [savedNotice, setSavedNotice] = useState("");
  const relatedSessions = useMemo(() => events
    .filter((event) => event.type === session.type)
    .sort((a, b) => a.day - b.day || (a.time ?? "00:00").localeCompare(b.time ?? "00:00")), [events, session.type]);
  const currentSessionIndex = relatedSessions.findIndex((event) => event.id === session.id);
  const previousSession = currentSessionIndex > 0 ? relatedSessions[currentSessionIndex - 1] : undefined;
  const nextSession = currentSessionIndex >= 0 ? relatedSessions[currentSessionIndex + 1] : undefined;
  const title = session.id === "match-20260720"
    ? "FC 안양 U18  2 – 1  수원FC U18"
    : session.type === "training" ? `7월 ${session.day}일 훈련` : session.title;
  const sessionMeta = [
    `7월 ${session.day}일`,
    session.time,
    session.duration ? `${session.duration}분` : undefined,
    session.type === "training" ? `강도 ${session.intensity ?? "Medium"}` : undefined,
    session.location,
    session.detail,
  ].filter(Boolean).join(" · ");
  const operation = performanceSession ? null : operationalCopy[session.type as keyof typeof operationalCopy];
  const sessionPlayerData = session.playerData?.length ? session.playerData : defaultTrainingPlayerData;
  const connectedGpsCount = sessionPlayerData.filter((player) => sessionPlayers.find((item) => item.number === player.number)?.distance !== "—").length;
  const heroStats = match
    ? [["포메이션", "4-3-3"], ["출전", "18명"], ["GPS", "17/18"], ["회고", "12/18"]]
    : session.type === "training"
      ? [["시간", `${session.duration ?? 120}분`], ["강도", session.intensity ?? "Medium"], ["예외", "3명"], ["GPS", `${connectedGpsCount}/${sessionPlayerData.length}`]]
      : [["시간", session.duration ? `${session.duration}분` : "종일"], ["대상", operation?.participants ?? "팀"], ["상태", "확정"], ["메모", "1건"]];
  const tabCopy = useMemo(() => tabLabels.map((item) => ({ ...item, label: item.id === "players" ? `${item.label} · ${match ? 18 : 26}명` : item.label })), [match]);

  function duplicateSession() {
    const { id: _discardedId, ...copy } = session;
    const nextDay = Math.min(31, session.day + 1);
    const createdId = createEvent({
      ...copy,
      day: nextDay,
      date: `2026-07-${String(nextDay).padStart(2, "0")}`,
      title: session.type === "training" ? "훈련" : `${session.title} 복사본`,
      planBlocks: session.planBlocks?.map((block) => ({ ...block, id: `${block.id}-copy-${Date.now().toString(36)}` })),
      playerData: session.playerData?.map((player) => ({ ...player, feedbackSent: false, feedbackVisibleToParent: false })),
    });
    router.push(`${detailBasePath}/${createdId}`);
  }

  return <div className={`session-detail-page ${session.type === "training" ? "training-detail-page" : match ? "match-detail-page" : ""}`}>
    <div className="session-detail-command-bar">
      <div className="session-navigation">
        <Link className="session-back" href={match ? "/matches" : "/schedule"}><Icon name="chevron" size={15} />{match ? "전체 경기" : "훈련 목록"}</Link>
        <span />
        {previousSession ? <Link href={`${detailBasePath}/${previousSession.id}`} aria-label={match ? "이전 경기" : "이전 훈련"}><b>‹</b><small>{previousSession.day}일 · {previousSession.time}</small></Link> : <button disabled aria-label={match ? "이전 경기" : "이전 훈련"}><b>‹</b></button>}
        <em>{currentSessionIndex >= 0 ? `${currentSessionIndex + 1} / ${relatedSessions.length}` : "현재"}</em>
        {nextSession ? <Link href={`${detailBasePath}/${nextSession.id}`} aria-label={match ? "다음 경기" : "다음 훈련"}><small>{nextSession.day}일 · {nextSession.time}</small><b>›</b></Link> : <button disabled aria-label={match ? "다음 경기" : "다음 훈련"}><b>›</b></button>}
      </div>
      {(session.type === "training" || session.type === "match") && <div className="session-crud-actions">
        {match && <Link href="/schedule?create=match"><Icon name="plus" size={15} />새 경기</Link>}
        <button onClick={duplicateSession}><Icon name="copy" size={15} />복제</button>
        <button className="delete-session-button" onClick={() => setConfirmDelete(true)}>{match && session.matchStatus !== "작성 중" ? "경기 취소" : publishedTraining ? "훈련 취소" : "삭제"}</button>
        <button className="edit-session-button" onClick={() => setEditing(true)}><Icon name="edit" size={15} />수정</button>
      </div>}
    </div>
    {session.type === "training" ? <TrainingDetailWorkspace
      session={session}
      onEdit={() => setEditing(true)}
      onMemoSave={(memo) => {
        updateEvent(session.id, { memo });
        setSavedNotice("훈련 메모를 저장했습니다.");
      }}
      onPlayerDataChange={(playerData) => {
        updateEvent(session.id, { playerData });
        setSavedNotice("선수 정보를 저장했습니다.");
      }}
    /> : match ? <MatchDetailWorkspace
      session={session}
      onEdit={() => setEditing(true)}
      onMemoSave={(memo) => {
        updateEvent(session.id, { memo });
        setSavedNotice("감독 총평을 저장했습니다.");
      }}
      onMatchMomentsChange={(matchMoments) => {
        updateEvent(session.id, { matchMoments });
        setSavedNotice("경기 기록을 추가했습니다.");
      }}
      onPlayerDataChange={(matchPlayerData) => {
        updateEvent(session.id, { matchPlayerData });
        setSavedNotice("선수별 경기 기록과 피드백을 저장했습니다.");
      }}
      onMatchUpdate={(updates) => {
        updateEvent(session.id, updates);
        if (updates.matchPublicationStatus === "공개") setSavedNotice("선수와 학부모에게 각자의 경기 기록과 공개 피드백을 전달했습니다.");
        else if (updates.matchStatus === "완료") setSavedNotice("경기를 마감하고 선수·시즌 기록에 반영했습니다.");
        else setSavedNotice("경기 준비 상태를 저장했습니다.");
      }}
    /> : <section className="session-hero">
      <div className="session-hero-kicker"><Badge tone={match ? "orange" : "blue"}>{sessionTypeLabels[session.type]} · {match ? "종료" : "진행 전"}</Badge><span>{match ? "기록 완성도 96% · GPS 1명 확인 필요" : "마지막 수정 12분 전 · 김태호"}</span></div>
      <div className="session-hero-main"><div><h1>{title}</h1><p>{sessionMeta}</p></div>
        <div>{heroStats.map(([label, value]) => <span key={label}><small>{label}</small><strong>{value}</strong></span>)}</div>
      </div>
      {match && <div className="session-tabs">{tabCopy.map((item) => <button className={tab === item.id ? "active" : ""} key={item.id} onClick={() => setTab(item.id)}>{item.label}</button>)}</div>}
    </section>}
    {!performanceSession && <OperationalOverview session={session} />}
    {savedNotice && <div className="schedule-toast" role="status"><Icon name="check" size={16} />{savedNotice}<button onClick={() => setSavedNotice("")} aria-label="알림 닫기"><Icon name="close" size={14} /></button></div>}
    {editing && session.type === "training" && <SimpleTrainingEditor session={session} onClose={() => setEditing(false)} onSave={(updated) => {
      updateEvent(session.id, updated);
      setEditing(false);
      setSavedNotice("훈련 정보를 수정했습니다.");
    }} />}
    {editing && match && <MatchDetailEditor session={session} onClose={() => setEditing(false)} onSave={(updated) => {
      updateEvent(session.id, updated);
      setEditing(false);
      setSavedNotice("경기 정보와 기록을 수정했습니다.");
    }} />}
    {editing && session.type !== "training" && !match && <ScheduleEventEditor
      mode="edit"
      initialEvent={session}
      defaultType={match ? "match" : "training"}
      defaultDay={session.day}
      templates={templates}
      onClose={() => setEditing(false)}
      onSave={(updated) => {
        updateEvent(session.id, updated);
        setEditing(false);
        setSavedNotice("일정과 훈련 데이터를 수정했습니다.");
      }}
      onSaveTemplate={(template) => {
        createTemplate(template);
        setSavedNotice(`${template.name} 템플릿을 저장했습니다.`);
      }}
    />}
    {confirmDelete && <div className="schedule-modal-backdrop" role="presentation">
      <section className="delete-session-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-session-title">
        <span><Icon name="notice" size={22} /></span>
        <h2 id="delete-session-title">{match && session.matchStatus !== "작성 중" ? "이 경기를 취소할까요?" : publishedTraining ? "이 훈련을 취소할까요?" : `${session.type === "training" ? "이 훈련" : session.title} 일정을 삭제할까요?`}</h2>
        <p>{match && session.matchStatus !== "작성 중" ? "기존 일정과 준비 내용은 기록으로 유지되고, 선수와 학부모에게 취소 안내가 필요 상태로 표시됩니다." : publishedTraining ? "훈련 계획과 참가 정보는 기록으로 유지되고, 선수와 학부모에게 변경 알림이 필요 상태로 표시됩니다." : "캘린더에서 일정과 연결된 훈련 데이터가 함께 사라집니다. 이 작업은 되돌릴 수 없습니다."}</p>
        <div><button onClick={() => setConfirmDelete(false)}>취소</button><button onClick={() => {
          if (match && session.matchStatus !== "작성 중") {
            updateEvent(session.id, { matchStatus: "취소", matchPublicationStatus: "변경됨" });
            setConfirmDelete(false);
            setSavedNotice("경기를 취소했습니다. 선수·학부모 변경 알림을 확인해 주세요.");
            return;
          }
          if (publishedTraining) {
            updateEvent(session.id, { trainingStatus: "취소", trainingPublicationStatus: "변경됨" });
            setConfirmDelete(false);
            setSavedNotice("훈련을 취소했습니다. 선수·학부모 변경 알림을 확인해 주세요.");
            return;
          }
          deleteEvent(session.id);
          router.push(detailBasePath);
        }}>{match && session.matchStatus !== "작성 중" ? "경기 취소" : publishedTraining ? "훈련 취소" : "일정 삭제"}</button></div>
      </section>
    </div>}
  </div>;
}
