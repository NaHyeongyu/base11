"use client";

import { useRef, useState } from "react";
import { performanceImports } from "@/features/coach-performance/data/performance-preview-data";
import { Badge, MetricCard, PageHeader, Panel, ProgressBar } from "@/shared/ui/components";
import { Icon } from "@/shared/ui/icon";

type ImportStep = "idle" | "mapping" | "ready";

export function PerformanceView() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<ImportStep>("idle");
  const [fileName, setFileName] = useState("");

  return <>
    <PageHeader eyebrow="훈련·경기 데이터" title="퍼포먼스 데이터" description="GPS·RPE 파일을 세션과 선수에 연결하고 누락된 데이터만 확인합니다." action={<button className="action-button" onClick={() => inputRef.current?.click()}><Icon name="download" size={17} />파일 가져오기</button>} />
    <input ref={inputRef} hidden type="file" accept=".xlsx,.xls,.csv" onChange={(event) => { const file = event.target.files?.[0]; if (file) { setFileName(file.name); setStep("mapping"); } }} />
    <div className="metric-grid four compact">
      <MetricCard label="연결 세션" value="18 / 21" helper="최근 30일" tone="blue" />
      <MetricCard label="선수 매칭" value="99.2%" helper="이름·등번호 기준" tone="green" />
      <MetricCard label="연결 업체" value="3개" helper="STATSports · Catapult · RPE" tone="purple" />
      <MetricCard label="확인 필요" value="1건" helper="선수 중복 매칭" tone="orange" />
    </div>

    {step !== "idle" && <Panel title="새 데이터 가져오기" description={fileName} action={<Badge tone={step === "ready" ? "green" : "blue"}>{step === "ready" ? "가져오기 준비" : "열 매핑"}</Badge>}>
      <div className="import-stepper"><div className="done"><span>1</span><strong>파일</strong></div><i /><div className="current"><span>2</span><strong>열 매핑</strong></div><i /><div className={step === "ready" ? "current" : ""}><span>3</span><strong>검증·저장</strong></div></div>
      <div className="mapping-grid">
        {[['선수 식별자','Athlete Name','필수'],['총 거리','Total Distance (m)','필수'],['고속 주행','HSR Distance','선택'],['최고 속도','Max Speed (km/h)','선택'],['스프린트','Sprint Count','선택'],['세션 RPE','RPE','선택']].map(([target,source,required]) => <div key={target}><span><strong>{target}</strong><small>{required}</small></span><Icon name="chevron" size={15} /><select defaultValue={source}><option>{source}</option><option>매핑 안 함</option></select></div>)}
      </div>
      <div className="mapping-footer"><span><Icon name="shield" size={17} />원본 파일과 매핑 규칙을 함께 보관합니다.</span><button onClick={() => setStep("ready")}>{step === "ready" ? "MD-2 세션에 저장" : "26명 데이터 검증"}</button></div>
    </Panel>}

    <div className="content-grid performance-layout">
      <Panel title="최근 가져오기" description="원본·매핑·수정 이력을 추적할 수 있습니다.">
        <div className="import-history">{performanceImports.map((item) => <article key={item.file}><span className="file-icon">XLS</span><div><strong>{item.file}</strong><small>{item.source} · {item.importedAt}</small></div><span><strong>{item.mapped} / {item.rows}</strong><small>선수 매칭</small></span><Badge tone={item.tone}>{item.status}</Badge><button><Icon name="more" size={16} /></button></article>)}</div>
      </Panel>
      <Panel title="세션 데이터 완성도" description="다음 계획에 사용할 수 있는 데이터 상태입니다.">
        <div className="data-completeness"><div><span>MD-4 연습 경기</span><strong>96%</strong></div><ProgressBar value={96} tone="green" /><div><span>MD-5 빌드업 원칙</span><strong>88%</strong></div><ProgressBar value={88} tone="blue" /><div><span>MD-6 회복·리셋</span><strong>100%</strong></div><ProgressBar value={100} tone="green" /></div>
        <div className="data-rule"><Icon name="target" size={19} /><span><strong>세션이 기준입니다</strong><small>훈련 계획, GPS, RPE, 선수 회고와 목표를 같은 세션 ID에 연결합니다.</small></span></div>
      </Panel>
    </div>
  </>;
}
