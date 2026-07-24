import { matches } from "@/features/coach-matches/data/matches-preview-data";
import { ActionButton, Badge, MetricCard, PageHeader, Panel } from "@/shared/ui/components";
import { Icon } from "@/shared/ui/icon";

export function MatchesView() {
  return <>
    <PageHeader eyebrow="2026 SEASON" title="경기 기록" description="일정, 결과와 팀 경기 데이터를 시즌 단위로 관리합니다." action={<ActionButton>경기 등록</ActionButton>} />
    <div className="metric-grid four compact">
      <MetricCard label="시즌 경기" value="12경기" helper="7승 3무 2패" tone="blue" />
      <MetricCard label="승점" value="24점" helper="리그 3위" tone="green" />
      <MetricCard label="득실차" value="+9" helper="21득점 · 12실점" tone="purple" />
      <MetricCard label="다음 경기" value="D-2" helper="vs 수원FC U18" tone="orange" />
    </div>
    <Panel title="다음 경기" description="K리그 주니어 U18 · 14라운드">
      <div className="next-match"><div className="match-date"><strong>7월 20일</strong><span>일요일 · 15:00</span><small>수원월드컵 보조구장</small></div><div className="match-team"><span className="large-crest home">A</span><strong>FC 안양 U18</strong></div><div className="match-versus"><Badge tone="orange">AWAY</Badge><strong>VS</strong><small>경기 D-2</small></div><div className="match-team"><span className="large-crest away">S</span><strong>수원FC U18</strong></div><div className="match-actions"><button>명단 관리</button><button className="action-button">경기 준비</button></div></div>
    </Panel>
    <div className="content-grid match-grid">
      <Panel title="최근 경기" description="최근 4경기 2승 1무 1패" action={<button className="table-action">전체 시즌</button>}>
        <div className="match-list">{matches.map((match) => <div key={`${match.date}-${match.opponent}`}><time>{match.date}</time><Badge tone={match.result === "승" ? "green" : match.result === "패" ? "red" : "gray"}>{match.result}</Badge><div><small>{match.competition}</small><strong>{match.opponent}</strong></div><span className="score">{match.home} <em>:</em> {match.away}</span><button className="more-button"><Icon name="chevron" /></button></div>)}</div>
      </Panel>
      <Panel title="시즌 퍼포먼스" description="리그 경기 기준">
        <div className="season-ring"><div><strong>67%</strong><small>승률</small></div><p><span><i className="win" />7승</span><span><i className="draw" />3무</span><span><i className="loss" />2패</span></p></div>
        <div className="season-stats"><div><span>경기당 득점</span><strong>1.75</strong></div><div><span>경기당 실점</span><strong>1.00</strong></div><div><span>평균 점유율</span><strong>52%</strong></div><div><span>평균 슈팅</span><strong>10.4</strong></div></div>
      </Panel>
    </div>
  </>;
}
