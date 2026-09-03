"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buildParentTrainingView, parentHiddenData } from "@/features/audience/parent-access-policy";
import {
  defaultTrainingPlan,
  defaultTrainingPlayerData,
  type CalendarEvent,
  type TrainingPlanBlock,
  type TrainingPlayerData,
} from "@/features/coach-schedule/data/schedule-preview-data";
import { TrainingPlayerDataPanel } from "@/features/coach-schedule/training-player-data-panel";
import { Icon } from "@/shared/ui/icon";

type TrainingSimpleTab = "content" | "notes" | "players";

function addMinutes(time: string, minutes: number) {
  const [hour, minute] = time.split(":").map(Number);
  const total = hour * 60 + minute + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function formatDate(date: string | undefined, day: number) {
  if (!date) return `2026년 7월 ${day}일`;
  const [year, month, dateValue] = date.split("-").map(Number);
  return `${year}년 ${month}월 ${dateValue}일`;
}

function getBlocks(session: CalendarEvent) {
  let elapsed = 0;
  const blocks = session.planBlocks?.length ? session.planBlocks : defaultTrainingPlan;
  return blocks.map((block) => {
    const defaultDetail = defaultTrainingPlan.find((item) => item.id === block.id);
    const item = { ...defaultDetail, ...block, startTime: addMinutes(session.time ?? "18:00", elapsed) };
    elapsed += block.duration;
    return item;
  });
}

type TimedTrainingBlock = TrainingPlanBlock & { startTime: string };

function TrainingSessionDetail({ block, onClose, onEdit }: {
  block: TimedTrainingBlock;
  onClose: () => void;
  onEdit: () => void;
}) {
  const endTime = addMinutes(block.startTime, block.duration);
  const keyPoints = block.keyPoints?.length ? block.keyPoints : [block.point].filter(Boolean);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return <div className="training-session-detail-backdrop" role="presentation" onMouseDown={(event) => {
    if (event.currentTarget === event.target) onClose();
  }}>
    <aside className="training-session-detail-drawer" role="dialog" aria-modal="true" aria-labelledby="training-session-detail-title">
      <header>
        <div><span>훈련 세션 상세</span><h2 id="training-session-detail-title">{block.title}</h2><p>{block.startTime}–{endTime} · {block.duration}분</p></div>
        <button type="button" onClick={onClose} aria-label="훈련 세션 상세 닫기"><Icon name="close" size={18} /></button>
      </header>
      <div className="training-session-detail-scroll">
        <dl className="training-session-detail-summary">
          <div><dt>강도</dt><dd>{block.intensity === "High" ? "높음" : block.intensity === "Low" ? "낮음" : "보통"}</dd></div>
          <div><dt>대상</dt><dd>{block.group || "전체"}</dd></div>
          <div><dt>인원</dt><dd>{block.playerCount || "전체 선수"}</dd></div>
        </dl>

        <section className="training-session-detail-primary">
          <span>세션 목적</span>
          <p>{block.objective || block.point || "세션 목적이 아직 입력되지 않았습니다."}</p>
        </section>

        <section>
          <h3>구성</h3>
          <dl className="training-session-setup-list">
            <div><dt>공간·배치</dt><dd>{block.setup || block.area || "현장에서 확인"}</dd></div>
            <div><dt>준비물</dt><dd>{block.equipment || "볼 · 콘 · 조끼"}</dd></div>
          </dl>
        </section>

        <section>
          <h3>진행 방법</h3>
          <p>{block.method || `${block.group || "전체 선수"}를 대상으로 ${block.duration}분 동안 진행합니다. 세트 사이에 코칭 포인트를 짧게 전달합니다.`}</p>
        </section>

        <section>
          <h3>규칙</h3>
          <p>{block.rules || "선수 반응과 공간 간격을 보며 반복 횟수와 휴식 시간을 현장에서 조정합니다."}</p>
        </section>

        <section>
          <h3>코칭 포인트</h3>
          {keyPoints.length ? <ul>{keyPoints.map((point) => <li key={point}>{point}</li>)}</ul> : <p>등록된 코칭 포인트가 없습니다.</p>}
        </section>
      </div>
      <footer><button type="button" onClick={onClose}>닫기</button><button type="button" onClick={() => { onClose(); onEdit(); }}><Icon name="edit" size={15} />세션 수정</button></footer>
    </aside>
  </div>;
}

function TrainingPlan({ session, onEdit }: { session: CalendarEvent; onEdit: () => void }) {
  const blocks = getBlocks(session);
  const duration = session.duration ?? blocks.reduce((sum, block) => sum + block.duration, 0);
  const [selectedBlock, setSelectedBlock] = useState<TimedTrainingBlock | null>(null);

  return <>
    <section className="training-simple-card training-simple-plan-card">
      <header>
        <div><span>훈련 상세</span><h2>훈련 구성</h2><p>{blocks.length}개 세션 · 총 {duration}분 · 세션을 누르면 상세 내용을 볼 수 있습니다.</p></div>
        <button type="button" onClick={onEdit}><Icon name="edit" size={15} />수정</button>
      </header>
      <div className="training-simple-blocks">
        {blocks.map((block, index) => <button type="button" key={block.id} onClick={() => setSelectedBlock(block)} aria-label={`${block.title} 세션 상세 보기`}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <time>{block.startTime}</time>
          <div><strong>{block.title}</strong><p>{block.point || "세부 내용 확인"}</p></div>
          <em>{block.duration}분</em>
          <Icon name="chevron" size={16} />
        </button>)}
      </div>
    </section>
    {selectedBlock && <TrainingSessionDetail block={selectedBlock} onClose={() => setSelectedBlock(null)} onEdit={onEdit} />}
  </>;
}

function TrainingMemo({ session, onSave }: { session: CalendarEvent; onSave: (memo: string) => void }) {
  const [memo, setMemo] = useState(session.memo ?? "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMemo(session.memo ?? "");
    setSaved(false);
  }, [session.id, session.memo]);

  return <section className="training-simple-card training-simple-note-card">
    <header><div><span>메모</span><h2>훈련 메모</h2><p>훈련에서 확인한 내용만 자유롭게 남깁니다.</p></div></header>
    <textarea value={memo} onChange={(event) => { setMemo(event.target.value); setSaved(false); }} placeholder="예: 전환 속도는 좋아졌고, 압박 간격은 다음 훈련에서 다시 확인" />
    <footer><small>{saved ? "저장되었습니다." : "지도자 내부 기록"}</small><button type="button" onClick={() => { onSave(memo); setSaved(true); }}>{saved ? <><Icon name="check" size={15} />저장됨</> : "메모 저장"}</button></footer>
  </section>;
}

function TrainingParentPreview({ session, players }: { session: CalendarEvent; players: TrainingPlayerData[] }) {
  const linkedPlayer = players.find((player) => player.feedbackSent && player.feedbackVisibleToParent) ?? players[0];
  const view = linkedPlayer ? buildParentTrainingView({ ...session, playerData: players }, linkedPlayer.playerId) : null;
  if (!view) return null;

  return <section className="training-simple-card audience-child-preview">
    <header><div><span>학부모 공개 범위</span><h2>연결된 자녀 기록만</h2><p>학부모 계정에는 다른 선수나 팀 운영 정보가 전달되지 않습니다.</p></div><strong>자녀 단위</strong></header>
    <div className="audience-child-preview-body">
      <div><small>{view.playerName} 선수의 훈련</small><strong>{view.date} · {view.time}</strong><p>{view.location}</p></div>
      <dl>
        <div><dt>참여</dt><dd>{view.participation}</dd></div>
        <div><dt>컨디션</dt><dd>{view.condition}<small>/10</small></dd></div>
        <div><dt>RPE</dt><dd>{view.rpe}<small>/10</small></dd></div>
      </dl>
      <blockquote>{view.feedback ?? "지도자가 학부모 공개로 전달한 피드백이 아직 없습니다."}</blockquote>
    </div>
    <footer><span>공개하지 않음</span><div>{parentHiddenData.map((item) => <em key={item}>{item}</em>)}</div></footer>
  </section>;
}

export function TrainingDetailWorkspace({ session, onEdit, onMemoSave, onPlayerDataChange }: {
  session: CalendarEvent;
  onEdit: () => void;
  onMemoSave: (memo: string) => void;
  onPlayerDataChange: (players: TrainingPlayerData[]) => void;
}) {
  const [activeTab, setActiveTab] = useState<TrainingSimpleTab>("content");
  const players = session.playerData?.length ? session.playerData : defaultTrainingPlayerData;
  const blocks = getBlocks(session);
  const duration = session.duration ?? blocks.reduce((sum, block) => sum + block.duration, 0);
  const endTime = addMinutes(session.time ?? "18:00", duration);

  return <div className="training-simple-workspace">
    <section className="training-simple-header">
      <div className="training-simple-title"><span>훈련 기록</span><h1>{session.title || `7월 ${session.day}일 훈련`}</h1></div>
      <dl>
        <div><dt>날짜</dt><dd>{formatDate(session.date, session.day)}</dd></div>
        <div><dt>시간</dt><dd>{session.time ?? "미정"}–{endTime}</dd></div>
        <div><dt>장소</dt><dd>{session.location ?? "장소 미정"}</dd></div>
      </dl>
      <Link href="/schedule/templates"><Icon name="copy" size={15} />훈련 템플릿</Link>
    </section>

    <nav className="training-simple-tabs" role="tablist" aria-label="훈련 상세 메뉴">
      <button type="button" role="tab" aria-selected={activeTab === "content"} aria-controls="training-content-panel" onClick={() => setActiveTab("content")}><span>훈련 내용</span><b>{blocks.length}</b></button>
      <button type="button" role="tab" aria-selected={activeTab === "notes"} aria-controls="training-notes-panel" onClick={() => setActiveTab("notes")}><span>목표·메모</span></button>
      <button type="button" role="tab" aria-selected={activeTab === "players"} aria-controls="training-players-panel" onClick={() => setActiveTab("players")}><span>선수 정보</span><b>{players.length}</b></button>
    </nav>

    {activeTab === "content" && <div id="training-content-panel" role="tabpanel" className="training-simple-panel"><TrainingPlan session={session} onEdit={onEdit} /></div>}

    {activeTab === "notes" && <div id="training-notes-panel" role="tabpanel" className="training-simple-panel training-simple-notes">
        <section className="training-simple-card training-simple-goal-card">
          <header><div><span>목표</span><h2>이번 훈련 목표</h2><p>선수에게 전달할 기준을 한 가지로 정합니다.</p></div><button type="button" onClick={onEdit}><Icon name="edit" size={15} />수정</button></header>
          <p>{session.objective || "아직 입력한 목표가 없습니다."}</p>
        </section>
        <TrainingMemo session={session} onSave={onMemoSave} />
        <TrainingParentPreview session={session} players={players} />
      </div>}

    {activeTab === "players" && <section id="training-players-panel" role="tabpanel" className="training-simple-panel training-simple-players">
      <TrainingPlayerDataPanel mode="prepare" paged players={players} onChange={onPlayerDataChange} />
    </section>}
  </div>;
}
