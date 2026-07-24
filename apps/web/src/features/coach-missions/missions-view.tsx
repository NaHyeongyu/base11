import { missions } from "@/features/coach-missions/data/missions-preview-data";
import { PlayerIdentity } from "@/features/players/ui/player-identity";
import { ActionButton, Badge, MetricCard, PageHeader, Panel, ProgressBar } from "@/shared/ui/components";
import { Icon } from "@/shared/ui/icon";

export function MissionsView() {
  return <>
    <PageHeader eyebrow="PLAYER DEVELOPMENT" title="선수 목표" description="세션마다 바뀌는 숙제가 아니라 기준값, 목표값, 측정 근거와 리뷰 주기가 있는 성장 목표를 관리합니다." action={<ActionButton>목표 만들기</ActionButton>} />
    <div className="metric-grid four compact">
      <MetricCard label="활성 목표" value="24개" helper="팀 목표 1 · 개인 목표 23" tone="blue" />
      <MetricCard label="평균 진척" value="68%" helper="실제 세션 근거 기준" tone="green" />
      <MetricCard label="리뷰 예정" value="5명" helper="이번 주 코칭 미팅" tone="orange" />
      <MetricCard label="근거 연결" value="89%" helper="GPS·경기·지도자 평가" tone="purple" />
    </div>
    <Panel title="이번 주 팀 포커스" description="개인 목표를 실제 세션 행동으로 연결하는 팀 공통 방향입니다." action={<button className="table-action">수정</button>}>
      <div className="team-focus"><span><Icon name="target" size={28} /></span><div><Badge tone="blue">WEEK 29</Badge><h3>공을 잃은 순간 5초 안에 압박 구조 만들기</h3><p>가장 가까운 선수는 즉시 압박하고, 나머지 선수는 중앙 패스 길을 차단합니다.</p></div><div className="focus-stats"><strong>4</strong><small>적용 훈련</small><strong>73%</strong><small>팀 수행률</small></div></div>
    </Panel>
    <Panel title="개인 목표 현황" description="다음 리뷰 시점과 근거가 부족한 선수부터 확인합니다." action={<div className="table-tools"><label><Icon name="search" size={16} /><input placeholder="선수 또는 목표 검색" /></label><button><Icon name="filter" size={16} />진행 중</button></div>}>
      <div className="data-table mission-table"><div className="table-head"><span>선수</span><span>성장 목표</span><span>진척</span><span>연결 근거</span><span>다음 리뷰</span><span /></div>
        {missions.map((mission, index) => <div className="table-row" key={mission.player.id}><PlayerIdentity player={mission.player} compact /><strong className="mission-title">{mission.title}</strong><div className="mission-progress"><span><strong>{mission.progress}%</strong></span><ProgressBar value={mission.progress} tone={mission.progress >= 70 ? "green" : "blue"} /></div><span><Badge tone="purple">{mission.streak + 2}개 세션</Badge></span><span className="table-muted">{["7월 21일","7월 22일","7월 23일","7월 24일","7월 25일"][index]}</span><button className="more-button"><Icon name="more" /></button></div>)}
      </div>
    </Panel>
  </>;
}
