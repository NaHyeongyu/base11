import type { Metadata } from "next";
import { TrainingTemplatesView } from "@/features/coach-schedule/training-templates-view";

export const metadata: Metadata = { title: "훈련 템플릿" };

export default function TrainingTemplatesPage() {
  return <TrainingTemplatesView />;
}
