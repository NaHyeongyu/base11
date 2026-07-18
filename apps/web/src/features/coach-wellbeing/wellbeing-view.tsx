import { attendanceRows, players } from "@/features/coach-data/mock-data";
import { Badge, MetricCard, PageHeader, Panel, PlayerIdentity, ProgressBar } from "@/features/coach-ui/components";

export function WellbeingView() {
  const risks = players.filter((player) => player.status !== "정상");
  return <>
    <PageHeader eyebrow="PLAYER WELLBEING" title="컨디션·부상" description="민감한 선수 상태는 지도자 권한이 있는 구성원만 확인할 수 있습니다." />
    <div className="metric-grid four compact">
      <MetricCard label="체크 완료" value="22 / 26" helper="오늘 17:40 기준" tone="blue" />
      <MetricCard label="팀 준비도" value="78점" helper="최근 7일 평균" tone="green" />
      <MetricCard label="관찰 필요" value="2명" helper="통증·피로 기준" tone="orange" />
      <MetricCard label="부상 관리" value="1명" helper="복귀 프로그램 진행" tone="red" />
    </div>
    <div className="content-grid wellbeing-grid">
      <Panel title="오늘의 팀 준비도" description="체크인 응답 기준">
        <div className="readiness-hero"><div className="score-ring"><strong>78</strong><small>GOOD</small></div><div className="readiness-copy"><Badge tone="green">훈련 진행 적합</Badge><h3>전반적으로 안정적인 상태입니다.</h3><p>피로도가 높은 2명의 훈련 강도를 개별 조정하세요.</p></div></div>
        <div className="readiness-bars expanded">
          <div><span>수면 회복</span><ProgressBar value={82} tone="blue" /><strong>82</strong></div>
          <div><span>근육 피로</span><ProgressBar value={71} tone="orange" /><strong>71</strong></div>
          <div><span>기분·의욕</span><ProgressBar value={85} tone="green" /><strong>85</strong></div>
          <div><span>통증 위험</span><ProgressBar value={18} tone="red" /><strong>18</strong></div>
        </div>
      </Panel>
      <Panel title="관찰 선수" description="훈련 전에 직접 확인해주세요." action={<Badge tone="orange">{risks.length}명</Badge>}>
        <div className="risk-list">{risks.map((player) => { const row = attendanceRows.find((item) => item.player.id === player.id); return <div key={player.id}><PlayerIdentity player={player} compact /><div><Badge tone={player.status === "부상" ? "red" : "orange"}>{player.status}</Badge><strong>{row?.pain}</strong><small>준비도 {player.condition}점</small></div><button>상세</button></div>; })}</div>
      </Panel>
    </div>
    <Panel title="최근 상태 보고" description="선수별 변화와 지도자 조치 기록입니다.">
      <div className="data-table wellbeing-table"><div className="table-head"><span>선수</span><span>보고 시각</span><span>준비도</span><span>통증</span><span>지도자 조치</span></div>
        {attendanceRows.slice(0, 6).map((row, index) => <div className="table-row" key={row.player.id}><PlayerIdentity player={row.player} compact /><span className="table-muted">오늘 {17 + Math.floor(index / 3)}:{22 + index * 3}</span><span><strong>{row.player.condition}</strong> / 100</span><span className={row.pain !== "없음" ? "pain-text" : "table-muted"}>{row.pain}</span><span>{row.pain !== "없음" ? "훈련 강도 조정" : "정상 참여"}</span></div>)}
      </div>
    </Panel>
  </>;
}
