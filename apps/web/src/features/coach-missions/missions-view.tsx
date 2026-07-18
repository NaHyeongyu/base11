import { missions } from "@/features/coach-data/mock-data";
import { ActionButton, Badge, MetricCard, PageHeader, Panel, PlayerIdentity, ProgressBar } from "@/features/coach-ui/components";
import { Icon } from "@/features/coach-shell/icon";

export function MissionsView() {
  return <>
    <PageHeader eyebrow="PLAYER DEVELOPMENT" title="선수 미션" description="선수마다 오늘 집중할 한 가지를 명확하게 전달합니다." action={<ActionButton>미션 만들기</ActionButton>} />
    <div className="metric-grid four compact">
      <MetricCard label="활성 미션" value="24개" helper="팀 공통 1 · 개인 23" tone="blue" />
      <MetricCard label="평균 수행률" value="68%" helper="지난주 대비 +6%" tone="green" />
      <MetricCard label="확인 필요" value="5명" helper="48시간 이상 미응답" tone="orange" />
      <MetricCard label="연속 수행" value="12명" helper="3일 이상 유지" tone="purple" />
    </div>
    <Panel title="이번 주 팀 포커스" description="모든 개인 미션의 기준이 되는 팀 공통 방향입니다." action={<button className="table-action">수정</button>}>
      <div className="team-focus"><span><Icon name="target" size={28} /></span><div><Badge tone="blue">WEEK 29</Badge><h3>공을 잃은 순간 5초 안에 압박 구조 만들기</h3><p>가장 가까운 선수는 즉시 압박하고, 나머지 선수는 중앙 패스 길을 차단합니다.</p></div><div className="focus-stats"><strong>4</strong><small>적용 훈련</small><strong>73%</strong><small>팀 수행률</small></div></div>
    </Panel>
    <Panel title="개인 미션 현황" description="최근 훈련 기준으로 자동 정렬됩니다." action={<div className="table-tools"><label><Icon name="search" size={16} /><input placeholder="선수 또는 미션 검색" /></label><button><Icon name="filter" size={16} />진행 중</button></div>}>
      <div className="data-table mission-table"><div className="table-head"><span>선수</span><span>현재 미션</span><span>진행률</span><span>연속 수행</span><span>최근 응답</span><span /></div>
        {missions.map((mission) => <div className="table-row" key={mission.player.id}><PlayerIdentity player={mission.player} compact /><strong className="mission-title">{mission.title}</strong><div className="mission-progress"><span><strong>{mission.progress}%</strong></span><ProgressBar value={mission.progress} tone={mission.progress >= 70 ? "green" : "blue"} /></div><span><Badge tone="purple">{mission.streak}일 연속</Badge></span><span className="table-muted">{mission.updated}</span><button className="more-button"><Icon name="more" /></button></div>)}
      </div>
    </Panel>
  </>;
}
