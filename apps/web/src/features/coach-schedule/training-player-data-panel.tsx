"use client";

import { useEffect, useMemo, useState } from "react";
import type { TrainingPlayerData } from "@/features/coach-schedule/data/schedule-preview-data";
import { Badge, ProgressBar } from "@/shared/ui/components";
import { Icon } from "@/shared/ui/icon";

export function TrainingPlayerDataPanel({
  players,
  onChange,
}: {
  players: TrainingPlayerData[];
  onChange: (players: TrainingPlayerData[]) => void;
}) {
  const [selectedId, setSelectedId] = useState(players.find((player) => !player.feedbackSent)?.playerId ?? players[0]?.playerId ?? 0);
  const selected = players.find((player) => player.playerId === selectedId) ?? players[0];
  const [draft, setDraft] = useState<TrainingPlayerData | null>(selected ? { ...selected } : null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(selected ? { ...selected } : null);
    setSaved(false);
  }, [selected]);

  const summary = useMemo(() => ({
    normal: players.filter((player) => player.participation === "전체").length,
    limited: players.filter((player) => player.participation === "제한").length,
    excluded: players.filter((player) => player.participation === "제외").length,
    pending: players.filter((player) => !player.feedbackSent).length,
  }), [players]);

  function savePlayer() {
    if (!draft) return;
    onChange(players.map((player) => player.playerId === draft.playerId ? { ...draft } : player));
    setSaved(true);
  }

  if (!draft) return null;

  return <div className="training-player-data-layout">
    <section className="session-card training-player-table-card">
      <header><div><h3>선수별 훈련 데이터</h3><p>컨디션·참여·RPE와 퀵 피드백을 선수별로 관리합니다.</p></div><Badge tone="orange">피드백 대기 {summary.pending}</Badge></header>
      <div className="training-player-summary">
        <span><small>전체 참여</small><strong>{summary.normal}</strong></span>
        <span><small>제한 참여</small><strong>{summary.limited}</strong></span>
        <span><small>훈련 제외</small><strong>{summary.excluded}</strong></span>
        <span><small>평균 컨디션</small><strong>{Math.round(players.reduce((sum, player) => sum + player.condition, 0) / Math.max(players.length, 1))}</strong></span>
      </div>
      <div className="training-player-data-table">
        <div className="training-player-data-head"><span>선수</span><span>컨디션</span><span>상태</span><span>참여</span><span>RPE</span><span>퀵 피드백</span></div>
        {players.map((player) => <button className={`${player.playerId === draft.playerId ? "selected" : ""} ${player.participation !== "전체" ? "attention" : ""}`} key={player.playerId} onClick={() => setSelectedId(player.playerId)}>
          <span><i>{player.number}</i><strong>{player.name}</strong></span>
          <span><strong>{player.condition}</strong><ProgressBar value={player.condition} tone={player.condition < 60 ? "red" : player.condition < 75 ? "orange" : "green"} /></span>
          <Badge tone={player.status === "정상" ? "green" : player.status === "재활" ? "red" : "orange"}>{player.status}</Badge>
          <span>{player.participation}</span><span>{player.rpe}</span>
          <span className={player.feedbackSent ? "sent" : "pending"}>{player.feedbackSent ? "전달 완료" : player.feedback ? "작성됨" : "작성 필요"}<Icon name="chevron" size={14} /></span>
        </button>)}
      </div>
    </section>

    <aside className="session-card player-quick-editor">
      <header><div><h3>{draft.number} {draft.name}</h3><p>선수 퀵 피드백</p></div><Badge tone={draft.feedbackSent ? "green" : "orange"}>{draft.feedbackSent ? "전달됨" : "미전달"}</Badge></header>
      <div className="quick-player-metrics">
        <label><span>컨디션</span><input type="number" min={0} max={100} value={draft.condition} onChange={(event) => setDraft({ ...draft, condition: Number(event.target.value) })} /></label>
        <label><span>세션 RPE</span><input type="number" min={0} max={10} value={draft.rpe} onChange={(event) => setDraft({ ...draft, rpe: Number(event.target.value) })} /></label>
        <label><span>상태</span><select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as TrainingPlayerData["status"] })}><option>정상</option><option>관찰</option><option>제한</option><option>재활</option></select></label>
        <label><span>훈련 참여</span><select value={draft.participation} onChange={(event) => setDraft({ ...draft, participation: event.target.value as TrainingPlayerData["participation"] })}><option>전체</option><option>제한</option><option>제외</option></select></label>
      </div>
      <label className="quick-feedback-input"><span>코치 피드백</span><textarea value={draft.feedback} onChange={(event) => setDraft({ ...draft, feedback: event.target.value, feedbackSent: false })} /></label>
      <div className="quick-feedback-guide"><Icon name="target" size={16} /><span><strong>좋은 퀵 피드백</strong><small>관찰한 장면 → 다음에 신경 쓸 한 가지 → 실행할 행동 순서로 작성하세요.</small></span></div>
      <footer>
        <label><input type="checkbox" checked={draft.feedbackSent} onChange={(event) => setDraft({ ...draft, feedbackSent: event.target.checked })} />선수에게 바로 전달</label>
        <button onClick={savePlayer}>{saved ? <><Icon name="check" size={15} />저장 완료</> : "선수 데이터 저장"}</button>
      </footer>
    </aside>
  </div>;
}
