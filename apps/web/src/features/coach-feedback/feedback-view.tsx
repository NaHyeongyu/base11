"use client";

import { useMemo, useState } from "react";
import {
  completedImprovementTasks,
  improvementRecommendations,
  type ImprovementRecommendation,
  type RecommendationStatus,
} from "@/features/coach-feedback/data/feedback-preview-data";
import { PlayerIdentity } from "@/features/players/ui/player-identity";
import { Badge, MetricCard, ProgressBar } from "@/shared/ui/components";
import { Icon } from "@/shared/ui/icon";

type Workspace = "recommendations" | "tracking";

const statusTabs: Array<{ id: RecommendationStatus; label: string }> = [
  { id: "review", label: "검토 대기" },
  { id: "delivered", label: "전달 완료" },
  { id: "hold", label: "보류" },
];

function categoryTone(category: ImprovementRecommendation["category"]) {
  if (category === "기술") return "blue" as const;
  if (category === "피지컬") return "orange" as const;
  return "purple" as const;
}

export function FeedbackView() {
  const [workspace, setWorkspace] = useState<Workspace>("recommendations");
  const [activeStatus, setActiveStatus] = useState<RecommendationStatus>("review");
  const [recommendations, setRecommendations] = useState(improvementRecommendations);
  const [selectedId, setSelectedId] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [draftDrills, setDraftDrills] = useState("");
  const [draftCues, setDraftCues] = useState("");
  const [visibility, setVisibility] = useState({ player: true, staff: true, parent: false });
  const [notice, setNotice] = useState("");
  const [reviewChecks, setReviewChecks] = useState([false, false, false]);

  const visibleRecommendations = useMemo(
    () => recommendations.filter((item) => item.status === activeStatus),
    [recommendations, activeStatus],
  );

  const selected =
    recommendations.find((item) => item.id === selectedId && item.status === activeStatus) ??
    visibleRecommendations[0] ??
    recommendations[0];

  function changeStatus(status: RecommendationStatus) {
    setActiveStatus(status);
    setIsEditing(false);
    const first = recommendations.find((item) => item.status === status);
    if (first) setSelectedId(first.id);
    setNotice("");
  }

  function approveRecommendation() {
    setIsEditing(false);
    setRecommendations((current) =>
      current.map((item) => (item.id === selected.id ? { ...item, status: "delivered" as const } : item)),
    );
    setNotice(`${selected.player.name} 선수에게 개선 과제를 전달했습니다.`);
    const next = recommendations.find((item) => item.status === "review" && item.id !== selected.id);
    if (next) {
      setSelectedId(next.id);
      return;
    }
    setActiveStatus("delivered");
    setSelectedId(selected.id);
  }

  function toggleEdit() {
    if (!isEditing) {
      setDraftDrills(selected.drills.join("\n"));
      setDraftCues(selected.cues.join("\n"));
      setIsEditing(true);
      return;
    }

    const drills = draftDrills.split("\n").map((item) => item.trim()).filter(Boolean);
    const cues = draftCues.split("\n").map((item) => item.trim()).filter(Boolean);
    setRecommendations((current) =>
      current.map((item) =>
        item.id === selected.id
          ? { ...item, drills: drills.length ? drills : item.drills, cues: cues.length ? cues : item.cues }
          : item,
      ),
    );
    setIsEditing(false);
    setNotice("수정한 훈련 처방과 코칭 포인트를 저장했습니다.");
  }

  return (
    <div className="improvement-page">
      <header className="improvement-header">
        <div>
          <p className="page-eyebrow">COACH-APPROVED IMPROVEMENT LOOP</p>
          <h1>{workspace === "recommendations" ? "추천 개선 과제" : "선수 개선 추적"}</h1>
          <p>
            {workspace === "recommendations"
              ? "코치는 부족 항목과 근거를 확인하고 추천된 처방만 승인합니다."
              : "자동 처방의 실행 기록과 다음 현장 점검을 한 타임라인으로 확인합니다."}
          </p>
        </div>
        <nav className="workspace-switcher" aria-label="개선 과제 화면 전환">
          <button
            className={workspace === "recommendations" ? "active" : ""}
            onClick={() => setWorkspace("recommendations")}
            aria-pressed={workspace === "recommendations"}
          >
            추천 과제
          </button>
          <button
            className={workspace === "tracking" ? "active" : ""}
            onClick={() => setWorkspace("tracking")}
            aria-pressed={workspace === "tracking"}
          >
            선수 개선 추적
          </button>
        </nav>
      </header>

      {workspace === "recommendations" ? (
        <RecommendationWorkspace
          recommendations={recommendations}
          visibleRecommendations={visibleRecommendations}
          selected={selected}
          activeStatus={activeStatus}
          isEditing={isEditing}
          draftDrills={draftDrills}
          draftCues={draftCues}
          visibility={visibility}
          notice={notice}
          onStatusChange={changeStatus}
          onSelect={(id) => {
            setSelectedId(id);
            setIsEditing(false);
            setNotice("");
          }}
          onEdit={toggleEdit}
          onDraftDrillsChange={setDraftDrills}
          onDraftCuesChange={setDraftCues}
          onVisibilityChange={(key) => setVisibility((current) => ({ ...current, [key]: !current[key] }))}
          onApprove={approveRecommendation}
          onTrack={() => setWorkspace("tracking")}
        />
      ) : (
        <TrackingWorkspace
          checks={reviewChecks}
          notice={notice}
          onCheck={(index) =>
            setReviewChecks((current) => current.map((value, itemIndex) => (itemIndex === index ? !value : value)))
          }
          onRecord={() => setNotice("김민수 선수의 현장 점검 결과를 기록했습니다.")}
        />
      )}

      {notice && <div className="improvement-toast" role="status"><Icon name="check" size={18} />{notice}</div>}
    </div>
  );
}

function RecommendationWorkspace({
  recommendations,
  visibleRecommendations,
  selected,
  activeStatus,
  isEditing,
  draftDrills,
  draftCues,
  visibility,
  notice,
  onStatusChange,
  onSelect,
  onEdit,
  onDraftDrillsChange,
  onDraftCuesChange,
  onVisibilityChange,
  onApprove,
  onTrack,
}: {
  recommendations: ImprovementRecommendation[];
  visibleRecommendations: ImprovementRecommendation[];
  selected: ImprovementRecommendation;
  activeStatus: RecommendationStatus;
  isEditing: boolean;
  draftDrills: string;
  draftCues: string;
  visibility: { player: boolean; staff: boolean; parent: boolean };
  notice: string;
  onStatusChange: (status: RecommendationStatus) => void;
  onSelect: (id: number) => void;
  onEdit: () => void;
  onDraftDrillsChange: (value: string) => void;
  onDraftCuesChange: (value: string) => void;
  onVisibilityChange: (key: "player" | "staff" | "parent") => void;
  onApprove: () => void;
  onTrack: () => void;
}) {
  return (
    <>
      <div className="improvement-toolbar">
        <div className="status-tabs" role="tablist" aria-label="추천 과제 상태">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              className={activeStatus === tab.id ? "active" : ""}
              onClick={() => onStatusChange(tab.id)}
              role="tab"
              aria-selected={activeStatus === tab.id}
            >
              {tab.label}
              <span>{recommendations.filter((item) => item.status === tab.id).length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="metric-grid four compact improvement-metrics">
        <MetricCard label="검토 대기" value="8건" helper="오늘 추천 3건" tone="orange" />
        <MetricCard label="자동 추천 정확도" value="87%" helper="코치 승인 기준" tone="blue" />
        <MetricCard label="이번 주 전달" value="21건" helper="선수 18명" tone="green" />
        <MetricCard label="다음 점검" value="6건" helper="48시간 이내" tone="purple" />
      </div>

      <div className="recommendation-workspace">
        <section className="recommendation-queue-panel">
          <header>
            <div><h2>추천 대기열</h2><p>반복 신호와 우선순위 기준</p></div>
            <Badge tone="orange">{visibleRecommendations.length}건 표시</Badge>
          </header>
          <div className="recommendation-queue">
            {visibleRecommendations.length ? visibleRecommendations.map((item) => (
              <button
                key={item.id}
                className={item.id === selected.id ? "selected" : ""}
                onClick={() => onSelect(item.id)}
              >
                <span className="queue-player-row">
                  <PlayerIdentity player={item.player} compact />
                  {item.priority && <Badge tone="red">우선</Badge>}
                </span>
                <strong>{item.issue}</strong>
                <span className="queue-meta">
                  <Badge tone={categoryTone(item.category)}>{item.category}</Badge>
                  <small>{item.source} · {item.timing}</small>
                </span>
                <Icon name="chevron" size={17} />
              </button>
            )) : (
              <div className="recommendation-empty">
                <Icon name="check" size={22} />
                <strong>이 상태의 과제가 없습니다.</strong>
                <p>새로운 추천이 들어오면 여기에 표시됩니다.</p>
              </div>
            )}
          </div>
          <button className="queue-track-button" onClick={onTrack}><Icon name="users" size={16} />선수 개선 직접 따라가기</button>
        </section>

        <section className="recommendation-detail-panel">
          <header className="recommendation-detail-header">
            <div>
              <span>{selected.player.name} · {selected.player.position}</span>
              <Badge tone={categoryTone(selected.category)}>자동 추천</Badge>
              <h2>{selected.issue}</h2>
              <p>최근 훈련 태그 2회와 경기 메모 1회를 근거로 생성됨</p>
            </div>
            <button className="more-button" aria-label="과제 더보기"><Icon name="more" /></button>
          </header>

          <div className="prescription-section prescription-drills">
            <span className="section-kicker">추천 훈련</span>
            {isEditing ? (
              <textarea value={draftDrills} onChange={(event) => onDraftDrillsChange(event.target.value)} aria-label="추천 훈련 수정" />
            ) : (
              <ol>{selected.drills.map((drill) => <li key={drill}>{drill}</li>)}</ol>
            )}
          </div>

          <div className="prescription-section prescription-cues">
            <span className="section-kicker">선수에게 전달할 코칭 포인트</span>
            {isEditing ? (
              <textarea value={draftCues} onChange={(event) => onDraftCuesChange(event.target.value)} aria-label="코칭 포인트 수정" />
            ) : (
              <ul>{selected.cues.map((cue) => <li key={cue}>{cue}</li>)}</ul>
            )}
          </div>

          <div className="prescription-success">
            <div><span>성공 기준</span><strong>{selected.successTarget}</strong></div>
            <div><span>다음 점검</span><strong>{selected.nextReview}</strong></div>
          </div>
        </section>

        <aside className="recommendation-evidence-panel">
          <header><h2>추천 근거</h2><p>추천이 만들어진 신호입니다.</p></header>
          <div className="evidence-card">
            <Badge tone="purple">{selected.evidence.tag}</Badge>
            <p>{selected.evidence.matchNote}</p>
            <span>추천 신뢰도 <strong>{selected.evidence.confidence}</strong></span>
          </div>

          <div className="visibility-section">
            <span className="section-kicker">공개 범위</span>
            <ToggleRow label="선수 본인" checked={visibility.player} onChange={() => onVisibilityChange("player")} />
            <ToggleRow label="지도자" checked={visibility.staff} onChange={() => onVisibilityChange("staff")} />
            <ToggleRow label="학부모" checked={visibility.parent} onChange={() => onVisibilityChange("parent")} />
          </div>

          <div className="approval-warning">
            <Icon name="shield" size={18} />
            <div><strong>자동 전달하지 않습니다.</strong><p>코치 승인 이후에만 선수 과제로 게시됩니다.</p></div>
          </div>

          <div className="approval-actions">
            <button className="action-button secondary" onClick={onEdit}><Icon name="edit" size={16} />{isEditing ? "수정 완료" : "훈련·기준 수정"}</button>
            <button className="action-button" onClick={onApprove} disabled={activeStatus !== "review"}>
              <Icon name="check" size={16} />{activeStatus === "review" ? "승인하고 전달" : "전달 완료"}
            </button>
          </div>
          {notice && <small className="inline-success"><Icon name="check" size={14} />처리가 완료되었습니다.</small>}
        </aside>
      </div>
    </>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="visibility-toggle">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <i aria-hidden="true" />
    </label>
  );
}

function TrackingWorkspace({
  checks,
  notice,
  onCheck,
  onRecord,
}: {
  checks: boolean[];
  notice: string;
  onCheck: (index: number) => void;
  onRecord: () => void;
}) {
  const player = improvementRecommendations[0].player;
  const timeline = [
    { date: "7/25 18:42", title: "코치 승인·전달", detail: "추천 근거 확인 후 선수 과제로 게시", tone: "done" },
    { date: "7/26 20:10", title: "개인 훈련 완료", detail: "벽 패스 방향 터치 30회 · 선수 기록", tone: "done" },
    { date: "7/28 예정", title: "개인 훈련 2회차", detail: "오픈 바디 터치 3세트", tone: "next" },
    { date: "7/30 훈련", title: "코치 현장 점검", detail: "성공 기준과 실제 수행 비교", tone: "review" },
  ];
  const checklist = ["압박 전 주변 확인 횟수", "첫 터치가 상대 반대 방향인지", "두 번째 행동 연결 속도"];

  return (
    <>
      <div className="tracking-player-bar">
        <PlayerIdentity player={player} />
        <button><span>11 김민수 · RW</span><Icon name="chevron" size={15} /></button>
      </div>

      <div className="metric-grid four compact improvement-metrics">
        <MetricCard label="진행 중" value="1개" helper="이번 주 집중" tone="blue" />
        <MetricCard label="완료 과제" value="3개" helper="최근 90일" tone="green" />
        <MetricCard label="개인 훈련 실행률" value="83%" helper="5 / 6회" tone="purple" />
        <MetricCard label="다음 점검" value="D-5" helper="7월 30일" tone="orange" />
      </div>

      <div className="tracking-workspace">
        <section className="tracking-main-panel">
          <header>
            <div><span>진행 중 · 기술</span><h2>압박 상황에서 첫 터치 방향 만들기</h2><p>추천 처방 승인 이후 선수 실행과 코치 점검을 이어서 관리합니다.</p></div>
            <Badge tone="blue">진행 중</Badge>
          </header>

          <div className="task-progress-card">
            <div><span>개인 훈련 실행</span><strong>1 / 3회 완료</strong></div>
            <ProgressBar value={33} tone="blue" />
            <div><span>성공 기준</span><strong>방향 전환 10회 중 7회</strong></div>
          </div>

          <h3 className="tracking-section-title">과제 진행 타임라인</h3>
          <div className="improvement-timeline">
            {timeline.map((item) => (
              <article key={item.date} className={item.tone}>
                <time>{item.date}</time>
                <i><Icon name={item.tone === "done" ? "check" : item.tone === "review" ? "feedback" : "clock"} size={15} /></i>
                <div><strong>{item.title}</strong><p>{item.detail}</p></div>
              </article>
            ))}
          </div>

          <div className="player-question">
            <span>선수 질문</span>
            <p>상대가 가까이 붙으면 터치 방향을 미리 정해도 되나요?</p>
          </div>
        </section>

        <aside className="tracking-side-panel">
          <header><h2>다음 점검 준비</h2><p>7월 30일 · 팀 전술 훈련</p></header>
          <div className="review-checklist">
            {checklist.map((item, index) => (
              <label key={item}>
                <input type="checkbox" checked={checks[index]} onChange={() => onCheck(index)} />
                <span>{item}</span>
              </label>
            ))}
          </div>

          <div className="completed-tasks">
            <span className="section-kicker">최근 완료한 개선 과제</span>
            {completedImprovementTasks.map((task) => (
              <article key={task.title}>
                <div><strong>{task.title}</strong><small>완료 · {task.date}</small></div>
                <Icon name="check" size={17} />
              </article>
            ))}
          </div>

          <button className="action-button tracking-record-button" onClick={onRecord}><Icon name="edit" size={16} />점검 결과 기록하기</button>
          {notice && <small className="inline-success"><Icon name="check" size={14} />저장되었습니다.</small>}
        </aside>
      </div>
    </>
  );
}
