import type { Metadata } from "next";
import { PlayerDetailView } from "@/features/coach-roster/player-detail-view";

export const metadata: Metadata = { title: "선수 상세" };

export default async function PlayerPage({ params }: { params: Promise<{ playerId: string }> }) {
  const { playerId } = await params;
  return <PlayerDetailView playerId={Number(playerId)} />;
}
