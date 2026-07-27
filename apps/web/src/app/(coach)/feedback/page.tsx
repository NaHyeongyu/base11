import type { Metadata } from "next";
import { FeedbackView } from "@/features/coach-feedback/feedback-view";
export const metadata: Metadata = { title: "추천 개선 과제" };
export default function FeedbackPage() { return <FeedbackView />; }
