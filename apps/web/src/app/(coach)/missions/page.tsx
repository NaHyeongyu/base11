import type { Metadata } from "next";
import { MissionsView } from "@/features/coach-missions/missions-view";
export const metadata: Metadata = { title: "선수 목표" };
export default function MissionsPage() { return <MissionsView />; }
