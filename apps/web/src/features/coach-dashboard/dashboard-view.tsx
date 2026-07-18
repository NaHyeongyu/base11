import Link from "next/link";
import { attendanceRows, todaySchedule } from "@/features/coach-data/mock-data";
import { ActionButton, Badge, MetricCard, PageHeader, Panel, PlayerIdentity, ProgressBar } from "@/features/coach-ui/components";
import { Icon } from "@/features/coach-shell/icon";

export function DashboardView() {
  const attention = attendanceRows.filter((row) => row.condition === "주의" || row.response === "미응답" || row.response === "결석");
  return <>
    <PageHeader eyebrow="FRIDAY · JUL 18" title="팀의 오늘을 준비하세요" description="훈련 시작까지 2시간 18분 남았습니다." action={<ActionButton>새 일정</ActionButton>} />
    <div className="metric-grid four">
      <MetricCard label="오늘 참여" value="24 / 26" helper="응답률 92%" tone="blue" delta="+4%" />
      <MetricCard label="컨디션 확인" value="22명" helper="주의 선수 2명" tone="green" />
      <MetricCard label="피드백 대기" value="5건" helper="오늘 마감 2건" tone="purple" />
      <MetricCard label="다음 경기" value="D-2" helper="vs 수원FC U18" tone="orange" />
    </div>

    <div className="content-grid dashboard-primary">
      <Panel title="오늘 타임라인" description="팀 일정과 필요한 액션을 시간순으로 확인하세요." action={<Link className="text-link" href="/schedule">일정 전체보기 <Icon name="chevron" size={15} /></Link>}>
        <div className="timeline-list">
          {todaySchedule.map((event, index) => <div className="timeline-row" key={event.time}>
            <div className="timeline-time"><strong>{event.time}</strong><span>{event.end}</span></div>
            <i className={`timeline-dot tone-${event.tone}`} />
            <div className="timeline-event"><div><Badge tone={event.tone}>{event.type}</Badge><strong>{event.title}</strong></div><p><Icon name="location" size={15} />{event.location}<span>·</span><Icon name="users" size={15} />{event.participants}</p></div>
            <button className="more-button" aria-label={`${event.title} 메뉴`}><Icon name="more" /></button>
            {index < todaySchedule.length - 1 && <span className="timeline-line" />}
          </div>)}
        </div>
      </Panel>

      <Panel title="지금 확인이 필요해요" description="선수의 중요한 변화를 놓치지 마세요." action={<Badge tone="red">3건</Badge>}>
        <div className="attention-list">
          {attention.map((item) => <div className="attention-row" key={item.player.id}>
            <PlayerIdentity player={item.player} compact />
            <div className="attention-message"><strong>{item.pain === "없음" ? "참여 상태 미확인" : item.pain}</strong><span>{item.response} · {item.condition}</span></div>
            <button>확인</button>
          </div>)}
        </div>
        <Link href="/wellbeing" className="panel-footer-link">컨디션 현황 자세히 보기 <Icon name="chevron" size={15} /></Link>
      </Panel>
    </div>

    <div className="content-grid dashboard-secondary">
      <Panel title="이번 주 훈련 부하" description="선수 입력과 일정 기준의 팀 평균입니다.">
        <div className="load-chart" aria-label="이번 주 훈련 부하 막대 그래프">
          {[42, 68, 82, 20, 76, 54, 88].map((value, index) => <div key={index}><span style={{ height: `${value}%` }} className={index === 4 ? "current" : ""} /><small>{["월","화","수","목","금","토","일"][index]}</small></div>)}
        </div>
        <div className="load-legend"><span><i className="legend-blue" />팀 훈련 부하</span><strong>주간 평균 66%</strong></div>
      </Panel>
      <Panel title="운영 체크리스트" description="경기 전까지 필요한 준비입니다.">
        <div className="checklist">
          <label><input type="checkbox" defaultChecked /><span><strong>경기 일정 공지</strong><small>선수·학부모 24/26 확인</small></span></label>
          <label><input type="checkbox" defaultChecked /><span><strong>원정 차량 확정</strong><small>28인승 버스 · 13:00 출발</small></span></label>
          <label><input type="checkbox" /><span><strong>출전 명단 제출</strong><small>내일 18:00 마감</small></span></label>
          <label><input type="checkbox" /><span><strong>세트피스 영상 공유</strong><small>선수단 전체</small></span></label>
        </div>
      </Panel>
      <Panel title="팀 컨디션" description="최근 7일 평균">
        <div className="readiness-score"><div><strong>78</strong><span>/ 100</span></div><Badge tone="green">양호</Badge></div>
        <div className="readiness-bars">
          <div><span>수면</span><ProgressBar value={82} tone="blue" /><strong>82</strong></div>
          <div><span>피로</span><ProgressBar value={71} tone="orange" /><strong>71</strong></div>
          <div><span>통증</span><ProgressBar value={18} tone="red" /><strong>18</strong></div>
        </div>
      </Panel>
    </div>
  </>;
}
