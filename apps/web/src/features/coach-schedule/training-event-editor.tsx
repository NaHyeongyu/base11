"use client";

import { useMemo, useState } from "react";
import {
  defaultTrainingPlayerData,
  type CalendarEvent,
  type TrainingPlanBlock,
  type TrainingTemplate,
} from "@/features/coach-schedule/data/schedule-preview-data";
import { Icon } from "@/shared/ui/icon";

function createBlock(): TrainingPlanBlock {
  return {
    id: `training-block-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    title: "새 훈련 내용",
    duration: 20,
    point: "",
    intensity: "Medium",
    group: "전체",
  };
}

function copyBlocks(blocks: TrainingPlanBlock[]) {
  return blocks.map((block) => ({
    ...block,
    id: `${block.id}-${Math.random().toString(36).slice(2, 7)}`,
    keyPoints: block.keyPoints ? [...block.keyPoints] : undefined,
    board: block.board ? {
      pitchPreset: block.board.pitchPreset,
      items: block.board.items.map((item) => ({ ...item })),
      lines: block.board.lines.map((line) => ({ ...line, points: line.points?.map((point) => ({ ...point })) })),
    } : undefined,
  }));
}

export function TrainingEventEditor({ day, initialEvent, templates, onClose, onSave }: {
  day: number;
  initialEvent?: CalendarEvent;
  templates: TrainingTemplate[];
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
}) {
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [date, setDate] = useState(initialEvent?.date ?? `2026-07-${String(day).padStart(2, "0")}`);
  const [time, setTime] = useState(initialEvent?.time ?? "17:00");
  const [location, setLocation] = useState(initialEvent?.location ?? "보조구장");
  const [objective, setObjective] = useState(initialEvent?.objective ?? "");
  const [memo, setMemo] = useState(initialEvent?.memo ?? "");
  const [intensity, setIntensity] = useState(initialEvent?.intensity ?? "Medium");
  const [blocks, setBlocks] = useState<TrainingPlanBlock[]>(() => initialEvent?.planBlocks?.length ? copyBlocks(initialEvent.planBlocks) : [createBlock()]);
  const duration = useMemo(() => blocks.reduce((sum, block) => sum + block.duration, 0), [blocks]);

  function updateBlock(id: string, updates: Partial<TrainingPlanBlock>) {
    setBlocks((current) => current.map((block) => block.id === id ? { ...block, ...updates } : block));
  }

  function applyTemplate(templateId: string) {
    setSelectedTemplateId(templateId);
    const template = templates.find((item) => item.id === templateId);
    if (!template) return;
    setLocation(template.location);
    setObjective(template.objective);
    setMemo(template.memo);
    setIntensity(template.intensity);
    setBlocks(copyBlocks(template.planBlocks));
  }

  return <div className="schedule-modal-backdrop" role="presentation" onMouseDown={(event) => {
    if (event.currentTarget === event.target) onClose();
  }}>
    <section className="simple-training-editor-modal" role="dialog" aria-modal="true" aria-labelledby="training-create-title">
      <header>
        <div><span>훈련 등록</span><h2 id="training-create-title">새 훈련</h2><p>템플릿을 고른 뒤 달라진 내용만 수정하면 됩니다.</p></div>
        <button type="button" onClick={onClose} aria-label="훈련 등록 닫기"><Icon name="close" size={18} /></button>
      </header>
      <form onSubmit={(event) => {
        event.preventDefault();
        const nextDay = Number(date.split("-")[2]) || day;
        onSave({
          id: "new",
          day: nextDay,
          date,
          time,
          title: "훈련",
          type: "training",
          duration,
          intensity,
          location,
          objective,
          memo,
          coachingPoints: blocks.map((block) => block.point).filter(Boolean).slice(0, 3).join(" / "),
          planBlocks: blocks,
          playerData: initialEvent?.playerData?.map((player) => ({ ...player })) ?? defaultTrainingPlayerData.map((player) => ({ ...player })),
        });
      }}>
        <div className="simple-training-editor-scroll">
          {templates.length > 0 && <section className="simple-training-template-picker">
            <div><Icon name="copy" size={17} /><span><strong>훈련 템플릿</strong><small>선택하면 내용·목표·메모를 불러옵니다.</small></span></div>
            <select value={selectedTemplateId} onChange={(event) => applyTemplate(event.target.value)} aria-label="훈련 템플릿 선택">
              <option value="">직접 입력</option>
              {templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
            </select>
          </section>}

          <section className="simple-training-editor-section">
            <header><h3>기본 정보</h3></header>
            <div className="simple-training-basic-fields">
              <label><span>날짜</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label>
              <label><span>시작 시간</span><input type="time" value={time} onChange={(event) => setTime(event.target.value)} required /></label>
              <label className="location"><span>장소</span><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="훈련 장소" /></label>
            </div>
          </section>

          <section className="simple-training-editor-section">
            <header><div><h3>훈련 내용</h3><p>진행 순서와 시간, 짧은 메모만 입력합니다.</p></div><strong>총 {duration}분</strong></header>
            <div className="simple-training-block-editor">
              {blocks.map((block, index) => <article key={block.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <label><small>훈련 내용</small><input required value={block.title} onChange={(event) => updateBlock(block.id, { title: event.target.value })} /></label>
                <label><small>시간</small><input type="number" min={1} max={180} value={block.duration} onChange={(event) => updateBlock(block.id, { duration: Math.max(1, Number(event.target.value)) })} /></label>
                <label><small>메모</small><input value={block.point} onChange={(event) => updateBlock(block.id, { point: event.target.value })} placeholder="선택" /></label>
                <button type="button" disabled={blocks.length === 1} onClick={() => setBlocks((current) => current.filter((item) => item.id !== block.id))} aria-label={`${block.title} 삭제`}><Icon name="close" size={15} /></button>
              </article>)}
              <button className="simple-add-training-block" type="button" onClick={() => setBlocks((current) => [...current, createBlock()])}><Icon name="plus" size={15} />훈련 내용 추가</button>
            </div>
          </section>

          <section className="simple-training-editor-section simple-template-notes">
            <label><span>훈련 목표</span><textarea value={objective} onChange={(event) => setObjective(event.target.value)} placeholder="이번 훈련의 한 가지 목표" /></label>
            <label><span>메모</span><textarea value={memo} onChange={(event) => setMemo(event.target.value)} placeholder="준비하거나 기억할 내용" /></label>
          </section>
        </div>
        <footer><button type="button" onClick={onClose}>취소</button><button type="submit"><Icon name="check" size={15} />훈련 저장</button></footer>
      </form>
    </section>
  </div>;
}
