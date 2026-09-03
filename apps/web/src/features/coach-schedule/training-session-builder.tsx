"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties, type DragEvent as ReactDragEvent, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import {
  type CalendarEvent,
  type TrainingBoardItem,
  type TrainingBoardItemType,
  type TrainingBoardLine,
  type TrainingBoardLineType,
  type TrainingBoardState,
  type TrainingIntensity,
  type TrainingPitchPreset,
  type TrainingPlanBlock,
} from "@/features/coach-schedule/data/schedule-preview-data";
import { useScheduleStore } from "@/features/coach-schedule/model/schedule-store";
import { Icon } from "@/shared/ui/icon";

type BoardTool = "select" | TrainingBoardItemType | TrainingBoardLineType;
type BoardToolItem = { id: BoardTool; label: string; short: string };
type BoardAssetType = Exclude<TrainingBoardItemType, "text">;
type PlayerTokenType = Extract<TrainingBoardItemType, "player-a" | "player-b" | "goalkeeper">;

const boardAssetPaths: Record<BoardAssetType, string> = {
  "player-a": "/tactics-board/player-a.png",
  "player-b": "/tactics-board/player-b.png",
  goalkeeper: "/tactics-board/goalkeeper.png",
  ball: "/tactics-board/ball.png",
  cone: "/tactics-board/cone.png",
  vest: "/tactics-board/vest.png",
  goal: "/tactics-board/goal.png",
  pole: "/tactics-board/pole.png",
  hurdle: "/tactics-board/hurdle.png",
  mannequin: "/tactics-board/mannequin.png",
  zone: "/tactics-board/zone.png",
};

const placementTools: BoardToolItem[] = [
  { id: "select", label: "선택·이동", short: "선택" },
  { id: "player-a", label: "A팀 선수", short: "A" },
  { id: "player-b", label: "B팀 선수", short: "B" },
  { id: "goalkeeper", label: "골키퍼", short: "GK" },
  { id: "ball", label: "볼", short: "●" },
  { id: "cone", label: "콘", short: "▲" },
  { id: "vest", label: "조끼", short: "조끼" },
  { id: "goal", label: "골대", short: "골대" },
  { id: "pole", label: "폴", short: "│" },
  { id: "hurdle", label: "허들", short: "П" },
  { id: "mannequin", label: "마네킹", short: "사람" },
  { id: "text", label: "텍스트", short: "T" },
];

const lineTools: BoardToolItem[] = [
  { id: "pass", label: "패스", short: "→" },
  { id: "dribble", label: "드리블", short: "⋯" },
  { id: "shot", label: "슈팅", short: "➜" },
  { id: "run", label: "움직임", short: "⇢" },
  { id: "press", label: "압박", short: "↠" },
];

const drawTool: BoardToolItem = { id: "draw", label: "그리기", short: "✎" };
const normalLineTools = [...lineTools, drawTool];
const boardTools = [...placementTools, ...normalLineTools];

const pitchPresets: Array<{ id: TrainingPitchPreset; label: string; description: string; width: number; height: number }> = [
  { id: "full", label: "풀코트", description: "전체 전술", width: 105, height: 68 },
  { id: "half", label: "하프코트", description: "공격·수비 조직", width: 68, height: 52.5 },
  { id: "third", label: "1/3코트", description: "파이널 서드", width: 68, height: 35 },
  { id: "blank", label: "빈 공간", description: "라인 없는 잔디", width: 105, height: 68 },
];

const lineColors: Record<TrainingBoardLineType, string> = {
  pass: "#ffffff",
  dribble: "#74d8ff",
  shot: "#ff6b6b",
  run: "#ffd166",
  press: "#ff9f43",
  draw: "#ffffff",
};

const drawingColors = ["#ffffff", "#ffd166", "#ff6b6b", "#3182f6"];
const defaultDrawingColor = drawingColors[0];
const defaultDrawingWidth = 2.4;

const boardItemLabels: Record<TrainingBoardItemType, string> = {
  "player-a": "A팀 선수",
  "player-b": "B팀 선수",
  goalkeeper: "골키퍼",
  ball: "볼",
  cone: "콘",
  vest: "조끼",
  goal: "골대",
  pole: "폴",
  hurdle: "허들",
  mannequin: "마네킹",
  zone: "구역",
  text: "텍스트",
};

const lineLabels: Record<TrainingBoardLineType, string> = {
  pass: "패스",
  dribble: "드리블",
  shot: "슈팅",
  run: "움직임",
  press: "압박",
  draw: "자유 그림",
};

const builderAutosaveKey = "base11:training-builder-autosave:v2";

const intensityLabels: Record<TrainingIntensity, string> = {
  Low: "낮음",
  Medium: "보통",
  High: "높음",
};

function createId(prefix: string) {
  const suffix = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().slice(0, 8)
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  return `${prefix}-${suffix}`;
}

function normalizePitchPreset(preset: unknown): TrainingPitchPreset {
  if (preset === "half" || preset === "third" || preset === "blank") return preset;
  return "full";
}

function normalizeLineSequence(lines: TrainingBoardLine[]): TrainingBoardLine[] {
  const clonedLines = lines.map((line) => ({ ...line, points: line.points?.map((point) => ({ ...point })) }));
  const prepared = clonedLines.filter((line) => line.animated === true && line.type !== "draw").map((line) => ({
    ...line,
    animated: true,
    duration: line.duration ?? 2,
    startDelay: 0,
    sequenceStep: Math.max(1, Math.round(line.sequenceStep ?? 1)),
  }));
  const orderedSteps = [...new Set(prepared.map((line) => line.sequenceStep as number))].sort((a, b) => a - b);
  const normalizedSteps = new Map(orderedSteps.map((step, index) => [step, index + 1]));
  const normalizedAnimatedLines = new Map(prepared.map((line) => [line.id, {
    ...line,
    sequenceStep: normalizedSteps.get(line.sequenceStep as number) ?? 1,
  }]));
  return clonedLines.map((line) => {
    const animatedLine = normalizedAnimatedLines.get(line.id);
    if (animatedLine) return animatedLine;
    const { duration: _duration, startDelay: _startDelay, pauseAfter: _pauseAfter, sequenceStep: _sequenceStep, sourceItemId: _sourceItemId, ...staticLine } = line;
    return { ...staticLine, animated: false };
  });
}

function createSequenceGroups(lines: TrainingBoardLine[]) {
  const groups = new Map<number, TrainingBoardLine[]>();
  lines.filter((line) => line.animated === true).forEach((line) => {
    const step = Math.max(1, Math.round(line.sequenceStep ?? 1));
    groups.set(step, [...(groups.get(step) ?? []), line]);
  });
  return [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([step, stepLines]) => ({
      step,
      lines: stepLines,
      duration: Math.max(.8, ...stepLines.map((line) => line.duration ?? 2)),
      pauseAfter: Math.max(.32, ...stepLines.map((line) => line.pauseAfter ?? .32)),
    }));
}

function quadraticLinePoint(line: TrainingBoardLine, progress: number) {
  const control = lineControlPoint(line);
  const inverse = 1 - progress;
  return {
    x: inverse * inverse * line.x1 + 2 * inverse * progress * control.x + progress * progress * line.x2,
    y: inverse * inverse * line.y1 + 2 * inverse * progress * control.y + progress * progress * line.y2,
  };
}

function createPlaybackPlan(lines: TrainingBoardLine[], playbackStep: number | null) {
  const groups = createSequenceGroups(lines);
  const playbackGroups = playbackStep === null ? groups : groups.filter((group) => group.step === playbackStep);
  const timing = new Map<string, { start: number; duration: number }>();
  let cursor = 0;
  playbackGroups.forEach((group) => {
    group.lines.forEach((line) => {
      timing.set(line.id, { start: cursor, duration: line.duration ?? 2 });
    });
    cursor += group.duration + group.pauseAfter;
  });
  const cycleDuration = Math.max(1.2, cursor + .55);
  const linesBySource = new Map<string, TrainingBoardLine[]>();
  lines.forEach((line) => {
    if (!line.sourceItemId || !timing.has(line.id)) return;
    linesBySource.set(line.sourceItemId, [...(linesBySource.get(line.sourceItemId) ?? []), line]);
  });
  const keyframesBySource = new Map<string, Keyframe[]>();
  linesBySource.forEach((sourceLines, sourceId) => {
    const ordered = [...sourceLines].sort((a, b) => (timing.get(a.id)?.start ?? 0) - (timing.get(b.id)?.start ?? 0));
    const firstLine = ordered[0];
    const frames: Keyframe[] = [{ left: `${firstLine.x1}%`, top: `${firstLine.y1}%`, offset: 0 }];
    let currentPoint = { x: firstLine.x1, y: firstLine.y1 };
    let currentTime = 0;
    ordered.forEach((line) => {
      const lineTiming = timing.get(line.id);
      if (!lineTiming) return;
      if (lineTiming.start > currentTime) {
        frames.push({ left: `${currentPoint.x}%`, top: `${currentPoint.y}%`, offset: lineTiming.start / cycleDuration });
      }
      const samples = 16;
      for (let index = 0; index <= samples; index += 1) {
        const progress = index / samples;
        const point = quadraticLinePoint(line, progress);
        const offset = (lineTiming.start + lineTiming.duration * progress) / cycleDuration;
        const previous = frames.at(-1);
        if (previous?.offset === offset) {
          frames[frames.length - 1] = { left: `${point.x}%`, top: `${point.y}%`, offset };
        } else {
          frames.push({ left: `${point.x}%`, top: `${point.y}%`, offset });
        }
      }
      currentPoint = { x: line.x2, y: line.y2 };
      currentTime = lineTiming.start + lineTiming.duration;
    });
    frames.push({ left: `${currentPoint.x}%`, top: `${currentPoint.y}%`, offset: 1 });
    keyframesBySource.set(sourceId, frames);
  });
  return { timing, cycleDuration, keyframesBySource };
}

function isAnimationMovableItem(item: TrainingBoardItem) {
  return item.type === "player-a" || item.type === "player-b" || item.type === "goalkeeper" || item.type === "ball";
}

function createSequenceWarnings(board: TrainingBoardState) {
  const warnings: string[] = [];
  const itemIds = new Set(board.items.map((item) => item.id));
  const animationLines = board.lines.filter((line) => line.animated === true);
  const missingSources = animationLines.filter((line) => !line.sourceItemId || !itemIds.has(line.sourceItemId)).length;
  if (missingSources) warnings.push(`연결 대상 없는 움직임 ${missingSources}개`);

  const sourceSteps = new Set<string>();
  let duplicateSources = 0;
  animationLines.forEach((line) => {
    if (!line.sourceItemId) return;
    const key = `${line.sequenceStep ?? 1}:${line.sourceItemId}`;
    if (sourceSteps.has(key)) duplicateSources += 1;
    sourceSteps.add(key);
  });
  if (duplicateSources) warnings.push(`같은 단계의 중복 움직임 ${duplicateSources}개`);

  let disconnected = 0;
  const linesBySource = new Map<string, TrainingBoardLine[]>();
  animationLines.forEach((line) => {
    if (!line.sourceItemId) return;
    linesBySource.set(line.sourceItemId, [...(linesBySource.get(line.sourceItemId) ?? []), line]);
  });
  linesBySource.forEach((lines) => {
    const ordered = [...lines].sort((a, b) => (a.sequenceStep ?? 1) - (b.sequenceStep ?? 1));
    ordered.slice(1).forEach((line, index) => {
      const previous = ordered[index];
      if (Math.hypot(previous.x2 - line.x1, previous.y2 - line.y1) > 2) disconnected += 1;
    });
  });
  if (disconnected) warnings.push(`이어지지 않는 경로 ${disconnected}개`);
  return warnings;
}

function connectLineSequence(lines: TrainingBoardLine[]) {
  const connected = lines.map((line) => ({ ...line, points: line.points?.map((point) => ({ ...point })) }));
  const linesBySource = new Map<string, TrainingBoardLine[]>();
  connected.forEach((line) => {
    if (line.animated !== true || !line.sourceItemId) return;
    linesBySource.set(line.sourceItemId, [...(linesBySource.get(line.sourceItemId) ?? []), line]);
  });
  linesBySource.forEach((sourceLines) => {
    const ordered = [...sourceLines].sort((a, b) => (a.sequenceStep ?? 1) - (b.sequenceStep ?? 1));
    ordered.slice(1).forEach((line, index) => {
      const previous = ordered[index];
      const dx = previous.x2 - line.x1;
      const dy = previous.y2 - line.y1;
      const controlX = line.cx ?? (line.x1 + line.x2) / 2;
      const controlY = line.cy ?? (line.y1 + line.y2) / 2;
      line.x1 = previous.x2;
      line.y1 = previous.y2;
      line.cx = Math.max(3, Math.min(97, controlX + dx / 2));
      line.cy = Math.max(4, Math.min(96, controlY + dy / 2));
    });
  });
  return connected;
}

function cloneBoard(board: TrainingBoardState | undefined): TrainingBoardState {
  return board ? {
    pitchPreset: normalizePitchPreset(board.pitchPreset),
    items: board.items.filter((item) => item.type !== "zone").map((item) => ({ ...item, rotation: item.rotation ?? 0, scale: item.scale ?? 1 })),
    lines: normalizeLineSequence(board.lines),
  } : { pitchPreset: "full", items: [], lines: [] };
}

function cloneBlock(block: TrainingPlanBlock): TrainingPlanBlock {
  return {
    ...block,
    keyPoints: block.keyPoints ? [...block.keyPoints] : undefined,
    board: cloneBoard(block.board),
  };
}

function normalizeBuilderBlock(block: TrainingPlanBlock, _index: number): TrainingPlanBlock {
  const points = block.keyPoints?.length ? block.keyPoints : [block.point];
  return {
    ...cloneBlock(block),
    method: block.method ?? "공을 소유한 팀은 반대편 구역까지 연결합니다. 수비 팀은 공을 빼앗으면 즉시 역할을 바꿉니다.",
    keyPoints: [...points, "", ""].slice(0, 3),
    successCriteria: block.successCriteria ?? "약속한 원칙이 3회 연속 나오면 다음 단계로 진행합니다.",
    rules: block.rules ?? "터치 수와 재시작 위치는 선수 수준에 맞게 조정합니다.",
    objective: block.objective ?? block.point,
    playerCount: block.playerCount ?? (block.group === "전체" ? "전체 26명" : block.group ?? "전체"),
    area: block.area ?? block.setup?.split("·")[0]?.trim() ?? "40×30m",
    equipment: block.equipment ?? block.setup?.split("·").slice(1).join("·").trim() ?? "볼 · 콘 · 조끼",
    board: cloneBoard(block.board),
  };
}

function blankSession(): CalendarEvent {
  const drill = normalizeBuilderBlock({
    id: createId("draft-drill"),
    title: "새 훈련",
    duration: 20,
    intensity: "Medium",
    point: "",
    objective: "",
    method: "",
    rules: "",
    keyPoints: ["", "", ""],
    playerCount: "",
    area: "",
    equipment: "",
    setup: "",
    board: { pitchPreset: "full", items: [], lines: [] },
  }, 0);
  return {
    id: "new",
    day: 1,
    title: drill.title,
    type: "training",
    duration: drill.duration,
    intensity: drill.intensity,
    objective: drill.objective,
    planBlocks: [drill],
  };
}

function blankSetPieceSession(): CalendarEvent {
  const drill = normalizeBuilderBlock({
    id: createId("draft-set-piece"),
    title: "새 세트피스 전술",
    duration: 5,
    intensity: "Medium",
    point: "",
    objective: "",
    method: "",
    rules: "",
    keyPoints: ["", "", ""],
    playerCount: "",
    area: "",
    equipment: "",
    setup: "",
    board: { pitchPreset: "full", items: [], lines: [] },
  }, 0);
  return {
    id: "new-set-piece",
    day: 1,
    title: drill.title,
    type: "training",
    duration: drill.duration,
    intensity: drill.intensity,
    objective: drill.objective,
    planBlocks: [drill],
  };
}

function isBoardAssetTool(tool: BoardTool): tool is BoardAssetType {
  return tool in boardAssetPaths;
}

function isPlacementTool(tool: BoardTool): tool is TrainingBoardItemType {
  return tool !== "select" && placementTools.some((item) => item.id === tool);
}

function isBoardAssetItem(item: TrainingBoardItem): item is TrainingBoardItem & { type: BoardAssetType } {
  return item.type !== "text";
}

function isPlayerTokenType(type: TrainingBoardItemType): type is PlayerTokenType {
  return type === "player-a" || type === "player-b" || type === "goalkeeper";
}

function boardItemDisplayLabel(item: TrainingBoardItem) {
  const details = [item.label, item.name?.trim()].filter(Boolean);
  return `${boardItemLabels[item.type]}${details.length ? ` ${details.join(" · ")}` : ""}`;
}

function BoardAssetView({ type, label }: { type: BoardAssetType; label?: string }) {
  const markerLabel = type === "goalkeeper" ? label || "GK" : label;
  const isPlayerToken = isPlayerTokenType(type);
  return <span className={`builder-generated-asset asset-${type}`} aria-hidden="true">
    {isPlayerToken ? <span className="builder-flat-player-token" /> : <img src={boardAssetPaths[type]} alt="" draggable={false} />}
    {markerLabel && isPlayerToken
      ? <b>{markerLabel}</b>
      : null}
  </span>;
}

function BoardToolPreview({ item }: { item: BoardToolItem }) {
  if (item.id === "text") return <i className="builder-text-tool-icon">T</i>;
  if (!isBoardAssetTool(item.id)) return <i>{item.short}</i>;
  const markerLabel = item.id === "player-a" ? "A" : item.id === "player-b" ? "B" : undefined;
  return <BoardAssetView type={item.id} label={markerLabel} />;
}

function BoardItemView({ item }: { item: TrainingBoardItem }) {
  if (item.type === "text") return <span className="builder-board-text">{item.label || "텍스트"}</span>;
  return <BoardAssetView type={item.type} label={item.label} />;
}

function lineControlPoint(line: TrainingBoardLine) {
  return {
    x: line.cx ?? (line.x1 + line.x2) / 2,
    y: line.cy ?? (line.y1 + line.y2) / 2,
  };
}

function linePath(line: TrainingBoardLine) {
  if (line.type === "draw" && line.points?.length) {
    return line.points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  }
  const control = lineControlPoint(line);
  return `M ${line.x1} ${line.y1} Q ${control.x} ${control.y} ${line.x2} ${line.y2}`;
}

function lineCurveDirection(line: TrainingBoardLine): -1 | 0 | 1 {
  const midpoint = { x: (line.x1 + line.x2) / 2, y: (line.y1 + line.y2) / 2 };
  const control = lineControlPoint(line);
  const cross = (line.x2 - line.x1) * (control.y - midpoint.y) - (line.y2 - line.y1) * (control.x - midpoint.x);
  if (Math.abs(cross) < 1) return 0;
  return cross > 0 ? 1 : -1;
}

function PitchMarkings({ preset }: { preset: TrainingPitchPreset }) {
  if (preset === "blank") return null;
  if (preset === "full") return <svg className="builder-pitch-svg" viewBox="0 0 105 68" preserveAspectRatio="none" aria-hidden="true">
    <g>
      <rect x="1" y="1" width="103" height="66" />
      <line x1="52.5" y1="1" x2="52.5" y2="67" />
      <circle cx="52.5" cy="34" r="9.15" />
      <circle className="pitch-spot" cx="52.5" cy="34" r="0.35" />
      <rect x="1" y="13.84" width="16.5" height="40.32" />
      <rect x="1" y="24.84" width="5.5" height="18.32" />
      <circle className="pitch-spot" cx="12" cy="34" r="0.35" />
      <path d="M17.5 26.69 A9.15 9.15 0 0 1 17.5 41.31" />
      <rect x="87.5" y="13.84" width="16.5" height="40.32" />
      <rect x="98.5" y="24.84" width="5.5" height="18.32" />
      <circle className="pitch-spot" cx="93" cy="34" r="0.35" />
      <path d="M87.5 41.31 A9.15 9.15 0 0 1 87.5 26.69" />
      <path d="M1 2 A1 1 0 0 0 2 1 M103 1 A1 1 0 0 0 104 2 M104 66 A1 1 0 0 0 103 67 M2 67 A1 1 0 0 0 1 66" />
    </g>
  </svg>;
  if (preset === "half" || preset === "third") {
    const height = preset === "half" ? 52.5 : 35;
    return <svg className="builder-pitch-svg" viewBox={`0 0 68 ${height}`} preserveAspectRatio="none" aria-hidden="true">
      <g>
        <rect x="1" y="1" width="66" height={height - 2} />
        <rect x="13.84" y="1" width="40.32" height="16.5" />
        <rect x="24.84" y="1" width="18.32" height="5.5" />
        <circle className="pitch-spot" cx="34" cy="12" r="0.35" />
        <path d="M26.69 17.5 A9.15 9.15 0 0 0 41.31 17.5" />
        <path d="M1 2 A1 1 0 0 0 2 1 M66 1 A1 1 0 0 0 67 2" />
        {preset === "half" ? <line x1="1" y1="51.5" x2="67" y2="51.5" /> : null}
      </g>
    </svg>;
  }
  return null;
}

export function TrainingSessionBuilder() {
  const router = useRouter();
  const routeSearchParams = useSearchParams();
  const routeContext = routeSearchParams.toString();
  const { drills, hydrated, createDrill, updateDrill } = useScheduleStore();
  const [draft, setDraft] = useState<CalendarEvent>(blankSession);
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState(draft.planBlocks?.[0]?.id ?? "");
  const [tool, setTool] = useState<BoardTool>("select");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [lineStart, setLineStart] = useState<{ x: number; y: number } | null>(null);
  const [hoverPoint, setHoverPoint] = useState<{ x: number; y: number } | null>(null);
  const [draggedTool, setDraggedTool] = useState<TrainingBoardItemType | null>(null);
  const [isBoardDragOver, setIsBoardDragOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sequenceOpen, setSequenceOpen] = useState(false);
  const [sequenceTargetStep, setSequenceTargetStep] = useState(1);
  const [sequenceNotice, setSequenceNotice] = useState("");
  const [draggedSequenceStep, setDraggedSequenceStep] = useState<number | null>(null);
  const [draggedSequenceLineId, setDraggedSequenceLineId] = useState<string | null>(null);
  const [sequenceDropStep, setSequenceDropStep] = useState<number | "new" | null>(null);
  const [animationDragPreview, setAnimationDragPreview] = useState<{ id: string; x: number; y: number } | null>(null);
  const [playbackStep, setPlaybackStep] = useState<number | null>(null);
  const [playbackNonce, setPlaybackNonce] = useState(0);
  const [history, setHistory] = useState<Record<string, TrainingBoardState[]>>({});
  const [boardFocus, setBoardFocus] = useState(true);
  const [builderMode, setBuilderMode] = useState<"training" | "set-piece">("training");
  const [trainingInfoTab, setTrainingInfoTab] = useState<"basic" | "operation" | "setup">("basic");
  const [setPieceType, setSetPieceType] = useState<"corner" | "free-kick" | "throw-in" | "kickoff">("corner");
  const [setPiecePhase, setSetPiecePhase] = useState<"attack" | "defense">("attack");
  const [draftAutosaved, setDraftAutosaved] = useState(true);
  const [autosaveError, setAutosaveError] = useState(false);
  const initializedContext = useRef<string | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const boardItemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number; originX: number; originY: number; x: number; y: number; animation: boolean; moved: boolean } | null>(null);
  const suppressItemClickRef = useRef<string | null>(null);
  const lineHandleDragRef = useRef<{ lineId: string; handle: "start" | "control" | "end" } | null>(null);
  const drawingRef = useRef<{
    id: string;
    baseBoard: TrainingBoardState;
    points: Array<{ x: number; y: number }>;
    color: string;
    strokeWidth: number;
  } | null>(null);

  useEffect(() => {
    if (!hydrated || initializedContext.current === routeContext) return;
    const params = new URLSearchParams(routeContext);
    const drillId = params.get("drill");
    const saveAsCopy = params.get("copy") === "1";
    const requestedMode = params.get("mode") === "set-piece" ? "set-piece" : "training";
    const drill = drills.find((item) => item.id === drillId);
    const autosaveContext = `${requestedMode}:${drillId ?? "new"}:${saveAsCopy ? "copy" : "edit"}`;
    setSourceId(null);
    setTool("select");
    setSelectedItemId(null);
    setSelectedLineId(null);
    setLineStart(null);
    setHoverPoint(null);
    setIsPlaying(false);
    setSequenceOpen(false);
    setSequenceTargetStep(1);
    setSequenceNotice("");
    setPlaybackStep(null);
    setAnimationDragPreview(null);
    setHistory({});
    setBoardFocus(true);
    setTrainingInfoTab("basic");
    try {
      const recovered = JSON.parse(window.localStorage.getItem(builderAutosaveKey) ?? "null") as {
        context?: string;
        draft?: CalendarEvent;
        sourceId?: string | null;
        selectedBlockId?: string;
        builderMode?: "training" | "set-piece";
        setPieceType?: typeof setPieceType;
        setPiecePhase?: typeof setPiecePhase;
      } | null;
      if (recovered?.context === autosaveContext && recovered.draft?.planBlocks?.length) {
        setDraft(recovered.draft);
        setSourceId(recovered.sourceId ?? null);
        setSelectedBlockId(recovered.selectedBlockId ?? recovered.draft.planBlocks[0].id);
        setBuilderMode(recovered.builderMode ?? requestedMode);
        setSetPieceType(recovered.setPieceType ?? "corner");
        setSetPiecePhase(recovered.setPiecePhase ?? "attack");
        initializedContext.current = routeContext;
        return;
      }
    } catch {
      try {
        window.localStorage.removeItem(builderAutosaveKey);
      } catch {
        // Private browsing or browser policy can block local storage entirely.
      }
    }
    if (drill) {
      const block = normalizeBuilderBlock({
        ...cloneBlock(drill),
        id: createId("draft-drill"),
        title: saveAsCopy ? `${drill.title} 복사본` : drill.title,
        sourceDrillId: undefined,
      }, 0);
      setDraft({
        ...blankSession(),
        title: block.title,
        duration: block.duration,
        intensity: block.intensity,
        objective: block.objective,
        planBlocks: [block],
      });
      setSourceId(saveAsCopy ? null : drill.id);
      setSelectedBlockId(block.id);
      setBuilderMode(drill.category === "set-piece" ? "set-piece" : "training");
      setSetPieceType(drill.setPieceType ?? "corner");
      setSetPiecePhase(drill.setPiecePhase ?? "attack");
    } else if (requestedMode === "set-piece") {
      const next = blankSetPieceSession();
      setDraft(next);
      setSelectedBlockId(next.planBlocks?.[0]?.id ?? "");
      setBuilderMode("set-piece");
      setSetPieceType("corner");
      setSetPiecePhase("attack");
    } else {
      const next = blankSession();
      setDraft(next);
      setSelectedBlockId(next.planBlocks?.[0]?.id ?? "");
      setBuilderMode("training");
      setSetPieceType("corner");
      setSetPiecePhase("attack");
    }
    initializedContext.current = routeContext;
  }, [drills, hydrated, routeContext]);

  useEffect(() => {
    if (initializedContext.current !== routeContext) return;
    setDraftAutosaved(false);
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(routeContext);
      const requestedMode = params.get("mode") === "set-piece" ? "set-piece" : "training";
      const drillId = params.get("drill");
      const saveAsCopy = params.get("copy") === "1";
      try {
        window.localStorage.setItem(builderAutosaveKey, JSON.stringify({
          context: `${requestedMode}:${drillId ?? "new"}:${saveAsCopy ? "copy" : "edit"}`,
          draft,
          sourceId,
          selectedBlockId,
          builderMode,
          setPieceType,
          setPiecePhase,
          savedAt: Date.now(),
        }));
        setDraftAutosaved(true);
        setAutosaveError(false);
      } catch {
        setDraftAutosaved(false);
        setAutosaveError(true);
      }
    }, 450);
    return () => window.clearTimeout(timer);
  }, [builderMode, draft, routeContext, selectedBlockId, setPiecePhase, setPieceType, sourceId]);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, [contenteditable='true']")) return;
      if (event.key === "Escape") {
        setTool("select");
        setLineStart(null);
        setHoverPoint(null);
        setSelectedItemId(null);
        setSelectedLineId(null);
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        undoBoard();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "d") {
        event.preventDefault();
        duplicateSelection();
        return;
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        deleteSelection();
      }
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  });

  const blocks = draft.planBlocks ?? [];
  const selectedBlock = blocks.find((block) => block.id === selectedBlockId) ?? blocks[0];
  const playbackBoard = selectedBlock?.board ?? { pitchPreset: "full" as const, items: [], lines: [] };
  const activePlaybackPlan = createPlaybackPlan(playbackBoard.lines, playbackStep);

  useEffect(() => {
    if (!isPlaying) return;
    const animations: Animation[] = [];
    activePlaybackPlan.keyframesBySource.forEach((keyframes, sourceId) => {
      const element = boardItemRefs.current.get(sourceId);
      if (!element || keyframes.length < 2 || typeof element.animate !== "function") return;
      animations.push(element.animate(keyframes, {
        duration: activePlaybackPlan.cycleDuration * 1000,
        easing: "linear",
        fill: "both",
        iterations: Infinity,
      }));
    });
    return () => animations.forEach((animation) => animation.cancel());
  }, [isPlaying, playbackNonce, playbackStep, selectedBlock?.board?.lines]);

  function updateBlock(id: string, updates: Partial<TrainingPlanBlock>) {
    setDraft((current) => ({
      ...current,
      planBlocks: current.planBlocks?.map((block) => block.id === id ? { ...block, ...updates } : block),
    }));
  }

  function recordBoard(board: TrainingBoardState) {
    if (!selectedBlock) return;
    setHistory((current) => ({
      ...current,
      [selectedBlock.id]: [...(current[selectedBlock.id] ?? []).slice(-19), cloneBoard(board)],
    }));
  }

  function changeBoard(next: TrainingBoardState, remember = true) {
    if (!selectedBlock) return;
    if (remember) recordBoard(selectedBlock.board ?? { items: [], lines: [] });
    updateBlock(selectedBlock.id, { board: next });
  }

  function boardPoint(event: { clientX: number; clientY: number }) {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: Math.max(3, Math.min(97, ((event.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(4, Math.min(96, ((event.clientY - rect.top) / rect.height) * 100)),
    };
  }

  function drawingLineFromRef(drawing: NonNullable<typeof drawingRef.current>): TrainingBoardLine {
    const first = drawing.points[0];
    const last = drawing.points.at(-1) ?? first;
    return {
      id: drawing.id,
      type: "draw",
      x1: first.x,
      y1: first.y,
      x2: last.x,
      y2: last.y,
      points: drawing.points.map((point) => ({ ...point })),
      color: drawing.color,
      strokeWidth: drawing.strokeWidth,
      animated: false,
    };
  }

  function startFreehandDrawing(event: ReactPointerEvent<HTMLDivElement>) {
    if (tool !== "draw" || sequenceOpen || !selectedBlock) return;
    const target = event.target as Element;
    if (target.closest(".builder-board-item, .builder-line-hit, .builder-line-anchor")) return;
    const point = boardPoint(event);
    if (!point) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const baseBoard = cloneBoard(selectedBlock.board);
    recordBoard(baseBoard);
    const drawing = {
      id: createId("drawing"),
      baseBoard,
      points: [point],
      color: defaultDrawingColor,
      strokeWidth: defaultDrawingWidth,
    };
    drawingRef.current = drawing;
    changeBoard({ ...cloneBoard(baseBoard), lines: [...baseBoard.lines, drawingLineFromRef(drawing)] }, false);
    setSelectedItemId(null);
    setSelectedLineId(drawing.id);
  }

  function moveFreehandDrawing(event: ReactPointerEvent<HTMLDivElement>) {
    const drawing = drawingRef.current;
    if (!drawing || !selectedBlock) return;
    const point = boardPoint(event);
    if (!point) return;
    const previous = drawing.points.at(-1);
    if (previous && Math.hypot(point.x - previous.x, point.y - previous.y) < .35) return;
    drawing.points.push(point);
    const board = cloneBoard(drawing.baseBoard);
    board.lines.push(drawingLineFromRef(drawing));
    changeBoard(board, false);
  }

  function endFreehandDrawing(event: ReactPointerEvent<HTMLDivElement>) {
    const drawing = drawingRef.current;
    if (!drawing) return;
    moveFreehandDrawing(event);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    const finalDrawing = drawingRef.current;
    drawingRef.current = null;
    if (!finalDrawing || finalDrawing.points.length > 1) return;
    changeBoard(cloneBoard(finalDrawing.baseBoard), false);
    setSelectedLineId(null);
  }

  function placeBoardItem(itemType: TrainingBoardItemType, point: { x: number; y: number }) {
    if (!selectedBlock) return;
    const board = cloneBoard(selectedBlock.board);
    const sameTypeCount = board.items.filter((item) => item.type === itemType).length;
    const item: TrainingBoardItem = {
      id: createId("board"),
      type: itemType,
      x: point.x,
      y: point.y,
      label: itemType === "player-a" || itemType === "player-b"
        ? String(sameTypeCount + 1)
        : itemType === "text" ? "텍스트를 입력하세요" : undefined,
      rotation: 0,
      scale: 1,
    };
    board.items.push(item);
    changeBoard(board);
    setSelectedItemId(item.id);
    setSelectedLineId(null);
    setTool("select");
  }

  function handleToolDragStart(event: ReactDragEvent<HTMLButtonElement>, item: BoardToolItem) {
    if (!isPlacementTool(item.id)) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("application/x-base11-board-item", item.id);
    event.dataTransfer.setData("text/plain", item.id);
    setDraggedTool(item.id);
    setTool(item.id);
    setLineStart(null);
    setHoverPoint(null);
    setSelectedItemId(null);
    setSelectedLineId(null);
  }

  function handleToolDragEnd() {
    setDraggedTool(null);
    setIsBoardDragOver(false);
    setTool("select");
  }

  function handleBoardDragOver(event: ReactDragEvent<HTMLDivElement>) {
    if (!draggedTool) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setIsBoardDragOver(true);
  }

  function handleBoardDragLeave(event: ReactDragEvent<HTMLDivElement>) {
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && event.currentTarget.contains(nextTarget)) return;
    setIsBoardDragOver(false);
  }

  function handleBoardDrop(event: ReactDragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    const droppedTool = draggedTool ?? event.dataTransfer.getData("application/x-base11-board-item");
    const point = boardPoint(event);
    setDraggedTool(null);
    setIsBoardDragOver(false);
    if (!point || !isPlacementTool(droppedTool as BoardTool)) {
      setTool("select");
      return;
    }
    placeBoardItem(droppedTool as TrainingBoardItemType, point);
  }

  function addItemMovement(itemId: string, target: { x: number; y: number }, remember = true) {
    if (!selectedBlock) return false;
    const board = cloneBoard(selectedBlock.board);
    const source = board.items.find((item) => item.id === itemId);
    if (!source || !isAnimationMovableItem(source)) return false;
    if (board.lines.some((line) => (line.sequenceStep ?? 1) === sequenceTargetStep && line.sourceItemId === source.id)) {
      setSequenceNotice("같은 선수의 다음 움직임은 ‘다음 시퀀스’를 만든 뒤 추가하세요.");
      return false;
    }
    const previousMovement = board.lines
      .filter((line) => line.sourceItemId === source.id && (line.sequenceStep ?? 1) < sequenceTargetStep)
      .sort((a, b) => (a.sequenceStep ?? 1) - (b.sequenceStep ?? 1))
      .at(-1);
    const origin = previousMovement ? { x: previousMovement.x2, y: previousMovement.y2 } : source;
    if (Math.hypot(target.x - origin.x, target.y - origin.y) <= 1.2) return false;
    const line: TrainingBoardLine = {
      id: createId("line"),
      type: source.type === "ball" ? "pass" : "run",
      x1: origin.x,
      y1: origin.y,
      x2: target.x,
      y2: target.y,
      cx: (origin.x + target.x) / 2,
      cy: (origin.y + target.y) / 2,
      animated: true,
      duration: 2,
      pauseAfter: .32,
      sequenceStep: sequenceTargetStep,
      sourceItemId: source.id,
    };
    board.lines.push(line);
    changeBoard(board, remember);
    setSelectedLineId(line.id);
    setSelectedItemId(null);
    setSequenceNotice("");
    setTool("select");
    return true;
  }

  function handleBoardClick(event: ReactMouseEvent<HTMLDivElement>) {
    if (!selectedBlock) return;
    const target = event.target as Element;
    if (target.closest(".builder-board-item, .builder-line-hit, .builder-line-anchor")) return;
    const point = boardPoint(event);
    if (!point) return;
    const board = cloneBoard(selectedBlock.board);
    if (tool === "select") {
      if (sequenceOpen && selectedItemId && addItemMovement(selectedItemId, point)) return;
      setSelectedItemId(null);
      setSelectedLineId(null);
      return;
    }
    if (lineTools.some((item) => item.id === tool)) {
      const lineType = tool as TrainingBoardLineType;
      if (!lineStart) {
        setLineStart(point);
        return;
      }
      const nearestSource = sequenceOpen ? board.items
        .filter(isAnimationMovableItem)
        .map((item) => {
          const previousMovement = board.lines
            .filter((line) => line.sourceItemId === item.id && (line.sequenceStep ?? 1) < sequenceTargetStep)
            .sort((a, b) => (a.sequenceStep ?? 1) - (b.sequenceStep ?? 1))
            .at(-1);
          const position = sequenceOpen && previousMovement ? { x: previousMovement.x2, y: previousMovement.y2 } : item;
          return { item, distance: Math.hypot(position.x - lineStart.x, position.y - lineStart.y) };
        })
        .sort((a, b) => a.distance - b.distance)[0] : undefined;
      const sourceItemId = nearestSource && nearestSource.distance <= 10 ? nearestSource.item.id : undefined;
      if (sourceItemId && board.lines.some((item) => (item.sequenceStep ?? 1) === sequenceTargetStep && item.sourceItemId === sourceItemId)) {
        setSequenceNotice("같은 선수의 다음 움직임은 ‘다음 시퀀스’를 만든 뒤 추가하세요.");
        setLineStart(null);
        setHoverPoint(null);
        return;
      }
      const line: TrainingBoardLine = {
        id: createId("line"),
        type: lineType,
        x1: lineStart.x,
        y1: lineStart.y,
        x2: point.x,
        y2: point.y,
        cx: (lineStart.x + point.x) / 2,
        cy: (lineStart.y + point.y) / 2,
        ...(sequenceOpen ? {
          animated: true,
          duration: 2,
          pauseAfter: .32,
          sequenceStep: sequenceTargetStep,
          sourceItemId,
        } : { animated: false }),
      };
      board.lines.push(line);
      changeBoard(board);
      setLineStart(null);
      setHoverPoint(null);
      setSelectedLineId(line.id);
      setSelectedItemId(null);
      setSequenceNotice("");
      setTool("select");
      return;
    }
    if (isPlacementTool(tool)) placeBoardItem(tool, point);
  }

  function handleBoardPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (drawingRef.current) {
      moveFreehandDrawing(event);
      return;
    }
    if (dragRef.current) {
      moveItem(event);
      return;
    }
    if (!lineStart || !lineTools.some((item) => item.id === tool)) return;
    setHoverPoint(boardPoint(event));
  }

  function handleBoardPointerEnd(event: ReactPointerEvent<HTMLDivElement>) {
    if (drawingRef.current) {
      endFreehandDrawing(event);
      return;
    }
    endItemDrag(event);
  }

  function startItemDrag(event: ReactPointerEvent<HTMLButtonElement>, item: TrainingBoardItem) {
    event.stopPropagation();
    if (!selectedBlock) return;
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const board = cloneBoard(selectedBlock.board);
    const previousMovement = board.lines
      .filter((line) => line.sourceItemId === item.id && (line.sequenceStep ?? 1) < sequenceTargetStep)
      .sort((a, b) => (a.sequenceStep ?? 1) - (b.sequenceStep ?? 1))
      .at(-1);
    const animation = sequenceOpen && isAnimationMovableItem(item);
    const originX = animation ? previousMovement?.x2 ?? item.x : item.x;
    const originY = animation ? previousMovement?.y2 ?? item.y : item.y;
    event.currentTarget.setPointerCapture(event.pointerId);
    recordBoard(selectedBlock.board ?? { items: [], lines: [] });
    dragRef.current = {
      id: item.id,
      offsetX: event.clientX - (rect.left + originX / 100 * rect.width),
      offsetY: event.clientY - (rect.top + originY / 100 * rect.height),
      originX,
      originY,
      x: originX,
      y: originY,
      animation,
      moved: false,
    };
    if (animation) setAnimationDragPreview({ id: item.id, x: originX, y: originY });
    setSelectedItemId(item.id);
    setSelectedLineId(null);
    setTool("select");
  }

  function moveItem(event: ReactPointerEvent<HTMLElement>) {
    if (!dragRef.current || !selectedBlock) return;
    event.stopPropagation();
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(3, Math.min(97, ((event.clientX - dragRef.current.offsetX - rect.left) / rect.width) * 100));
    const y = Math.max(4, Math.min(96, ((event.clientY - dragRef.current.offsetY - rect.top) / rect.height) * 100));
    dragRef.current.x = x;
    dragRef.current.y = y;
    dragRef.current.moved = Math.hypot(x - dragRef.current.originX, y - dragRef.current.originY) > 1.2;
    if (dragRef.current.animation) {
      setAnimationDragPreview({ id: dragRef.current.id, x, y });
      return;
    }
    const board = cloneBoard(selectedBlock.board);
    board.items = board.items.map((item) => item.id === dragRef.current?.id ? { ...item, x, y } : item);
    changeBoard(board, false);
  }

  function endItemDrag(event: ReactPointerEvent<HTMLElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    const drag = dragRef.current;
    const selectedId = drag?.id;
    dragRef.current = null;
    setAnimationDragPreview(null);
    if (drag?.animation && drag.moved && event.type !== "pointercancel" && addItemMovement(drag.id, { x: drag.x, y: drag.y }, false)) {
      suppressItemClickRef.current = drag.id;
      return;
    }
    if (selectedId) {
      setSelectedItemId(selectedId);
      setSelectedLineId(null);
    }
  }

  function updateSelectedItem(updates: Partial<TrainingBoardItem>, remember = true) {
    if (!selectedBlock || !selectedItemId) return;
    const board = cloneBoard(selectedBlock.board);
    board.items = board.items.map((item) => item.id === selectedItemId ? { ...item, ...updates } : item);
    changeBoard(board, remember);
  }

  function updateSelectedLine(updates: Partial<TrainingBoardLine>, remember = true) {
    if (!selectedBlock || !selectedLineId) return;
    const board = cloneBoard(selectedBlock.board);
    board.lines = board.lines.map((line) => line.id === selectedLineId ? { ...line, ...updates } : line);
    changeBoard(board, remember);
  }

  function setLineSequenceStep(lineId: string, targetStep: number) {
    if (!selectedBlock) return;
    const board = cloneBoard(selectedBlock.board);
    board.lines = connectLineSequence(normalizeLineSequence(board.lines.map((line) => line.id === lineId
      ? { ...line, sequenceStep: Math.max(1, targetStep), startDelay: 0 }
      : line)));
    changeBoard(board);
    setSelectedLineId(lineId);
    setSelectedItemId(null);
    setSequenceTargetStep(board.lines.find((line) => line.id === lineId)?.sequenceStep ?? 1);
    setSequenceNotice("");
    setIsPlaying(false);
    setPlaybackStep(null);
  }

  function reorderSequenceGroups(sourceStep: number, targetStep: number) {
    if (!selectedBlock) return;
    const board = cloneBoard(selectedBlock.board);
    const groups = createSequenceGroups(board.lines);
    const sourceIndex = groups.findIndex((group) => group.step === sourceStep);
    const targetIndex = groups.findIndex((group) => group.step === targetStep);
    if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
      setDraggedSequenceStep(null);
      setSequenceDropStep(null);
      return;
    }
    const reordered = [...groups];
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    const stepByLineId = new Map(reordered.flatMap((group, index) => group.lines.map((line) => [line.id, index + 1] as const)));
    board.lines = connectLineSequence(board.lines.map((line) => ({ ...line, sequenceStep: stepByLineId.get(line.id) ?? line.sequenceStep })));
    changeBoard(board);
    setIsPlaying(false);
    setPlaybackStep(null);
    setDraggedSequenceStep(null);
    setSequenceDropStep(null);
  }

  function duplicateSequenceGroup(step: number) {
    if (!selectedBlock) return;
    const board = cloneBoard(selectedBlock.board);
    const sourceLines = board.lines.filter((line) => line.animated === true && (line.sequenceStep ?? 1) === step);
    if (!sourceLines.length) return;
    const offsetsBySource = new Map(sourceLines.filter((line) => line.sourceItemId).map((line) => [line.sourceItemId as string, { x: line.x2 - line.x1, y: line.y2 - line.y1 }] as const));
    board.lines = board.lines.map((line) => {
      if (line.animated !== true || (line.sequenceStep ?? 1) <= step) return line;
      const offset = line.sourceItemId ? offsetsBySource.get(line.sourceItemId) : undefined;
      return {
        ...line,
        x1: offset ? Math.max(3, Math.min(97, line.x1 + offset.x)) : line.x1,
        y1: offset ? Math.max(4, Math.min(96, line.y1 + offset.y)) : line.y1,
        x2: offset ? Math.max(3, Math.min(97, line.x2 + offset.x)) : line.x2,
        y2: offset ? Math.max(4, Math.min(96, line.y2 + offset.y)) : line.y2,
        cx: offset ? Math.max(3, Math.min(97, (line.cx ?? (line.x1 + line.x2) / 2) + offset.x)) : line.cx,
        cy: offset ? Math.max(4, Math.min(96, (line.cy ?? (line.y1 + line.y2) / 2) + offset.y)) : line.cy,
        sequenceStep: (line.sequenceStep ?? 1) + 1,
      };
    });
    const copies = sourceLines.map((line) => {
      const dx = line.x2 - line.x1;
      const dy = line.y2 - line.y1;
      return {
        ...line,
        id: createId("line"),
        x1: line.x2,
        y1: line.y2,
        x2: Math.max(3, Math.min(97, line.x2 + dx)),
        y2: Math.max(4, Math.min(96, line.y2 + dy)),
        cx: Math.max(3, Math.min(97, (line.cx ?? (line.x1 + line.x2) / 2) + dx)),
        cy: Math.max(4, Math.min(96, (line.cy ?? (line.y1 + line.y2) / 2) + dy)),
        sequenceStep: step + 1,
      };
    });
    board.lines = connectLineSequence(normalizeLineSequence([...board.lines, ...copies]));
    changeBoard(board);
    setSelectedLineId(copies[0]?.id ?? null);
    setSelectedItemId(null);
    setSequenceTargetStep(step + 1);
    setSequenceNotice("");
    setIsPlaying(false);
    setPlaybackStep(null);
  }

  function deleteSequenceGroup(step: number) {
    if (!selectedBlock) return;
    const board = cloneBoard(selectedBlock.board);
    board.lines = connectLineSequence(normalizeLineSequence(board.lines.filter((line) => line.animated !== true || (line.sequenceStep ?? 1) !== step)));
    changeBoard(board);
    setSelectedLineId(null);
    setSelectedItemId(null);
    setSequenceTargetStep(Math.max(1, ...board.lines.filter((line) => line.animated === true).map((line) => line.sequenceStep ?? 1)));
    setSequenceNotice("");
    setIsPlaying(false);
    setPlaybackStep(null);
  }

  function toggleSequenceGroupPause(step: number) {
    if (!selectedBlock) return;
    const board = cloneBoard(selectedBlock.board);
    const group = createSequenceGroups(board.lines).find((item) => item.step === step);
    if (!group) return;
    const nextPause = group.pauseAfter >= .8 ? .32 : 1.2;
    board.lines = board.lines.map((line) => line.animated === true && (line.sequenceStep ?? 1) === step ? { ...line, pauseAfter: nextPause } : line);
    changeBoard(board);
    setIsPlaying(false);
    setPlaybackStep(null);
  }

  function startSequencePlayback(step: number | null = null) {
    if (!selectedBlock?.board?.lines.some((line) => line.animated === true)) return;
    setSequenceOpen(true);
    setPlaybackStep(step);
    setPlaybackNonce((current) => current + 1);
    setIsPlaying(true);
  }

  function stopSequencePlayback() {
    setIsPlaying(false);
    setPlaybackStep(null);
  }

  function closeAnimationFocus() {
    stopSequencePlayback();
    setSequenceOpen(false);
    setSelectedItemId(null);
    setSelectedLineId(null);
    setSequenceTargetStep(1);
    setSequenceNotice("");
    setDraggedSequenceStep(null);
    setDraggedSequenceLineId(null);
    setSequenceDropStep(null);
    setLineStart(null);
    setHoverPoint(null);
    setTool("select");
  }

  function setSelectedLineCurve(direction: -1 | 0 | 1) {
    if (!selectedBoardLine) return;
    const midpoint = {
      x: (selectedBoardLine.x1 + selectedBoardLine.x2) / 2,
      y: (selectedBoardLine.y1 + selectedBoardLine.y2) / 2,
    };
    if (direction === 0) {
      updateSelectedLine({ cx: midpoint.x, cy: midpoint.y });
      return;
    }
    const dx = selectedBoardLine.x2 - selectedBoardLine.x1;
    const dy = selectedBoardLine.y2 - selectedBoardLine.y1;
    const length = Math.max(1, Math.hypot(dx, dy));
    const offset = Math.min(18, Math.max(9, length * 0.28)) * direction;
    updateSelectedLine({
      cx: Math.max(3, Math.min(97, midpoint.x - dy / length * offset)),
      cy: Math.max(4, Math.min(96, midpoint.y + dx / length * offset)),
    });
  }

  function startLineHandleDrag(event: ReactPointerEvent<SVGElement>, lineId: string, handle: "start" | "control" | "end") {
    event.stopPropagation();
    if (!selectedBlock) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    recordBoard(selectedBlock.board ?? { items: [], lines: [] });
    lineHandleDragRef.current = { lineId, handle };
    setSelectedLineId(lineId);
    setSelectedItemId(null);
    setSequenceTargetStep(selectedBlock.board?.lines.find((line) => line.id === lineId)?.sequenceStep ?? 1);
    setSequenceNotice("");
    setTool("select");
  }

  function moveLineHandle(event: ReactPointerEvent<SVGElement>) {
    if (!lineHandleDragRef.current || !selectedBlock) return;
    event.stopPropagation();
    const point = boardPoint(event);
    if (!point) return;
    const { lineId, handle } = lineHandleDragRef.current;
    const board = cloneBoard(selectedBlock.board);
    const targetLine = board.lines.find((line) => line.id === lineId);
    const connectedLines = targetLine?.sourceItemId
      ? board.lines.filter((line) => line.sourceItemId === targetLine.sourceItemId).sort((a, b) => (a.sequenceStep ?? 1) - (b.sequenceStep ?? 1))
      : [];
    const connectedIndex = connectedLines.findIndex((line) => line.id === lineId);
    const previousLineId = connectedLines[connectedIndex - 1]?.id;
    const nextLineId = connectedLines[connectedIndex + 1]?.id;
    board.lines = board.lines.map((line) => {
      if (handle === "start" && line.id === previousLineId) return { ...line, x2: point.x, y2: point.y };
      if (handle === "end" && line.id === nextLineId) return { ...line, x1: point.x, y1: point.y };
      if (line.id !== lineId) return line;
      if (handle === "start") return { ...line, x1: point.x, y1: point.y };
      if (handle === "end") return { ...line, x2: point.x, y2: point.y };
      return { ...line, cx: point.x, cy: point.y };
    });
    changeBoard(board, false);
  }

  function endLineHandleDrag(event: ReactPointerEvent<SVGElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    lineHandleDragRef.current = null;
  }

  function duplicateSelection() {
    if (!selectedBlock) return;
    const board = cloneBoard(selectedBlock.board);
    if (selectedItemId) {
      const source = board.items.find((item) => item.id === selectedItemId);
      if (!source) return;
      const copy = { ...source, id: createId("board"), x: Math.min(96, source.x + 4), y: Math.min(95, source.y + 4) };
      board.items.push(copy);
      changeBoard(board);
      setSelectedItemId(copy.id);
      return;
    }
    if (selectedLineId) {
      const source = board.lines.find((line) => line.id === selectedLineId);
      if (!source) return;
      const dx = source.x2 - source.x1;
      const dy = source.y2 - source.y1;
      const copy: TrainingBoardLine = source.type === "draw" ? {
        ...source,
        id: createId("drawing"),
        x1: Math.min(97, source.x1 + 3),
        y1: Math.min(96, source.y1 + 3),
        x2: Math.min(97, source.x2 + 3),
        y2: Math.min(96, source.y2 + 3),
        points: source.points?.map((point) => ({ x: Math.min(97, point.x + 3), y: Math.min(96, point.y + 3) })),
        animated: false,
      } : sequenceOpen ? {
        ...source,
        id: createId("line"),
        x1: Math.min(97, source.x1 + 3),
        y1: Math.min(96, source.y1 + 3),
        x2: Math.min(97, source.x2 + 3),
        y2: Math.min(96, source.y2 + 3),
        cx: Math.min(97, (source.cx ?? (source.x1 + source.x2) / 2) + 3),
        cy: Math.min(96, (source.cy ?? (source.y1 + source.y2) / 2) + 3),
        sequenceStep: source.sequenceStep ?? sequenceTargetStep,
        sourceItemId: undefined,
      } : {
        ...source,
        id: createId("line"),
        x1: source.x2,
        y1: source.y2,
        x2: Math.max(3, Math.min(97, source.x2 + dx)),
        y2: Math.max(4, Math.min(96, source.y2 + dy)),
        cx: Math.max(3, Math.min(97, (source.cx ?? (source.x1 + source.x2) / 2) + dx)),
        cy: Math.max(4, Math.min(96, (source.cy ?? (source.y1 + source.y2) / 2) + dy)),
        animated: false,
        duration: undefined,
        startDelay: undefined,
        pauseAfter: undefined,
        sequenceStep: undefined,
        sourceItemId: undefined,
      };
      board.lines.push(copy);
      board.lines = connectLineSequence(normalizeLineSequence(board.lines));
      changeBoard(board);
      setSelectedLineId(copy.id);
      setSequenceTargetStep(copy.sequenceStep ?? 1);
    }
  }

  function deleteSelection() {
    if (!selectedBlock || (!selectedItemId && !selectedLineId)) return;
    const board = cloneBoard(selectedBlock.board);
    if (selectedItemId) board.items = board.items.filter((item) => item.id !== selectedItemId);
    if (selectedLineId) board.lines = connectLineSequence(normalizeLineSequence(board.lines.filter((line) => line.id !== selectedLineId)));
    changeBoard(board);
    setSelectedItemId(null);
    setSelectedLineId(null);
    if (sequenceOpen) setSequenceTargetStep(Math.max(1, ...board.lines.filter((line) => line.animated === true).map((line) => line.sequenceStep ?? 1)));
  }

  function undoBoard() {
    if (!selectedBlock) return;
    const stack = history[selectedBlock.id] ?? [];
    const previous = stack[stack.length - 1];
    if (!previous) return;
    const restoredBoard = cloneBoard(previous);
    updateBlock(selectedBlock.id, { board: restoredBoard });
    setHistory((current) => ({ ...current, [selectedBlock.id]: stack.slice(0, -1) }));
    setSelectedItemId(null);
    setSelectedLineId(null);
    if (sequenceOpen) setSequenceTargetStep(Math.max(1, ...restoredBoard.lines.filter((line) => line.animated === true).map((line) => line.sequenceStep ?? 1)));
  }

  function saveDrill() {
    if (!selectedBlock) return;
    const normalized = {
      ...cloneBlock(selectedBlock),
      title: selectedBlock.title.trim() || "새 훈련",
      point: selectedBlock.keyPoints?.find(Boolean) ?? selectedBlock.point,
      setup: [selectedBlock.area, selectedBlock.playerCount, selectedBlock.equipment].filter(Boolean).join(" · "),
      sourceDrillId: undefined,
      category: builderMode,
      setPieceType: builderMode === "set-piece" ? setPieceType : undefined,
      setPiecePhase: builderMode === "set-piece" ? setPiecePhase : undefined,
    };
    const { id: _discardedId, ...input } = normalized;
    try {
      window.localStorage.removeItem(builderAutosaveKey);
    } catch {
      // Saving the drill still works when local draft storage is unavailable.
    }
    if (sourceId) {
      updateDrill(sourceId, input);
      router.push("/schedule/templates");
      return;
    }
    createDrill(input);
    router.push("/schedule/templates");
  }

  if (!selectedBlock) return null;
  const board = selectedBlock.board ?? { pitchPreset: "full" as const, items: [], lines: [] };
  const activePitchPreset = normalizePitchPreset(board.pitchPreset);
  const activePitchDefinition = pitchPresets.find((preset) => preset.id === activePitchPreset) ?? pitchPresets[0];
  const animationLines = board.lines.filter((line) => line.animated === true);
  const hasAnimation = animationLines.length > 0;
  const canOpenAnimation = board.items.some(isAnimationMovableItem) || hasAnimation;
  const selectedBoardItem = board.items.find((item) => item.id === selectedItemId);
  const selectedBoardLine = board.lines.find((line) => line.id === selectedLineId);
  const selectedLineCurveDirection = selectedBoardLine ? lineCurveDirection(selectedBoardLine) : 0;
  const sequenceGroups = createSequenceGroups(board.lines);
  const lastSequenceStep = sequenceGroups.at(-1)?.step ?? 0;
  const sequencePending = sequenceTargetStep > lastSequenceStep;
  const selectedSequenceStep = selectedBoardLine?.sequenceStep ?? sequenceTargetStep;
  const selectedSequenceGroup = sequenceGroups.find((group) => group.step === selectedSequenceStep);
  const sequenceWarnings = createSequenceWarnings(board);
  const animationItemPositions = new Map(board.items.map((item) => [item.id, { x: item.x, y: item.y }] as const));
  sequenceGroups.filter((group) => group.step <= sequenceTargetStep).forEach((group) => group.lines.forEach((line) => {
    if (line.sourceItemId) animationItemPositions.set(line.sourceItemId, { x: line.x2, y: line.y2 });
  }));
  const sequenceTiming = activePlaybackPlan.timing;
  const sequenceCycleDuration = activePlaybackPlan.cycleDuration;
  const selectedSequenceGroupIndex = sequenceGroups.findIndex((group) => group.step === (playbackStep ?? selectedSequenceStep));
  const selectedSequenceIndex = selectedSequenceGroupIndex >= 0 ? selectedSequenceGroupIndex : sequenceGroups.length;
  const animatedSourceIds = new Set(isPlaying
    ? board.lines.filter((line) => sequenceTiming.has(line.id) && line.sourceItemId).map((line) => line.sourceItemId as string)
    : []);
  const keyPoints = [...(selectedBlock.keyPoints ?? [selectedBlock.point]), "", ""].slice(0, 3);
  const activeLineColor = tool === "draw"
    ? defaultDrawingColor
    : lineTools.some((item) => item.id === tool)
    ? lineColors[tool as TrainingBoardLineType]
    : "#ffffff";
  const activeToolDefinition = boardTools.find((item) => item.id === tool);
  const activeToolKind = tool === "draw" ? "draw" : lineTools.some((item) => item.id === tool) ? "line" : tool === "select" ? "select" : "placement";
  const activeToolStateLabel = selectedBoardItem
    ? boardItemDisplayLabel(selectedBoardItem)
    : selectedBoardLine
      ? `${lineLabels[selectedBoardLine.type]} 경로`
      : lineStart
        ? `${activeToolDefinition?.label ?? "선"} 끝점 선택`
        : tool === "select"
          ? "선택 도구"
          : `${activeToolDefinition?.label ?? "요소"} ${activeToolKind === "line" ? "시작점" : activeToolKind === "draw" ? "활성" : "배치"}`;
  const previewLine = lineStart && hoverPoint && lineTools.some((item) => item.id === tool)
    ? {
      id: "preview",
      type: tool as TrainingBoardLineType,
      x1: lineStart.x,
      y1: lineStart.y,
      x2: hoverPoint.x,
      y2: hoverPoint.y,
    } satisfies TrainingBoardLine
    : null;

  return <div className={`session-builder-page toss-editor-shell ${builderMode === "set-piece" ? "set-piece-editor" : "training-editor"} ${boardFocus ? "board-focus" : ""} ${sequenceOpen ? "animation-focus" : ""}`}>
    <header className="session-builder-header single-drill-builder-header">
      {sequenceOpen ? <>
        <div className="animation-focus-heading">
          <button type="button" aria-label="애니메이션 편집 종료" onClick={closeAnimationFocus}>‹</button>
          <div><small>애니메이션 편집</small><strong>{selectedBlock.title}</strong></div>
          <span className={sequenceWarnings.length ? "has-warning" : undefined}>{sequenceGroups.length}개 시퀀스 · {animationLines.length}개 움직임{sequenceWarnings.length ? ` · 확인 ${sequenceWarnings.length}` : ""}</span>
        </div>
        <div className="animation-focus-actions"><small className={autosaveError ? "has-error" : undefined}>{autosaveError ? "자동 저장 실패" : draftAutosaved ? "자동 저장됨" : "저장 중…"}</small><button type="button" onClick={closeAnimationFocus}>완료</button></div>
      </> : <>
        <div className="session-builder-heading">
          <Link href="/schedule/templates"><Icon name="chevron" size={15} />훈련 보관함</Link>
          <span>{builderMode === "set-piece" ? "세트피스 전술" : "개별 훈련"}</span>
          <h1>{builderMode === "set-piece" ? (sourceId ? "세트피스 수정" : "세트피스 만들기") : (sourceId ? "훈련 수정" : "훈련 만들기")}</h1>
          <p>{builderMode === "set-piece" ? "한 장면에 집중해 선수와 볼의 움직임을 그리고 재생 가능한 전술로 저장합니다." : "지금은 한 개의 훈련만 설계합니다. 저장한 뒤 템플릿에서 순서대로 조합할 수 있습니다."}</p>
        </div>
        <div className="session-builder-save-actions">
          <span className={`builder-save-state ${autosaveError ? "has-error" : ""}`}><i />{autosaveError ? "저장 실패" : draftAutosaved ? "자동 저장됨" : "저장 중"}</span>
          <Link href="/schedule/templates" onClick={() => {
            try {
              window.localStorage.removeItem(builderAutosaveKey);
            } catch {
              // Navigation should not fail when local draft storage is unavailable.
            }
          }}>취소</Link>
          <button type="button" className="primary" onClick={saveDrill}><Icon name="check" size={16} />{sourceId ? "변경 저장" : builderMode === "set-piece" ? "전술 저장" : "훈련 저장"}</button>
        </div>
      </>}
    </header>

    <div className="session-builder-layout single-drill-builder-layout">
      <main className="session-builder-board-panel">
        <header>
          <div><span>{builderMode === "set-piece" ? "세트피스 작전판" : "작전판"}</span><h2>{selectedBlock.title}</h2><p>도구를 고른 뒤 작전판을 누르세요. 배치한 요소는 바로 움직일 수 있습니다.</p></div>
          <div className="builder-canvas-actions"><span className={`builder-active-tool-state ${activeToolKind} ${lineStart ? "pending" : ""}`}><i /><b>{activeToolStateLabel}</b><kbd>Esc</kbd></span><button type="button" className="builder-info-toggle" aria-pressed={!boardFocus} onClick={() => {
            if (boardFocus) {
              setSelectedItemId(null);
              setSelectedLineId(null);
            }
            setBoardFocus((current) => !current);
          }}>{boardFocus ? builderMode === "set-piece" ? "전술 정보" : "훈련 정보" : "정보 닫기"}</button>{!sequenceOpen ? <button type="button" className="builder-animation-entry" disabled={!canOpenAnimation} title={canOpenAnimation ? "애니메이션 전용 화면 열기" : "선수나 볼을 먼저 배치하세요"} onClick={() => {
            setSequenceOpen(true);
            setSequenceTargetStep(Math.max(1, ...animationLines.map((line) => line.sequenceStep ?? 1)));
            setSequenceNotice("");
            setSelectedItemId(null);
            setSelectedLineId(null);
            setTool("select");
            setLineStart(null);
            setHoverPoint(null);
          }}>{hasAnimation ? "애니메이션 편집" : "애니메이션 만들기"}</button> : null}</div>
        </header>
        {!sequenceOpen ? <section className="builder-pitch-preset-panel" aria-label="피치 프리셋">
          <strong>피치</strong>
          <div>{pitchPresets.map((preset) => <button type="button" key={preset.id} aria-pressed={activePitchPreset === preset.id} onClick={() => {
            changeBoard({ ...cloneBoard(board), pitchPreset: preset.id });
            setSelectedItemId(null);
            setSelectedLineId(null);
            setLineStart(null);
            setHoverPoint(null);
            setIsPlaying(false);
          }}><span>{preset.label}</span><small>{preset.description}</small></button>)}</div>
        </section> : null}
        <div className="session-builder-tool-shelf" role="toolbar" aria-label="작전판 도구">
          {sequenceOpen ? <>
            <section className="builder-tool-group animation-lines"><strong>움직임</strong><div>{[placementTools[0], ...lineTools].map((item) => <button key={item.id} type="button" className={`tool-${item.id}`} aria-pressed={tool === item.id} title={item.label} onClick={() => {
              setTool(item.id);
              setLineStart(null);
              setHoverPoint(null);
              if (item.id !== "select") {
                setSelectedItemId(null);
                setSelectedLineId(null);
              }
            }}>{item.id === "select" ? <BoardToolPreview item={item} /> : <i>{item.short}</i>}<span>{item.label}</span></button>)}</div></section>
            <div className="session-builder-toolbar-actions animation-toolbar-actions">
              <button type="button" onClick={undoBoard} disabled={!(history[selectedBlock.id]?.length)}>되돌리기</button>
            </div>
          </> : <>
            <section className="builder-tool-group placement"><strong>배치</strong><div>{placementTools.map((item) => <button key={item.id} type="button" draggable={isPlacementTool(item.id)} className={`tool-${item.id} ${draggedTool === item.id ? "is-dragging" : ""}`} aria-pressed={tool === item.id} title={isPlacementTool(item.id) ? `${item.label} · 클릭하거나 작전판으로 끌어 놓기` : item.label} onDragStart={(event) => handleToolDragStart(event, item)} onDragEnd={handleToolDragEnd} onClick={() => {
            setTool(item.id);
            setLineStart(null);
            setHoverPoint(null);
          }}><BoardToolPreview item={item} /><span>{item.label}</span></button>)}</div></section>
          <section className="builder-tool-group lines"><strong>선·그리기</strong><div>{normalLineTools.map((item) => <button key={item.id} type="button" className={`tool-${item.id}`} aria-pressed={tool === item.id} title={item.id === "draw" ? "누른 채로 자유롭게 그리기" : item.label} onClick={() => {
            setTool(item.id);
            setLineStart(null);
            setHoverPoint(null);
            setSelectedItemId(null);
            setSelectedLineId(null);
          }}><i>{item.short}</i><span>{item.label}</span></button>)}</div></section>
          <div className="session-builder-toolbar-actions">
            <button type="button" onClick={undoBoard} disabled={!(history[selectedBlock.id]?.length)}>되돌리기</button>
            <button type="button" onClick={() => {
              changeBoard({ pitchPreset: activePitchPreset, items: [], lines: [] });
              setSelectedItemId(null);
              setSelectedLineId(null);
              setIsPlaying(false);
              setSequenceTargetStep(1);
              setSequenceNotice("");
            }} disabled={!board.items.length && !board.lines.length}>전체 지우기</button>
          </div>
          </>}
        </div>
        <div className={`session-builder-board-wrap ${sequenceOpen ? "has-sequence-panel" : ""}`}>
          <div className="session-builder-board-stage">
            <div className={`session-builder-board pitch-${activePitchPreset} is-tool-${activeToolKind} ${lineStart ? "is-awaiting-end" : ""} ${isPlaying ? "is-playing" : ""} ${isBoardDragOver ? "is-drag-target" : ""}`} style={{ "--pitch-ratio": `${activePitchDefinition.width} / ${activePitchDefinition.height}` } as CSSProperties} ref={boardRef} onClick={handleBoardClick} onPointerDown={startFreehandDrawing} onPointerMove={handleBoardPointerMove} onPointerUp={handleBoardPointerEnd} onPointerCancel={handleBoardPointerEnd} onDragEnter={handleBoardDragOver} onDragOver={handleBoardDragOver} onDragLeave={handleBoardDragLeave} onDrop={handleBoardDrop} aria-label={`${activePitchDefinition.label} 작전판`}>
            <PitchMarkings preset={activePitchPreset} />
            <svg key={`playback-${playbackNonce}`} className="builder-board-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="작전판 이동 경로">
              <defs>
                {Object.entries(lineColors).map(([type, color]) => <marker key={type} id={`builder-${type}-arrow`} markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 Z" fill={color} /></marker>)}
              </defs>
              {board.lines.map((line) => {
                const control = lineControlPoint(line);
                const path = linePath(line);
                const lineSelectable = !sequenceOpen || line.animated === true;
                const selected = lineSelectable && selectedLineId === line.id;
                const sourceItem = line.sourceItemId ? board.items.find((item) => item.id === line.sourceItemId) : undefined;
                const animatedSourceItem = sourceItem && isBoardAssetItem(sourceItem) ? sourceItem : undefined;
                const timing = sequenceTiming.get(line.id);
                const lineIsPlaying = isPlaying && Boolean(timing);
                const movementDuration = timing?.duration ?? line.duration ?? 2;
                const sequenceStart = timing?.start ?? 0;
                const sequenceStartRatio = sequenceStart / sequenceCycleDuration;
                const movementEnd = (sequenceStart + movementDuration) / sequenceCycleDuration;
                const animationKeyPoints = sequenceStart > 0 ? "0;0;1;1" : "0;1;1";
                const animationKeyTimes = sequenceStart > 0 ? `0;${sequenceStartRatio};${movementEnd};1` : `0;${movementEnd};1`;
                const visibilityEnd = Math.min(.9999, movementEnd + .0001);
                const visibilityStart = sequenceStartRatio === 0 ? .0001 : sequenceStartRatio;
                const visibilityKeyTimes = `0;${visibilityStart};${movementEnd};${visibilityEnd};1`;
                const sequenceBadgeX = (line.x1 + line.x2) / 2;
                const sequenceBadgeY = Math.max(2.5, (line.y1 + line.y2) / 2 - 3);
                return <g key={line.id} className={`${selected && !isPlaying ? "selected" : ""} ${sequenceOpen && line.animated !== true ? "static-reference" : ""}`}>
                  <path className="builder-line-selection-stroke" d={path} vectorEffect="non-scaling-stroke" />
                  <path
                    className={`builder-line-path ${line.type} ${lineIsPlaying ? "is-sequence-playing" : ""}`}
                    d={path}
                    markerEnd={line.type === "draw" ? undefined : `url(#builder-${line.type}-arrow)`}
                    style={line.type === "draw" ? { stroke: line.color ?? lineColors.draw, strokeWidth: line.strokeWidth ?? 2.4 } : undefined}
                    vectorEffect="non-scaling-stroke"
                  >{lineIsPlaying ? <animate attributeName="stroke-opacity" values=".35;1;1;.35;.35" keyTimes={visibilityKeyTimes} dur={`${sequenceCycleDuration}s`} calcMode="discrete" repeatCount="indefinite" /> : null}</path>
                  <path className="builder-line-hit" d={path} vectorEffect="non-scaling-stroke" role="button" tabIndex={lineSelectable ? 0 : -1} aria-label={lineSelectable ? `${lineLabels[line.type]} 경로 선택` : `${lineLabels[line.type]} 정적 참고선`} onFocus={() => {
                    if (!lineSelectable) return;
                    setSelectedLineId(line.id);
                    setSelectedItemId(null);
                    setSequenceTargetStep(line.sequenceStep ?? 1);
                    setSequenceNotice("");
                    setPlaybackStep(null);
                    setIsPlaying(false);
                    setTool("select");
                  }} onClick={(event) => {
                    event.stopPropagation();
                    if (!lineSelectable) return;
                    setSelectedLineId(line.id);
                    setSelectedItemId(null);
                    setSequenceTargetStep(line.sequenceStep ?? 1);
                    setSequenceNotice("");
                    setPlaybackStep(null);
                    setIsPlaying(false);
                    setTool("select");
                    if (event.detail > 0) event.currentTarget.blur();
                  }} onKeyDown={(event) => {
                    if (!lineSelectable) return;
                    if (event.key !== "Enter" && event.key !== " ") return;
                    event.preventDefault();
                    setSelectedLineId(line.id);
                    setSelectedItemId(null);
                    setSequenceTargetStep(line.sequenceStep ?? 1);
                    setSequenceNotice("");
                    setPlaybackStep(null);
                    setIsPlaying(false);
                    setTool("select");
                  }} />
                  {lineIsPlaying && !animatedSourceItem ? <circle className={`builder-path-runner ${line.type}`} r="0.35"><animate attributeName="opacity" values="0;1;1;0;0" keyTimes={visibilityKeyTimes} dur={`${sequenceCycleDuration}s`} calcMode="discrete" repeatCount="indefinite" /><animateMotion path={path} dur={`${sequenceCycleDuration}s`} keyPoints={animationKeyPoints} keyTimes={animationKeyTimes} calcMode="linear" repeatCount="indefinite" /></circle> : null}
                  {sequenceOpen && line.animated === true && !isPlaying ? <g className={`builder-sequence-badge ${selected ? "selected" : ""}`} transform={`translate(${sequenceBadgeX} ${sequenceBadgeY})`} aria-hidden="true"><rect x="-1.25" y="-1.75" width="2.5" height="3.5" rx=".55" /><text y=".34" textAnchor="middle">{line.sequenceStep ?? 1}</text></g> : null}
                  {selected && !isPlaying && line.type !== "draw" ? <>
                    {lineCurveDirection(line) !== 0 ? <path className="builder-line-handle-guide" d={`M ${line.x1} ${line.y1} L ${control.x} ${control.y} L ${line.x2} ${line.y2}`} vectorEffect="non-scaling-stroke" /> : null}
                    <circle className="builder-line-anchor-hit" cx={line.x1} cy={line.y1} r="1.15" onPointerDown={(event) => startLineHandleDrag(event, line.id, "start")} onPointerMove={moveLineHandle} onPointerUp={endLineHandleDrag} onPointerCancel={endLineHandleDrag} />
                    <circle className="builder-line-anchor-hit" cx={control.x} cy={control.y} r="1.15" onPointerDown={(event) => startLineHandleDrag(event, line.id, "control")} onPointerMove={moveLineHandle} onPointerUp={endLineHandleDrag} onPointerCancel={endLineHandleDrag} />
                    <circle className="builder-line-anchor-hit" cx={line.x2} cy={line.y2} r="1.15" onPointerDown={(event) => startLineHandleDrag(event, line.id, "end")} onPointerMove={moveLineHandle} onPointerUp={endLineHandleDrag} onPointerCancel={endLineHandleDrag} />
                    <rect className="builder-line-anchor" x={line.x1 - .38} y={line.y1 - .58} width=".76" height="1.16" rx=".08" onPointerDown={(event) => startLineHandleDrag(event, line.id, "start")} onPointerMove={moveLineHandle} onPointerUp={endLineHandleDrag} onPointerCancel={endLineHandleDrag} />
                    <rect className="builder-line-anchor control" x={control.x - .38} y={control.y - .58} width=".76" height="1.16" rx=".08" onPointerDown={(event) => startLineHandleDrag(event, line.id, "control")} onPointerMove={moveLineHandle} onPointerUp={endLineHandleDrag} onPointerCancel={endLineHandleDrag} />
                    <rect className="builder-line-anchor" x={line.x2 - .38} y={line.y2 - .58} width=".76" height="1.16" rx=".08" onPointerDown={(event) => startLineHandleDrag(event, line.id, "end")} onPointerMove={moveLineHandle} onPointerUp={endLineHandleDrag} onPointerCancel={endLineHandleDrag} />
                  </> : null}
                </g>;
              })}
              {previewLine ? <path className={`builder-line-path preview ${previewLine.type}`} d={linePath(previewLine)} markerEnd={`url(#builder-${previewLine.type}-arrow)`} vectorEffect="non-scaling-stroke" /> : null}
              {lineStart && <circle cx={lineStart.x} cy={lineStart.y} r="0.65" fill={activeLineColor} />}
            </svg>
            {board.items.map((item) => {
              const sequencedPosition = sequenceOpen ? animationItemPositions.get(item.id) : undefined;
              const previewPosition = animationDragPreview?.id === item.id ? animationDragPreview : undefined;
              const displayPosition = previewPosition ?? sequencedPosition ?? item;
              const animationMovable = sequenceOpen && isAnimationMovableItem(item);
              return <button
              type="button"
              key={item.id}
              ref={(node) => {
                if (node) boardItemRefs.current.set(item.id, node);
                else boardItemRefs.current.delete(item.id);
              }}
              className={`builder-board-item item-${item.type} ${selectedItemId === item.id && !isPlaying ? "selected" : ""} ${animatedSourceIds.has(item.id) ? "playback-source" : ""} ${animationMovable ? "animation-movable" : ""} ${previewPosition ? "animation-dragging" : ""}`}
              style={{ left: `${displayPosition.x}%`, top: `${displayPosition.y}%`, "--item-rotation": `${item.rotation ?? 0}deg`, "--item-counter-rotation": `${-(item.rotation ?? 0)}deg`, "--item-scale": item.scale ?? 1 } as CSSProperties}
              onMouseDown={(event) => {
                event.stopPropagation();
                setSelectedItemId(item.id);
                setSelectedLineId(null);
              }}
              onPointerDown={(event) => startItemDrag(event, item)}
              onPointerMove={moveItem}
              onPointerUp={endItemDrag}
              onPointerCancel={endItemDrag}
              onFocus={() => {
                setSelectedItemId(item.id);
                setSelectedLineId(null);
                setTool("select");
              }}
              onClick={(event) => {
                event.stopPropagation();
                if (suppressItemClickRef.current === item.id) {
                  suppressItemClickRef.current = null;
                  return;
                }
                setSelectedItemId(item.id);
                setSelectedLineId(null);
                setTool("select");
              }}
              aria-label={animationMovable ? `${boardItemDisplayLabel(item)} 드래그하여 움직임 만들기` : `${boardItemDisplayLabel(item)} 이동`}
            ><BoardItemView item={item} />{isPlayerTokenType(item.type) && item.name?.trim() ? <span className="builder-player-name">{item.name.trim()}</span> : null}</button>;
            })}
            {!board.items.length && !board.lines.length && <div className="session-builder-board-empty"><strong>첫 요소를 놓아보세요</strong><span>왼쪽 도구를 클릭하거나 작전판으로 끌어 놓으면 됩니다.</span></div>}
            </div>
          </div>
          <p className="session-builder-board-help">{sequenceOpen
            ? lineStart
              ? "끝점을 누르면 현재 시퀀스의 움직임이 완성됩니다."
              : selectedBoardLine
                ? "점을 끌어 경로를 다듬고 우측에서 속도를 정하세요."
                : selectedBoardItem && isAnimationMovableItem(selectedBoardItem)
                  ? "목적지를 클릭하거나 선수를 그 위치까지 끌어 움직임을 만드세요."
                : lineTools.some((item) => item.id === tool)
                  ? `${boardTools.find((item) => item.id === tool)?.label} 시작점을 누르세요.`
                  : "움직임을 선택하거나 왼쪽에서 새 경로를 그리세요."
            : lineStart
              ? "끝점을 누르면 경로가 완성됩니다. 마우스를 움직여 방향을 미리 볼 수 있습니다."
              : selectedBoardLine
                ? selectedBoardLine.type === "draw"
                  ? "그림을 선택했습니다. 우측에서 색상과 굵기를 조절하세요."
                  : "양 끝점과 노란 곡선 핸들을 끌고, 우측에서 선 종류와 곡선을 조절하세요."
                : selectedBoardItem
                  ? `${isPlayerTokenType(selectedBoardItem.type) ? "등번호·이름·" : ""}크기·회전을 우측 속성에서 조절하세요.`
                  : tool === "select"
                    ? "요소나 선을 선택하면 우측에 속성이 열립니다."
                    : tool === "draw"
                      ? "작전판 위에서 누른 채 움직여 자유롭게 그리세요."
                    : `${boardTools.find((item) => item.id === tool)?.label}을 놓을 위치를 누르세요.`}</p>
          {sequenceOpen ? <section className="builder-sequence-panel" aria-label="애니메이션 시퀀스">
            <header>
              <div className="builder-sequence-heading">
                <strong>{sequenceTargetStep}번 시퀀스</strong>
                <small className={sequenceNotice || sequenceWarnings.length ? "sequence-warning-text" : undefined}>{sequenceNotice || sequenceWarnings[0] || "지금 추가하는 움직임은 모두 함께 실행됩니다."}</small>
              </div>
              <div className="builder-sequence-playback">
                <button type="button" aria-label="이전 시퀀스 미리보기" disabled={selectedSequenceIndex <= 0} onClick={() => startSequencePlayback(sequenceGroups[selectedSequenceIndex - 1]?.step ?? null)}>‹</button>
                <button type="button" className="primary" aria-pressed={isPlaying && playbackStep === null} onClick={() => isPlaying ? stopSequencePlayback() : startSequencePlayback(null)}>{isPlaying ? "정지" : "전체 재생"}</button>
                <button type="button" aria-label="다음 시퀀스 미리보기" disabled={selectedSequenceIndex >= sequenceGroups.length - 1} onClick={() => startSequencePlayback(sequenceGroups[selectedSequenceIndex + 1]?.step ?? null)}>›</button>
              </div>
            </header>
            <div className="builder-sequence-track">
              {!sequenceGroups.length ? <div className="builder-sequence-empty"><strong>1번 시퀀스</strong><span>추가하는 모든 움직임이 함께 실행됩니다.</span></div> : null}
              {sequenceGroups.map((group, groupIndex) => <article
                key={group.step}
                className={`${(playbackStep ?? sequenceTargetStep) === group.step ? "active" : ""} ${sequenceDropStep === group.step ? "drop-target" : ""}`}
                style={{ "--sequence-card-width": `${group.lines.length > 1 ? group.lines.length * 164 + 10 : 196}px` } as CSSProperties}
                onDragOver={(event) => {
                  if (draggedSequenceStep === null && !draggedSequenceLineId) return;
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  setSequenceDropStep(group.step);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  if (draggedSequenceLineId) setLineSequenceStep(draggedSequenceLineId, group.step);
                  else if (draggedSequenceStep !== null) reorderSequenceGroups(draggedSequenceStep, group.step);
                  setDraggedSequenceLineId(null);
                  setDraggedSequenceStep(null);
                  setSequenceDropStep(null);
                }}
              >
                <header draggable onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = "move";
                  setDraggedSequenceStep(group.step);
                  setDraggedSequenceLineId(null);
                }} onDragEnd={() => {
                  setDraggedSequenceStep(null);
                  setSequenceDropStep(null);
                }} title="끌어서 시퀀스 순서 변경">
                  <b className="builder-sequence-grip" aria-hidden="true">⋮⋮</b>
                  <span>{groupIndex + 1}</span>
                  <div><strong>{group.lines.length > 1 ? `같이 움직임 ${group.lines.length}` : "한 동작"}</strong><small>{group.duration.toFixed(1)}초{group.pauseAfter >= .8 ? " · 멈춤" : ""}</small></div>
                </header>
                <div>{group.lines.map((line) => {
                  const source = line.sourceItemId ? board.items.find((item) => item.id === line.sourceItemId) : undefined;
                  const sourceLabel = source
                    ? boardItemDisplayLabel(source)
                    : "경로만 표시";
                  return <button type="button" draggable key={line.id} className={selectedLineId === line.id ? "selected" : ""} onDragStart={(event) => {
                    event.stopPropagation();
                    event.dataTransfer.effectAllowed = "move";
                    setDraggedSequenceLineId(line.id);
                    setDraggedSequenceStep(null);
                  }} onDragEnd={() => {
                    setDraggedSequenceLineId(null);
                    setSequenceDropStep(null);
                  }} title="다른 시퀀스에 놓으면 그 시퀀스에서 같이 움직입니다" onClick={() => {
                    setSelectedLineId(line.id);
                    setSelectedItemId(null);
                    setPlaybackStep(null);
                    setIsPlaying(false);
                    setSequenceTargetStep(line.sequenceStep ?? 1);
                    setSequenceNotice("");
                    setTool("select");
                  }}><i style={{ background: lineColors[line.type] }} /><span><strong>{sourceLabel}</strong><small>{lineLabels[line.type]}</small></span></button>;
                })}</div>
              </article>)}
              {sequenceGroups.length && sequencePending ? <article className="builder-sequence-pending active">
                <header><b className="builder-sequence-grip" aria-hidden="true">·</b><span>{sequenceTargetStep}</span><div><strong>새 시퀀스</strong><small>움직임 추가 대기</small></div></header>
                <div><p>이제 추가하는 움직임부터 순서대로 실행됩니다.</p></div>
              </article> : null}
              <button
                type="button"
                className={`builder-sequence-new-step ${sequenceDropStep === "new" ? "drop-target" : ""}`}
                disabled={!animationLines.length || sequencePending}
                onDragOver={(event) => {
                  if (!draggedSequenceLineId) return;
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  setSequenceDropStep("new");
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  if (draggedSequenceLineId) setLineSequenceStep(draggedSequenceLineId, lastSequenceStep + 1);
                  setDraggedSequenceLineId(null);
                  setSequenceDropStep(null);
                }}
                onClick={() => {
                  const nextStep = lastSequenceStep + 1;
                  setSequenceTargetStep(nextStep);
                  setSelectedLineId(null);
                  setSelectedItemId(null);
                  setSequenceNotice(`${nextStep}번 시퀀스가 준비되었습니다. 이후 움직임은 여기에서 함께 실행됩니다.`);
                  setTool("select");
                }}
              >+ 다음 시퀀스</button>
            </div>
          </section> : null}
        </div>
      </main>

      <aside className={`session-builder-settings-panel ${selectedBoardLine || (!sequenceOpen && selectedBoardItem) ? "selection-properties-panel" : ""} ${!boardFocus && !selectedBoardLine && !selectedBoardItem ? "document-properties-panel" : ""}`}>
        {sequenceOpen && !selectedBoardLine ? <div className="animation-properties-empty">
          <span>움직임 속성</span>
          <strong>{selectedBoardItem && isAnimationMovableItem(selectedBoardItem) ? `${boardItemLabels[selectedBoardItem.type]}의 목적지를 정하세요` : sequencePending ? `${sequenceTargetStep}번 시퀀스에 움직임을 추가하세요` : board.lines.length ? "수정할 움직임을 선택하세요" : "먼저 움직임을 그려주세요"}</strong>
          <p>{selectedBoardItem && isAnimationMovableItem(selectedBoardItem) ? "작전판의 도착 위치를 클릭하거나 선수를 직접 끌어 놓으면 현재 시퀀스에 추가됩니다." : sequencePending ? "선수나 볼을 끌어 놓으면 새 시퀀스가 완성됩니다." : board.lines.length ? "작전판의 선이나 아래 시퀀스 카드를 누르면 경로와 속도를 조절할 수 있습니다." : "선수·볼을 끌어 놓거나 왼쪽에서 움직임 종류를 선택하면 됩니다."}</p>
        </div> : selectedBoardItem ? <>
          <header className="properties-panel-header">
            <div><small>선택한 요소</small><strong>{boardItemLabels[selectedBoardItem.type]}</strong></div>
            <button type="button" aria-label="요소 속성 닫기" onClick={() => {
              setSelectedItemId(null);
              setBoardFocus(true);
            }}>×</button>
          </header>
          <div className="properties-selection-preview">
            <BoardItemView item={selectedBoardItem} />
            <span><strong>{boardItemDisplayLabel(selectedBoardItem)}</strong><small>작전판에서 직접 끌어 이동할 수 있습니다.</small></span>
          </div>
          {isPlayerTokenType(selectedBoardItem.type) ? <section className="properties-section">
            <header><strong>선수 표시</strong><small>등번호와 이름을 각각 표시할 수 있습니다.</small></header>
            <label className="properties-wide-field"><span>등번호</span><input value={selectedBoardItem.label ?? ""} maxLength={3} inputMode="numeric" onChange={(event) => updateSelectedItem({ label: event.target.value.replace(/[^0-9A-Za-z]/g, "").slice(0, 3) })} /></label>
            <label className="properties-wide-field"><span>이름</span><input value={selectedBoardItem.name ?? ""} maxLength={12} onChange={(event) => updateSelectedItem({ name: event.target.value.slice(0, 12) })} placeholder="예: 김민준" /></label>
          </section> : selectedBoardItem.type === "text" ? <section className="properties-section">
            <header><strong>텍스트</strong><small>작전판에 표시할 문구입니다.</small></header>
            <label className="properties-wide-field"><span>내용</span><input value={selectedBoardItem.label ?? ""} maxLength={80} onChange={(event) => updateSelectedItem({ label: event.target.value })} placeholder="예: 수비 간격 유지" /></label>
          </section> : null}
          <section className="properties-section">
            <header><strong>위치와 방향</strong><small>직접 입력하거나 작전판에서 조절하세요.</small></header>
            <div className="properties-number-grid">
              <label><span>X</span><input type="number" min="3" max="97" step="0.5" value={Math.round(selectedBoardItem.x * 10) / 10} onChange={(event) => updateSelectedItem({ x: Math.max(3, Math.min(97, Number(event.target.value))) })} /></label>
              <label><span>Y</span><input type="number" min="4" max="96" step="0.5" value={Math.round(selectedBoardItem.y * 10) / 10} onChange={(event) => updateSelectedItem({ y: Math.max(4, Math.min(96, Number(event.target.value))) })} /></label>
              <label><span>회전</span><div className="property-input-unit"><input type="number" min="0" max="359" value={Math.round(selectedBoardItem.rotation ?? 0)} onChange={(event) => updateSelectedItem({ rotation: ((Number(event.target.value) % 360) + 360) % 360 })} /><i>°</i></div></label>
            </div>
            <div className="property-rotate-actions"><button type="button" onClick={() => updateSelectedItem({ rotation: ((selectedBoardItem.rotation ?? 0) + 345) % 360 })}>−15°</button><button type="button" aria-pressed={Math.round(selectedBoardItem.rotation ?? 0) === 0} onClick={() => updateSelectedItem({ rotation: 0 })}>초기화</button><button type="button" onClick={() => updateSelectedItem({ rotation: ((selectedBoardItem.rotation ?? 0) + 15) % 360 })}>+15°</button></div>
          </section>
          <section className="properties-section">
            <header><strong>크기</strong></header>
            <div className="property-scale-stepper">
              <button type="button" aria-label="크기 10% 줄이기" onClick={() => updateSelectedItem({ scale: Math.max(.01, (Math.round((selectedBoardItem.scale ?? 1) * 100) - 10) / 100) })}>−</button>
              <label><input type="number" min="1" step="5" aria-label="크기 퍼센트" value={Math.round((selectedBoardItem.scale ?? 1) * 100)} onFocus={() => recordBoard(board)} onChange={(event) => {
                const percentage = Number(event.target.value);
                if (!Number.isFinite(percentage) || percentage <= 0) return;
                updateSelectedItem({ scale: percentage / 100 }, false);
              }} /><i>%</i></label>
              <button type="button" aria-label="크기 10% 늘리기" onClick={() => updateSelectedItem({ scale: (Math.round((selectedBoardItem.scale ?? 1) * 100) + 10) / 100 })}>+</button>
              <button type="button" className="reset" disabled={Math.abs((selectedBoardItem.scale ?? 1) - 1) < .001} onClick={() => updateSelectedItem({ scale: 1 })}>초기화</button>
            </div>
          </section>
          <footer className="properties-panel-actions"><button type="button" onClick={duplicateSelection}>복제</button><button type="button" className="danger" onClick={deleteSelection}>삭제</button></footer>
        </> : selectedBoardLine ? <>
          <header className="properties-panel-header">
            <div><small>{sequenceOpen ? "선택한 움직임" : "선택한 선"}</small><strong>{lineLabels[selectedBoardLine.type]}</strong></div>
            <button type="button" aria-label={`${sequenceOpen ? "움직임" : "선"} 속성 닫기`} onClick={() => {
              setSelectedLineId(null);
              setBoardFocus(true);
            }}>×</button>
          </header>
          <div className="properties-line-preview"><i style={{ background: selectedBoardLine.type === "draw" ? selectedBoardLine.color ?? lineColors.draw : lineColors[selectedBoardLine.type] }} /><span><strong>{lineLabels[selectedBoardLine.type]}{selectedBoardLine.type === "draw" ? "" : " 경로"}</strong><small>{selectedBoardLine.type === "draw" ? "자유롭게 그린 정적 주석입니다." : "피치의 점을 끌어 경로를 수정할 수 있습니다."}</small></span></div>
          {selectedBoardLine.type === "draw" ? <>
            <section className="properties-section">
              <header><strong>펜 색상</strong></header>
              <div className="drawing-color-options">{drawingColors.map((color) => <button type="button" key={color} aria-label={`펜 색상 ${color}`} aria-pressed={(selectedBoardLine.color ?? lineColors.draw) === color} style={{ "--drawing-color": color } as CSSProperties} onClick={() => updateSelectedLine({ color })}><i /></button>)}</div>
            </section>
            <section className="properties-section">
              <header><strong>선 굵기</strong></header>
              <div className="property-segmented-control" aria-label="선 굵기"><button type="button" aria-pressed={(selectedBoardLine.strokeWidth ?? 2.4) === 1.6} onClick={() => updateSelectedLine({ strokeWidth: 1.6 })}>얇게</button><button type="button" aria-pressed={(selectedBoardLine.strokeWidth ?? 2.4) === 2.4} onClick={() => updateSelectedLine({ strokeWidth: 2.4 })}>보통</button><button type="button" aria-pressed={(selectedBoardLine.strokeWidth ?? 2.4) === 3.6} onClick={() => updateSelectedLine({ strokeWidth: 3.6 })}>굵게</button></div>
            </section>
          </> : <>
            <section className="properties-section">
              <header><strong>{sequenceOpen ? "움직임 종류" : "선 종류"}</strong></header>
              <div className="property-action-types">{lineTools.map((item) => <button type="button" key={item.id} aria-pressed={selectedBoardLine.type === item.id} onClick={() => updateSelectedLine({ type: item.id as TrainingBoardLineType })}><i style={{ background: lineColors[item.id as TrainingBoardLineType] }} />{item.label}</button>)}</div>
            </section>
            <section className="properties-section">
              <header><strong>경로</strong><small>{sequenceOpen ? "움직일 요소와 곡선을 정합니다." : "선의 방향과 곡선만 정합니다."}</small></header>
              {sequenceOpen ? <label className="properties-wide-field"><span>움직일 요소</span><select aria-label="움직일 요소" value={selectedBoardLine.sourceItemId ?? ""} onChange={(event) => updateSelectedLine({ sourceItemId: event.target.value || undefined })}><option value="">경로만 표시</option>{board.items.filter(isAnimationMovableItem).map((item) => <option value={item.id} key={item.id}>{boardItemDisplayLabel(item)}</option>)}</select></label> : null}
              <div className="property-segmented-control" aria-label="곡선 방향"><button type="button" aria-pressed={selectedLineCurveDirection === -1} onClick={() => setSelectedLineCurve(-1)}>왼쪽</button><button type="button" aria-pressed={selectedLineCurveDirection === 0} onClick={() => setSelectedLineCurve(0)}>직선</button><button type="button" aria-pressed={selectedLineCurveDirection === 1} onClick={() => setSelectedLineCurve(1)}>오른쪽</button></div>
            </section>
            {sequenceOpen ? <section className="properties-section">
              <header><strong>움직임 속도</strong><small>재생 속도만 선택합니다.</small></header>
              <label className="properties-wide-field"><span>속도</span><select value={selectedBoardLine.duration ?? 2} onChange={(event) => updateSelectedLine({ duration: Number(event.target.value) })}><option value="1">빠르게</option><option value="2">보통</option><option value="3.5">천천히</option></select></label>
            </section> : null}
            {sequenceOpen && selectedSequenceGroup ? <section className="properties-section sequence-step-properties">
              <header><strong>{selectedSequenceStep}번 시퀀스</strong><small>{selectedSequenceGroup.lines.length > 1 ? `${selectedSequenceGroup.lines.length}개 동시 실행` : "한 동작"}</small></header>
              <div className="sequence-step-property-actions">
                <button type="button" onClick={() => duplicateSequenceGroup(selectedSequenceStep)}>시퀀스 복제</button>
                <button type="button" aria-pressed={selectedSequenceGroup.pauseAfter >= .8} onClick={() => toggleSequenceGroupPause(selectedSequenceStep)}>{selectedSequenceGroup.pauseAfter >= .8 ? "멈춤 해제" : "잠시 멈춤"}</button>
                <button type="button" className="danger" onClick={() => deleteSequenceGroup(selectedSequenceStep)}>시퀀스 삭제</button>
              </div>
            </section> : null}
          </>}
          <footer className="properties-panel-actions"><button type="button" onClick={duplicateSelection}>{selectedBoardLine.type === "draw" ? "그림 복제" : sequenceOpen ? "움직임 복제" : "선 복제"}</button><button type="button" className="danger" onClick={deleteSelection}>{selectedBoardLine.type === "draw" ? "그림 삭제" : sequenceOpen ? "움직임 삭제" : "선 삭제"}</button></footer>
        </> : boardFocus ? <div className="properties-idle-state" aria-hidden="true" /> : <>
          <header><div><strong>{builderMode === "set-piece" ? "전술 정보" : "훈련 정보"}</strong><small>{builderMode === "set-piece" ? "이름과 상황만 정하고 바로 작전판을 편집하세요." : "이 훈련 하나를 실행하는 데 필요한 내용입니다."}</small></div></header>
          {builderMode === "set-piece" ? <>
            <section className="set-piece-builder-meta">
              <label><span>상황</span><select value={setPieceType} onChange={(event) => setSetPieceType(event.target.value as typeof setPieceType)}><option value="corner">코너킥</option><option value="free-kick">프리킥</option><option value="throw-in">스로인</option><option value="kickoff">킥오프</option></select></label>
              <label><span>국면</span><select value={setPiecePhase} onChange={(event) => setSetPiecePhase(event.target.value as typeof setPiecePhase)}><option value="attack">공격</option><option value="defense">수비</option></select></label>
            </section>
            <div className="session-builder-field-grid set-piece-simple-fields">
              <label className="full"><span>전술 이름</span><input value={selectedBlock.title} onChange={(event) => updateBlock(selectedBlock.id, { title: event.target.value })} placeholder="예: 코너킥 니어 스크린" /></label>
            </div>
            <div className="properties-empty-guide"><strong>작전판 편집</strong><p>선수·공·장비 또는 움직임 선을 선택하면 이 영역이 해당 속성 패널로 바뀝니다.</p></div>
          </> : <>
            <nav className="training-info-tabs" aria-label="훈련 정보 구분">
              <button type="button" aria-pressed={trainingInfoTab === "basic"} onClick={() => setTrainingInfoTab("basic")}>기본</button>
              <button type="button" aria-pressed={trainingInfoTab === "operation"} onClick={() => setTrainingInfoTab("operation")}>운영</button>
              <button type="button" aria-pressed={trainingInfoTab === "setup"} onClick={() => setTrainingInfoTab("setup")}>준비</button>
            </nav>
            {trainingInfoTab === "basic" ? <div className="session-builder-field-grid training-info-pane">
              <label className="full"><span>훈련 이름</span><input value={selectedBlock.title} onChange={(event) => updateBlock(selectedBlock.id, { title: event.target.value })} placeholder="예: 전환 게임 6v6+3" /></label>
              <label><span>시간</span><div className="input-unit"><input type="number" min={5} step={5} value={selectedBlock.duration} onChange={(event) => updateBlock(selectedBlock.id, { duration: Math.max(5, Number(event.target.value)) })} /><i>분</i></div></label>
              <label><span>강도</span><select value={selectedBlock.intensity ?? "Medium"} onChange={(event) => updateBlock(selectedBlock.id, { intensity: event.target.value as TrainingIntensity })}>{Object.entries(intensityLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
              <label className="full"><span>목적</span><textarea value={selectedBlock.objective ?? ""} onChange={(event) => updateBlock(selectedBlock.id, { objective: event.target.value })} placeholder="이 훈련을 왜 하는지 짧게 적어주세요." /></label>
            </div> : null}
            {trainingInfoTab === "operation" ? <div className="session-builder-field-grid training-info-pane operation-pane">
              <label className="full"><span>진행 방법</span><textarea value={selectedBlock.method ?? ""} onChange={(event) => updateBlock(selectedBlock.id, { method: event.target.value })} placeholder="선수들이 무엇을 어떻게 하는지 순서대로 적어주세요." /></label>
              <label className="full"><span>룰·제한 조건</span><textarea value={selectedBlock.rules ?? ""} onChange={(event) => updateBlock(selectedBlock.id, { rules: event.target.value })} placeholder="터치 수, 득점 조건, 역할 전환 규칙을 적어주세요." /></label>
            </div> : null}
            {trainingInfoTab === "setup" ? <div className="training-info-pane setup-pane">
              <section className="session-builder-keypoints compact-keypoints">
                <header><strong>핵심 포인트</strong><small>현장에서 볼 내용만 3개까지</small></header>
                {keyPoints.map((point, index) => <label key={index}><span>{index + 1}</span><input value={point} onChange={(event) => {
                  const next = [...keyPoints];
                  next[index] = event.target.value;
                  updateBlock(selectedBlock.id, { keyPoints: next, point: next.find(Boolean) ?? "" });
                }} placeholder={index === 0 ? "가장 중요한 코칭 포인트" : "선택 입력"} /></label>)}
              </section>
              <div className="session-builder-field-grid compact-training-setup">
                <label><span>참여 대상</span><input value={selectedBlock.playerCount ?? ""} onChange={(event) => updateBlock(selectedBlock.id, { playerCount: event.target.value, group: event.target.value })} placeholder="전체 26명" /></label>
                <label><span>구역</span><input value={selectedBlock.area ?? ""} onChange={(event) => updateBlock(selectedBlock.id, { area: event.target.value })} placeholder="40×30m" /></label>
                <label className="full"><span>장비</span><input value={selectedBlock.equipment ?? ""} onChange={(event) => updateBlock(selectedBlock.id, { equipment: event.target.value })} placeholder="볼 · 콘 · 조끼" /></label>
                <label className="full"><span>성공 기준</span><textarea value={selectedBlock.successCriteria ?? ""} onChange={(event) => updateBlock(selectedBlock.id, { successCriteria: event.target.value })} /></label>
              </div>
            </div> : null}
          </>}
        </>}
      </aside>
    </div>
  </div>;
}
