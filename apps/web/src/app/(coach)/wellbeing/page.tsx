import type { Metadata } from "next";
import { WellbeingView } from "@/features/coach-wellbeing/wellbeing-view";
export const metadata: Metadata = { title: "선수 이슈" };
export default function WellbeingPage() { return <WellbeingView />; }
