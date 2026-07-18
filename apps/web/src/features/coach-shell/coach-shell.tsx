"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon, type IconName } from "./icon";

const navigation: Array<{ href: string; label: string; icon: IconName }> = [
  { href: "/dashboard", label: "운영 대시보드", icon: "home" },
  { href: "/schedule", label: "일정 관리", icon: "calendar" },
  { href: "/notices", label: "공지 센터", icon: "notice" },
  { href: "/attendance", label: "출석 현황", icon: "check" },
  { href: "/wellbeing", label: "컨디션·부상", icon: "heart" },
  { href: "/missions", label: "선수 미션", icon: "target" },
  { href: "/feedback", label: "피드백", icon: "feedback" },
  { href: "/matches", label: "경기 기록", icon: "match" },
  { href: "/roster", label: "선수단", icon: "users" },
];

export function CoachShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="coach-shell">
      <aside className={`coach-sidebar ${open ? "is-open" : ""}`}>
        <div className="sidebar-brand">
          <span className="brand-mark">B11</span>
          <div><strong>BASE11</strong><small>COACH OFFICE</small></div>
          <button className="sidebar-close" onClick={() => setOpen(false)} aria-label="메뉴 닫기"><Icon name="close" /></button>
        </div>

        <button className="team-selector">
          <span className="team-crest">A</span>
          <span><small>2026 시즌</small><strong>FC 안양 U18</strong></span>
          <Icon name="chevron" size={16} />
        </button>

        <nav className="coach-nav" aria-label="지도자 메뉴">
          <p>TEAM MANAGEMENT</p>
          {navigation.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={active ? "active" : ""} onClick={() => setOpen(false)}>
                <Icon name={item.icon} /><span>{item.label}</span>{item.href === "/feedback" && <em>5</em>}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-profile">
          <span className="avatar avatar-dark">김</span>
          <span><strong>김태호 감독</strong><small>Head Coach</small></span>
          <Icon name="more" />
        </div>
      </aside>
      {open && <button className="sidebar-backdrop" onClick={() => setOpen(false)} aria-label="메뉴 닫기" />}

      <div className="coach-main">
        <header className="coach-topbar">
          <button className="mobile-menu" onClick={() => setOpen(true)} aria-label="메뉴 열기"><Icon name="menu" /></button>
          <label className="global-search">
            <Icon name="search" size={18} />
            <input placeholder="선수, 일정, 공지를 검색하세요" aria-label="통합 검색" />
            <kbd>⌘ K</kbd>
          </label>
          <div className="topbar-actions">
            <span className="sync-state"><i />모든 변경사항 저장됨</span>
            <Link href="/notifications" className={`icon-button ${pathname === "/notifications" ? "active" : ""}`} aria-label="알림">
              <Icon name="bell" /><b>3</b>
            </Link>
            <span className="top-avatar">김</span>
          </div>
        </header>
        <main className="coach-content">{children}</main>
      </div>
    </div>
  );
}
