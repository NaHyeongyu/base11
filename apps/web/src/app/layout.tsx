import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "BASE11 Coach",
    template: "%s · BASE11 Coach",
  },
  description: "유소년 축구팀 운영을 위한 디지털 클럽하우스",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
