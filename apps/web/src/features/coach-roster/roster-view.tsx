import { players } from "@/features/coach-data/mock-data";
import { ActionButton, Badge, MetricCard, PageHeader, Panel, ProgressBar } from "@/features/coach-ui/components";
import { Icon } from "@/features/coach-shell/icon";

export function RosterView() {
  return <>
    <PageHeader eyebrow="TEAM ROSTER" title="선수단" description="2026 시즌 FC 안양 U18 등록 선수와 역할을 관리합니다." action={<ActionButton>선수 초대</ActionButton>} />
    <div className="metric-grid four compact">
      <MetricCard label="등록 선수" value="26명" helper="정원 30명" tone="blue" />
      <MetricCard label="3학년" value="9명" helper="진학 대상 7명" tone="purple" />
      <MetricCard label="출석률" value="93%" helper="최근 30일" tone="green" />
      <MetricCard label="상태 확인" value="2명" helper="관찰·부상 선수" tone="orange" />
    </div>
    <Panel title="선수 명단" description="선수 프로필과 최근 상태를 확인합니다." action={<div className="table-tools"><label><Icon name="search" size={16} /><input placeholder="이름, 번호, 포지션 검색" /></label><button><Icon name="filter" size={16} />전체 포지션</button></div>}>
      <div className="roster-grid">{players.map((player) => <article className="player-card" key={player.id}>
        <header><span className={`avatar player-card-avatar position-${player.position.toLowerCase()}`}>{player.number}</span><Badge tone={player.status === "정상" ? "green" : player.status === "부상" ? "red" : "orange"}>{player.status}</Badge><button className="more-button"><Icon name="more" /></button></header>
        <h3>{player.name}</h3><p>{player.position} · {player.grade} · {player.dominantFoot}</p>
        <div className="player-physical"><span><small>신장</small><strong>{player.height} cm</strong></span><span><small>체중</small><strong>{player.weight} kg</strong></span></div>
        <div className="player-card-stat"><span>최근 출석률 <strong>{player.attendance}%</strong></span><ProgressBar value={player.attendance} tone="green" /></div>
        <div className="player-card-stat"><span>오늘 준비도 <strong>{player.condition}</strong></span><ProgressBar value={player.condition} tone={player.condition < 60 ? "orange" : "blue"} /></div>
        <button className="player-detail">선수 상세 보기 <Icon name="chevron" size={15} /></button>
      </article>)}</div>
    </Panel>
  </>;
}
