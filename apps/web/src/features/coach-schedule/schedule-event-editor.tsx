"use client";

import { useMemo, useState } from "react";
import {
  defaultTrainingPlan,
  defaultTrainingPlayerData,
  type CalendarEvent,
  type TrainingIntensity,
  type TrainingPlanBlock,
  type TrainingTemplate,
} from "@/features/coach-schedule/data/schedule-preview-data";
import { Icon } from "@/shared/ui/icon";

type EditableEventType = "training" | "match";

type ScheduleEventEditorProps = {
  initialEvent?: CalendarEvent;
  mode?: "create" | "edit";
  defaultType?: EditableEventType;
  defaultDay?: number;
  templates: TrainingTemplate[];
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onSaveTemplate: (template: Omit<TrainingTemplate, "id" | "builtIn">) => void;
};

function createBlock(): TrainingPlanBlock {
  return {
    id: `block-${Date.now().toString(36)}`,
    title: "새 훈련 블록",
    duration: 15,
    intensity: "Medium",
    group: "전체",
    setup: "구역 크기·인원·장비를 입력하세요.",
    point: "핵심 코칭 포인트를 입력하세요.",
  };
}

function buildDraft(initialEvent?: CalendarEvent, defaultType: EditableEventType = "training", defaultDay = 28): CalendarEvent {
  if (initialEvent) {
    return {
      ...initialEvent,
      planBlocks: initialEvent.planBlocks?.map((block) => ({ ...block })),
      playerData: initialEvent.playerData?.map((player) => ({ ...player })),
    };
  }
  const type = defaultType;
  return {
    id: "new",
    type,
    day: defaultDay,
    date: `2026-07-${String(defaultDay).padStart(2, "0")}`,
    time: type === "training" ? "17:00" : "15:00",
    duration: type === "training" ? 100 : 110,
    title: type === "training" ? "훈련" : "새 경기",
    intensity: type === "training" ? "Medium" : undefined,
    location: "보조구장",
    objective: type === "training" ? "이번 세션에서 달성할 목적을 입력하세요." : undefined,
    coachingPoints: type === "training" ? "선수에게 반복해서 전달할 핵심 포인트를 입력하세요." : undefined,
    memo: "",
    opponent: type === "match" ? "상대 팀" : undefined,
    competition: type === "match" ? "대회·리그" : undefined,
    planBlocks: type === "training" ? defaultTrainingPlan.map((block) => ({ ...block })) : undefined,
    playerData: type === "training" ? defaultTrainingPlayerData.map((player) => ({ ...player })) : undefined,
  };
}

export function ScheduleEventEditor({
  initialEvent,
  mode = initialEvent ? "edit" : "create",
  defaultType = "training",
  defaultDay = 28,
  templates,
  onClose,
  onSave,
  onSaveTemplate,
}: ScheduleEventEditorProps) {
  const [draft, setDraft] = useState(() => buildDraft(initialEvent, defaultType, defaultDay));
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id ?? "");
  const [templateName, setTemplateName] = useState("");
  const [templateSaved, setTemplateSaved] = useState(false);
  const training = draft.type === "training";
  const blockDuration = useMemo(
    () => draft.planBlocks?.reduce((sum, block) => sum + block.duration, 0) ?? 0,
    [draft.planBlocks],
  );

  function updateField<K extends keyof CalendarEvent>(key: K, value: CalendarEvent[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function changeType(type: EditableEventType) {
    setDraft((current) => {
      if (type === "training") {
        return {
          ...current,
          type,
          title: "훈련",
          duration: current.duration ?? 100,
          date: current.date ?? `2026-07-${String(current.day).padStart(2, "0")}`,
          intensity: current.intensity ?? "Medium",
          objective: current.objective ?? "이번 세션에서 달성할 목적을 입력하세요.",
          coachingPoints: current.coachingPoints ?? "핵심 코칭 포인트를 입력하세요.",
          planBlocks: current.planBlocks?.length ? current.planBlocks : defaultTrainingPlan.map((block) => ({ ...block })),
          playerData: current.playerData?.length ? current.playerData : defaultTrainingPlayerData.map((player) => ({ ...player })),
        };
      }
      return {
        ...current,
        type,
        title: current.title === "훈련" ? "새 경기" : current.title,
        opponent: current.opponent ?? "상대 팀",
        competition: current.competition ?? "대회·리그",
      };
    });
  }

  function updateBlock(id: string, updates: Partial<TrainingPlanBlock>) {
    setDraft((current) => ({
      ...current,
      planBlocks: current.planBlocks?.map((block) => block.id === id ? { ...block, ...updates } : block),
    }));
  }

  function removeBlock(id: string) {
    setDraft((current) => ({
      ...current,
      planBlocks: current.planBlocks?.filter((block) => block.id !== id),
    }));
  }

  function applyTemplate() {
    const template = templates.find((item) => item.id === selectedTemplateId);
    if (!template) return;
    setDraft((current) => ({
      ...current,
      type: "training",
      duration: template.duration,
      intensity: template.intensity,
      location: template.location,
      objective: template.objective,
      coachingPoints: template.coachingPoints,
      memo: template.memo,
      planBlocks: template.planBlocks.map((block) => ({ ...block, id: `${block.id}-${Date.now().toString(36)}` })),
      playerData: current.playerData?.length ? current.playerData : defaultTrainingPlayerData.map((player) => ({ ...player })),
    }));
  }

  function saveTemplate() {
    if (!training) return;
    onSaveTemplate({
      name: templateName.trim() || `7월 ${draft.day}일 훈련 템플릿`,
      duration: blockDuration || draft.duration || 0,
      intensity: draft.intensity ?? "Medium",
      location: draft.location ?? "",
      objective: draft.objective ?? "",
      coachingPoints: draft.coachingPoints ?? "",
      memo: draft.memo ?? "",
      planBlocks: draft.planBlocks?.map((block) => ({ ...block })) ?? [],
    });
    setTemplateSaved(true);
    setTemplateName("");
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave({
      ...draft,
      title: training ? "훈련" : draft.title,
      duration: training && blockDuration ? blockDuration : draft.duration,
      detail: training ? draft.objective : draft.competition,
    });
  }

  return (
    <div className="schedule-modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.currentTarget === event.target) onClose();
    }}>
      <section className="schedule-editor-modal" role="dialog" aria-modal="true" aria-labelledby="schedule-editor-title">
        <header className="schedule-editor-header">
          <div>
            <span>{mode === "edit" ? "일정 수정" : "새 일정 만들기"}</span>
            <h2 id="schedule-editor-title">{training ? "훈련 계획" : "경기 일정"}</h2>
            <p>{training ? "훈련 내용과 선수 피드백 준비까지 한 번에 구성합니다." : "경기 운영에 필요한 상대·시간·장소·메모를 관리합니다."}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="일정 편집 닫기"><Icon name="close" /></button>
        </header>

        <form onSubmit={submit}>
          <div className="schedule-type-switch" aria-label="일정 유형">
            <button type="button" className={training ? "active" : ""} onClick={() => changeType("training")}><Icon name="calendar" size={16} />훈련</button>
            <button type="button" className={!training ? "active" : ""} onClick={() => changeType("match")}><Icon name="match" size={16} />경기</button>
          </div>

          {training && <section className="editor-template-strip">
            <div><strong>훈련 템플릿으로 빠르게 시작</strong><span>저장된 구성과 코칭 포인트를 불러옵니다.</span></div>
            <select value={selectedTemplateId} onChange={(event) => setSelectedTemplateId(event.target.value)}>
              {templates.map((template) => <option value={template.id} key={template.id}>{template.name}</option>)}
            </select>
            <button type="button" onClick={applyTemplate}>불러오기</button>
          </section>}

          <div className="schedule-editor-scroll">
            <section className="editor-form-section">
              <header><span>01</span><div><h3>기본 정보</h3><p>캘린더와 선수 화면에 표시되는 정보입니다.</p></div></header>
              <div className="editor-field-grid">
                {!training && <label className="span-2"><span>경기명</span><input required value={draft.title} onChange={(event) => updateField("title", event.target.value)} /></label>}
                <label><span>{training ? "훈련 날짜" : "경기 날짜"}</span><input required type="date" value={draft.date ?? `2026-07-${String(draft.day).padStart(2, "0")}`} onChange={(event) => {
                  const nextDate = event.target.value;
                  updateField("date", nextDate);
                  updateField("day", Number(nextDate.slice(-2)));
                }} /></label>
                <label><span>시작 시간</span><input required type="time" value={draft.time ?? ""} onChange={(event) => updateField("time", event.target.value)} /></label>
                {training && <label><span>훈련 강도</span><select value={draft.intensity ?? "Medium"} onChange={(event) => updateField("intensity", event.target.value as TrainingIntensity)}><option value="Low">낮음 · Low</option><option value="Medium">보통 · Medium</option><option value="High">높음 · High</option></select></label>}
                {training && <label><span>총 훈련 시간</span><input readOnly value={`${blockDuration || draft.duration || 0}분`} /></label>}
                <label><span>장소</span><input required value={draft.location ?? ""} onChange={(event) => updateField("location", event.target.value)} /></label>
                {!training && <>
                  <label><span>상대 팀</span><input required value={draft.opponent ?? ""} onChange={(event) => updateField("opponent", event.target.value)} /></label>
                  <label className="span-2"><span>대회·라운드</span><input value={draft.competition ?? ""} onChange={(event) => updateField("competition", event.target.value)} /></label>
                  <label><span>예상 소요 시간</span><input min={1} type="number" value={draft.duration ?? 110} onChange={(event) => updateField("duration", Number(event.target.value))} /></label>
                </>}
              </div>
            </section>

            {training && <section className="editor-form-section">
              <header><span>02</span><div><h3>훈련 방향</h3><p>현장에서 반복할 목적과 코칭 언어를 정합니다.</p></div></header>
              <div className="editor-field-grid">
                <label className="span-2"><span>훈련 목적</span><textarea value={draft.objective ?? ""} onChange={(event) => updateField("objective", event.target.value)} /></label>
                <label className="span-2"><span>핵심 포인트</span><textarea value={draft.coachingPoints ?? ""} onChange={(event) => updateField("coachingPoints", event.target.value)} /></label>
              </div>
            </section>}

            {training && <section className="editor-form-section">
              <header><span>03</span><div><h3>훈련 내용</h3><p>블록별 시간과 실행 포인트를 구성합니다.</p></div><BadgeDuration value={blockDuration} /></header>
              <div className="training-block-editor">
                {draft.planBlocks?.map((block, index) => <article key={block.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <label className="block-title"><small>세션 내용</small><input value={block.title} onChange={(event) => updateBlock(block.id, { title: event.target.value })} /></label>
                  <label className="block-duration"><small>시간</small><input min={5} step={5} type="number" value={block.duration} onChange={(event) => updateBlock(block.id, { duration: Number(event.target.value) })} /></label>
                  <label className="block-intensity"><small>강도</small><select value={block.intensity ?? "Medium"} onChange={(event) => updateBlock(block.id, { intensity: event.target.value as TrainingIntensity })}><option>Low</option><option>Medium</option><option>High</option></select></label>
                  <label className="block-group"><small>참여 대상</small><input value={block.group ?? "전체"} onChange={(event) => updateBlock(block.id, { group: event.target.value })} /></label>
                  <label className="block-setup"><small>운영 형태·구역·장비</small><input value={block.setup ?? ""} onChange={(event) => updateBlock(block.id, { setup: event.target.value })} /></label>
                  <label className="block-point"><small>코칭 포인트</small><input value={block.point} onChange={(event) => updateBlock(block.id, { point: event.target.value })} /></label>
                  <button type="button" onClick={() => removeBlock(block.id)} aria-label={`${block.title} 삭제`}><Icon name="close" size={15} /></button>
                </article>)}
                <button type="button" className="add-training-block" onClick={() => setDraft((current) => ({ ...current, planBlocks: [...(current.planBlocks ?? []), createBlock()] }))}><Icon name="plus" size={15} />훈련 블록 추가</button>
              </div>
            </section>}

            <section className="editor-form-section">
              <header><span>{training ? "04" : "02"}</span><div><h3>운영 메모</h3><p>지도자에게만 보이는 준비사항과 예외를 기록합니다.</p></div></header>
              <label className="editor-wide-label"><span>메모</span><textarea value={draft.memo ?? ""} onChange={(event) => updateField("memo", event.target.value)} /></label>
            </section>

            {training && <section className="save-template-panel">
              <div><Icon name="download" size={18} /><span><strong>이 구성을 템플릿으로 저장</strong><small>다음 훈련에서 내용과 포인트를 그대로 재사용합니다.</small></span></div>
              <input value={templateName} onChange={(event) => {
                setTemplateName(event.target.value);
                setTemplateSaved(false);
              }} placeholder="템플릿 이름" />
              <button type="button" onClick={saveTemplate}>{templateSaved ? "저장됨" : "템플릿 저장"}</button>
            </section>}
          </div>

          <footer className="schedule-editor-footer">
            <span>{training ? `훈련 ${draft.planBlocks?.length ?? 0}개 블록 · 선수 ${draft.playerData?.length ?? 0}명` : `${draft.opponent ?? "상대 미정"} · ${draft.competition ?? "대회 미정"}`}</span>
            <div><button type="button" onClick={onClose}>취소</button><button type="submit"><Icon name="check" size={16} />{mode === "edit" ? "변경사항 저장" : "일정 생성"}</button></div>
          </footer>
        </form>
      </section>
    </div>
  );
}

function BadgeDuration({ value }: { value: number }) {
  return <strong className="editor-duration-badge">총 {value}분</strong>;
}
