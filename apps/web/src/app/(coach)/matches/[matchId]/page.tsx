import type { Metadata } from "next";
import { SessionDetailView } from "@/features/coach-schedule/session-detail-view";

export const metadata: Metadata = { title: "경기 상세" };

export default async function MatchDetailPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  return <SessionDetailView sessionId={matchId} />;
}
