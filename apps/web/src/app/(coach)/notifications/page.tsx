import type { Metadata } from "next";
import { NotificationsView } from "@/features/coach-notifications/notifications-view";
export const metadata: Metadata = { title: "알림" };
export default function NotificationsPage() { return <NotificationsView />; }
