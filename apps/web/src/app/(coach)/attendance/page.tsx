import type { Metadata } from "next";
import { AttendanceView } from "@/features/coach-attendance/attendance-view";
export const metadata: Metadata = { title: "출석 현황" };
export default function AttendancePage() { return <AttendanceView />; }
