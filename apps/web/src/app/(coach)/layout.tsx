import { CoachShell } from "@/features/coach-shell/coach-shell";

export default function CoachLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <CoachShell>{children}</CoachShell>;
}
