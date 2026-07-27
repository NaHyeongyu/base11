"use client";

import Link from "next/link";
import { useState } from "react";
import { players } from "@/features/players/data/player-preview-data";
import { Badge, ProgressBar } from "@/shared/ui/components";
import { Icon } from "@/shared/ui/icon";

const recentSessions = [
  ["7/23 · 훈련", "60분", "7.2km", "0.68km", "6", "첫 터치 방향"],
  ["7/21 · 경기", "68분", "8.9km", "0.92km", "7", "후반 피로"],
  ["7/19 · 훈련", "75분", "8.1km", "0.76km", "6", "압박 반응 양호"],
  ["7/17 · 훈련", "55분", "6.4km", "0.54km", "5", "발목 2/10"],
];

export function PlayerDetailView({ playerId }: { playerId: number }) {
  const player = players.find((item) => item.id === playerId) ?? players[2];
  const [saved, setSaved] = useState(false);
  const condition = player.id === 3 ? 52 : player.condition;
  return <div className="player-detail-page">
    <Link href="/roster" className="session-back">‹ 선수단으로 돌아가기</Link>
    <section className="player-profile-hero">
      <div className={`player-number position-${player.position.toLowerCase()}`}>{player.number}</div>
      <div><h1>{player.name}</h1><p>{player.position} · {player.grade} · {player.height}cm · {player.weight}kg</p><span><Badge tone={player.status === "정상" ? "green" : "orange"}>{player.status === "정상" ? "정상 참여" : "제한 참여"}</Badge><small>최근 측정 2026. 07. 20</small></span></div>
      <div className="profile-quick-stats"><span><small>오늘 컨디션</small><strong>{condition}</strong></span><span><small>현재 상태</small><strong>{player.status}</strong></span><span><small>최근 부하</small><strong>{player.sessionLoad} AU</strong></span><span><small>GPS 최고</small><strong>9.1km</strong></span></div>
      <button onClick={() => setSaved(true)}>{saved ? <><Icon name="check" size={16} />판단 저장됨</> : "판단 저장"}</button>
    </section>
    <div className="player-detail-tabs"><button className="active">요약</button><button>컨디션·부상</button><button>훈련·경기</button><button>피지컬·성장</button><button>메모·피드백</button></div>
    <div className="player-detail-layout">
      <main>
        <section className="player-detail-card readiness-card">
          <header><div><h2>오늘 컨디션·부상</h2><p>수면 입력 없이 컨디션, 통증과 참여 판단만 관리합니다.</p></div><Badge tone={condition < 60 ? "orange" : "green"}>{condition < 60 ? "확인 필요" : "정상"}</Badge></header>
          <div className="readiness-metrics"><article><small>컨디션</small><strong>{condition} / 100</strong><ProgressBar value={condition} tone={condition < 60 ? "orange" : "green"} /></article><article><small>통증</small><strong>{player.id === 3 ? "발목 3/10" : "없음"}</strong><ProgressBar value={player.id === 3 ? 30 : 0} tone="red" /></article><article><small>최근 7일 부하</small><strong>{player.sessionLoad} AU</strong><ProgressBar value={player.sessionLoad} tone={player.sessionLoad > 85 ? "orange" : "blue"} /></article><article><small>가용 시간</small><strong>{player.id === 3 ? "최대 60분" : "전체 참여"}</strong><ProgressBar value={player.id === 3 ? 67 : 100} tone="blue" /></article></div>
        </section>
        <section className="player-detail-card load-history-card">
          <header><div><h2>최근 세션 부하</h2><p>최근 6개 훈련·경기의 내부·외부 부하</p></div><Badge tone="purple">ACWR 1.12</Badge></header>
          <div className="player-load-bars">{[54, 66, 74, 67, 82, 72].map((value, index) => <div key={index}><i><span style={{ height: `${value}%` }} /></i><small>7/{13 + index * 2}</small></div>)}<aside><strong>최근 7.2km</strong><span>HSR 0.68km</span><em>RPE 6 · 72 AU</em></aside></div>
        </section>
        <section className="player-detail-card recent-session-card">
          <header><h2>최근 훈련·경기 기록</h2><button>전체 보기</button></header>
          <div className="player-session-table"><div><span>일자·유형</span><span>참여</span><span>GPS 거리</span><span>HSR</span><span>RPE</span><span>코치 메모</span></div>{recentSessions.map((row) => <div key={row[0]}>{row.map((value, index) => index === 5 ? <strong key={value}>{value}</strong> : <span key={`${value}-${index}`}>{value}</span>)}</div>)}</div>
        </section>
      </main>
      <aside>
        <section className="player-decision-card"><span>오늘 참여 판단</span><strong>{player.id === 3 ? "정상 참여 · 최대 60분" : "정상 참여"}</strong><p>• 고강도 러닝 {player.id === 3 ? "80% 제한" : "정상 수행"}</p><p>• 세션 종료 후 통증 재확인</p><button>판단 수정</button></section>
        <section className="player-detail-card body-record-card"><header><h2>신체·성장 기록</h2></header><dl><div><dt>신장</dt><dd>{player.height}cm</dd></div><div><dt>체중</dt><dd>{player.weight}kg</dd></div><div><dt>12개월 키</dt><dd>+4.2cm</dd></div><div><dt>12개월 체중</dt><dd>+3.1kg</dd></div><div><dt>성장 이력</dt><dd>{player.height - 4.2} → {player.height}</dd></div><div><dt>성장 추세</dt><dd>정상 범위</dd></div></dl></section>
        <section className="player-detail-card physical-record-card"><header><h2>개인 피지컬 기록</h2></header><dl><div><dt>30m 스프린트</dt><dd>4.18s</dd></div><div><dt>최고 속도</dt><dd>31.4km/h</dd></div><div><dt>CMJ</dt><dd>42cm</dd></div><div><dt>Yo-Yo IR1</dt><dd>1980m</dd></div><div><dt>5-10-5</dt><dd>4.62s</dd></div><div><dt>최근 측정</dt><dd>7/20</dd></div></dl></section>
        <section className="player-feedback-card"><header><h2>최근 메모·피드백</h2><Badge tone="blue">7/23</Badge></header><p>전진 패스 선택은 좋았어. 다음 세션은 첫 터치 방향을 먼저 준비하자.</p><hr /><small>다음 목표</small><strong>압박 전 첫 터치 방향을 미리 설정</strong></section>
      </aside>
    </div>
  </div>;
}
