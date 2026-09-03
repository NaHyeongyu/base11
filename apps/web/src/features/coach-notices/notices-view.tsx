"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { notices, type NoticeAudience } from "@/features/coach-notices/data/notices-preview-data";
import { ActionButton, Badge, MetricCard, PageHeader, ProgressBar } from "@/shared/ui/components";
import { Icon } from "@/shared/ui/icon";

const audiences: Array<"전체" | NoticeAudience> = ["전체", "선수단", "학부모", "지도자"];
const audienceTone = { 전체: "blue", 선수단: "purple", 학부모: "green", 지도자: "orange" } as const;

export function NoticesView() {
  const [audience, setAudience] = useState<"전체" | NoticeAudience>("전체");
  const [query, setQuery] = useState("");
  const [importantOnly, setImportantOnly] = useState(false);
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return notices.filter((notice) => {
      const matchesAudience = audience === "전체" || notice.audience === audience;
      const matchesImportance = !importantOnly || notice.important;
      const matchesQuery = `${notice.title} ${notice.author}`.toLowerCase().includes(normalizedQuery);
      return matchesAudience && matchesImportance && matchesQuery;
    });
  }, [audience, importantOnly, query]);
  const selected = filtered[0] ?? notices[0];

  return <div className="notice-center-page">
    <PageHeader eyebrow="팀 공지 관리" title="공지" description="공지 작성, 대상 설정, 확인 여부를 한 화면에서 관리합니다." action={<ActionButton>공지 작성</ActionButton>} />
    <div className="metric-grid four compact notice-metrics">
      <MetricCard label="게시 중" value="12개" helper="예약 1개" tone="blue" />
      <MetricCard label="평균 확인율" value="94%" helper="지난달 +3%" tone="green" />
      <MetricCard label="중요 미확인" value="2명" helper="최근 중요 공지" tone="orange" />
      <MetricCard label="이번 달 발송" value="5개" helper="전체 대상 2개" tone="purple" />
    </div>
    <div className="notice-toolbar">
      <div className="audience-tabs">{audiences.map((item) => <button className={audience === item ? "active" : ""} key={item} onClick={() => setAudience(item)}>{item}</button>)}</div>
      <label><Icon name="search" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="공지 제목·작성자 검색" /></label>
      <button className={importantOnly ? "active" : ""} onClick={() => setImportantOnly((value) => !value)}>중요만</button>
      <button>예약 포함</button>
    </div>
    <div className="notice-layout">
      <section className="notice-list-panel">
        <header><div><h2>전체 공지</h2><p>대상과 확인율을 기준으로 관리합니다.</p></div><Badge tone="gray">{filtered.length}개</Badge></header>
        <div className="notice-list-table">
          <div className="notice-list-head"><span>공지</span><span>대상</span><span>작성자</span><span>게시일</span><span>확인율</span><span /></div>
          {filtered.map((notice) => {
            const rate = Math.round(notice.read / notice.total * 100);
            return <Link className={`notice-list-row ${notice.id === selected.id ? "selected" : ""}`} href={`/notices/${notice.id}`} key={notice.id}>
              <div><strong>{notice.title}</strong><small>공지 #{notice.id}{notice.important ? " · 중요" : ""}{notice.scheduled ? " · 예약" : ""}</small></div>
              <Badge tone={audienceTone[notice.audience]}>{notice.audience}</Badge><span>{notice.author}</span><span>{notice.date}</span>
              <div className="notice-rate"><strong>{rate}%</strong><small>{notice.read}/{notice.total}</small><ProgressBar value={rate} tone={rate === 100 ? "green" : "blue"} /></div><Icon name="chevron" size={17} />
            </Link>;
          })}
        </div>
      </section>
      <aside className="notice-audience-panel">
        <header><div><h2>대상별 현황</h2><p>최근 30일 공식 공지</p></div><Badge tone="blue">전체</Badge></header>
        <Link href="/notices/108"><Badge tone="blue">전체</Badge><strong>4개 공지</strong><span>평균 97%</span><Icon name="chevron" size={16} /></Link>
        <Link href="/notices/107"><Badge tone="purple">선수단</Badge><strong>3개 공지</strong><span>평균 89%</span><Icon name="chevron" size={16} /></Link>
        <Link href="/notices/106"><Badge tone="green">학부모</Badge><strong>3개 공지</strong><span>평균 92%</span><Icon name="chevron" size={16} /></Link>
        <Link href="/notices/105"><Badge tone="orange">지도자</Badge><strong>2개 공지</strong><span>평균 80%</span><Icon name="chevron" size={16} /></Link>
        <div className="unread-alert"><small>중요 공지 미확인</small><strong>2명</strong><p>오늘 18:00 재알림 예정</p><button>재알림</button></div>
        <footer><span>최근 작성자</span><div><strong>김태호</strong><strong>최은지</strong><strong>박성진</strong></div></footer>
      </aside>
    </div>
  </div>;
}
