"use client";

import { useState } from "react";
import { matches, players } from "@/features/coach-data/mock-data";
import { Icon } from "@/features/coach-shell/icon";
import { ActionButton, Badge, MetricCard, Panel, PlayerIdentity, ProgressBar } from "@/features/coach-ui/components";

type TeamTab = "overview" | "roster" | "staff" | "records" | "settings";

const tabs: Array<{ id: TeamTab; label: string }> = [
  { id: "overview", label: "팀 개요" },
  { id: "roster", label: "선수단" },
  { id: "staff", label: "코칭스태프" },
  { id: "records", label: "시즌 기록" },
  { id: "settings", label: "팀 설정" },
];

const staff = [
  { name: "김태호", role: "감독", initial: "김", specialty: "팀 운영 · 전술", contact: "010-4821-2036", status: "관리자" },
  { name: "박성진", role: "수석코치", initial: "박", specialty: "공격 · 세트피스", contact: "010-2274-9810", status: "지도자" },
  { name: "이상훈", role: "GK 코치", initial: "이", specialty: "골키퍼 · 빌드업", contact: "010-8301-1178", status: "지도자" },
  { name: "최은지", role: "의무 트레이너", initial: "최", specialty: "재활 · 컨디셔닝", contact: "010-6204-8177", status: "메디컬" },
];

const teamInfo = [
  ["소속", "FC 안양 아카데미"],
  ["연령", "U18 · 고등부"],
  ["창단", "2013년 3월"],
  ["연고지", "경기도 안양시"],
  ["주 훈련장", "안양종합운동장 보조구장"],
  ["대표 연락처", "academy@fc-anyang.com"],
];

function TeamHero() {
  return <section className="team-detail-hero">
    <div className="team-hero-main">
      <span className="team-hero-crest">A</span>
      <div>
        <p>FC ANYANG ACADEMY · 2026 SEASON</p>
        <h1>FC 안양 U18</h1>
        <div className="team-hero-meta"><span>대한민국 · 경기도 안양</span><i /><span>K리그 주니어 U18</span><Badge tone="green">운영 중</Badge></div>
      </div>
    </div>
    <div className="team-hero-actions">
      <ActionButton icon="share" secondary>초대 링크</ActionButton>
      <ActionButton icon="edit">팀 정보 수정</ActionButton>
    </div>
    <div className="team-hero-stats">
      <div><small>등록 선수</small><strong>26</strong><span>정원 30명</span></div>
      <div><small>코칭스태프</small><strong>5</strong><span>권한 활성 5명</span></div>
      <div><small>시즌 전적</small><strong>8승 2무 2패</strong><span>승률 67%</span></div>
      <div><small>최근 출석률</small><strong>93%</strong><span className="positive">전월 대비 +2.4%</span></div>
    </div>
  </section>;
}

function OverviewTab() {
  return <>
    <div className="team-overview-grid">
      <Panel title="팀 기본 정보" description="선수와 학부모에게 공개되는 공식 정보입니다." action={<button className="panel-icon-button" aria-label="팀 정보 수정"><Icon name="edit" size={17} /></button>}>
        <dl className="team-info-list">{teamInfo.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      </Panel>
      <Panel title="2026 시즌 목표" description="코칭스태프가 공유하는 팀의 공통 목표입니다.">
        <div className="season-goal">
          <div><span>전국대회 토너먼트 진출</span><strong>72%</strong></div><ProgressBar value={72} tone="blue" />
          <p>리그 12경기 중 8승 · 남은 경기 10경기</p>
        </div>
        <div className="goal-list">
          <div><Icon name="check" size={17} /><span><strong>경기당 실점 1.0 이하</strong><small>현재 1.08 · 목표 근접</small></span><Badge tone="orange">진행 중</Badge></div>
          <div><Icon name="check" size={17} /><span><strong>선수 평균 출석률 92%</strong><small>현재 93% · 기준 달성</small></span><Badge tone="green">달성</Badge></div>
          <div><Icon name="target" size={17} /><span><strong>개인 미션 주간 완료율 80%</strong><small>현재 74% · 6%p 필요</small></span><Badge tone="blue">진행 중</Badge></div>
        </div>
      </Panel>
    </div>
    <div className="team-overview-lower">
      <Panel title="코칭스태프" description="팀 운영 권한이 있는 구성원" action={<button className="text-button">전체 보기 <Icon name="chevron" size={14} /></button>}>
        <div className="staff-compact-list">{staff.slice(0, 3).map((member) => <article key={member.name}><span>{member.initial}</span><div><strong>{member.name}</strong><small>{member.role} · {member.specialty}</small></div><Badge tone={member.role === "감독" ? "blue" : "gray"}>{member.status}</Badge></article>)}</div>
      </Panel>
      <Panel title="최근 경기" description="K리그 주니어 U18" action={<button className="text-button">경기 기록 <Icon name="chevron" size={14} /></button>}>
        <div className="team-recent-matches">{matches.slice(0, 3).map((match) => <article key={`${match.date}-${match.opponent}`}><time>{match.date}</time><Badge tone={match.result === "승" ? "green" : match.result === "패" ? "red" : "gray"}>{match.result}</Badge><div><strong>{match.opponent}</strong><small>{match.competition}</small></div><b>{match.home} <em>:</em> {match.away}</b></article>)}</div>
      </Panel>
      <Panel title="구성원 연결" description="초대와 계정 연결 상태">
        <div className="member-connect-list">
          <div><span className="connect-icon blue"><Icon name="users" size={18} /></span><span><strong>선수 계정</strong><small>24 / 26명 연결</small></span><Badge tone="orange">2명 대기</Badge></div>
          <div><span className="connect-icon purple"><Icon name="shield" size={18} /></span><span><strong>보호자 계정</strong><small>31명 · 선수 25명 연결</small></span><Badge tone="green">96%</Badge></div>
          <button><Icon name="share" size={16} />팀 초대 링크 관리</button>
        </div>
      </Panel>
    </div>
  </>;
}

function RosterTab() {
  return <Panel title="등록 선수 26명" description="선수의 소속 정보와 오늘 상태를 함께 확인합니다." action={<div className="table-tools"><label><Icon name="search" size={16} /><input aria-label="선수 검색" placeholder="이름, 번호, 포지션 검색" /></label><button><Icon name="filter" size={16} />전체 학년</button></div>}>
    <div className="team-roster-table">
      <div className="team-roster-head"><span>선수</span><span>학년</span><span>주발</span><span>출석률</span><span>오늘 준비도</span><span>상태</span><span /></div>
      {players.map((player) => <div className="team-roster-row" key={player.id}><PlayerIdentity player={player} /><span>{player.grade}</span><span>{player.dominantFoot}</span><div className="inline-progress"><ProgressBar value={player.attendance} tone="green" /><strong>{player.attendance}%</strong></div><div className="inline-progress"><ProgressBar value={player.condition} tone={player.condition < 60 ? "orange" : "blue"} /><strong>{player.condition}</strong></div><Badge tone={player.status === "정상" ? "green" : player.status === "부상" ? "red" : "orange"}>{player.status}</Badge><button className="more-button" aria-label={`${player.name} 메뉴`}><Icon name="more" /></button></div>)}
    </div>
  </Panel>;
}

function StaffTab() {
  return <>
    <div className="team-section-header"><div><h2>코칭스태프</h2><p>지도자 권한과 담당 영역을 관리합니다.</p></div><ActionButton>스태프 초대</ActionButton></div>
    <div className="staff-card-grid">{staff.map((member, index) => <article key={member.name} className="staff-card"><header><span>{member.initial}</span><Badge tone={index === 0 ? "blue" : index === 3 ? "purple" : "gray"}>{member.status}</Badge><button className="more-button" aria-label={`${member.name} 메뉴`}><Icon name="more" /></button></header><h3>{member.name}</h3><p>{member.role}</p><dl><div><dt>담당</dt><dd>{member.specialty}</dd></div><div><dt>연락처</dt><dd>{member.contact}</dd></div></dl><button className="staff-detail-button">권한 및 프로필 보기 <Icon name="chevron" size={15} /></button></article>)}</div>
    <Panel title="권한 안내" description="민감한 선수 정보는 역할별로 최소한만 노출합니다.">
      <div className="permission-grid"><div><Badge tone="blue">관리자</Badge><strong>팀 전체 관리</strong><p>구성원, 일정, 공지, 건강 정보, 권한 설정</p></div><div><Badge tone="gray">지도자</Badge><strong>훈련 및 선수 관리</strong><p>일정, 출석, 미션, 피드백, 경기 기록</p></div><div><Badge tone="purple">메디컬</Badge><strong>건강 정보 관리</strong><p>선수 컨디션, 통증, 부상 및 복귀 상태</p></div></div>
    </Panel>
  </>;
}

function RecordsTab() {
  return <>
    <div className="metric-grid four compact"><MetricCard label="시즌 경기" value="12경기" helper="리그 10 · 대회 2" tone="blue" /><MetricCard label="승점" value="26점" helper="8승 2무 2패" tone="green" /><MetricCard label="득실차" value="+13" helper="25득점 · 12실점" tone="purple" /><MetricCard label="클린시트" value="5경기" helper="전체 경기의 42%" tone="orange" /></div>
    <div className="team-record-grid">
      <Panel title="시즌 흐름" description="최근 12경기 결과"><div className="form-strip">{["승", "승", "무", "승", "패", "승", "승", "무", "승", "승", "패", "승"].map((result, index) => <span key={index} className={result === "승" ? "win" : result === "패" ? "loss" : "draw"}>{result}</span>)}</div><div className="record-summary"><div><small>최근 5경기</small><strong>3승 1무 1패</strong></div><div><small>경기당 득점</small><strong>2.08</strong></div><div><small>경기당 실점</small><strong>1.00</strong></div></div></Panel>
      <Panel title="대회별 성적" description="2026 시즌"><div className="competition-list"><div><span><strong>K리그 주니어 U18</strong><small>10경기 · 7승 2무 1패</small></span><Badge tone="blue">2위</Badge></div><div><span><strong>전국고등축구리그</strong><small>2경기 · 1승 1패</small></span><Badge tone="orange">조별리그</Badge></div></div></Panel>
    </div>
    <Panel title="최근 경기 기록" description="최종 승인된 공식 기록"><div className="team-match-table">{matches.map((match) => <article key={`${match.date}-${match.opponent}`}><time>{match.date}</time><span><strong>{match.opponent}</strong><small>{match.competition}</small></span><b>{match.home} <em>:</em> {match.away}</b><Badge tone={match.result === "승" ? "green" : match.result === "패" ? "red" : "gray"}>{match.result}</Badge><span className="match-meta">점유 {match.possession}% · 슈팅 {match.shots}</span><button className="more-button"><Icon name="chevron" size={16} /></button></article>)}</div></Panel>
  </>;
}

function SettingsTab() {
  return <div className="team-settings-grid">
    <Panel title="팀 공개 정보" description="선수·학부모 화면에 표시되는 정보"><div className="settings-form"><label><span>팀 이름</span><input defaultValue="FC 안양 U18" /></label><label><span>시즌</span><input defaultValue="2026" /></label><label className="full"><span>팀 소개</span><textarea defaultValue="FC 안양의 미래를 만드는 U18 유소년 팀입니다." /></label><label className="full"><span>주 훈련장</span><input defaultValue="안양종합운동장 보조구장" /></label><button className="action-button">변경사항 저장</button></div></Panel>
    <div className="settings-side"><Panel title="운영 정책" description="팀 기본 동작 설정"><div className="team-toggle-list"><label><span><strong>선수 컨디션 체크</strong><small>훈련 4시간 전 자동 요청</small></span><input type="checkbox" defaultChecked /></label><label><span><strong>보호자 일정 공개</strong><small>집합 시간과 장소를 자동 공유</small></span><input type="checkbox" defaultChecked /></label><label><span><strong>선수 간 프로필 공개</strong><small>번호, 포지션, 학년만 표시</small></span><input type="checkbox" defaultChecked /></label></div></Panel><Panel title="팀 보관 및 삭제" description="복구가 어려운 작업은 추가 확인이 필요합니다."><div className="danger-zone"><p>시즌 종료 후 팀을 보관하면 구성원은 읽기 전용으로 전환됩니다.</p><button>2026 시즌 팀 보관</button></div></Panel></div>
  </div>;
}

export function TeamDetailView() {
  const [tab, setTab] = useState<TeamTab>("overview");
  return <>
    <TeamHero />
    <nav className="team-detail-tabs" aria-label="팀 상세 메뉴">{tabs.map((item) => <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}>{item.label}</button>)}</nav>
    <div className="team-tab-content">
      {tab === "overview" && <OverviewTab />}
      {tab === "roster" && <RosterTab />}
      {tab === "staff" && <StaffTab />}
      {tab === "records" && <RecordsTab />}
      {tab === "settings" && <SettingsTab />}
    </div>
  </>;
}
