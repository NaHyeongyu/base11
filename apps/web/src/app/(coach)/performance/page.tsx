import type { Metadata } from "next";
import { PerformanceView } from "@/features/coach-performance/performance-view";

export const metadata: Metadata = { title: "퍼포먼스 데이터" };
export default function PerformancePage() { return <PerformanceView />; }
