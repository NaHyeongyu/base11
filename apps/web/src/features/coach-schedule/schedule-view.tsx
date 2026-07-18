import { todaySchedule, weekEvents } from "@/features/coach-data/mock-data";
import { ActionButton, Badge, MetricCard, PageHeader, Panel } from "@/features/coach-ui/components";
import { Icon } from "@/features/coach-shell/icon";

export function ScheduleView() {
  return <>
    <PageHeader eyebrow="TEAM SCHEDULE" title="일정 관리" description="훈련, 경기, 미팅과 휴식 계획을 한 곳에서 관리합니다." action={<><ActionButton secondary icon="download">내보내기</ActionButton><ActionButton>일정 만들기</ActionButton></>} />
    <div className="metric-grid four compact">
      <MetricCard label="이번 주 일정" value="6개" helper="훈련 4 · 경기 1 · 미팅 1" tone="blue" />
      <MetricCard label="선수 응답률" value="92%" helper="평균 24/26명" tone="green" />
      <MetricCard label="다음 경기" value="D-2" helper="7월 20일 15:00" tone="orange" />
      <MetricCard label="이번 달 훈련" value="18회" helper="총 31.5시간" tone="purple" />
    </div>
    <Panel title="7월 3주차" description="2026년 7월 14일 – 7월 20일" action={<div className="calendar-actions"><button aria-label="이전 주">‹</button><button>오늘</button><button aria-label="다음 주">›</button></div>}>
      <div className="week-calendar">
        {weekEvents.map((day) => <article key={day.date} className={day.current ? "current" : ""}>
          <header><span>{day.day}</span><strong>{day.date}</strong>{day.current && <em>오늘</em>}</header>
          <div>{day.events.map((event) => <button key={`${event.time}-${event.title}`} className={`calendar-event tone-${event.tone}`}><small>{event.time}</small><strong>{event.title}</strong></button>)}</div>
        </article>)}
      </div>
    </Panel>
    <div className="content-grid schedule-bottom">
      <Panel title="오늘 일정" description="3개의 일정이 있습니다.">
        <div className="compact-event-list">{todaySchedule.map((event) => <div key={event.time}><span className={`event-mark tone-${event.tone}`} /><time>{event.time}</time><div><strong>{event.title}</strong><small>{event.location} · {event.participants}</small></div><Badge tone={event.tone}>{event.type}</Badge><Icon name="chevron" size={17} /></div>)}</div>
      </Panel>
      <Panel title="일정 운영 현황" description="이번 달 기준">
        <div className="schedule-stats"><div><span>정상 완료</span><strong>16</strong></div><div><span>일정 변경</span><strong>2</strong></div><div><span>취소</span><strong>1</strong></div></div>
        <div className="notice-box"><Icon name="notice" /><span><strong>장마철 일정 확인</strong><small>다음 주 3개 훈련의 우천 대체 장소가 필요합니다.</small></span></div>
      </Panel>
    </div>
  </>;
}
