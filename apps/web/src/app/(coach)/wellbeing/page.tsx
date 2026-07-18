import type { Metadata } from "next";
import { WellbeingView } from "@/features/coach-wellbeing/wellbeing-view";
export const metadata: Metadata = { title: "컨디션·부상" };
export default function WellbeingPage() { return <WellbeingView />; }
