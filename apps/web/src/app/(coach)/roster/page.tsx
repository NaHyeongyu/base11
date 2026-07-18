import type { Metadata } from "next";
import { RosterView } from "@/features/coach-roster/roster-view";
export const metadata: Metadata = { title: "선수단" };
export default function RosterPage() { return <RosterView />; }
