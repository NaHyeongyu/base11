"use client";

import type { TrainingTemplate } from "@/features/coach-schedule/data/schedule-preview-data";
import { Icon } from "@/shared/ui/icon";

export function TrainingTemplateLibrary({
  templates,
  onClose,
  onUse,
  onDelete,
}: {
  templates: TrainingTemplate[];
  onClose: () => void;
  onUse: (template: TrainingTemplate) => void;
  onDelete: (id: string) => void;
}) {
  return <div className="schedule-modal-backdrop" role="presentation" onMouseDown={(event) => {
    if (event.currentTarget === event.target) onClose();
  }}>
    <section className="template-library-modal" role="dialog" aria-modal="true" aria-labelledby="template-library-title">
      <header>
        <div><span>TRAINING LIBRARY</span><h2 id="template-library-title">훈련 템플릿</h2><p>자주 쓰는 훈련 구성과 코칭 포인트를 저장하고 새 일정에 재사용합니다.</p></div>
        <button onClick={onClose} aria-label="템플릿 보관함 닫기"><Icon name="close" /></button>
      </header>
      <div className="template-library-summary">
        <article><small>전체 템플릿</small><strong>{templates.length}개</strong></article>
        <article><small>기본 템플릿</small><strong>{templates.filter((template) => template.builtIn).length}개</strong></article>
        <article><small>내 템플릿</small><strong>{templates.filter((template) => !template.builtIn).length}개</strong></article>
      </div>
      <div className="template-card-grid">
        {templates.map((template) => <article className="training-template-card" key={template.id}>
          <header><span className={template.builtIn ? "built-in" : "custom"}>{template.builtIn ? "BASE11 기본" : "내 템플릿"}</span>{!template.builtIn && <button onClick={() => onDelete(template.id)}>삭제</button>}</header>
          <h3>{template.name}</h3>
          <p>{template.objective}</p>
          <div><span><Icon name="clock" size={14} />{template.duration}분</span><span><Icon name="location" size={14} />{template.location}</span></div>
          <ul>{template.planBlocks.slice(0, 4).map((block) => <li key={block.id}><span>{block.duration}분</span><strong>{block.title}</strong></li>)}</ul>
          <footer><small>{template.planBlocks.length}개 훈련 블록</small><button onClick={() => onUse(template)}>이 템플릿으로 일정 만들기 <Icon name="chevron" size={15} /></button></footer>
        </article>)}
      </div>
      {!templates.length && <div className="template-empty"><Icon name="download" size={24} /><strong>저장된 템플릿이 없습니다.</strong><p>훈련 일정을 만들 때 현재 구성을 템플릿으로 저장해보세요.</p></div>}
    </section>
  </div>;
}
