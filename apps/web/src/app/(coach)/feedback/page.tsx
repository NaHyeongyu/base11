import type { Metadata } from "next";
import { FeedbackView } from "@/features/coach-feedback/feedback-view";
export const metadata: Metadata = { title: "회고·피드백" };
export default function FeedbackPage() { return <FeedbackView />; }
