import type { Metadata } from "next";
import { NoticesView } from "@/features/coach-notices/notices-view";
export const metadata: Metadata = { title: "공지 센터" };
export default function NoticesPage() { return <NoticesView />; }
