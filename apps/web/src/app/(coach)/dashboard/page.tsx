import type { Metadata } from "next";
import { DashboardView } from "@/features/coach-dashboard/dashboard-view";

export const metadata: Metadata = { title: "운영 대시보드" };
export default function DashboardPage() { return <DashboardView />; }
