import type { Metadata } from "next";
import { StaffReviewView } from "@/features/coach-staff-review/staff-review-view";

export const metadata: Metadata = { title: "스태프 검토" };
export default function StaffReviewPage() { return <StaffReviewView />; }
