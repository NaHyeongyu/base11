import type { Metadata } from "next";
import { MatchesView } from "@/features/coach-matches/matches-view";
export const metadata: Metadata = { title: "경기 기록" };
export default function MatchesPage() { return <MatchesView />; }
