"use client";

import { useEffect, useMemo, useState } from "react";
import { usePlayerHealthStore } from "@/features/coach-wellbeing/model/player-health-store";
import type { MatchPlayerData } from "@/features/coach-schedule/data/schedule-preview-data";
import { Icon } from "@/shared/ui/icon";

function clonePlayers(players: MatchPlayerData[]) {
  return players.map((player) => ({ ...player }));
}

function statusLabel(status: MatchPlayerData["status"]) {
  if (status === "GPS 누락") return "GPS 확인";
  return status;
}

function firstPlayerId(players: MatchPlayerData[]) {
  const roleOrder = { "선발": 0, "교체": 1, "미출전": 2 };
  return [...players].sort((a, b) => roleOrder[a.role] - roleOrder[b.role] || a.number - b.number)[0]?.playerId ?? 0;
}

export function MatchPlayerDataPanel({
  players,
  onChange,
  mode = "review",
  paged = false,
}: {
  players: MatchPlayerData[];
  onChange: (players: MatchPlayerData[]) => void;
  mode?: "prepare" | "review";
  paged?: boolean;
}) {
  const preparing = mode === "prepare";
  const { recordsByPlayerId } = usePlayerHealthStore();
  const linkedPlayers = useMemo(() => players.map((player) => {
    if (!preparing) return player;
    const health = recordsByPlayerId.get(player.playerId);
    return health ? { ...player, status: health.status } : player;
  }), [players, preparing, recordsByPlayerId]);
  const [draft, setDraft] = useState(() => clonePlayers(linkedPlayers));
  const [selectedId, setSelectedId] = useState(() => firstPlayerId(linkedPlayers));
  const [mobileEditorOpen, setMobileEditorOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 5;

  useEffect(() => {
    setDraft(clonePlayers(linkedPlayers));
  }, [linkedPlayers]);

  const selected = draft.find((player) => player.playerId === selectedId) ?? draft[0];
  const starters = draft.filter((player) => player.role === "선발").length;
  const gpsConnected = draft.filter((player) => player.distance !== null).length;
  const feedbackPending = draft.filter((player) => !player.feedbackSent).length;
  const averageRating = draft.reduce((sum, player) => sum + player.rating, 0) / Math.max(draft.length, 1);
  const bench = draft.filter((player) => player.role === "교체").length;
  const attention = draft.filter((player) => player.status === "관찰" || player.status === "제한" || player.status === "재활").length;
  const orderedPlayers = useMemo(() => [...draft].sort((a, b) => {
    const roleOrder = { "선발": 0, "교체": 1, "미출전": 2 };
    return roleOrder[a.role] - roleOrder[b.role] || a.number - b.number;
  }), [draft]);
  const pageCount = Math.max(1, Math.ceil(orderedPlayers.length / pageSize));
  const visiblePlayers = paged ? orderedPlayers.slice(page * pageSize, (page + 1) * pageSize) : orderedPlayers;

  useEffect(() => {
    if (page < pageCount) return;
    setPage(Math.max(0, pageCount - 1));
  }, [page, pageCount]);

  function selectPlayer(playerId: number) {
    setSelectedId(playerId);
    setSaved(false);
    setMobileEditorOpen(true);
  }

  function updateSelected(updates: Partial<MatchPlayerData>) {
    setDraft((current) => current.map((player) => player.playerId === selectedId ? { ...player, ...updates } : player));
    setSaved(false);
  }

  function changePage(nextPage: number) {
    const safePage = Math.min(pageCount - 1, Math.max(0, nextPage));
    const firstPlayer = orderedPlayers[safePage * pageSize];
    setPage(safePage);
    if (firstPlayer) setSelectedId(firstPlayer.playerId);
    setMobileEditorOpen(false);
  }

  function save(sendFeedback: boolean) {
    const next = draft.map((player) => player.playerId === selectedId && sendFeedback ? { ...player, feedbackSent: true } : player);
    setDraft(next);
    onChange(clonePlayers(next));
    setSaved(true);
  }

  if (!selected) return null;

  return <div className={`match-player-layout ${preparing ? "mode-prepare" : "mode-review"}`}>
    <section className="match-player-list-card">
      <header>
        <div><h2>{preparing ? "엔트리·역할 편집" : "출전 선수"}</h2><p>{preparing ? "선수를 선택해 선발·벤치와 포지션만 빠르게 바꿉니다." : "출전 시간과 GPS를 확인하고 선수를 선택해 기록을 정리합니다."}</p></div>
        <span>{preparing ? `상태 확인 ${attention}명` : `GPS ${gpsConnected}/${draft.length}`}</span>
      </header>

      <div className="match-player-summary">
        <span><small>엔트리</small><strong>{draft.length}</strong></span>
        <span><small>선발</small><strong>{starters}</strong></span>
        <span><small>{preparing ? "벤치" : "평균 평점"}</small><strong>{preparing ? bench : averageRating.toFixed(1)}{!preparing && <b>/10</b>}</strong></span>
        <span><small>{preparing ? "상태 확인" : "피드백 대기"}</small><strong>{preparing ? attention : feedbackPending}</strong></span>
      </div>

      {preparing ? <div className="match-squad-table">
        <div className="match-squad-head"><span>선수</span><span>역할</span><span>포지션</span><span>상태</span><span /></div>
        {visiblePlayers.map((player) => <button type="button" className={player.playerId === selectedId ? "selected" : undefined} key={player.playerId} onClick={() => selectPlayer(player.playerId)}>
          <span className="match-player-identity"><i>{player.number}</i><strong>{player.name}</strong><small>{player.position}</small></span>
          <span className={`match-role role-${player.role}`}>{player.role}</span>
          <strong>{player.position}</strong>
          <span className={`match-squad-health status-${player.status}`}>{statusLabel(player.status)}</span>
          <Icon name="chevron" size={15} />
        </button>)}
      </div> : <div className="match-player-table">
        <div className="match-player-head"><span>선수</span><span>출전</span><span>시간</span><span>GPS</span><span>평점</span><span>피드백</span></div>
        {visiblePlayers.map((player) => <button
          type="button"
          className={player.playerId === selectedId ? "selected" : undefined}
          key={player.playerId}
          onClick={() => selectPlayer(player.playerId)}
          aria-label={`${player.number} ${player.name} 경기 기록 열기`}
        >
          <span className="match-player-identity"><i>{player.number}</i><strong>{player.name}</strong><small>{player.position} · {statusLabel(player.status)}</small></span>
          <span className={`match-role role-${player.role}`}>{player.role}</span>
          <strong>{player.minutes}분</strong>
          <span className={`match-player-gps ${player.distance === null ? "missing" : ""}`}><strong>{player.distance === null ? "미연동" : `${player.distance.toFixed(1)}km`}</strong><small>{player.hsr === null ? "GPS 확인" : `HSR ${player.hsr.toFixed(2)}km`}</small></span>
          <strong className="match-rating">{player.rating.toFixed(1)}</strong>
          <span className={player.feedbackSent ? "sent" : "pending"}>{player.feedbackSent ? "전달 완료" : "바로 작성"}</span>
        </button>)}
      </div>}
      {paged && pageCount > 1 && <div className="match-player-pagination">
        <span>{page * pageSize + 1}–{Math.min((page + 1) * pageSize, orderedPlayers.length)} / {orderedPlayers.length}명</span>
        <div><button type="button" disabled={page === 0} onClick={() => changePage(page - 1)} aria-label="이전 경기 선수 페이지">‹ 이전</button><strong>{page + 1} / {pageCount}</strong><button type="button" disabled={page === pageCount - 1} onClick={() => changePage(page + 1)} aria-label="다음 경기 선수 페이지">다음 ›</button></div>
      </div>}
    </section>

    {mobileEditorOpen && <button className="match-player-editor-backdrop" type="button" onClick={() => setMobileEditorOpen(false)} aria-label="선수 기록 닫기" />}
    <aside className={`match-player-editor ${mobileEditorOpen ? "mobile-open" : ""}`}>
      <header>
        <div><h2>{selected.number} {selected.name}</h2><p>{selected.position} · {preparing ? "엔트리 역할" : "경기 기록과 피드백"}</p></div>
        <div>{preparing ? <span className="pending">{statusLabel(selected.status)}</span> : <span className={selected.feedbackSent ? "sent" : "pending"}>{selected.feedbackSent ? "전달됨" : "미전달"}</span>}<button type="button" onClick={() => setMobileEditorOpen(false)} aria-label="선수 경기 기록 닫기"><Icon name="close" size={16} /></button></div>
      </header>

      <div className="match-player-editor-fields">
        <label><span>출전 구분</span><select value={selected.role} onChange={(event) => updateSelected({ role: event.target.value as MatchPlayerData["role"] })}><option>선발</option><option>교체</option><option>미출전</option></select></label>
        <label><span>포지션</span><input value={selected.position} onChange={(event) => updateSelected({ position: event.target.value })} /></label>
        {!preparing && <><label><span>출전 시간</span><div><input type="number" min={0} max={150} value={selected.minutes} onChange={(event) => updateSelected({ minutes: Math.min(150, Math.max(0, Number(event.target.value))) })} /><em>분</em></div></label>
        <label><span>경기 평점</span><div><input type="number" min={0} max={10} step={0.1} value={selected.rating} onChange={(event) => updateSelected({ rating: Math.min(10, Math.max(0, Number(event.target.value))) })} /><em>/10</em></div></label></>}
      </div>

      {!preparing && <><div className={`match-editor-gps ${selected.distance === null ? "missing" : ""}`}>
        <span><small>GPS 상태</small><strong>{selected.distance === null ? "확인 필요" : "연결됨"}</strong></span>
        <span><small>총 거리</small><strong>{selected.distance === null ? "—" : `${selected.distance.toFixed(1)}km`}</strong></span>
        <span><small>고속 주행</small><strong>{selected.hsr === null ? "—" : `${selected.hsr.toFixed(2)}km`}</strong></span>
        <span><small>최고 속도</small><strong>{selected.maxSpeed === null ? "—" : `${selected.maxSpeed.toFixed(1)}km/h`}</strong></span>
      </div>

      <label className="match-feedback-field"><span>경기 피드백</span><textarea value={selected.feedback} onChange={(event) => updateSelected({ feedback: event.target.value, feedbackSent: false, feedbackVisibleToParent: false })} placeholder="관찰한 장면과 다음 행동을 짧게 작성하세요." /></label>
      <label className="match-parent-feedback-toggle"><input type="checkbox" checked={Boolean(selected.feedbackVisibleToParent)} onChange={(event) => updateSelected({ feedbackVisibleToParent: event.target.checked })} /><span><strong>학부모에게도 공개</strong><small>연결된 이 선수의 학부모에게만 전달됩니다.</small></span></label>
      <p className="match-feedback-tip"><Icon name="target" size={15} /><span><strong>좋은 피드백</strong>관찰한 장면 → 다음에 바꿀 행동 순서로 작성합니다.</span></p>
      </>}

      <footer>
        <span>{saved ? "저장되었습니다." : preparing ? "현재 참가 판단은 읽기 전용으로 확인하고 역할만 저장합니다." : "완료된 경기 기록은 당시 값으로 보존되며 현재 상태를 바꾸지 않습니다."}</span>
        {preparing ? <div className="single"><button type="button" onClick={() => save(false)}>{saved ? <><Icon name="check" size={15} />저장됨</> : "역할 저장"}</button></div> : <div><button type="button" className="secondary" onClick={() => save(false)}>기록 저장</button><button type="button" onClick={() => save(true)}>{selected.feedbackSent && saved ? <><Icon name="check" size={15} />전달 완료</> : "피드백 보내기"}</button></div>}
      </footer>
    </aside>
  </div>;
}
