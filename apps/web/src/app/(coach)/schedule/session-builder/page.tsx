import type { Metadata } from "next";
import { Suspense } from "react";
import { TrainingSessionBuilder } from "@/features/coach-schedule/training-session-builder";

export const metadata: Metadata = { title: "개별 훈련 만들기" };

export default function TrainingSessionBuilderPage() {
  return <Suspense fallback={<div className="session-builder-loading"><span /><strong>작전판을 준비하고 있어요</strong></div>}>
    <TrainingSessionBuilder />
  </Suspense>;
}
