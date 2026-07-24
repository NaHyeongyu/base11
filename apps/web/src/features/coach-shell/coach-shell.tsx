"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon, type IconName } from "@/shared/ui/icon";

const navigation: Array<{ title: string; items: Array<{ href: string; label: string; icon: IconName; badge?: number }> }> = [
  { title: "COACHING FLOW", items: [
    { href: "/dashboard", label: "마이크로사이클", icon: "home" },
    { href: "/schedule", label: "주간 계획", icon: "calendar" },
    { href: "/staff-review", label: "스태프 검토", icon: "feedback", badge: 3 },
  ] },
  { title: "PLAYER & DATA", items: [
    { href: "/missions", label: "선수 목표", icon: "target" },
    { href: "/feedback", label: "회고·피드백", icon: "feedback", badge: 5 },
    { href: "/wellbeing", label: "선수 이슈", icon: "heart" },
    { href: "/performance", label: "퍼포먼스 데이터", icon: "download" },
    { href: "/matches", label: "경기 기록", icon: "match" },
  ] },
  { title: "TEAM", items: [
    { href: "/roster", label: "선수단", icon: "users" },
    { href: "/notices", label: "역할별 게시", icon: "notice" },
    { href: "/team", label: "팀·권한", icon: "shield" },
  ] },
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

        <Link className={`team-selector ${pathname === "/team" ? "is-active" : ""}`} href="/team" onClick={() => setOpen(false)}>
          <span className="team-crest">A</span>
          <span><small>2026 시즌</small><strong>FC 안양 U18</strong></span>
          <Icon name="chevron" size={16} />
        </Link>

        <nav className="coach-nav" aria-label="지도자 메뉴">
          {navigation.map((group) => <div className="nav-group" key={group.title}>
            <p>{group.title}</p>
            {group.items.map((item) => {
              const active = pathname === item.href;
              return <Link key={item.href} href={item.href} className={active ? "active" : ""} onClick={() => setOpen(false)}>
                <Icon name={item.icon} /><span>{item.label}</span>{item.badge && <em>{item.badge}</em>}
              </Link>;
            })}
          </div>)}
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
            <input placeholder="선수, 세션, 목표, 데이터를 검색하세요" aria-label="통합 검색" />
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
