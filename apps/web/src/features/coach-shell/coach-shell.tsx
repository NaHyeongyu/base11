"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon, type IconName } from "@/shared/ui/icon";

type NavigationItem = { href: string; label: string; icon: IconName };

const navigationSections: Array<{ label: string; items: NavigationItem[] }> = [
  {
    label: "홈",
    items: [{ href: "/dashboard", label: "오늘", icon: "home" }],
  },
  {
    label: "선수 관리",
    items: [
      { href: "/roster", label: "선수단", icon: "users" },
      { href: "/wellbeing", label: "부상·컨디션", icon: "heart" },
    ],
  },
  {
    label: "훈련·경기",
    items: [
      { href: "/schedule", label: "훈련 관리", icon: "calendar" },
      { href: "/matches", label: "경기 관리", icon: "match" },
    ],
  },
];

const mobileNavigation: NavigationItem[] = [
  { href: "/dashboard", label: "오늘", icon: "home" },
  { href: "/roster", label: "선수단", icon: "users" },
  { href: "/schedule", label: "훈련", icon: "calendar" },
  { href: "/wellbeing", label: "컨디션", icon: "heart" },
];

const secondaryNavigation: Array<{ href: string; label: string; description: string; icon: IconName }> = [
  { href: "/missions", label: "선수 목표", description: "목표와 성장 점검", icon: "target" },
  { href: "/feedback", label: "피드백", description: "개선 과제 검토·전달", icon: "feedback" },
  { href: "/performance", label: "퍼포먼스", description: "GPS·RPE 데이터", icon: "download" },
  { href: "/staff-review", label: "스태프 검토", description: "의견·결정 기록", icon: "users" },
  { href: "/notices", label: "공지", description: "팀 공지 작성·확인", icon: "notice" },
  { href: "/notifications", label: "알림", description: "변경·마감 확인", icon: "bell" },
];

function isCurrentPath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function CoachShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [secondaryOpen, setSecondaryOpen] = useState(false);
  const trainingBuilderFocus = pathname.startsWith("/schedule/session-builder");
  const secondaryActive = secondaryNavigation.some((item) => isCurrentPath(pathname, item.href));

  if (trainingBuilderFocus) {
    return <div className="session-builder-focus-shell">
      <main className="session-builder-focus-content">{children}</main>
    </div>;
  }

  return (
    <div className="coach-shell simple-coach-shell">
      <aside className={`coach-sidebar simple-sidebar ${open ? "is-open" : ""}`}>
        <div className="simple-brand">
          <Link href="/dashboard" onClick={() => setOpen(false)} aria-label="BASE11 오늘 홈">
            <span className="simple-brand-mark">B11</span>
            <span className="simple-brand-copy">
              <strong>BASE11</strong>
              <small>지도자용</small>
            </span>
          </Link>
          <button className="sidebar-close" onClick={() => setOpen(false)} aria-label="메뉴 닫기">
            <Icon name="close" />
          </button>
        </div>

        <Link className="simple-team-selector" href="/team" onClick={() => setOpen(false)} data-label="FC 성남 U15 · 팀 설정" aria-label="FC 성남 U15 팀 설정">
          <span className="simple-team-crest">S</span>
          <span className="simple-team-copy"><small>2026 시즌</small><strong>FC 성남 U15</strong></span>
          <Icon name="chevron" size={16} />
        </Link>

        <nav className="simple-nav" aria-label="지도자 주요 메뉴">
          {navigationSections.map((section) => <section className="simple-nav-section" key={section.label} aria-label={section.label}>
            <p className="simple-nav-label">{section.label}</p>
            <div>
              {section.items.map((item) => {
                const active = isCurrentPath(pathname, item.href);
                return <Link key={item.href} href={item.href} className={active ? "active" : ""} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined} data-label={item.label}>
                  <Icon name={item.icon} size={19} /><span>{item.label}</span>
                </Link>;
              })}
            </div>
          </section>)}
        </nav>

        <div className={`simple-secondary-menu ${secondaryOpen ? "is-open" : ""}`}>
          <button
            className={secondaryActive ? "active" : ""}
            type="button"
            onClick={() => setSecondaryOpen((value) => !value)}
            aria-expanded={secondaryOpen}
            aria-controls="coach-secondary-navigation"
            data-label="더 많은 업무"
          >
            <Icon name="more" size={20} /><span>더보기</span>
          </button>
          {secondaryOpen && <nav id="coach-secondary-navigation" aria-label="지도자 전체 업무">
            <header><strong>전체 업무</strong><small>필요할 때만 열어 사용합니다.</small></header>
            {secondaryNavigation.map((item) => {
              const active = isCurrentPath(pathname, item.href);
              return <Link key={item.href} href={item.href} className={active ? "active" : ""} onClick={() => { setOpen(false); setSecondaryOpen(false); }} aria-current={active ? "page" : undefined}>
                <span><Icon name={item.icon} size={18} /></span>
                <span><strong>{item.label}</strong><small>{item.description}</small></span>
                <Icon name="chevron" size={15} />
              </Link>;
            })}
          </nav>}
        </div>

        <Link className={`simple-profile ${pathname === "/team" ? "active" : ""}`} href="/team" onClick={() => setOpen(false)} data-label="팀 및 계정 설정" aria-label="팀 및 계정 설정">
          <span className="simple-avatar">김</span>
          <span><strong>김도윤 지도자</strong><small>감독 · 관리자</small></span>
          <Icon name="settings" size={17} />
        </Link>
      </aside>
      {open && <button className="sidebar-backdrop" onClick={() => setOpen(false)} aria-label="메뉴 닫기" />}

      <div className="coach-main simple-main">
        <header className="simple-mobile-header">
          <button onClick={() => setOpen(true)} aria-label="메뉴 열기"><Icon name="menu" /></button>
          <Link href="/dashboard">BASE11 <small>COACH</small></Link>
          <span className="mobile-save-state"><i />저장됨</span>
        </header>
        <main className="coach-content simple-content">{children}</main>
      </div>

      <nav className="simple-bottom-nav" aria-label="모바일 지도자 주요 메뉴">
        {mobileNavigation.map((item) => {
          const active = isCurrentPath(pathname, item.href);
          return <Link key={item.href} href={item.href} className={active ? "active" : ""} aria-current={active ? "page" : undefined}>
            <Icon name={item.icon} size={21} /><span>{item.label}</span>
          </Link>;
        })}
      </nav>
    </div>
  );
}
