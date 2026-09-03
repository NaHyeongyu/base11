"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "@/shared/ui/icon";

const decisions = [
  { player: "이도윤", detail: "발목 통증 3/10", action: "참가 범위 결정", href: "/roster/3", tone: "warning" },
  { player: "윤시우", detail: "재활 프로그램", action: "훈련 제외 확인", href: "/roster/7", tone: "danger" },
  { player: "U15 경기 엔트리", detail: "2명 미정", action: "엔트리 확인", href: "/matches", tone: "neutral" },
] as const;

const todaySchedule = [
  { time: "09:30", title: "인터벌 러닝", meta: "U15 · 24명", status: "준비 완료", href: "/schedule" },
  { time: "14:00", title: "수원전 팀 미팅", meta: "분석실", status: "장소 확인 필요", href: "/schedule" },
  { time: "17:00", title: "팀 훈련", meta: "U15 · 보조구장", status: "참가 확인 후 시작", href: "/schedule" },
] as const;

const quickActions: Array<{ title: string; description: string; href: string; icon: IconName }> = [
  { title: "훈련", description: "시간과 장소만 먼저 입력", href: "/schedule?create=training", icon: "target" },
  { title: "경기", description: "상대 팀과 날짜부터 등록", href: "/schedule?create=match", icon: "match" },
  { title: "선수", description: "이름과 소속부터 등록", href: "/roster", icon: "users" },
];

export function DashboardView() {
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const formattedToday = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date());

  useEffect(() => {
    if (!quickAddOpen) return;
    dialogRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setQuickAddOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [quickAddOpen]);

  return (
    <div className="today-page">
      <header className="today-header">
        <div>
          <p>{formattedToday}</p>
          <h1>오늘</h1>
          <span>지금 확인하고 처리할 일만 모았습니다.</span>
        </div>
        <button className="today-primary-button" onClick={() => setQuickAddOpen(true)}>
          <Icon name="plus" size={18} />빠른 추가
        </button>
      </header>

      <section className="today-summary" aria-label="오늘 요약">
        <div><strong>3</strong><span>확인할 일</span></div>
        <i />
        <div><strong>3</strong><span>오늘 일정</span></div>
        <i />
        <div><strong>23</strong><span>훈련 가능</span></div>
      </section>

      <div className="today-grid">
        <section className="today-card decision-card">
          <header>
            <div><h2>확인이 필요해요</h2><p>오늘 참여 범위나 준비 상태를 결정할 항목입니다.</p></div>
            <span className="count-badge">3건</span>
          </header>
          <div className="today-list">
            {decisions.map((item) => (
              <Link href={item.href} className="today-list-row" key={item.player}>
                <span className={`status-dot ${item.tone}`} />
                <span className="today-row-copy">
                  <strong>{item.player}</strong>
                  <span>{item.detail}</span>
                </span>
                <span className="row-action">{item.action}</span>
                <Icon name="chevron" size={18} />
              </Link>
            ))}
          </div>
          <Link href="/wellbeing" className="today-card-footer">부상·컨디션에서 모두 보기 <Icon name="chevron" size={16} /></Link>
        </section>

        <section className="today-card schedule-card">
          <header>
            <div><h2>오늘 일정</h2><p>일정에서 준비하고 현장 기록까지 이어집니다.</p></div>
            <Link href="/schedule" className="quiet-link">전체 일정</Link>
          </header>
          <div className="today-list">
            {todaySchedule.map((item, index) => (
              <Link href={item.href} className="today-list-row schedule-row" key={`${item.time}-${item.title}`}>
                <time>{item.time}</time>
                <span className="today-row-copy">
                  <strong>{item.title}</strong>
                  <span>{item.meta}</span>
                </span>
                <span className={index === 1 ? "row-action needs-check" : "row-action"}>{item.status}</span>
                <Icon name="chevron" size={18} />
              </Link>
            ))}
          </div>
          <Link href="/schedule" className="today-card-footer">오늘 훈련 준비 이어서 하기 <Icon name="chevron" size={16} /></Link>
        </section>
      </div>

      <aside className="offline-notice" role="status">
        <span><Icon name="check" size={18} /></span>
        <div><strong>모든 내용이 저장됐습니다</strong><p>연결이 끊겨도 입력한 내용은 이 기기에 보관됩니다.</p></div>
      </aside>

      {quickAddOpen && (
        <div className="quick-add-backdrop" role="presentation" onMouseDown={() => setQuickAddOpen(false)}>
          <div
            className="quick-add-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-add-title"
            tabIndex={-1}
            ref={dialogRef}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <div><p>빠른 추가</p><h2 id="quick-add-title">무엇을 추가할까요?</h2></div>
              <button onClick={() => setQuickAddOpen(false)} aria-label="빠른 추가 닫기"><Icon name="close" /></button>
            </header>
            <div className="quick-add-options">
              {quickActions.map((action) => (
                <Link href={action.href} key={action.title} onClick={() => setQuickAddOpen(false)}>
                  <span><Icon name={action.icon} size={22} /></span>
                  <span><strong>{action.title}</strong><small>{action.description}</small></span>
                  <Icon name="chevron" size={18} />
                </Link>
              ))}
            </div>
            <p className="quick-add-help">나머지 내용은 저장한 뒤 이어서 입력할 수 있습니다.</p>
          </div>
        </div>
      )}
    </div>
  );
}
