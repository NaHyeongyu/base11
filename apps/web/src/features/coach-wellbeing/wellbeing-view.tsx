import { playerIssues } from "@/features/coach-wellbeing/data/wellbeing-preview-data";
import { players } from "@/features/players/data/player-preview-data";
import { PlayerIdentity } from "@/features/players/ui/player-identity";
import { Badge, MetricCard, PageHeader, Panel, ProgressBar } from "@/shared/ui/components";

export function WellbeingView() {
  return <>
    <PageHeader eyebrow="EXCEPTION-BASED PLAYER CARE" title="선수 이슈" description="정상 상태의 반복 입력은 요구하지 않고, 통증·복귀·참여 제한처럼 지도자의 결정이 필요한 예외만 관리합니다." />
    <div className="metric-grid four compact">
      <MetricCard label="열린 이슈" value="3건" helper="통증 1 · 복귀 1 · 목표 1" tone="orange" />
      <MetricCard label="훈련 제한" value="1명" helper="MD-2 세션에 반영" tone="red" />
      <MetricCard label="복귀 관리" value="1명" helper="피치 복귀 승인 대기" tone="purple" />
      <MetricCard label="담당 지정" value="100%" helper="미지정 이슈 없음" tone="green" />
    </div>
    <div className="content-grid wellbeing-grid">
      <Panel title="결정이 필요한 이슈" description="세션 계획에 영향을 주는 항목만 표시합니다." action={<Badge tone="orange">{playerIssues.length}건</Badge>}>
        <div className="risk-list">{playerIssues.map((item) => <div key={item.player.id}><PlayerIdentity player={item.player} compact /><div><Badge tone={item.tone}>{item.type}</Badge><strong>{item.detail}</strong><small>{item.action} · 담당 {item.owner}</small></div><button>결정</button></div>)}</div>
      </Panel>
      <Panel title="MD-2 적용 상태" description="선수 이슈가 오늘 세션에 반영된 결과입니다.">
        <div className="session-readiness"><div><span>제한 훈련 그룹</span><Badge tone="orange">1명</Badge></div><div><span>메디컬 확인</span><Badge tone="green">완료</Badge></div><div><span>세션 담당 공유</span><Badge tone="green">완료</Badge></div><div><span>보호자 공개</span><Badge tone="gray">필요 정보만</Badge></div></div>
      </Panel>
    </div>
    <Panel title="선수별 최근 부하" description="GPS 데이터와 지도자 조치 기록을 함께 봅니다.">
      <div className="data-table wellbeing-table"><div className="table-head"><span>선수</span><span>최근 세션</span><span>세션 부하</span><span>상태</span><span>지도자 조치</span></div>
        {players.slice(0, 6).map((player) => <div className="table-row" key={player.id}><PlayerIdentity player={player} compact /><span className="table-muted">MD-4 연습 경기</span><div className="inline-progress"><ProgressBar value={player.sessionLoad} tone={player.sessionLoad > 85 ? "orange" : "blue"} /><strong>{player.sessionLoad}</strong></div><Badge tone={player.status === "정상" ? "green" : player.status === "부상" ? "red" : "orange"}>{player.status}</Badge><span>{player.status === "정상" ? "추가 조치 없음" : "MD-2 강도 조정"}</span></div>)}
      </div>
    </Panel>
  </>;
}
