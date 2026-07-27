import type { Metadata } from "next";
import { NoticeDetailView } from "@/features/coach-notices/notice-detail-view";

export const metadata: Metadata = { title: "공지 상세" };

export default async function NoticePage({ params }: { params: Promise<{ noticeId: string }> }) {
  const { noticeId } = await params;
  return <NoticeDetailView noticeId={Number(noticeId)} />;
}
