"use client";

import { useEffect, useMemo, useState } from "react";
import { usePlayerHealthStore } from "@/features/coach-wellbeing/model/player-health-store";
import { sessionPlayers, type TrainingPlayerData } from "@/features/coach-schedule/data/schedule-preview-data";
import { toConditionScore } from "@/features/players/model/player";
import { Badge, ProgressBar } from "@/shared/ui/components";
import { Icon } from "@/shared/ui/icon";

export function TrainingPlayerDataPanel({
  mode = "review",
  paged = false,
  players,
  onChange,
}: {
  mode?: "prepare" | "review";
  paged?: boolean;
  players: TrainingPlayerData[];
  onChange: (players: TrainingPlayerData[]) => void;
}) {
  const { recordsByPlayerId, updateHealth } = usePlayerHealthStore();
  const linkedPlayers = useMemo(() => players.map((player) => {
    if (mode === "review") return player;
    const health = recordsByPlayerId.get(player.playerId);
    if (!health) return player;
    return {
      ...player,
      condition: health.condition,
      status: health.status,
      participation: health.availability === "전체 참여" ? "전체" as const : health.availability === "제한 참여" ? "제한" as const : "제외" as const,
    };
  }), [mode, players, recordsByPlayerId]);
  const [selectedId, setSelectedId] = useState(players.find((player) => !player.feedbackSent)?.playerId ?? players[0]?.playerId ?? 0);
  const selected = linkedPlayers.find((player) => player.playerId === selectedId) ?? linkedPlayers[0];
  const [draft, setDraft] = useState<TrainingPlayerData | null>(selected ? { ...selected } : null);
  const [saveState, setSaveState] = useState<"idle" | "saved" | "sent" | "error">("idle");
  const [mobileEditorOpen, setMobileEditorOpen] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 5;
  const pageCount = Math.max(1, Math.ceil(linkedPlayers.length / pageSize));
  const visiblePlayers = paged ? linkedPlayers.slice(page * pageSize, (page + 1) * pageSize) : linkedPlayers;

  useEffect(() => {
    setDraft(selected ? { ...selected } : null);
  }, [selectedId, selected]);

  useEffect(() => {
    setSaveState("idle");
  }, [selectedId]);

  useEffect(() => {
    if (page < pageCount) return;
    setPage(Math.max(0, pageCount - 1));
  }, [page, pageCount]);

  const summary = useMemo(() => ({
    normal: linkedPlayers.filter((player) => player.participation === "전체").length,
    limited: linkedPlayers.filter((player) => player.participation === "제한").length,
    excluded: linkedPlayers.filter((player) => player.participation === "제외").length,
    pending: linkedPlayers.filter((player) => !player.feedbackSent).length,
    gps: linkedPlayers.filter((player) => {
      const gps = sessionPlayers.find((item) => item.number === player.number);
      return Boolean(gps && gps.distance !== "—");
    }).length,
  }), [linkedPlayers]);

  async function savePlayer(sendFeedback: boolean) {
    if (!draft) return;
    const nextDraft = { ...draft, feedbackSent: sendFeedback ? true : draft.feedbackSent };
    onChange(linkedPlayers.map((player) => player.playerId === draft.playerId ? nextDraft : player));
    if (mode === "prepare") {
      const currentHealth = recordsByPlayerId.get(nextDraft.playerId);
      const result = await updateHealth(nextDraft.playerId, {
        condition: nextDraft.condition,
        status: nextDraft.status,
        availability: nextDraft.participation === "전체" ? "전체 참여" : nextDraft.participation === "제한" ? "제한 참여" : "훈련 제외",
        injuryStatus: nextDraft.status === "재활" ? "재활 중" : currentHealth?.injuryStatus ?? "없음",
        restriction: nextDraft.participation === "전체" ? "제한 없음" : currentHealth?.restriction === "제한 없음" ? "훈련 전 지도자 재확인" : currentHealth?.restriction,
        updatedAt: "방금",
        source: "훈련 선수 기록",
      });
      if (!result.ok) {
        setSaveState("error");
        return;
      }
    }
    setDraft(nextDraft);
    setSaveState(sendFeedback ? "sent" : "saved");
  }

  function changePage(nextPage: number) {
    const safePage = Math.min(pageCount - 1, Math.max(0, nextPage));
    const firstPlayer = linkedPlayers[safePage * pageSize];
    setPage(safePage);
    if (firstPlayer) setSelectedId(firstPlayer.playerId);
    setMobileEditorOpen(false);
  }

  if (!draft) return null;

  return <div className={`training-player-data-layout mode-${mode}`}>
    <section className="session-card training-player-table-card">
      <header><div><h3>{mode === "prepare" ? "참여 선수 확인" : "선수 데이터·피드백"}</h3><p>{mode === "prepare" ? "훈련 전에는 컨디션과 참여 예외만 확인합니다." : "훈련 후 필요한 선수만 기록하고 바로 피드백을 보냅니다."}</p></div><div className="training-player-header-badges">{mode === "review" ? <><Badge tone="green">GPS {summary.gps}/{linkedPlayers.length}</Badge><Badge tone="orange">피드백 대기 {summary.pending}</Badge></> : <Badge tone={summary.limited + summary.excluded ? "orange" : "green"}>제한·제외 {summary.limited + summary.excluded}명</Badge>}</div></header>
      <div className="training-player-summary">
        <span><small>전체 선수</small><strong>{linkedPlayers.length}</strong></span>
        <span><small>평균 컨디션</small><strong>{(linkedPlayers.reduce((sum, player) => sum + player.condition, 0) / Math.max(linkedPlayers.length, 1)).toFixed(1)}<small>/10</small></strong></span>
        <span><small>제한·제외</small><strong>{summary.limited + summary.excluded}</strong></span>
        <span><small>{mode === "prepare" ? "전체 참여" : "GPS 연결"}</small><strong>{mode === "prepare" ? summary.normal : summary.gps}</strong></span>
      </div>
      <div className={`training-player-data-table mode-${mode}`}>
        <div className="training-player-data-head"><span>선수</span><span>컨디션</span><span>참여</span>{mode === "review" ? <><span>GPS</span><span>피드백</span></> : <span>상태</span>}</div>
        {visiblePlayers.map((player) => {
          const gps = sessionPlayers.find((item) => item.number === player.number);
          const gpsConnected = Boolean(gps && gps.distance !== "—");
          return <button className={player.playerId === draft.playerId ? "selected" : ""} key={player.playerId} onClick={() => {
            setSelectedId(player.playerId);
            setMobileEditorOpen(true);
          }}>
            <span><i>{player.number}</i><strong>{player.name}</strong><small className={`player-status status-${player.status}`}>{player.status}</small></span>
            <span><strong>{player.condition}<small>/10</small></strong><ProgressBar value={player.condition * 10} tone={player.condition < 6 ? "red" : player.condition < 8 ? "orange" : "green"} /></span>
            <span className={`participation-${player.participation}`}>{player.participation}</span>
            {mode === "review" ? <><span className={`training-gps-cell ${gpsConnected ? "connected" : "disconnected"}`}><strong>{gpsConnected ? gps?.distance : "미연동"}</strong><small>{gpsConnected ? `HSR ${gps?.hsr}` : "GPS 확인"}</small></span><span className={player.feedbackSent ? "sent" : "pending"}>{player.feedbackSent ? "전달 완료" : "바로 피드백"}<Icon name="chevron" size={14} /></span></> : <span className={`player-status status-${player.status}`}>{player.status}<Icon name="chevron" size={14} /></span>}
          </button>;
        })}
      </div>
      {paged && pageCount > 1 && <div className="training-player-pagination">
        <span>{page * pageSize + 1}–{Math.min((page + 1) * pageSize, linkedPlayers.length)} / {linkedPlayers.length}명</span>
        <div>
          <button type="button" disabled={page === 0} onClick={() => changePage(page - 1)} aria-label="이전 선수 페이지">‹ 이전</button>
          <strong>{page + 1} / {pageCount}</strong>
          <button type="button" disabled={page === pageCount - 1} onClick={() => changePage(page + 1)} aria-label="다음 선수 페이지">다음 ›</button>
        </div>
      </div>}
    </section>

    {mobileEditorOpen && <button className="player-editor-backdrop" onClick={() => setMobileEditorOpen(false)} aria-label="선수 피드백 닫기" />}
    <aside className={`session-card player-quick-editor ${mobileEditorOpen ? "mobile-open" : ""}`}>
      <header><div><h3>{draft.number} {draft.name}</h3><p>{mode === "prepare" ? "참여 상태 확인" : "선수 퀵 피드백"}</p></div><div className="player-editor-header-actions">{mode === "review" && <Badge tone={draft.feedbackSent ? "green" : "orange"}>{draft.feedbackSent ? "전달됨" : "미전달"}</Badge>}<button className="player-editor-close" onClick={() => setMobileEditorOpen(false)} aria-label="선수 피드백 닫기"><Icon name="close" size={16} /></button></div></header>
      <div className="quick-player-metrics">
        <label><span>컨디션 (0~10)</span><input type="number" min={0} max={10} step={1} value={draft.condition} onChange={(event) => setDraft({ ...draft, condition: toConditionScore(Number(event.target.value)) })} /></label>
        {mode === "review" && <label><span>세션 RPE</span><input type="number" min={0} max={10} value={draft.rpe} onChange={(event) => setDraft({ ...draft, rpe: Number(event.target.value) })} /></label>}
        <label><span>상태</span><select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as TrainingPlayerData["status"] })}><option>정상</option><option>관찰</option><option>제한</option><option>재활</option></select></label>
        <label><span>훈련 참여</span><select value={draft.participation} onChange={(event) => setDraft({ ...draft, participation: event.target.value as TrainingPlayerData["participation"] })}><option>전체</option><option>제한</option><option>제외</option></select></label>
      </div>
      {mode === "review" && (() => {
        const gps = sessionPlayers.find((item) => item.number === draft.number);
        const connected = Boolean(gps && gps.distance !== "—");
        return <div className={`quick-player-gps ${connected ? "connected" : "disconnected"}`}><span><small>GPS 상태</small><strong>{connected ? "연결됨" : "미연동"}</strong></span><span><small>총 거리</small><strong>{connected ? gps?.distance : "—"}</strong></span><span><small>고속 주행</small><strong>{connected ? gps?.hsr : "—"}</strong></span><span><small>스프린트</small><strong>{connected ? `${gps?.sprint}회` : "—"}</strong></span></div>;
      })()}
      {mode === "review" && <><label className="quick-feedback-input"><span>코치 피드백</span><textarea value={draft.feedback} onChange={(event) => setDraft({ ...draft, feedback: event.target.value, feedbackSent: false, feedbackVisibleToParent: false })} /></label><label className="match-parent-feedback-toggle"><input type="checkbox" checked={Boolean(draft.feedbackVisibleToParent)} onChange={(event) => setDraft({ ...draft, feedbackVisibleToParent: event.target.checked })} /><span><strong>학부모에게도 공개</strong><small>연결된 이 선수의 학부모에게만 전달됩니다.</small></span></label><div className="quick-feedback-guide"><Icon name="target" size={16} /><span><strong>좋은 퀵 피드백</strong><small>관찰한 장면 → 다음에 신경 쓸 한 가지 → 실행할 행동 순서로 작성하세요.</small></span></div></>}
      <footer>
        <span>{saveState === "error" ? "부상·재활 종료는 부상·컨디션 관리에서 확인해주세요." : mode === "prepare" ? "예정 훈련의 판단만 현재 상태에 함께 반영됩니다." : "완료된 훈련 기록은 당시 값으로 보존되며 현재 상태를 바꾸지 않습니다."}</span>
        <div className={mode === "prepare" ? "single" : ""}><button className="secondary" onClick={() => void savePlayer(false)}>{saveState === "saved" ? <><Icon name="check" size={15} />저장됨</> : mode === "prepare" ? "참여 상태 저장" : "정보 저장"}</button>{mode === "review" && <button onClick={() => void savePlayer(true)}>{saveState === "sent" ? <><Icon name="check" size={15} />전달 완료</> : "피드백 보내기"}</button>}</div>
      </footer>
    </aside>
  </div>;
}
