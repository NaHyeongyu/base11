"use client";

import { useState } from "react";
import { staffReviews } from "@/features/coach-staff-review/data/staff-review-preview-data";
import { Badge, MetricCard, PageHeader, Panel } from "@/shared/ui/components";
import { Icon } from "@/shared/ui/icon";

export function StaffReviewView() {
  const [selected, setSelected] = useState(staffReviews[0]);
  const [resolved, setResolved] = useState<number[]>([]);

  return <>
    <PageHeader eyebrow="지도자 협업" title="스태프 검토" description="훈련과 경기 안에서 의견을 검토하고 결정과 담당자를 기록합니다." />
    <div className="metric-grid four compact">
      <MetricCard label="검토 대기" value={`${staffReviews.length - resolved.length}건`} helper="오늘 게시 전 확인" tone="orange" />
      <MetricCard label="내 담당" value="2건" helper="전술 1 · 승인 1" tone="blue" />
      <MetricCard label="이번 주 결정" value="18건" helper="모두 세션에 기록" tone="green" />
      <MetricCard label="평균 검토 시간" value="38분" helper="지난주보다 12분 단축" tone="purple" />
    </div>
    <div className="content-grid staff-review-layout">
      <Panel title="검토 대기열" description="게시 영향도와 세션 시간순으로 정렬합니다.">
        <div className="staff-review-queue">{staffReviews.map((review) => <button className={selected.id === review.id ? "active" : ""} key={review.id} onClick={() => setSelected(review)}><span><Badge tone={resolved.includes(review.id) ? "green" : review.tone}>{resolved.includes(review.id) ? "결정 완료" : review.status}</Badge><small>{review.author}</small></span><strong>{review.session}</strong><p>{review.message}</p></button>)}</div>
      </Panel>
      <Panel title={selected.session} description="세션 계획과 함께 제안을 검토합니다." action={<Badge tone={resolved.includes(selected.id) ? "green" : selected.tone}>{resolved.includes(selected.id) ? "결정 완료" : selected.status}</Badge>}>
        <div className="review-context">
          <div><span>현재 계획</span><strong>전환 게임 8v8+3 · 25분 · High</strong><p>공을 잃은 순간 5초 압박과 중앙 패스길 차단을 경기 속도로 반복합니다.</p></div>
          <div className="review-proposal"><span>수정 제안 · {selected.author}</span><strong>{selected.message}</strong><p>공격조의 반복 횟수를 확보하면서 전체 세션 종료 시간은 유지합니다.</p></div>
          <label><span>결정 메모</span><textarea defaultValue="제안 반영. 전환 게임을 30분으로 조정하고 포지션 패턴을 5분 줄입니다." /></label>
          <div className="decision-actions"><button onClick={() => setResolved((items) => [...new Set([...items, selected.id])])}>제안 반영</button><button onClick={() => setResolved((items) => [...new Set([...items, selected.id])])}>현재 계획 유지</button></div>
          {resolved.includes(selected.id) && <div className="inline-success"><Icon name="check" size={18} /><span>결정이 세션 변경 이력에 저장되었습니다.</span></div>}
        </div>
      </Panel>
    </div>
  </>;
}
