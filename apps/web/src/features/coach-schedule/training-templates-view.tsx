"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  type TrainingPlanBlock,
  type TrainingTemplate,
} from "@/features/coach-schedule/data/schedule-preview-data";
import { useScheduleStore } from "@/features/coach-schedule/model/schedule-store";
import { Icon } from "@/shared/ui/icon";

type TemplateInput = Omit<TrainingTemplate, "id" | "builtIn">;

function createBlock(): TrainingPlanBlock {
  return {
    id: `template-block-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    title: "새 훈련 내용",
    duration: 20,
    point: "",
    intensity: "Medium",
    group: "전체",
  };
}

function newTemplate(): TemplateInput {
  return {
    name: "새 훈련 템플릿",
    duration: 20,
    intensity: "Medium",
    location: "보조구장",
    objective: "",
    coachingPoints: "",
    memo: "",
    planBlocks: [createBlock()],
  };
}

function copyBlock(block: TrainingPlanBlock, createNewId = false): TrainingPlanBlock {
  return {
    ...block,
    id: createNewId ? `template-block-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}` : block.id,
    keyPoints: block.keyPoints ? [...block.keyPoints] : undefined,
    board: block.board ? {
      pitchPreset: block.board.pitchPreset,
      items: block.board.items.map((item) => ({ ...item })),
      lines: block.board.lines.map((line) => ({ ...line, points: line.points?.map((point) => ({ ...point })) })),
    } : undefined,
  };
}

function TemplateEditor({ initial, saveAsNew, onClose, onSave }: {
  initial?: TrainingTemplate;
  saveAsNew?: boolean;
  onClose: () => void;
  onSave: (input: TemplateInput) => void;
}) {
  const [draft, setDraft] = useState<TemplateInput>(() => initial ? {
    name: saveAsNew ? `${initial.name} 복사본` : initial.name,
    duration: initial.duration,
    intensity: initial.intensity,
    location: initial.location,
    objective: initial.objective,
    coachingPoints: initial.coachingPoints,
    memo: initial.memo,
    planBlocks: initial.planBlocks.map((block) => copyBlock(block, Boolean(saveAsNew))),
  } : newTemplate());
  const duration = useMemo(() => draft.planBlocks.reduce((sum, block) => sum + block.duration, 0), [draft.planBlocks]);

  function updateBlock(id: string, updates: Partial<TrainingPlanBlock>) {
    setDraft((current) => ({ ...current, planBlocks: current.planBlocks.map((block) => block.id === id ? { ...block, ...updates } : block) }));
  }

  return <div className="schedule-modal-backdrop" role="presentation" onMouseDown={(event) => {
    if (event.currentTarget === event.target) onClose();
  }}>
    <section className="simple-training-editor-modal simple-template-editor-modal" role="dialog" aria-modal="true" aria-labelledby="template-editor-title">
      <header>
        <div><span>훈련 템플릿</span><h2 id="template-editor-title">{initial && !saveAsNew ? "템플릿 수정" : "새 템플릿"}</h2><p>훈련 내용과 목표, 메모만 저장해 다음에 그대로 사용합니다.</p></div>
        <button type="button" onClick={onClose} aria-label="템플릿 편집 닫기"><Icon name="close" size={18} /></button>
      </header>
      <form onSubmit={(event) => {
        event.preventDefault();
        if (!draft.name.trim() || !draft.planBlocks.length) return;
        onSave({
          ...draft,
          name: draft.name.trim(),
          duration,
          coachingPoints: draft.planBlocks.map((block) => block.point).filter(Boolean).slice(0, 3).join(" / "),
        });
      }}>
        <div className="simple-training-editor-scroll">
          <section className="simple-training-editor-section">
            <header><h3>기본 정보</h3></header>
            <div className="simple-training-basic-fields">
              <label className="location"><span>템플릿 이름</span><input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
              <label className="location"><span>기본 장소</span><input value={draft.location} onChange={(event) => setDraft({ ...draft, location: event.target.value })} placeholder="필요할 때 바꿀 수 있습니다." /></label>
            </div>
          </section>

          <section className="simple-training-editor-section">
            <header><div><h3>훈련 내용</h3><p>진행 순서와 시간, 짧은 메모만 입력합니다.</p></div><strong>총 {duration}분</strong></header>
            <div className="simple-training-block-editor">
              {draft.planBlocks.map((block, index) => <article key={block.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <label><small>훈련 내용</small><input required value={block.title} onChange={(event) => updateBlock(block.id, { title: event.target.value })} /></label>
                <label><small>시간</small><input type="number" min={1} max={180} value={block.duration} onChange={(event) => updateBlock(block.id, { duration: Math.max(1, Number(event.target.value)) })} /></label>
                <label><small>메모</small><input value={block.point} onChange={(event) => updateBlock(block.id, { point: event.target.value })} placeholder="선택" /></label>
                <button type="button" disabled={draft.planBlocks.length === 1} onClick={() => setDraft((current) => ({ ...current, planBlocks: current.planBlocks.filter((item) => item.id !== block.id) }))} aria-label={`${block.title} 삭제`}><Icon name="close" size={15} /></button>
                <details className="simple-training-block-details">
                  <summary>세션 상세 입력</summary>
                  <div>
                    <label className="full"><small>세션 목적</small><textarea value={block.objective ?? ""} onChange={(event) => updateBlock(block.id, { objective: event.target.value })} placeholder="이 세션에서 만들고 싶은 변화" /></label>
                    <label><small>공간·배치</small><input value={block.setup ?? ""} onChange={(event) => updateBlock(block.id, { setup: event.target.value })} placeholder="예: 30×25m · 3개 구역" /></label>
                    <label><small>인원</small><input value={block.playerCount ?? ""} onChange={(event) => updateBlock(block.id, { playerCount: event.target.value })} placeholder="예: 8v8+3" /></label>
                    <label className="full"><small>준비물</small><input value={block.equipment ?? ""} onChange={(event) => updateBlock(block.id, { equipment: event.target.value })} placeholder="볼 · 콘 · 조끼" /></label>
                    <label className="full"><small>진행 방법</small><textarea value={block.method ?? ""} onChange={(event) => updateBlock(block.id, { method: event.target.value })} placeholder="진행 순서와 세트 구성" /></label>
                    <label className="full"><small>규칙</small><textarea value={block.rules ?? ""} onChange={(event) => updateBlock(block.id, { rules: event.target.value })} placeholder="선수에게 전달할 핵심 규칙" /></label>
                    <label className="full"><small>코칭 포인트</small><textarea value={block.keyPoints?.join("\n") ?? ""} onChange={(event) => updateBlock(block.id, { keyPoints: event.target.value.split("\n").map((item) => item.trim()).filter(Boolean) })} placeholder={"한 줄에 하나씩 입력\n예: 받기 전 어깨 너머 확인"} /></label>
                  </div>
                </details>
              </article>)}
              <button className="simple-add-training-block" type="button" onClick={() => setDraft((current) => ({ ...current, planBlocks: [...current.planBlocks, createBlock()] }))}><Icon name="plus" size={15} />훈련 내용 추가</button>
            </div>
          </section>

          <section className="simple-training-editor-section simple-template-notes">
            <label><span>훈련 목표</span><textarea value={draft.objective} onChange={(event) => setDraft({ ...draft, objective: event.target.value })} placeholder="이 템플릿의 목표" /></label>
            <label><span>메모</span><textarea value={draft.memo} onChange={(event) => setDraft({ ...draft, memo: event.target.value })} placeholder="준비하거나 기억할 내용" /></label>
          </section>
        </div>
        <footer><button type="button" onClick={onClose}>취소</button><button type="submit"><Icon name="check" size={15} />템플릿 저장</button></footer>
      </form>
    </section>
  </div>;
}

export function TrainingTemplatesView() {
  const { templates, createTemplate, updateTemplate, deleteTemplate } = useScheduleStore();
  const [editor, setEditor] = useState<{ template?: TrainingTemplate; saveAsNew?: boolean } | null>(null);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const visibleTemplates = templates.filter((template) => `${template.name} ${template.objective} ${template.memo} ${template.planBlocks.map((block) => block.title).join(" ")}`.toLowerCase().includes(normalizedQuery));

  return <div className="training-template-page training-library-v2 training-template-simple-page">
    <Link className="session-back" href="/schedule">‹ 훈련 관리로 돌아가기</Link>
    <header className="training-template-page-header">
      <div><span>반복 입력 줄이기</span><h1>훈련 템플릿</h1><p>자주 쓰는 훈련 내용과 목표, 메모를 저장해 다음 훈련에 바로 사용합니다.</p></div>
      <div className="training-library-header-actions"><button className="primary" onClick={() => setEditor({})}><Icon name="plus" size={16} />새 템플릿</button></div>
    </header>

    <section className="training-library-workspace">
      <header className="training-library-workspace-header">
        <div><span>전체 {visibleTemplates.length}개</span><h2>저장된 템플릿</h2><p>필요한 템플릿을 골라 수정하거나 훈련에 사용하세요.</p></div>
        <label className="training-library-search"><Icon name="search" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="템플릿 검색" /></label>
      </header>

      <div className="template-card-grid template-page-grid training-library-template-grid">
        {visibleTemplates.map((template) => <article className="training-template-card" key={template.id}>
          <header><span className={template.builtIn ? "built-in" : "custom"}>{template.builtIn ? "기본 템플릿" : "내 템플릿"}</span><em>{template.duration}분</em></header>
          <h3>{template.name}</h3>
          <p>{template.objective || "목표가 아직 입력되지 않았습니다."}</p>
          <ol>{template.planBlocks.slice(0, 4).map((block, index) => <li key={block.id}><span>{String(index + 1).padStart(2, "0")}</span><strong>{block.title}</strong><small>{block.duration}분</small></li>)}</ol>
          <footer><small>{template.planBlocks.length}개 훈련 내용</small><div>
            <button onClick={() => setEditor({ template, saveAsNew: Boolean(template.builtIn) })}>{template.builtIn ? "복사해서 수정" : "수정"}</button>
            {!template.builtIn && <button className="danger" onClick={() => { deleteTemplate(template.id); setNotice("템플릿을 삭제했습니다."); }}>삭제</button>}
            <Link href={`/schedule?create=training&template=${template.id}`}>훈련에 사용</Link>
          </div></footer>
        </article>)}
        {!visibleTemplates.length && <div className="training-library-empty"><strong>표시할 템플릿이 없습니다.</strong><span>검색어를 바꾸거나 새 템플릿을 만들어보세요.</span></div>}
      </div>
    </section>

    {notice && <div className="schedule-toast" role="status"><Icon name="check" size={16} />{notice}<button onClick={() => setNotice("")} aria-label="알림 닫기"><Icon name="close" size={14} /></button></div>}
    {editor && <TemplateEditor initial={editor.template} saveAsNew={editor.saveAsNew} onClose={() => setEditor(null)} onSave={(input) => {
      if (editor.template && !editor.saveAsNew) updateTemplate(editor.template.id, input);
      else createTemplate(input);
      setEditor(null);
      setNotice(editor.template && !editor.saveAsNew ? "템플릿을 수정했습니다." : "새 템플릿을 저장했습니다.");
    }} />}
  </div>;
}
