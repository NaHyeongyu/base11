import { attendanceRows } from "@/features/coach-attendance/data/attendance-preview-data";
import { PlayerIdentity } from "@/features/players/ui/player-identity";
import { ActionButton, Badge, MetricCard, PageHeader, Panel } from "@/shared/ui/components";
import { Icon } from "@/shared/ui/icon";

function responseTone(value: string) { if (value === "참석") return "green" as const; if (value === "지각" || value === "일부 참여") return "orange" as const; if (value === "결석") return "red" as const; return "gray" as const; }

export function AttendanceView() {
  return <>
    <PageHeader eyebrow="ATTENDANCE · JUL 18" title="출석 현황" description="오늘 팀 전술 훈련 · 18:00 · 안양 보조구장" action={<><ActionButton secondary icon="download">CSV 내보내기</ActionButton><ActionButton icon="check">출석 확정</ActionButton></>} />
    <div className="metric-grid four compact">
      <MetricCard label="참석 예정" value="22명" helper="전체 선수의 85%" tone="green" />
      <MetricCard label="지각·일부 참여" value="2명" helper="사유 확인 완료" tone="orange" />
      <MetricCard label="결석" value="1명" helper="부상 회복 중" tone="red" />
      <MetricCard label="미응답" value="1명" helper="알림 재전송 필요" tone="gray" />
    </div>
    <Panel title="선수 출석 명단" description="선수의 참여 응답과 현장 체크인을 함께 확인합니다." action={<div className="table-tools"><label><Icon name="search" size={16} /><input placeholder="선수 검색" /></label><button><Icon name="filter" size={16} />전체 상태</button></div>}>
      <div className="data-table attendance-table">
        <div className="table-head"><span>선수</span><span>참여 응답</span><span>체크인</span><span>컨디션</span><span>통증 보고</span><span>관리</span></div>
        {attendanceRows.map((row) => <div className="table-row" key={row.player.id}>
          <PlayerIdentity player={row.player} compact /><span><Badge tone={responseTone(row.response)}>{row.response}</Badge></span><span>{row.checkIn}</span>
          <span><Badge tone={row.condition === "좋음" ? "green" : row.condition === "주의" || row.condition === "회복" ? "orange" : "gray"}>{row.condition}</Badge></span>
          <span className={row.pain !== "없음" && row.pain !== "-" ? "pain-text" : "table-muted"}>{row.pain}</span>
          <button className="table-action">수정</button>
        </div>)}
      </div>
    </Panel>
  </>;
}
