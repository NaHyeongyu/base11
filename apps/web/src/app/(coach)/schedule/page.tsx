import type { Metadata } from "next";
import { ScheduleView } from "@/features/coach-schedule/schedule-view";
export const metadata: Metadata = { title: "일정 관리" };
export default function SchedulePage() { return <ScheduleView />; }
