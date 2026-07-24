import { notices } from "@/features/coach-notices/data/notices-preview-data";
import { ActionButton, Badge, MetricCard, PageHeader, Panel, ProgressBar } from "@/shared/ui/components";
import { Icon } from "@/shared/ui/icon";

export function NoticesView() {
  return <>
    <PageHeader eyebrow="COMMUNICATION" title="공지 센터" description="팀의 공식 정보를 대상별로 정확하게 전달하고 확인합니다." action={<ActionButton>공지 작성</ActionButton>} />
    <div className="metric-grid four compact">
      <MetricCard label="게시 중" value="12개" helper="예약 공지 1개" tone="blue" />
      <MetricCard label="평균 확인율" value="94%" helper="지난달 대비 +3%" tone="green" />
      <MetricCard label="확인 필요" value="2명" helper="최근 중요 공지 기준" tone="orange" />
      <MetricCard label="이번 달 발송" value="5개" helper="전체 대상 4개" tone="purple" />
    </div>
    <Panel title="전체 공지" description="공지별 읽음 현황을 확인할 수 있습니다." action={<div className="table-tools"><label><Icon name="search" size={16} /><input placeholder="공지 검색" /></label><button><Icon name="filter" size={16} />필터</button></div>}>
      <div className="data-table notice-table">
        <div className="table-head"><span>공지</span><span>대상</span><span>작성자</span><span>게시일</span><span>확인율</span><span /></div>
        {notices.map((notice) => { const rate = Math.round(notice.read / notice.total * 100); return <div className="table-row" key={notice.id}>
          <div className="notice-title">{notice.pinned && <span className="pin">고정</span>}<span><strong>{notice.title}</strong><small>공지 #{notice.id}</small></span></div>
          <span><Badge tone="blue">{notice.target}</Badge></span><span>{notice.author}</span><span className="table-muted">{notice.date}</span>
          <div className="read-rate"><span><strong>{rate}%</strong><small>{notice.read}/{notice.total}</small></span><ProgressBar value={rate} tone={rate === 100 ? "green" : "blue"} /></div>
          <button className="more-button"><Icon name="more" /></button>
        </div>; })}
      </div>
    </Panel>
  </>;
}
