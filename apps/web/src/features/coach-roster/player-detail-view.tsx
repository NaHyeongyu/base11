"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  initialPlayerHealth,
  teamToday,
  usePlayerHealthStore,
  validatePlayerHealth,
  type Availability,
  type HealthStatus,
  type InjuryStatus,
} from "@/features/coach-wellbeing/model/player-health-store";
import {
  playerRecordKindLabels,
  usePlayerDetailStore,
  type PlayerDetailRecord,
  type PlayerProfileOverride,
  type PlayerRecordKind,
  type PlayerRecordStatus,
  type PlayerRecordVisibility,
} from "@/features/coach-roster/model/player-detail-store";
import { useScheduleStore } from "@/features/coach-schedule/model/schedule-store";
import { sessionPlayers, type CalendarEvent } from "@/features/coach-schedule/data/schedule-preview-data";
import { players } from "@/features/players/data/player-preview-data";
import { toConditionScore } from "@/features/players/model/player";
import { Icon } from "@/shared/ui/icon";

type PlayerHubTab = "summary" | "activity" | "growth" | "health" | "notes" | "info";
type RecordFilter = "all" | PlayerRecordKind;

type PlayerActivity = {
  id: string;
  type: "training" | "match";
  date: string;
  day: number;
  title: string;
  subtitle: string;
  minutes: number;
  participation: string;
  distance: number | null;
  hsr: number | null;
  rpe: number | null;
  feedback: string;
  dataIssue: string | null;
  sourceHref: string;
  source: CalendarEvent;
};

const tabItems: Array<{ id: PlayerHubTab; label: string }> = [
  { id: "summary", label: "요약" },
  { id: "activity", label: "훈련·경기" },
  { id: "growth", label: "성장·피지컬" },
  { id: "health", label: "컨디션·부상" },
  { id: "notes", label: "상담·피드백" },
  { id: "info", label: "정보·소속" },
];

const addableRecordKinds: PlayerRecordKind[] = ["medical", "body", "physical", "counseling", "note", "feedback", "goal"];

function toDateLabel(date: string) {
  const [, month, day] = date.split("-").map(Number);
  return `${month}월 ${day}일`;
}

function getTabFromHash(): PlayerHubTab {
  if (typeof window === "undefined") return "summary";
  const value = window.location.hash.replace("#", "") as PlayerHubTab;
  return tabItems.some((item) => item.id === value) ? value : value === "health" ? "health" : "summary";
}

function activityForPlayer(events: CalendarEvent[], playerId: number, playerNumber: number): PlayerActivity[] {
  return events.flatMap<PlayerActivity>((event): PlayerActivity[] => {
    if (event.type === "training") {
      const record = event.playerData?.find((item) => item.playerId === playerId);
      if (!record) return [];
      const gps = sessionPlayers.find((item) => item.number === playerNumber);
      const distance = gps && gps.distance !== "—" ? Number.parseFloat(gps.distance) : null;
      const hsr = gps && gps.hsr !== "—" ? Number.parseFloat(gps.hsr) : null;
      const minutes = record.participation === "제외" ? 0 : record.participation === "제한" ? Math.min(60, event.actualDuration ?? event.duration ?? 90) : event.actualDuration ?? event.duration ?? 90;
      return [{
        id: event.id,
        type: "training" as const,
        date: event.date ?? `2026-07-${String(event.day).padStart(2, "0")}`,
        day: event.day,
        title: `${event.day}일 훈련`,
        subtitle: event.objective ?? "팀 훈련",
        minutes,
        participation: record.participation,
        distance,
        hsr,
        rpe: record.rpe,
        feedback: record.feedback,
        dataIssue: null,
        sourceHref: `/schedule/${event.id}`,
        source: event,
      }];
    }
    if (event.type === "match") {
      const record = event.matchPlayerData?.find((item) => item.playerId === playerId);
      if (!record) return [];
      const dataIssue = record.minutes === 0 && record.role !== "미출전" ? `${record.role}인데 출전 시간이 0분입니다.` : record.minutes > 0 && record.role === "미출전" ? `미출전인데 출전 시간이 ${record.minutes}분입니다.` : null;
      return [{
        id: event.id,
        type: "match" as const,
        date: event.date ?? `2026-07-${String(event.day).padStart(2, "0")}`,
        day: event.day,
        title: `${event.opponent ?? "상대 팀"}전`,
        subtitle: `${event.competition ?? "경기"} · ${dataIssue ? "기록 확인 필요" : record.role}`,
        minutes: record.minutes,
        participation: dataIssue ? "확인 필요" : record.role === "미출전" ? "미출전" : record.role,
        distance: record.distance,
        hsr: record.hsr,
        rpe: null,
        feedback: record.feedback,
        dataIssue,
        sourceHref: `/matches/${event.id}`,
        source: event,
      }];
    }
    return [];
  }).sort((a, b) => b.date.localeCompare(a.date) || b.day - a.day);
}

function StatusPill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "green" | "orange" | "red" | "blue" }) {
  return <span className={`player-hub-pill tone-${tone}`}>{children}</span>;
}

function EmptyRecord({ title, description, onAdd }: { title: string; description: string; onAdd?: () => void }) {
  return <div className="player-hub-empty"><span><Icon name="plus" size={18} /></span><strong>{title}</strong><p>{description}</p>{onAdd && <button onClick={onAdd}>첫 기록 추가</button>}</div>;
}

function ActivityList({ activities, onSelect, limit }: { activities: PlayerActivity[]; onSelect: (activity: PlayerActivity) => void; limit?: number }) {
  const visible = limit ? activities.slice(0, limit) : activities;
  return <div className="player-hub-activity-list">
    {visible.map((activity) => <button type="button" key={activity.id} onClick={() => onSelect(activity)}>
      <time><strong>{activity.date.slice(8)}</strong><small>{Number(activity.date.slice(5, 7))}월</small></time>
      <span className={`activity-type ${activity.type}`}>{activity.type === "training" ? "훈련" : "경기"}</span>
      <div><strong>{activity.title}</strong><p>{activity.subtitle}</p></div>
      <dl><div><dt>참여</dt><dd>{activity.minutes}분</dd></div><div><dt>GPS</dt><dd>{activity.distance === null ? "미연동" : `${activity.distance.toFixed(1)}km`}</dd></div><div><dt>{activity.type === "training" ? "RPE" : "구분"}</dt><dd>{activity.rpe ?? activity.participation}</dd></div></dl>
      <Icon name="chevron" size={15} />
    </button>)}
  </div>;
}

function RecordList({ records, onSelect, limit }: { records: PlayerDetailRecord[]; onSelect: (record: PlayerDetailRecord) => void; limit?: number }) {
  const visible = limit ? records.slice(0, limit) : records;
  return <div className="player-hub-record-list">
    {visible.map((record) => <button type="button" key={record.id} onClick={() => onSelect(record)}>
      <span className={`record-kind kind-${record.kind}`}><Icon name={record.kind === "medical" ? "heart" : record.kind === "feedback" || record.kind === "counseling" ? "feedback" : record.kind === "goal" ? "target" : "check"} size={15} /></span>
      <div><small>{playerRecordKindLabels[record.kind]} · {toDateLabel(record.date)}</small><strong>{record.title}</strong><p>{record.metric && record.value !== undefined ? `${record.metric} ${record.value}${record.unit ?? ""} · ` : ""}{record.content}</p></div>
      <StatusPill tone={record.status === "취소됨" ? "red" : record.status === "초안" ? "orange" : record.visibility === "선수 공개" ? "blue" : "neutral"}>{record.status === "확정" ? record.visibility : record.status}</StatusPill>
      <Icon name="chevron" size={15} />
    </button>)}
  </div>;
}

function RecordEditor({ playerId, initial, initialKind, onClose, onCreate, onUpdate }: {
  playerId: number;
  initial?: PlayerDetailRecord;
  initialKind?: PlayerRecordKind;
  onClose: () => void;
  onCreate: (record: Omit<PlayerDetailRecord, "id" | "revision" | "updatedAt">) => void;
  onUpdate: (id: string, updates: Partial<PlayerDetailRecord>) => void;
}) {
  const [kind, setKind] = useState<PlayerRecordKind>(initial?.kind ?? initialKind ?? "note");
  const [date, setDate] = useState(initial?.date ?? "2026-08-27");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [metric, setMetric] = useState(initial?.metric ?? "");
  const [value, setValue] = useState(initial?.value === undefined ? "" : String(initial.value));
  const [unit, setUnit] = useState(initial?.unit ?? "");
  const [condition, setCondition] = useState(initial?.condition ?? "");
  const [followUp, setFollowUp] = useState(initial?.followUp ?? "");
  const [reviewDate, setReviewDate] = useState(initial?.reviewDate ?? "");
  const [visibility, setVisibility] = useState<PlayerRecordVisibility>(initial?.visibility ?? (kind === "feedback" || kind === "goal" ? "선수 공개" : "지도자 내부"));
  const measurement = kind === "body" || kind === "physical";
  const editingDraft = initial?.status === "초안";
  const valid = Boolean(title.trim() && content.trim() && (!measurement || (metric.trim() && value !== "" && unit.trim())));

  function save(status: PlayerRecordStatus) {
    if (!valid) return;
    const payload = {
      playerId,
      kind,
      date,
      title: title.trim(),
      content: content.trim(),
      author: initial?.author ?? "김태호",
      visibility,
      status,
      metric: measurement ? metric.trim() : undefined,
      value: measurement && value !== "" ? Number(value) : undefined,
      unit: measurement ? unit.trim() : undefined,
      condition: measurement ? condition.trim() : undefined,
      followUp: followUp.trim() || undefined,
      reviewDate: reviewDate || undefined,
      sourceEventId: initial?.sourceEventId,
    };
    if (initial) onUpdate(initial.id, payload);
    else onCreate(payload);
    onClose();
  }

  return <div className="player-hub-modal-backdrop" role="presentation">
    <section className="player-hub-modal" role="dialog" aria-modal="true" aria-labelledby="player-record-editor-title">
      <header><div><span>{editingDraft ? "초안 편집" : initial ? "기록 정정" : "기록 추가"}</span><h2 id="player-record-editor-title">{initial ? initial.title : "선수 기록 추가"}</h2><p>{editingDraft ? "작성 중인 내용을 저장하거나 확정합니다." : "한 번에 필요한 내용만 입력합니다."}</p></div><button onClick={onClose} aria-label="기록 편집 닫기"><Icon name="close" size={17} /></button></header>
      <div className="player-hub-modal-scroll">
        <div className="player-record-form-grid">
          <label><span>기록 유형</span><select value={kind} disabled={Boolean(initial)} onChange={(event) => setKind(event.target.value as PlayerRecordKind)}>{addableRecordKinds.map((item) => <option value={item} key={item}>{playerRecordKindLabels[item]}</option>)}</select></label>
          <label><span>기록일</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
          <label className="full"><span>제목</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={`${playerRecordKindLabels[kind]} 제목`} /></label>
          <label className="full"><span>내용</span><textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="관찰한 사실과 필요한 내용을 작성하세요." /></label>
          {measurement && <><label><span>측정 항목</span><input value={metric} onChange={(event) => setMetric(event.target.value)} placeholder="예: 신장, 30m 스프린트" /></label><label><span>측정값</span><input type="number" step="0.01" value={value} onChange={(event) => setValue(event.target.value)} /></label><label><span>단위</span><input value={unit} onChange={(event) => setUnit(event.target.value)} placeholder="cm, kg, 초" /></label><label><span>측정 조건</span><input value={condition} onChange={(event) => setCondition(event.target.value)} placeholder="장비·장소·시간" /></label></>}
          {!measurement && <><label className="full"><span>후속 조치 <small>선택</small></span><input value={followUp} onChange={(event) => setFollowUp(event.target.value)} placeholder="다음에 확인할 행동" /></label><label><span>다음 확인일 <small>선택</small></span><input type="date" value={reviewDate} onChange={(event) => setReviewDate(event.target.value)} /></label><label><span>공개 범위</span><select value={visibility} onChange={(event) => setVisibility(event.target.value as PlayerRecordVisibility)}><option>지도자 내부</option><option>선수 공개</option><option>학부모 공개</option></select></label></>}
        </div>
      </div>
      <footer><button onClick={onClose}>취소</button>{(!initial || editingDraft) && <button className="secondary" disabled={!valid} onClick={() => save("초안")}>초안 저장</button>}<button disabled={!valid} onClick={() => save(initial && !editingDraft ? "정정됨" : kind === "goal" ? "진행 중" : "확정")}><Icon name="check" size={15} />{editingDraft ? "확정" : initial ? "정정 저장" : "기록 저장"}</button></footer>
    </section>
  </div>;
}

function ProfileEditor({ profile, onClose, onSave }: { profile: PlayerProfileOverride; onClose: () => void; onSave: (updates: Partial<PlayerProfileOverride>) => void }) {
  const [draft, setDraft] = useState(profile);
  return <div className="player-hub-modal-backdrop" role="presentation"><section className="player-hub-modal compact" role="dialog" aria-modal="true" aria-labelledby="player-profile-editor-title">
    <header><div><span>선수 관리</span><h2 id="player-profile-editor-title">기본 정보 수정</h2><p>소속 이력과 기록은 변경하지 않습니다.</p></div><button onClick={onClose} aria-label="기본 정보 편집 닫기"><Icon name="close" size={17} /></button></header>
    <div className="player-hub-modal-scroll"><div className="player-record-form-grid">
      <label><span>등번호</span><input type="number" min={0} max={99} value={draft.number} onChange={(event) => setDraft({ ...draft, number: Number(event.target.value) })} /></label>
      <label><span>포지션</span><select value={draft.position} onChange={(event) => setDraft({ ...draft, position: event.target.value })}><option>GK</option><option>DF</option><option>MF</option><option>FW</option></select></label>
      <label><span>학년</span><select value={draft.grade} onChange={(event) => setDraft({ ...draft, grade: event.target.value })}><option>1학년</option><option>2학년</option><option>3학년</option></select></label>
      <label><span>주발</span><select value={draft.dominantFoot} onChange={(event) => setDraft({ ...draft, dominantFoot: event.target.value as PlayerProfileOverride["dominantFoot"] })}><option>오른발</option><option>왼발</option></select></label>
      <label className="full"><span>학교</span><input value={draft.school} onChange={(event) => setDraft({ ...draft, school: event.target.value })} /></label>
      <label><span>생년월일</span><input type="date" value={draft.birthDate} onChange={(event) => setDraft({ ...draft, birthDate: event.target.value })} /></label>
      <label><span>공식 스쿼드</span><input value={draft.squad} onChange={(event) => setDraft({ ...draft, squad: event.target.value })} /></label>
      <label><span>신장</span><input type="number" value={draft.height} onChange={(event) => setDraft({ ...draft, height: Number(event.target.value) })} /></label>
      <label><span>체중</span><input type="number" value={draft.weight} onChange={(event) => setDraft({ ...draft, weight: Number(event.target.value) })} /></label>
    </div></div>
    <footer><button onClick={onClose}>취소</button><button onClick={() => { onSave(draft); onClose(); }}><Icon name="check" size={15} />변경사항 저장</button></footer>
  </section></div>;
}

function RecordDrawer({ record, onClose, onEdit, onDeleteDraft, onCancel }: { record: PlayerDetailRecord; onClose: () => void; onEdit: () => void; onDeleteDraft: () => void; onCancel: () => void }) {
  const [confirmAction, setConfirmAction] = useState<"delete" | "cancel" | null>(null);
  const sourceHref = record.sourceEventId ? record.sourceEventId.startsWith("match") ? `/matches/${record.sourceEventId}` : `/schedule/${record.sourceEventId}` : undefined;
  return <><button className="player-hub-drawer-backdrop" onClick={onClose} aria-label="기록 상세 닫기" /><aside className="player-hub-drawer">
    <header><div><span>{playerRecordKindLabels[record.kind]}</span><h2>{record.title}</h2><p>{toDateLabel(record.date)} · {record.author}</p></div><button onClick={onClose} aria-label="기록 상세 닫기"><Icon name="close" size={17} /></button></header>
    <div className="player-hub-drawer-scroll">
      <div className="player-record-status-row"><StatusPill tone={record.status === "취소됨" ? "red" : record.status === "초안" ? "orange" : "green"}>{record.status}</StatusPill><StatusPill tone={record.visibility === "선수 공개" ? "blue" : "neutral"}>{record.visibility}</StatusPill><small>v{record.revision} · {record.updatedAt}</small></div>
      {record.metric && <dl className="player-record-metric"><div><dt>측정 항목</dt><dd>{record.metric}</dd></div><div><dt>측정값</dt><dd>{record.value}{record.unit}</dd></div><div><dt>측정 조건</dt><dd>{record.condition || "조건 없음"}</dd></div></dl>}
      <section><h3>기록 내용</h3><p>{record.content}</p></section>
      {(record.followUp || record.reviewDate) && <section><h3>후속 조치</h3><p>{record.followUp || "별도 후속 조치 없음"}</p>{record.reviewDate && <small>다음 확인 {toDateLabel(record.reviewDate)}</small>}</section>}
      <section className="player-record-revisions"><h3>변경 이력</h3><article><span>v{record.revision}</span><div><strong>현재 버전</strong><small>{record.updatedAt} · {record.status}</small></div></article>{[...(record.history ?? [])].reverse().map((revision) => <article key={`${record.id}-${revision.revision}`}><span>v{revision.revision}</span><div><strong>{revision.title}</strong><small>{revision.updatedAt} · {revision.status}{revision.value !== undefined ? ` · ${revision.value}${revision.unit ?? ""}` : ""}</small></div></article>)}{!record.history?.length && <small>아직 정정된 내용이 없습니다.</small>}</section>
      {sourceHref && <Link className="player-record-source-link" href={sourceHref}>원본 {record.sourceEventId?.startsWith("match") ? "경기" : "훈련"} 보기<Icon name="chevron" size={14} /></Link>}
    </div>
    <footer>{confirmAction ? <div className="player-record-confirm"><span>{confirmAction === "delete" ? "이 초안을 삭제할까요?" : "기록을 취소 상태로 남길까요?"}</span><button onClick={() => setConfirmAction(null)}>돌아가기</button><button className="danger" onClick={confirmAction === "delete" ? onDeleteDraft : onCancel}>확정</button></div> : <><button onClick={() => setConfirmAction(record.status === "초안" ? "delete" : "cancel")} disabled={record.status === "취소됨"}>{record.status === "초안" ? "초안 삭제" : "기록 취소"}</button><button className="primary" onClick={onEdit} disabled={record.status === "취소됨"}><Icon name="edit" size={14} />{record.status === "초안" ? "수정" : "정정"}</button></>}</footer>
  </aside></>;
}

function ActivityDrawer({ activity, onClose }: { activity: PlayerActivity; onClose: () => void }) {
  return <><button className="player-hub-drawer-backdrop" onClick={onClose} aria-label="세션 기록 닫기" /><aside className="player-hub-drawer">
    <header><div><span>{activity.type === "training" ? "훈련 참가 기록" : "경기 출전 기록"}</span><h2>{activity.title}</h2><p>{toDateLabel(activity.date)} · 기록 당시 U15</p></div><button onClick={onClose} aria-label="세션 기록 닫기"><Icon name="close" size={17} /></button></header>
    <div className="player-hub-drawer-scroll">
      <dl className="player-record-metric"><div><dt>참여·출전</dt><dd>{activity.minutes}분</dd></div><div><dt>GPS 거리</dt><dd>{activity.distance === null ? "미연동" : `${activity.distance.toFixed(1)}km`}</dd></div><div><dt>HSR</dt><dd>{activity.hsr === null ? "—" : `${activity.hsr.toFixed(2)}km`}</dd></div><div><dt>RPE</dt><dd>{activity.rpe ?? "—"}</dd></div></dl>
      <section><h3>세션 정보</h3><p>{activity.subtitle}</p><small>{activity.source.location} · {activity.source.time}</small></section>
      <section><h3>코치 피드백</h3><p>{activity.feedback || "작성된 피드백이 없습니다."}</p></section>
      {activity.dataIssue && <section className="player-activity-data-issue"><h3>확인 필요</h3><p>{activity.dataIssue}</p><small>원본 경기에서 역할과 출전 시간을 대조하세요.</small></section>}
      <section><h3>수정 정책</h3><p>완료된 참가·출전 기록은 선수 상세에서 직접 고치지 않습니다.</p><small>원본 세션에서 정정하면 이 화면에도 최신 버전이 반영됩니다.</small></section>
      <Link className="player-record-source-link" href={activity.sourceHref}>원본 {activity.type === "training" ? "훈련" : "경기"} 보기<Icon name="chevron" size={14} /></Link>
    </div>
    <footer><button className="primary full" onClick={onClose}>확인</button></footer>
  </aside></>;
}

function RegistrationConfirm({ status, onClose, onConfirm }: { status: "활동 중" | "일시 중지" | "등록 종료"; onClose: () => void; onConfirm: () => void }) {
  const [acknowledged, setAcknowledged] = useState(false);
  return <div className="player-hub-modal-backdrop" role="presentation"><section className="player-hub-modal compact player-registration-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="registration-confirm-title">
    <header><div><span>등록 관리</span><h2 id="registration-confirm-title">{status}로 변경할까요?</h2><p>기존 기록은 지우지 않고 그대로 보관합니다.</p></div><button onClick={onClose} aria-label="등록 상태 변경 닫기"><Icon name="close" size={17} /></button></header>
    <div className="player-hub-modal-scroll"><ul><li>과거 훈련·경기·상담·부상 기록은 유지됩니다.</li><li>{status === "활동 중" ? "앞으로 생성되는 일정의 기본 참가 대상에 다시 포함됩니다." : status === "일시 중지" ? "중지 기간에는 새 일정의 기본 참가 대상에서 제외됩니다." : "앞으로 생성되는 일정과 명단의 기본 대상에서 제외됩니다."}</li><li>이미 등록된 미래 일정은 담당 지도자가 별도로 확인해야 합니다.</li></ul><label><input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} /><span>영향 범위를 확인했습니다.</span></label></div>
    <footer><button onClick={onClose}>돌아가기</button><button className={status === "등록 종료" ? "danger" : "primary"} disabled={!acknowledged} onClick={onConfirm}>{status === "활동 중" ? "활동 재개" : `${status} 확정`}</button></footer>
  </section></div>;
}

function HandoffPolicy({ onClose }: { onClose: () => void }) {
  return <div className="player-hub-modal-backdrop" role="presentation"><section className="player-hub-modal compact" role="dialog" aria-modal="true" aria-labelledby="handoff-policy-title">
    <header><div><span>진학·이적 인계</span><h2 id="handoff-policy-title">선수 데이터 인계 원칙</h2><p>원본 전체를 넘기지 않고 확인본을 별도로 만듭니다.</p></div><button onClick={onClose} aria-label="인계 정책 닫기"><Icon name="close" size={17} /></button></header>
    <div className="player-hub-modal-scroll"><div className="player-handoff-policy"><article><strong>1. 보호자·선수 동의</strong><p>인계 대상과 기간을 먼저 확인합니다.</p></article><article><strong>2. 필요한 내용만 선택</strong><p>신체·피지컬·출전·부상 요약을 선택하며 상담 원문은 기본 제외합니다.</p></article><article><strong>3. 읽기 전용 확인본</strong><p>새 학교는 승인된 확인본만 보고 이전 팀의 원본은 수정할 수 없습니다.</p></article></div></div>
    <footer><button className="primary" onClick={onClose}>확인</button></footer>
  </section></div>;
}

export function PlayerDetailView({ playerId }: { playerId: number }) {
  const basePlayer = players.find((item) => item.id === playerId) ?? players[2];
  const { events } = useScheduleStore();
  const { recordsByPlayerId, profilesByPlayerId, addRecord, updateRecord, deleteDraft, cancelRecord, updateProfile } = usePlayerDetailStore();
  const { recordsByPlayerId: healthByPlayerId, updateHealth } = usePlayerHealthStore();
  const profile = profilesByPlayerId.get(basePlayer.id) ?? {
    playerId: basePlayer.id, school: "성남중학교", birthDate: "2011-04-15", number: basePlayer.number, position: basePlayer.position, grade: basePlayer.grade, dominantFoot: basePlayer.dominantFoot, height: basePlayer.height, weight: basePlayer.weight, registrationStatus: "활동 중" as const, squad: "U15", updatedAt: "2026-08-24",
  };
  const health = healthByPlayerId.get(basePlayer.id) ?? initialPlayerHealth.find((record) => record.playerId === basePlayer.id)!;
  const [activeTab, setActiveTab] = useState<PlayerHubTab>("summary");
  const [healthDraft, setHealthDraft] = useState({ ...health });
  const [recordEditor, setRecordEditor] = useState<{ initial?: PlayerDetailRecord; kind?: PlayerRecordKind } | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<PlayerDetailRecord | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<PlayerActivity | null>(null);
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);
  const [registrationAction, setRegistrationAction] = useState<"활동 중" | "일시 중지" | "등록 종료" | null>(null);
  const [handoffPolicyOpen, setHandoffPolicyOpen] = useState(false);
  const [managementOpen, setManagementOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [activityType, setActivityType] = useState<"all" | "training" | "match">("all");
  const [growthFilter, setGrowthFilter] = useState<"all" | "body" | "physical">("all");
  const [noteFilter, setNoteFilter] = useState<RecordFilter>("all");
  const records = useMemo(() => [...(recordsByPlayerId.get(basePlayer.id) ?? [])].sort((a, b) => b.date.localeCompare(a.date)), [recordsByPlayerId, basePlayer.id]);
  const activeRecords = records.filter((record) => record.status !== "취소됨");
  const activities = useMemo(() => activityForPlayer(events, basePlayer.id, profile.number), [events, basePlayer.id, profile.number]);
  const visibleActivities = activities.filter((activity) => activityType === "all" || activity.type === activityType);
  const growthRecords = activeRecords.filter((record) => (record.kind === "body" || record.kind === "physical") && (growthFilter === "all" || record.kind === growthFilter));
  const noteKinds: PlayerRecordKind[] = ["counseling", "note", "feedback", "goal"];
  const noteRecords = activeRecords.filter((record) => noteKinds.includes(record.kind) && (noteFilter === "all" || record.kind === noteFilter));
  const medicalRecords = records.filter((record) => record.kind === "medical");
  const currentGoal = activeRecords.find((record) => record.kind === "goal");
  const firstDataIssue = activities.find((activity) => activity.dataIssue);
  const attentionCount = (health.status === "정상" ? 0 : 1) + (currentGoal ? 1 : 0) + (firstDataIssue ? 1 : 0);

  useEffect(() => {
    setActiveTab(getTabFromHash());
    const syncHash = () => setActiveTab(getTabFromHash());
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => setHealthDraft({ ...health }), [health]);

  function selectTab(tab: PlayerHubTab) {
    setActiveTab(tab);
    window.history.replaceState(null, "", `${window.location.pathname}#${tab}`);
  }

  function createRecord(record: Omit<PlayerDetailRecord, "id" | "revision" | "updatedAt">) {
    addRecord(record);
    setNotice(`${playerRecordKindLabels[record.kind]}을 저장했습니다.`);
  }

  function changeHealthStatus(status: HealthStatus) {
    if (status === "정상") {
      setHealthDraft({ ...healthDraft, status, availability: "전체 참여", injuryStatus: "없음", painScore: 0, painArea: "통증 없음", restriction: "제한 없음", reviewAt: undefined });
      return;
    }
    const date = new Date(`${teamToday()}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + 1);
    const reviewAt = healthDraft.reviewAt ?? `${date.toISOString().slice(0, 10)}T09:00`;
    setHealthDraft({
      ...healthDraft,
      status,
      availability: status === "재활" ? "훈련 제외" : healthDraft.availability === "전체 참여" ? "제한 참여" : healthDraft.availability,
      injuryStatus: status === "재활" ? "재활 중" : healthDraft.injuryStatus,
      restriction: healthDraft.restriction === "제한 없음" ? "훈련 전 상태 재확인" : healthDraft.restriction,
      reviewAt,
    });
  }

  async function saveHealth() {
    const validationError = validatePlayerHealth(healthDraft);
    if (validationError) {
      setNotice(validationError);
      return;
    }
    const changed = healthDraft.condition !== health.condition || healthDraft.painScore !== health.painScore || healthDraft.status !== health.status || healthDraft.availability !== health.availability || healthDraft.injuryStatus !== health.injuryStatus || healthDraft.painArea !== health.painArea || healthDraft.restriction !== health.restriction || healthDraft.reviewAt !== health.reviewAt || healthDraft.note !== health.note;
    if (!changed && health.recordedOn === teamToday()) {
      setNotice("변경된 내용이 없습니다.");
      return;
    }
    const result = await updateHealth(basePlayer.id, { ...healthDraft, updatedAt: "방금", source: "선수 상세" });
    if (!result.ok) {
      setNotice(result.message ?? "상태를 저장하지 못했습니다.");
      return;
    }
    if (changed) addRecord({ playerId: basePlayer.id, kind: "medical", date: teamToday(), title: "참여 판단 변경", content: `${healthDraft.status} · ${healthDraft.availability} · 통증 ${healthDraft.painScore}/10`, author: "김태호", visibility: "지도자 내부", status: "확정", followUp: healthDraft.restriction, reviewDate: healthDraft.reviewAt?.slice(0, 10) });
    setNotice(result.synced ? "컨디션과 참가 판단을 DB에 저장했습니다." : result.message ?? "기기에 우선 저장했습니다.");
  }

  const latestTimeline = [
    ...activities.slice(0, 5).map((activity) => ({ id: `activity-${activity.id}`, date: activity.date, type: activity.type === "training" ? "훈련" : "경기", title: activity.title, action: () => setSelectedActivity(activity) })),
    ...records.slice(0, 7).map((record) => ({ id: `record-${record.id}`, date: record.date, type: playerRecordKindLabels[record.kind], title: record.title, action: () => setSelectedRecord(record) })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);

  return <div className="player-hub-page">
    <div className="player-hub-topbar"><Link href="/roster"><Icon name="chevron" size={14} />선수단</Link><div className="player-hub-player-nav"><Link href={`/roster/${Math.max(1, basePlayer.id - 1)}`}>‹ 이전</Link><span>{basePlayer.id} / {players.length}</span><Link href={`/roster/${Math.min(players.length, basePlayer.id + 1)}`}>다음 ›</Link></div></div>
    <section className="player-hub-header">
      <div className="player-hub-identity"><span>{profile.number}</span><div><div><StatusPill tone={profile.registrationStatus === "활동 중" ? "green" : "neutral"}>{profile.registrationStatus}</StatusPill><StatusPill tone={health.status === "정상" ? "green" : health.status === "재활" ? "red" : "orange"}>{health.availability}</StatusPill></div><h1>{basePlayer.name}</h1><p>{profile.position} · {profile.grade} · {profile.squad} · {profile.school}</p></div></div>
      <div className="player-hub-current"><span><small>오늘 컨디션</small><strong>{health.condition}/10</strong></span><span><small>참가 판단</small><strong>{health.availability}</strong></span><span><small>최근 기록</small><strong>{activities[0] ? toDateLabel(activities[0].date) : "없음"}</strong></span></div>
      <div className="player-hub-actions"><button className="primary" onClick={() => setRecordEditor({})}><Icon name="plus" size={15} />기록 추가</button><div><button onClick={() => setManagementOpen((value) => !value)}><Icon name="settings" size={15} />관리</button>{managementOpen && <div className="player-hub-management-menu"><button onClick={() => { setProfileEditorOpen(true); setManagementOpen(false); }}>기본 정보 수정</button><button onClick={() => { selectTab("info"); setManagementOpen(false); }}>소속·등번호 이력</button><button onClick={() => { selectTab("info"); setManagementOpen(false); }}>등록 상태 변경</button></div>}</div></div>
      <nav className="player-hub-tabs" aria-label="선수 상세 메뉴">{tabItems.map((tab) => <button key={tab.id} className={activeTab === tab.id ? "active" : ""} aria-current={activeTab === tab.id ? "page" : undefined} onClick={() => selectTab(tab.id)}>{tab.label}</button>)}</nav>
    </section>

    {activeTab === "summary" && <div className="player-hub-summary">
      <div className="player-hub-summary-main">
        <section className="player-hub-card player-hub-attention"><header><div><h2>지금 확인할 내용</h2><p>오늘 지도자가 결정해야 하는 항목입니다.</p></div><StatusPill tone="orange">{attentionCount}건</StatusPill></header><div>
          {health.status !== "정상" && <button onClick={() => selectTab("health")}><span><Icon name="heart" size={16} /></span><div><strong>{health.painArea} 통증 {health.painScore}/10</strong><p>{health.restriction}</p></div><em>상태 확인</em><Icon name="chevron" size={14} /></button>}
          {firstDataIssue && <button onClick={() => setSelectedActivity(firstDataIssue)}><span><Icon name="check" size={16} /></span><div><strong>경기 출전 기록 확인</strong><p>{firstDataIssue.title} · {firstDataIssue.dataIssue}</p></div><em>원본 대조</em><Icon name="chevron" size={14} /></button>}
          <button onClick={() => selectTab("notes")}><span><Icon name="clock" size={16} /></span><div><strong>개인 목표 검토</strong><p>{currentGoal?.reviewDate ? `${toDateLabel(currentGoal.reviewDate)}까지 확인` : "다음 검토일을 지정하세요."}</p></div><em>{currentGoal ? "예정" : "미등록"}</em><Icon name="chevron" size={14} /></button>
        </div></section>
        <section className="player-hub-card"><header><div><h2>최근 훈련·경기</h2><p>실제 참가·출전 기록과 원본 세션을 확인합니다.</p></div><button onClick={() => selectTab("activity")}>전체 보기</button></header>{activities.length ? <ActivityList activities={activities} limit={3} onSelect={setSelectedActivity} /> : <EmptyRecord title="참가 기록이 없습니다." description="완료된 훈련과 경기에서 자동으로 연결됩니다." />}</section>
        <section className="player-hub-card"><header><div><h2>최근 기록</h2><p>훈련·측정·상담·정정 이력을 한 시간축으로 봅니다.</p></div><span>{latestTimeline.length}건</span></header><div className="player-hub-timeline">{latestTimeline.map((item) => <button key={item.id} onClick={item.action}><time>{toDateLabel(item.date)}</time><span>{item.type}</span><strong>{item.title}</strong><Icon name="chevron" size={14} /></button>)}</div></section>
      </div>
      <aside className="player-hub-summary-side">
        <section className={`player-hub-decision tone-${health.status === "정상" ? "green" : "orange"}`}><span>오늘 참가 판단</span><strong>{health.availability}</strong><p>{health.restriction}</p><small>{health.updatedAt} · {health.source}</small><button onClick={() => selectTab("health")}>판단 수정</button></section>
        <section className="player-hub-card player-hub-goal"><header><div><h2>현재 개인 목표</h2><p>선수와 합의한 다음 행동입니다.</p></div>{currentGoal && <StatusPill tone="blue">진행 중</StatusPill>}</header>{currentGoal ? <button onClick={() => setSelectedRecord(currentGoal)}><strong>{currentGoal.title}</strong><p>{currentGoal.content}</p><span>{currentGoal.reviewDate ? `다음 검토 ${toDateLabel(currentGoal.reviewDate)}` : "검토일 미정"}<Icon name="chevron" size={14} /></span></button> : <EmptyRecord title="진행 중인 목표가 없습니다." description="선수와 확인할 행동 하나를 등록하세요." onAdd={() => setRecordEditor({ kind: "goal" })} />}</section>
        <section className="player-hub-card player-hub-mini-metrics"><header><div><h2>최근 변화</h2><p>가장 최근에 확정된 측정값입니다.</p></div></header><dl><div><dt>신장</dt><dd>{profile.height}cm</dd></div><div><dt>체중</dt><dd>{profile.weight}kg</dd></div><div><dt>30m</dt><dd>{activeRecords.find((record) => record.metric === "30m 스프린트")?.value ?? "—"}초</dd></div><div><dt>CMJ</dt><dd>{activeRecords.find((record) => record.metric === "CMJ")?.value ?? "—"}cm</dd></div></dl><button onClick={() => selectTab("growth")}>성장·피지컬 보기<Icon name="chevron" size={14} /></button></section>
      </aside>
    </div>}

    {activeTab === "activity" && <div className="player-hub-section">
      <section className="player-hub-card player-activity-summary"><header><div><h2>훈련·경기</h2><p>실제 참가와 출전만 집계하고 계획 대상은 구분합니다.</p></div><div className="player-hub-segmented">{(["all", "training", "match"] as const).map((item) => <button className={activityType === item ? "active" : ""} key={item} onClick={() => setActivityType(item)}>{item === "all" ? "전체" : item === "training" ? "훈련" : "경기"}</button>)}</div></header><dl><div><dt>실제 참가</dt><dd>{visibleActivities.filter((item) => item.minutes > 0).length}<small>회</small></dd></div><div><dt>총 시간</dt><dd>{visibleActivities.reduce((sum, item) => sum + item.minutes, 0)}<small>분</small></dd></div><div><dt>GPS 보유</dt><dd>{visibleActivities.filter((item) => item.distance !== null).length}<small>/{visibleActivities.length}</small></dd></div><div><dt>평균 RPE</dt><dd>{(() => { const values = visibleActivities.flatMap((item) => item.rpe === null ? [] : [item.rpe]); return values.length ? (values.reduce((sum, item) => sum + item, 0) / values.length).toFixed(1) : "—"; })()}</dd></div></dl></section>
      <section className="player-hub-card"><header><div><h2>세션 기록</h2><p>행을 누르면 선수 기록을 확인하고 원본 업무로 이동합니다.</p></div><span>{visibleActivities.length}건</span></header>{visibleActivities.length ? <ActivityList activities={visibleActivities} onSelect={setSelectedActivity} /> : <EmptyRecord title="해당 기록이 없습니다." description="필터를 바꾸거나 원본 세션의 참가자 기록을 확인하세요." />}</section>
    </div>}

    {activeTab === "growth" && <div className="player-hub-section">
      <section className="player-hub-card"><header><div><h2>성장·피지컬</h2><p>같은 측정 방식의 기록만 비교합니다.</p></div><button className="header-primary" onClick={() => setRecordEditor({ kind: "body" })}><Icon name="plus" size={14} />측정 추가</button></header><div className="player-hub-toolbar"><div className="player-hub-segmented"><button className={growthFilter === "all" ? "active" : ""} onClick={() => setGrowthFilter("all")}>전체</button><button className={growthFilter === "body" ? "active" : ""} onClick={() => setGrowthFilter("body")}>신체</button><button className={growthFilter === "physical" ? "active" : ""} onClick={() => setGrowthFilter("physical")}>피지컬</button></div><span>최근 측정 7월 20일</span></div>
        <div className="player-growth-metrics">{["신장", "체중", "30m 스프린트", "CMJ"].map((metric) => { const record = activeRecords.find((item) => item.metric === metric); return <button key={metric} disabled={!record} onClick={() => record && setSelectedRecord(record)}><small>{metric}</small><strong>{record?.value ?? "—"}<em>{record?.unit}</em></strong><span>{record ? toDateLabel(record.date) : "측정 없음"}</span></button>; })}</div>
      </section>
      <section className="player-hub-card"><header><div><h2>측정 기록</h2><p>정확한 값, 조건, 측정자와 정정 버전을 확인합니다.</p></div><span>{growthRecords.length}건</span></header>{growthRecords.length ? <RecordList records={growthRecords} onSelect={setSelectedRecord} /> : <EmptyRecord title="측정 기록이 없습니다." description="신체 또는 피지컬 측정을 추가하세요." onAdd={() => setRecordEditor({ kind: "body" })} />}</section>
    </div>}

    {activeTab === "health" && <div className="player-health-workspace-v2">
      <main>
        <section className="player-hub-card player-current-health"><header><div><h2>현재 참가 판단</h2><p>현재값은 다음 훈련·경기의 참가자 화면에 함께 반영됩니다.</p></div><StatusPill tone={health.status === "정상" ? "green" : health.status === "재활" ? "red" : "orange"}>{health.status}</StatusPill></header><dl><div><dt>컨디션</dt><dd>{health.condition}<small>/10</small></dd></div><div><dt>통증</dt><dd>{health.painScore}<small>/10</small></dd></div><div><dt>참여 범위</dt><dd>{health.availability}</dd></div><div><dt>부상 단계</dt><dd>{health.injuryStatus}</dd></div></dl><section><span><small>통증 부위</small><strong>{health.painArea}</strong></span><span><small>참여 제한</small><strong>{health.restriction}</strong></span><span><small>담당자·최근 반영</small><strong>{health.owner} · {health.updatedAt}</strong></span></section></section>
        <section className="player-hub-card"><header><div><h2>부상·재활 이력</h2><p>세션에서 발생한 기록과 참가 판단 변경을 함께 봅니다.</p></div><button className="header-primary" onClick={() => setRecordEditor({ kind: "medical" })}><Icon name="plus" size={14} />기록 추가</button></header>{medicalRecords.length ? <RecordList records={medicalRecords} onSelect={setSelectedRecord} /> : <EmptyRecord title="부상 이력이 없습니다." description="정상 상태에서도 필요할 때만 기록을 추가합니다." />}</section>
      </main>
      <aside className="player-health-quick-edit-v2"><header><div><h2>상태 수정</h2><p>현재 판단과 다음 확인 시점을 함께 저장합니다.</p></div></header><div><label><span>컨디션 (0~10)</span><input type="number" min={0} max={10} value={healthDraft.condition} onChange={(event) => setHealthDraft({ ...healthDraft, condition: toConditionScore(Number(event.target.value)) })} /></label><label><span>통증 (0~10)</span><input type="number" min={0} max={10} value={healthDraft.painScore} onChange={(event) => setHealthDraft({ ...healthDraft, painScore: toConditionScore(Number(event.target.value)) })} /></label><label><span>상태</span><select value={healthDraft.status} onChange={(event) => changeHealthStatus(event.target.value as HealthStatus)}><option>정상</option><option>관찰</option><option>제한</option><option>재활</option></select></label><label><span>참여 범위</span><select value={healthDraft.availability} onChange={(event) => setHealthDraft({ ...healthDraft, availability: event.target.value as Availability })}><option>전체 참여</option><option>제한 참여</option><option>훈련 제외</option></select></label><label className="full"><span>부상 단계</span><select value={healthDraft.injuryStatus} onChange={(event) => setHealthDraft({ ...healthDraft, injuryStatus: event.target.value as InjuryStatus })}><option>없음</option><option>통증 관찰</option><option>치료 중</option><option>재활 중</option><option>복귀 검토</option></select></label><label className="full"><span>통증 부위</span><input value={healthDraft.painArea} onChange={(event) => setHealthDraft({ ...healthDraft, painArea: event.target.value })} /></label>{healthDraft.status !== "정상" && <label className="full"><span>다음 확인 시점</span><input type="datetime-local" value={healthDraft.reviewAt ?? ""} onChange={(event) => setHealthDraft({ ...healthDraft, reviewAt: event.target.value })} /></label>}<label className="full"><span>참여 제한</span><textarea value={healthDraft.restriction} onChange={(event) => setHealthDraft({ ...healthDraft, restriction: event.target.value })} /></label></div>{validatePlayerHealth(healthDraft) && <p className="player-health-validation">{validatePlayerHealth(healthDraft)}</p>}<button disabled={Boolean(validatePlayerHealth(healthDraft))} onClick={() => void saveHealth()}><Icon name="check" size={15} />변경사항 저장</button></aside>
    </div>}

    {activeTab === "notes" && <div className="player-hub-section">
      <section className="player-hub-card"><header><div><h2>상담·피드백</h2><p>지도자 내부 기록과 선수에게 전달한 내용을 분리합니다.</p></div><button className="header-primary" onClick={() => setRecordEditor({ kind: "counseling" })}><Icon name="plus" size={14} />기록 추가</button></header><div className="player-hub-toolbar"><div className="player-hub-segmented scrollable">{(["all", "counseling", "note", "feedback", "goal"] as RecordFilter[]).map((item) => <button className={noteFilter === item ? "active" : ""} key={item} onClick={() => setNoteFilter(item)}>{item === "all" ? "전체" : playerRecordKindLabels[item as PlayerRecordKind]}</button>)}</div><span>{noteRecords.length}건</span></div></section>
      <section className="player-hub-card">{noteRecords.length ? <RecordList records={noteRecords} onSelect={setSelectedRecord} /> : <EmptyRecord title="해당 기록이 없습니다." description="상담, 메모, 피드백 또는 목표를 추가하세요." onAdd={() => setRecordEditor({ kind: "counseling" })} />}</section>
    </div>}

    {activeTab === "info" && <div className="player-info-workspace">
      <main>
        <section className="player-hub-card player-profile-info"><header><div><h2>기본 정보</h2><p>현재 정보와 과거 소속 이력을 분리합니다.</p></div><button onClick={() => setProfileEditorOpen(true)}><Icon name="edit" size={14} />수정</button></header><dl><div><dt>이름</dt><dd>{basePlayer.name}</dd></div><div><dt>생년월일</dt><dd>{profile.birthDate}</dd></div><div><dt>학교·학년</dt><dd>{profile.school} · {profile.grade}</dd></div><div><dt>주발</dt><dd>{profile.dominantFoot}</dd></div><div><dt>신장·체중</dt><dd>{profile.height}cm · {profile.weight}kg</dd></div><div><dt>등록 상태</dt><dd>{profile.registrationStatus}</dd></div></dl></section>
        <section className="player-hub-card player-membership-history"><header><div><h2>시즌·소속 이력</h2><p>기록 당시 소속은 현재 정보로 덮어쓰지 않습니다.</p></div><button onClick={() => setProfileEditorOpen(true)}>소속 변경</button></header><div><article><time>2026</time><span>현재</span><div><strong>{profile.squad} · #{profile.number} · {profile.position}</strong><p>2026.01.01–현재 · {profile.registrationStatus}</p></div></article><article><time>2025</time><span>종료</span><div><strong>U14 · #{Math.max(1, profile.number - 2)} · {profile.position}</strong><p>2025.01.01–2025.12.31 · 시즌 종료</p></div></article></div></section>
        <section className="player-hub-card player-change-history"><header><div><h2>변경 이력</h2><p>누가 언제 무엇을 바꿨는지 확인합니다.</p></div></header><div><article><time>{profile.updatedAt}</time><strong>기본 정보 확인</strong><p>김태호 · 선수 상세</p></article><article><time>2026.01.02</time><strong>2026 시즌 등록</strong><p>팀 매니저 · U15</p></article></div></section>
      </main>
      <aside><section className="player-hub-card player-registration-card"><header><div><h2>등록 관리</h2><p>선수 삭제 없이 등록 상태를 변경합니다.</p></div></header><strong>{profile.registrationStatus}</strong><p>과거 훈련·경기·상담 기록은 등록 종료 후에도 유지됩니다.</p>{profile.registrationStatus === "활동 중" ? <div><button onClick={() => setRegistrationAction("일시 중지")}>일시 중지</button><button onClick={() => setRegistrationAction("등록 종료")}>등록 종료</button></div> : profile.registrationStatus === "일시 중지" ? <div><button onClick={() => setRegistrationAction("활동 중")}>활동 재개</button><button onClick={() => setRegistrationAction("등록 종료")}>등록 종료</button></div> : <small>재등록은 새 시즌 등록 절차에서 진행합니다.</small>}</section><section className="player-hub-card player-account-card"><header><div><h2>계정·인계</h2><p>선수 본인 계정과 데이터 확인본 상태입니다.</p></div></header><dl><div><dt>선수 계정</dt><dd>연결됨</dd></div><div><dt>보호자 계정</dt><dd>1명 연결</dd></div><div><dt>진학 인계</dt><dd>미요청</dd></div></dl><button onClick={() => setHandoffPolicyOpen(true)}>인계 정책 확인</button></section></aside>
    </div>}

    {notice && <div className="schedule-toast" role="status"><Icon name="check" size={16} />{notice}<button onClick={() => setNotice("")} aria-label="알림 닫기"><Icon name="close" size={14} /></button></div>}
    {recordEditor && <RecordEditor playerId={basePlayer.id} initial={recordEditor.initial} initialKind={recordEditor.kind} onClose={() => setRecordEditor(null)} onCreate={createRecord} onUpdate={(id, updates) => { updateRecord(id, updates); setSelectedRecord(null); setNotice(updates.status === "초안" ? "초안을 저장했습니다." : recordEditor.initial?.status === "초안" ? "초안을 확정했습니다." : "기록을 정정하고 이전 버전을 이력에 남겼습니다."); }} />}
    {profileEditorOpen && <ProfileEditor profile={profile} onClose={() => setProfileEditorOpen(false)} onSave={(updates) => { updateProfile(basePlayer.id, updates); setNotice("기본 정보를 수정했습니다."); }} />}
    {registrationAction && <RegistrationConfirm status={registrationAction} onClose={() => setRegistrationAction(null)} onConfirm={() => { updateProfile(basePlayer.id, { registrationStatus: registrationAction }); setNotice(`등록 상태를 ${registrationAction}로 변경했습니다.`); setRegistrationAction(null); }} />}
    {handoffPolicyOpen && <HandoffPolicy onClose={() => setHandoffPolicyOpen(false)} />}
    {selectedRecord && <RecordDrawer record={selectedRecord} onClose={() => setSelectedRecord(null)} onEdit={() => { setRecordEditor({ initial: selectedRecord }); setSelectedRecord(null); }} onDeleteDraft={() => { deleteDraft(selectedRecord.id); setSelectedRecord(null); setNotice("초안을 삭제했습니다."); }} onCancel={() => { cancelRecord(selectedRecord.id); setSelectedRecord(null); setNotice("확정 기록을 취소 상태로 보존했습니다."); }} />}
    {selectedActivity && <ActivityDrawer activity={selectedActivity} onClose={() => setSelectedActivity(null)} />}
  </div>;
}
