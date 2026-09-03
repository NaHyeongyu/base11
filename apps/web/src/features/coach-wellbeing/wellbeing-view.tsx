"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  usePlayerHealthStore,
  teamToday,
  validatePlayerHealth,
  type Availability,
  type HealthStatus,
  type InjuryStatus,
  type PlayerHealthChange,
  type PlayerHealthRecord,
} from "@/features/coach-wellbeing/model/player-health-store";
import { players } from "@/features/players/data/player-preview-data";
import { toConditionScore } from "@/features/players/model/player";
import { Icon } from "@/shared/ui/icon";

type WellbeingTab = "attention" | "all" | "cases" | "history";
type SaveState = "idle" | "saving" | "saved" | "error";

function conditionLabel(condition: number) {
  if (condition >= 8) return "좋음";
  if (condition >= 6) return "보통";
  return "주의";
}

function statusClass(status: HealthStatus) {
  if (status === "정상") return "normal";
  if (status === "재활") return "rehab";
  return "watch";
}

function nextReviewAt() {
  const date = new Date(`${teamToday()}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return `${date.toISOString().slice(0, 10)}T09:00`;
}

function formatDateTime(value?: string) {
  if (!value) return "미정";
  const date = new Date(value.includes("Z") || /[+-]\d\d:\d\d$/.test(value) ? value : `${value}:00+09:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
}

function historyCopy(change: PlayerHealthChange) {
  if (change.entityType === "readiness") return "컨디션과 통증 기록을 새로 남겼습니다.";
  if (change.entityType === "injury_case") {
    if (change.action === "opened") return "부상·재활 케이스를 시작했습니다.";
    if (change.action === "closed") return "복귀 확인 후 부상 케이스를 종료했습니다.";
    return "부상·재활 단계를 수정했습니다.";
  }
  return change.beforeValue ? "현재 참가 판단을 새 버전으로 변경했습니다." : "첫 참가 판단을 등록했습니다.";
}

function historyStatus(change: PlayerHealthChange): HealthStatus {
  const status = change.afterValue.status;
  if (status === "normal") return "정상";
  if (status === "limited") return "제한";
  if (status === "rehab") return "재활";
  return "관찰";
}

export function WellbeingView() {
  const { records, recordsByPlayerId, activeCases, changes, syncState, lastError, refresh, updateHealth } = usePlayerHealthStore();
  const [tab, setTab] = useState<WellbeingTab>("attention");
  const [selectedId, setSelectedId] = useState(3);
  const [mobileEditorOpen, setMobileEditorOpen] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const selectedRecord = recordsByPlayerId.get(selectedId) ?? records[0];
  const [draft, setDraft] = useState<PlayerHealthRecord | null>(selectedRecord ? { ...selectedRecord } : null);

  useEffect(() => {
    setDraft(selectedRecord ? { ...selectedRecord } : null);
  }, [selectedId, selectedRecord]);

  const joined = useMemo(() => players.map((player) => ({ player, health: recordsByPlayerId.get(player.id) })).filter((item): item is { player: typeof players[number]; health: PlayerHealthRecord } => Boolean(item.health)), [recordsByPlayerId]);
  const attention = joined.filter(({ health }) => health.status !== "정상" || health.condition <= 5);
  const limited = joined.filter(({ health }) => health.availability === "제한 참여").length;
  const excluded = joined.filter(({ health }) => health.availability === "훈련 제외").length;
  const todayRecords = records.filter((record) => record.recordedOn === teamToday());
  const unlinked = records.filter((record) => !record.membershipId).length;
  const averageCondition = todayRecords.reduce((sum, record) => sum + record.condition, 0) / Math.max(todayRecords.length, 1);
  const validationError = draft ? validatePlayerHealth(draft) : null;
  const isDirty = Boolean(draft && selectedRecord && (["condition", "painScore", "status", "availability", "injuryStatus", "painArea", "restriction", "reviewAt", "note"] as const).some((key) => draft[key] !== selectedRecord[key]));
  const canSave = Boolean(draft && !validationError && (isDirty || selectedRecord?.recordedOn !== teamToday()));

  function openPlayer(playerId: number) {
    setSelectedId(playerId);
    setSaveState("idle");
    setSaveMessage("");
    setMobileEditorOpen(true);
  }

  function updateDraft(updates: Partial<PlayerHealthRecord>) {
    if (!draft) return;
    setDraft({ ...draft, ...updates });
    setSaveState("idle");
    setSaveMessage("");
  }

  function changeStatus(status: HealthStatus) {
    if (!draft) return;
    if (status === "정상") {
      updateDraft({ status, availability: "전체 참여", injuryStatus: "없음", painScore: 0, painArea: "통증 없음", restriction: "제한 없음", reviewAt: undefined });
      return;
    }
    if (status === "재활") {
      updateDraft({ status, availability: "훈련 제외", injuryStatus: "재활 중", restriction: draft.restriction === "제한 없음" ? "팀 훈련 제외 · 재활 프로그램 진행" : draft.restriction, reviewAt: draft.reviewAt ?? nextReviewAt() });
      return;
    }
    updateDraft({ status, availability: draft.availability === "전체 참여" ? "제한 참여" : draft.availability, restriction: draft.restriction === "제한 없음" ? "훈련 전 상태 재확인" : draft.restriction, reviewAt: draft.reviewAt ?? nextReviewAt() });
  }

  async function saveRecord() {
    if (!draft || validationError) return;
    setSaveState("saving");
    const result = await updateHealth(draft.playerId, { ...draft, updatedAt: "방금", source: "부상·컨디션 관리" });
    if (!result.ok) {
      setSaveState("error");
      setSaveMessage(result.message ?? "저장하지 못했습니다.");
      return;
    }
    setSaveState("saved");
    setSaveMessage(result.synced ? "DB와 모든 연결 화면에 반영했습니다." : result.message ?? "기기에 우선 저장했습니다.");
  }

  return <div className="wellbeing-v2-page">
    <header className="wellbeing-v2-header">
      <div><span>FC 성남 U15 · 2026 시즌</span><h1>부상·컨디션</h1><p>오늘 체크하고, 참가 범위를 정하고, 다음 확인 시점까지 놓치지 않습니다.</p></div>
      <div className="wellbeing-header-actions">
        <button className={`wellbeing-sync state-${syncState}`} type="button" onClick={() => void refresh()} title={lastError ?? undefined}><i />{syncState === "synced" ? "DB 연결됨" : syncState === "saving" ? "저장 중" : syncState === "connecting" ? "연결 중" : "오프라인 · 다시 시도"}</button>
        <button className="wellbeing-primary-action" type="button" onClick={() => setTab("all")}><Icon name="plus" size={16} />선수 선택</button>
      </div>
    </header>

    {syncState === "offline" && <div className="wellbeing-sync-notice"><Icon name="notice" size={16} /><span><strong>기기 저장 모드</strong>{lastError ?? "서버 연결을 확인해주세요."}</span><button type="button" onClick={() => void refresh()}>다시 연결</button></div>}

    <section className="wellbeing-v2-summary" aria-label="부상과 컨디션 요약">
      <span><small>확인 필요</small><strong>{attention.length}<b>명</b></strong><em>오늘 지도자 판단</em></span>
      <span><small>제한 참여</small><strong>{limited}<b>명</b></strong><em>다음 일정에 반영</em></span>
      <span><small>훈련 제외</small><strong>{excluded}<b>명</b></strong><em>부상·재활 관리</em></span>
      <span><small>오늘 평균</small><strong>{todayRecords.length ? averageCondition.toFixed(1) : "—"}<b>/10</b></strong><em>{todayRecords.length}명 체크{unlinked ? ` · 연결 필요 ${unlinked}명` : ""}</em></span>
    </section>

    <nav className="wellbeing-v2-tabs" aria-label="부상 컨디션 관리 메뉴">
      <button aria-current={tab === "attention" ? "page" : undefined} onClick={() => setTab("attention")}>확인 필요 <span>{attention.length}</span></button>
      <button aria-current={tab === "all" ? "page" : undefined} onClick={() => setTab("all")}>전체 선수 <span>{players.length}</span></button>
      <button aria-current={tab === "cases" ? "page" : undefined} onClick={() => setTab("cases")}>부상·재활 <span>{activeCases.length}</span></button>
      <button aria-current={tab === "history" ? "page" : undefined} onClick={() => setTab("history")}>변경 기록 <span>{changes.length}</span></button>
    </nav>

    {tab === "attention" && <div className="wellbeing-v2-layout">
      <section className="wellbeing-v2-list-card">
        <header><div><h2>오늘 확인할 선수</h2><p>선수별 참가 범위와 다음 확인 시점만 빠르게 결정합니다.</p></div><span>{attention.length}명</span></header>
        {attention.length ? <div className="wellbeing-attention-list">
          {attention.map(({ player, health }) => <button type="button" className={player.id === selectedId ? "selected" : ""} key={player.id} onClick={() => openPlayer(player.id)}>
            <span className="health-player-number">{player.number}</span>
            <span className="health-player-copy"><strong>{player.name}</strong><small>{player.position} · {player.grade}</small></span>
            <span className={`health-condition condition-${health.condition <= 5 ? "low" : "steady"}`}><small>컨디션</small><strong>{health.condition}<b>/10</b></strong></span>
            <span className={`health-status status-${statusClass(health.status)}`}><i />{health.status}</span>
            <span className="health-issue"><strong>{health.injuryStatus === "없음" ? health.restriction : `${health.painArea} ${health.painScore}/10`}</strong><small>{health.availability} · 다음 확인 {formatDateTime(health.reviewAt)}</small></span>
            <span className="health-source"><small>{health.source}</small><strong>{health.updatedAt}</strong></span>
            <Icon name="chevron" size={16} />
          </button>)}
        </div> : <div className="wellbeing-empty"><Icon name="check" size={22} /><strong>오늘 확인할 선수가 없습니다.</strong><p>전체 선수에서 새 상태를 기록할 수 있습니다.</p><button type="button" onClick={() => setTab("all")}>전체 선수 보기</button></div>}
      </section>

      {mobileEditorOpen && <button className="health-editor-backdrop" type="button" onClick={() => setMobileEditorOpen(false)} aria-label="선수 상태 편집 닫기" />}
      {draft && <aside className={`wellbeing-health-editor ${mobileEditorOpen ? "mobile-open" : ""}`}>
        <header><div><h2>{players.find((player) => player.id === draft.playerId)?.number} {players.find((player) => player.id === draft.playerId)?.name}</h2><p>참가 판단 빠른 수정</p></div><div><span className={`status-${statusClass(draft.status)}`}>{draft.status}</span><button type="button" onClick={() => setMobileEditorOpen(false)} aria-label="선수 상태 편집 닫기"><Icon name="close" size={16} /></button></div></header>
        <div className="health-editor-condition">
          <label><span>오늘 컨디션</span><div><input type="number" min={0} max={10} value={draft.condition} onChange={(event) => updateDraft({ condition: toConditionScore(Number(event.target.value)) })} /><em>/10</em></div><small>{conditionLabel(draft.condition)}</small></label>
          <label><span>통증 정도</span><div><input type="number" min={0} max={10} value={draft.painScore} onChange={(event) => updateDraft({ painScore: toConditionScore(Number(event.target.value)) })} /><em>/10</em></div><small>{draft.painScore === 0 ? "통증 없음" : "부위 확인 필요"}</small></label>
        </div>
        <div className="health-editor-fields">
          <label><span>현재 상태</span><select value={draft.status} onChange={(event) => changeStatus(event.target.value as HealthStatus)}><option>정상</option><option>관찰</option><option>제한</option><option>재활</option></select></label>
          <label><span>참여 범위</span><select value={draft.availability} onChange={(event) => updateDraft({ availability: event.target.value as Availability })}><option>전체 참여</option><option>제한 참여</option><option>훈련 제외</option></select></label>
          <label><span>부상 단계</span><select value={draft.injuryStatus} onChange={(event) => updateDraft({ injuryStatus: event.target.value as InjuryStatus })}><option>없음</option><option>통증 관찰</option><option>치료 중</option><option>재활 중</option><option>복귀 검토</option></select></label>
          <label><span>통증 부위</span><input value={draft.painArea} onChange={(event) => updateDraft({ painArea: event.target.value })} /></label>
          {draft.status !== "정상" && <label className="full"><span>다음 확인 시점</span><input type="datetime-local" value={draft.reviewAt ?? ""} onChange={(event) => updateDraft({ reviewAt: event.target.value })} /></label>}
          <label className="full"><span>참여 제한·확인 사항</span><input value={draft.restriction} onChange={(event) => updateDraft({ restriction: event.target.value })} placeholder="예: 최대 60분 · 방향 전환 제한" /></label>
          <label className="full"><span>지도자 운영 메모</span><textarea value={draft.note} onChange={(event) => updateDraft({ note: event.target.value })} placeholder="선수에게 공개되지 않는 운영 메모입니다." /></label>
        </div>
        <div className="health-linked-views"><span><Icon name="users" size={15} /><strong>선수단</strong></span><span><Icon name="target" size={15} /><strong>예정 훈련</strong></span><span><Icon name="match" size={15} /><strong>예정 경기</strong></span></div>
        {(validationError || saveMessage) && <p className={`health-editor-message ${validationError || saveState === "error" ? "error" : "success"}`} role="status">{validationError ?? saveMessage}</p>}
        <footer><Link href={`/roster/${draft.playerId}#health`}>선수 상세 보기<Icon name="chevron" size={14} /></Link><button type="button" disabled={!canSave || saveState === "saving"} onClick={() => void saveRecord()}>{saveState === "saved" ? <><Icon name="check" size={15} />저장됨</> : saveState === "saving" ? "저장 중…" : !canSave && !validationError ? "변경 없음" : "상태 저장"}</button></footer>
      </aside>}
    </div>}

    {tab === "all" && <section className="wellbeing-all-card">
      <header><div><h2>전체 선수 상태</h2><p>등번호 순으로 확인하고 선수를 누르면 참가 판단을 수정합니다.</p></div><span>{joined.length}명</span></header>
      <div className="wellbeing-all-table"><div><span>선수</span><span>컨디션</span><span>상태</span><span>참여 범위</span><span>부상·통증</span><span>최근 반영</span></div>{[...joined].sort((a, b) => a.player.number - b.player.number).map(({ player, health }) => <button type="button" key={player.id} onClick={() => { setTab("attention"); openPlayer(player.id); }}><span><i>{player.number}</i><strong>{player.name}</strong><small>{player.position} · {player.grade}</small></span><strong>{health.condition}<small>/10</small></strong><span className={`health-status status-${statusClass(health.status)}`}><i />{health.status}</span><span>{health.availability}</span><span>{health.injuryStatus === "없음" ? "없음" : `${health.painArea} ${health.painScore}/10`}</span><span><small>{health.source}</small><strong>{health.updatedAt}</strong></span></button>)}</div>
    </section>}

    {tab === "cases" && <section className="wellbeing-cases-card">
      <header><div><h2>진행 중 부상·재활</h2><p>한 번의 부상은 하나의 케이스로 이어서 관리하고 복귀 확인 후 종료합니다.</p></div><span>{activeCases.length}건</span></header>
      {activeCases.length ? <div className="wellbeing-case-grid">{activeCases.map((health) => {
        const player = players.find((item) => item.id === health.playerId);
        if (!player) return null;
        return <button type="button" key={health.activeCaseId ?? `preview-${health.playerId}`} onClick={() => { setTab("attention"); openPlayer(health.playerId); }}>
          <header><span className="health-player-number">{player.number}</span><div><strong>{player.name}</strong><small>{player.position} · {player.grade}</small></div><span className={`health-status status-${statusClass(health.status)}`}><i />{health.injuryStatus}</span></header>
          <dl><div><dt>부위·통증</dt><dd>{health.painArea} · {health.painScore}/10</dd></div><div><dt>참여 판단</dt><dd>{health.availability}</dd></div><div><dt>운영 제한</dt><dd>{health.restriction}</dd></div><div><dt>다음 확인</dt><dd>{formatDateTime(health.reviewAt)}</dd></div></dl>
          <footer><span>{health.owner} 담당{health.caseVersion ? ` · v${health.caseVersion}` : " · DB 연결 전"}</span><strong>케이스 열기 <Icon name="chevron" size={14} /></strong></footer>
        </button>;
      })}</div> : <div className="wellbeing-empty"><Icon name="check" size={22} /><strong>진행 중인 부상 케이스가 없습니다.</strong><p>새 통증이나 부상 단계가 기록되면 이곳에서 이어서 관리합니다.</p></div>}
    </section>}

    {tab === "history" && <section className="wellbeing-history-card">
      <header><div><h2>실제 변경 기록</h2><p>현재 목록이 아니라 DB에 누적된 생성·변경·종료 이력입니다.</p></div><span>{changes.length}건</span></header>
      {changes.length ? <div>{changes.map((change) => {
        const player = players.find((item) => item.id === change.playerId);
        const status = historyStatus(change);
        return <article key={change.id}><time>{formatDateTime(change.createdAt)}</time><span className={`health-status status-${statusClass(status)}`}><i />{status}</span><div><Link href={`/roster/${change.playerId}#health`}>{player?.number ?? "—"} {player?.name ?? "선수"}</Link><p>{historyCopy(change)}</p><small>{change.source}</small></div></article>;
      })}</div> : <div className="wellbeing-empty"><Icon name="clock" size={22} /><strong>아직 저장된 변경 기록이 없습니다.</strong><p>상태를 저장하면 변경 전·후 값과 담당자가 자동으로 남습니다.</p></div>}
    </section>}
  </div>;
}
