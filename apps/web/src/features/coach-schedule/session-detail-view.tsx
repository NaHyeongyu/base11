"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  calendarEvents,
  matchMoments,
  sessionPlayers,
  trainingBlocks,
  weekCalendarEvents,
  type CalendarEvent,
  type CalendarEventType,
} from "@/features/coach-schedule/data/schedule-preview-data";
import { Badge, ProgressBar } from "@/shared/ui/components";
import { Icon } from "@/shared/ui/icon";

type SessionTab = "overview" | "players" | "gps" | "feedback";

const tabLabels: Array<{ id: SessionTab; label: string }> = [
  { id: "overview", label: "개요" },
  { id: "players", label: "선수" },
  { id: "gps", label: "GPS" },
  { id: "feedback", label: "메모·피드백" },
];

const sessionTypeLabels: Record<CalendarEventType, string> = {
  training: "훈련",
  match: "경기",
  meeting: "미팅",
  recovery: "회복",
  off: "휴식",
};

const fallbackSession: CalendarEvent = {
  id: "training-20260718",
  day: 18,
  time: "18:00",
  title: "포지션 전환 훈련",
  type: "training",
  duration: 120,
  location: "보조구장 B",
};

function getSession(sessionId: string) {
  return [...calendarEvents, ...weekCalendarEvents].find((event) => event.id === sessionId) ?? {
    ...fallbackSession,
    id: sessionId,
    type: sessionId.startsWith("match") ? "match" as const : fallbackSession.type,
  };
}

function addMinutes(time: string, minutes: number) {
  const [hour, minute] = time.split(":").map(Number);
  const total = hour * 60 + minute + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function getTrainingBlocks(session: CalendarEvent) {
  let elapsed = 0;
  let remaining = session.duration ?? 120;
  return trainingBlocks.flatMap((block) => {
    if (remaining <= 0) return [];
    const plannedDuration = Number.parseInt(block.duration, 10);
    const duration = Math.min(plannedDuration, remaining);
    const adjusted = {
      ...block,
      time: addMinutes(session.time ?? "17:00", elapsed),
      duration: `${duration}분`,
    };
    elapsed += duration;
    remaining -= duration;
    return [adjusted];
  });
}

function LoadSummary({ match }: { match: boolean }) {
  const items = match
    ? [["총 거리", "10.6 km"], ["고속 주행", "1.08 km"], ["스프린트", "26회"], ["최고 속도", "32.4"]]
    : [["총 거리", "8.4 km"], ["고속 주행", "782 m"], ["스프린트", "19회"], ["평균 RPE", "6.3"]];
  return <section className={`session-card session-load ${match ? "match" : ""}`}>
    <header><div><h3>팀 GPS · {match ? "경기 부하" : "RPE"}</h3><p>{match ? "Catapult · 17/18 연결" : "STATSports · 26/26 연결"}</p></div><Badge tone={match ? "orange" : "green"}>{match ? "1명 확인" : "완료"}</Badge></header>
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

function OverviewTab({ match, session }: { match: boolean; session: CalendarEvent }) {
  const sessionTrainingBlocks = getTrainingBlocks(session);
  return <div className="session-overview-grid">
    <div className="session-main-stack">
      <section className="session-card">
        <header><div><h3>{match ? "주요 경기 장면" : "오늘 훈련 내용"}</h3><p>{match ? "득점·교체·부상·전술 변경 8건" : `${sessionTrainingBlocks.length}개 블록 · 총 ${session.duration ?? 120}분 · 담당별 실행 순서`}</p></div><button>{match ? "경기 기록 편집" : "계획 편집"}</button></header>
        {match ? <div className="match-moment-list">{matchMoments.map((moment) => <article key={`${moment.minute}-${moment.title}`}><time>{moment.minute}</time><Badge tone={moment.type === "GOAL" ? "green" : moment.type === "MEDICAL" ? "red" : "purple"}>{moment.type}</Badge><strong>{moment.title}</strong><span>{moment.detail}</span></article>)}</div> : <div className="training-block-list">{sessionTrainingBlocks.map((block) => <article key={block.time}><time>{block.time}</time><i /><strong>{block.title}</strong><span>{block.group} · {block.owner}</span><Badge tone={block.intensity === "High" ? "red" : block.intensity === "Medium" ? "blue" : "green"}>{block.intensity}</Badge><em>{block.duration}</em></article>)}</div>}
      </section>
      <section className="session-card">
        <header><div><h3>{match ? "선수 퍼포먼스 · 경기 부하" : "선수 상태 · GPS"}</h3><p>예외·상위 부하·피드백 대기 선수를 우선 확인합니다.</p></div><Badge tone="orange">예외 {match ? "2" : "3"} · 전체 {match ? "18" : "26"}</Badge></header>
        <PlayerTable match={match} />
      </section>
    </div>
    <aside className="session-side-stack">
      <LoadSummary match={match} />
      <section className="session-card session-memo-card">
        <header><h3>{match ? "감독 총평 · 메모" : "코치 메모"}</h3><button>+ 메모</button></header>
        <article><span>{match ? "총평" : "스태프"}<small>김태호 · 16:42</small></span><p>{match ? "후반 중원 수치 조정 뒤 세컨드볼 회수가 개선됨" : "전환 게임 3세트에서 공격조 반복 수 확보"}</p></article>
        <article><span>메디컬<small>최은지 · 16:51</small></span><p>{match ? "이도윤 발목 3/10, 내일 오전 재확인 예정" : "윤시우는 러닝 제외, 전술 설명과 패스만 참여"}</p></article>
      </section>
      <QuickFeedback match={match} />
    </aside>
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

function PlayersTab({ match }: { match: boolean }) {
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

function QuickFeedback({ match }: { match: boolean }) {
  const [sent, setSent] = useState(false);
  const [player, setPlayer] = useState(match ? "박준호" : "이도윤");
  const [message, setMessage] = useState(match ? "전환 순간 첫 선택이 빨랐고, 약속한 왼발 마무리까지 연결한 점이 좋았어." : "압박을 받기 전 첫 터치 방향을 먼저 준비하고, 다음 패스를 받을 몸의 각도를 만들어보자.");
  return <section className="session-card quick-feedback-card">
    <header><div><h3>{match ? "경기 바로 피드백" : "바로 피드백"}</h3><p>{match ? "장면·출전·GPS를 근거로 전달" : "세션 데이터와 함께 비공개 전달"}</p></div><Badge tone="orange">대기 {match ? "6" : "5"}</Badge></header>
    <label><span>선수</span><select value={player} onChange={(event) => setPlayer(event.target.value)}>{sessionPlayers.map((item) => <option key={item.number}>{item.name}</option>)}</select></label>
    <div className="feedback-evidence"><small>근거</small><strong>{match ? "72′ 전환 6초 · 결승골 · 최고속도 32.4km/h" : "전환 게임 · RPE 6 · GPS 7.8km · 관찰 상태"}</strong></div>
    <label><span>지도자 피드백</span><textarea value={message} onChange={(event) => setMessage(event.target.value)} /></label>
    <footer><label><input type="checkbox" defaultChecked />다음 미션에 연결</label><button onClick={() => setSent(true)}>{sent ? <><Icon name="check" size={15} />전달 완료</> : "피드백 보내기"}</button></footer>
  </section>;
}

function FeedbackTab({ match }: { match: boolean }) {
  return <div className="session-feedback-layout">
    <QuickFeedback match={match} />
    <section className="session-card">
      <header><div><h3>세션 메모</h3><p>스태프 내부 메모와 선수에게 전달된 피드백을 구분합니다.</p></div><button>+ 새 메모</button></header>
      <div className="session-note-list"><article><Badge tone="purple">스태프</Badge><div><strong>전환 블록 반복 수 확보</strong><p>3세트에서 공격조의 반복 수가 부족해 다음 세션에 5분을 추가합니다.</p><small>박성진 · 16:42</small></div></article><article><Badge tone="red">메디컬</Badge><div><strong>이도윤 발목 재확인</strong><p>통증 3/10. 내일 오전 상태 확인 후 주말 경기 출전 시간을 결정합니다.</p><small>최은지 · 17:26</small></div></article><article><Badge tone="blue">피드백</Badge><div><strong>박준호에게 전달 완료</strong><p>전환 순간 첫 선택과 왼발 마무리 장면을 다음 개인 미션에 연결했습니다.</p><small>김태호 · 18:02</small></div></article></div>
    </section>
  </div>;
}

export function SessionDetailView({ sessionId }: { sessionId: string }) {
  const session = getSession(sessionId);
  const match = session.type === "match";
  const performanceSession = session.type === "training" || match;
  const [tab, setTab] = useState<SessionTab>("overview");
  const title = session.id === "match-20260720" ? "FC 안양 U18  2 – 1  수원FC U18" : session.title;
  const sessionMeta = [
    `7월 ${session.day}일`,
    session.time,
    session.duration ? `${session.duration}분` : undefined,
    session.location,
    session.detail,
  ].filter(Boolean).join(" · ");
  const operation = performanceSession ? null : operationalCopy[session.type as keyof typeof operationalCopy];
  const heroStats = match
    ? [["포메이션", "4-3-3"], ["출전", "18명"], ["GPS", "17/18"], ["회고", "12/18"]]
    : session.type === "training"
      ? [["시간", `${session.duration ?? 120}분`], ["강도", "Medium"], ["예외", "3명"], ["GPS", "26/26"]]
      : [["시간", session.duration ? `${session.duration}분` : "종일"], ["대상", operation?.participants ?? "팀"], ["상태", "확정"], ["메모", "1건"]];
  const tabCopy = useMemo(() => tabLabels.map((item) => ({ ...item, label: item.id === "players" ? `${item.label} ${match ? 18 : 26}` : item.id === "gps" ? (match ? "GPS · 경기 부하" : "GPS · RPE") : item.id === "feedback" ? `${item.label} ${match ? 3 : 2}` : item.label })), [match]);
  return <div className="session-detail-page">
    <Link className="session-back" href="/schedule">‹ 일정으로 돌아가기</Link>
    <section className="session-hero">
      <div className="session-hero-kicker"><Badge tone={match ? "orange" : "blue"}>{sessionTypeLabels[session.type]} · {match ? "종료" : "진행 전"}</Badge><span>{match ? "기록 완성도 96% · GPS 1명 확인 필요" : "마지막 수정 12분 전 · 김태호"}</span></div>
      <div className="session-hero-main"><div><h1>{title}</h1><p>{sessionMeta}</p></div>
        <div>{heroStats.map(([label, value]) => <span key={label}><small>{label}</small><strong>{value}</strong></span>)}</div>
      </div>
      {performanceSession && <div className="session-tabs">{tabCopy.map((item) => <button className={tab === item.id ? "active" : ""} key={item.id} onClick={() => setTab(item.id)}>{item.label}</button>)}</div>}
    </section>
    {!performanceSession && <OperationalOverview session={session} />}
    {performanceSession && tab === "overview" && <OverviewTab match={match} session={session} />}
    {performanceSession && tab === "players" && <PlayersTab match={match} />}
    {performanceSession && tab === "gps" && <GpsTab match={match} />}
    {performanceSession && tab === "feedback" && <FeedbackTab match={match} />}
  </div>;
}
