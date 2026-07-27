import type { Metadata } from "next";
import { SessionDetailView } from "@/features/coach-schedule/session-detail-view";

export const metadata: Metadata = { title: "세션 상세" };

export default async function SessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  return <SessionDetailView sessionId={sessionId} />;
}
