"use client";

import { useMemo, useState } from "react";
import { microcycleDays } from "@/features/coach-schedule/data/schedule-preview-data";
import { Badge, MetricCard, PageHeader, Panel } from "@/shared/ui/components";
import { Icon } from "@/shared/ui/icon";

const drills = [
  { time: "17:00", duration: "15분", title: "프리액티베이션", owner: "최은지", group: "전체", intensity: "Low" },
  { time: "17:15", duration: "25분", title: "포지션별 패턴", owner: "박성진", group: "공격·미드필더", intensity: "Medium" },
  { time: "17:40", duration: "30분", title: "전환 게임 8v8+3", owner: "김태호", group: "전체", intensity: "High" },
  { time: "18:10", duration: "30분", title: "수원FC 빌드업 대응", owner: "김태호", group: "수비·미드필더", intensity: "Medium" },
  { time: "18:40", duration: "20분", title: "쿨다운·개별 목표", owner: "최은지", group: "전체", intensity: "Low" },
];

export function ScheduleView() {
  const [selectedId, setSelectedId] = useState("MD-2");
  const [reviewRequested, setReviewRequested] = useState(false);
  const [published, setPublished] = useState(false);
  const [templateApplied, setTemplateApplied] = useState(false);
  const selected = useMemo(() => microcycleDays.find((day) => day.id === selectedId) ?? microcycleDays[4], [selectedId]);

  return <>
    <PageHeader
      eyebrow="WEEK 29 · VS SUWON FC U18"
      title="주간 마이크로사이클"
      description="다음 경기에서 역산해 주간 구조를 만들고, 스태프 검토 후 역할별로 한 번에 게시합니다."
      action={<>
        <button className="action-button secondary" onClick={() => setTemplateApplied(true)}><Icon name="download" size={17} />{templateApplied ? "템플릿 적용됨" : "지난 주 복제"}</button>
        <button className="action-button" onClick={() => setPublished(true)}><Icon name="share" size={17} />{published ? "게시 완료" : "감독 승인·게시"}</button>
      </>}
    />

    {(templateApplied || published || reviewRequested) && <div className="inline-success" role="status"><Icon name="check" size={18} /><span>{published ? "선수·학부모·스태프에게 역할별 정보가 게시되었습니다. 모든 변경은 이력에 남습니다." : reviewRequested ? "담당 코치 4명에게 검토 요청을 보냈습니다." : "지난 경기 주간 구조를 복제했습니다. 세션 목적과 강도만 확인하세요."}</span></div>}

    <div className="match-anchor">
      <div><span className="match-anchor-mark">MD</span><div><small>NEXT MATCH</small><strong>FC 안양 U18 <em>vs</em> 수원FC U18</strong><p>7월 20일 일요일 15:00 · 수원월드컵 보조구장 · K리그 주니어 13R</p></div></div>
      <button><Icon name="edit" size={16} />경기 변경</button>
    </div>

    <div className="metric-grid four compact">
      <MetricCard label="이번 주 세션" value="6개" helper="훈련 4 · 경기 1 · 휴식 1" tone="blue" />
      <MetricCard label="스태프 검토" value={reviewRequested ? "요청됨" : "4 / 6"} helper="담당 영역별 확인" tone="purple" />
      <MetricCard label="변경 일정" value="1개" helper="변경 시 역할별 재배포" tone="orange" />
      <MetricCard label="주간 템플릿" value="4개" helper="상대·경기 간격별 저장" tone="green" />
    </div>

    <Panel title="경기일 기준 주간 구조" description="세션을 선택하면 아래 상세 계획이 바뀝니다." action={<div className="calendar-actions"><button aria-label="이전 주">‹</button><button>이번 주</button><button aria-label="다음 주">›</button></div>}>
      <div className="microcycle-planner">
        {microcycleDays.map((day) => <button key={day.id} className={selectedId === day.id ? "active" : ""} onClick={() => setSelectedId(day.id)}>
          <span><small>{day.day} · {day.date}</small><Badge tone={day.tone}>{day.id}</Badge></span>
          <strong>{day.title}</strong><p>{day.objective}</p>
          <div><i className={`load-dot tone-${day.tone}`} /><span>{day.load}</span><em>{day.duration ? `${day.duration}분` : "휴식"}</em></div>
          <small className="plan-status">{day.status}</small>
        </button>)}
      </div>
    </Panel>

    <div className="content-grid plan-workspace">
      <Panel title={`${selected.id} · ${selected.title}`} description={`${selected.day}요일 ${selected.date} · ${selected.objective}`} action={<Badge tone={published ? "green" : selected.tone}>{published ? "게시됨" : selected.status}</Badge>}>
        <div className="session-form-grid">
          <label><span>세션 목적</span><input defaultValue={selected.objective} /></label>
          <label><span>시간</span><input defaultValue={selected.duration ? `17:00–${selected.duration >= 100 ? "19:00" : "18:10"}` : "OFF"} /></label>
          <label><span>장소</span><input defaultValue={selected.id === "MD" ? "수원월드컵 보조구장" : "안양 보조구장"} /></label>
          <label><span>예상 강도</span><select defaultValue={selected.load}><option>Low</option><option>Medium</option><option>High</option><option>Match</option><option>Off</option></select></label>
        </div>
        <div className="session-blocks">
          <div className="session-block-head"><span>세션 구성</span><button><Icon name="plus" size={15} />블록 추가</button></div>
          {selected.id === "MD-2" ? drills.map((drill, index) => <article key={drill.time}><time>{drill.time}</time><span className="drag-handle">⠿</span><div><strong>{drill.title}</strong><small>{drill.group} · 담당 {drill.owner}</small></div><Badge tone={drill.intensity === "High" ? "red" : drill.intensity === "Medium" ? "blue" : "green"}>{drill.intensity}</Badge><em>{drill.duration}</em><button aria-label={`${drill.title} 수정`}><Icon name="more" size={16} /></button></article>) : <div className="session-empty"><Icon name="calendar" size={26} /><strong>{selected.title}</strong><p>선택한 날짜의 세션 블록을 템플릿에서 추가하거나 직접 구성하세요.</p><button>템플릿에서 구성</button></div>}
        </div>
      </Panel>

      <aside className="plan-side-stack">
        <Panel title="스태프 검토" description="담당 영역에만 검토를 요청합니다.">
          <div className="review-avatars">
            {[{name:"박성진",role:"공격",state:"완료"},{name:"이상훈",role:"GK",state:"완료"},{name:"최은지",role:"메디컬",state:"확인"},{name:"김태호",role:"감독",state:"승인"}].map((member) => <div key={member.name}><span>{member.name.slice(0,1)}</span><div><strong>{member.name}</strong><small>{member.role}</small></div><Badge tone={member.state === "확인" ? "orange" : "green"}>{member.state}</Badge></div>)}
          </div>
          <button className="full-secondary-button" onClick={() => setReviewRequested(true)}><Icon name="feedback" size={16} />{reviewRequested ? "검토 요청 다시 보내기" : "스태프 검토 요청"}</button>
        </Panel>

        <Panel title="게시 범위 미리보기" description="같은 계획을 역할별 필요한 정보로 전달합니다.">
          <div className="audience-preview">
            <div><Badge tone="blue">선수</Badge><p>시간·장소·세션 목적·개인 목표</p></div>
            <div><Badge tone="purple">스태프</Badge><p>전체 세션 블록·담당·검토 의견·내부 메모</p></div>
            <div><Badge tone="green">학부모</Badge><p>집합·이동·준비물·중요 변경만</p></div>
          </div>
        </Panel>

        <Panel title="변경 이력" description="누가 무엇을 바꿨는지 남습니다.">
          <div className="change-log"><div><i /><span><strong>강도 Medium으로 변경</strong><small>김태호 · 12분 전</small></span></div><div><i /><span><strong>전환 게임 +5분 제안</strong><small>박성진 · 28분 전</small></span></div><div><i /><span><strong>발목 제한 선수 연결</strong><small>최은지 · 41분 전</small></span></div></div>
        </Panel>
      </aside>
    </div>
  </>;
}
