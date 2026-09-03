import type { Metadata } from "next";
import { WellbeingView } from "@/features/coach-wellbeing/wellbeing-view";
export const metadata: Metadata = { title: "부상·컨디션" };
export default function WellbeingPage() { return <WellbeingView />; }
