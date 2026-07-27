"use client";

import Link from "next/link";
import { useState } from "react";
import { notices } from "@/features/coach-notices/data/notices-preview-data";
import { Badge, ProgressBar } from "@/shared/ui/components";
import { Icon } from "@/shared/ui/icon";

export function NoticeDetailView({ noticeId }: { noticeId: number }) {
  const notice = notices.find((item) => item.id === noticeId) ?? notices[0];
  const [reminded, setReminded] = useState(false);
  return <div className="notice-detail-page">
    <Link href="/notices" className="session-back">‹ 공지 센터로 돌아가기</Link>
    <section className="notice-detail-hero">
      <div><span><Badge tone="blue">{notice.audience}</Badge><Badge tone="red">중요</Badge></span><h1>{notice.title}</h1><p>{notice.author} · {notice.date} · 공지 #{notice.id} · 마지막 수정 10:31</p></div>
      <div><small>전달 대상</small><strong>선수단 26 · 학부모 26 · 지도자 5</strong><span><button>복제</button><button onClick={() => setReminded(true)}>{reminded ? "재알림 예약됨" : "재알림"}</button></span></div>
    </section>
    <div className="notice-detail-layout">
      <main>
        <section className="notice-detail-card notice-content-card"><h2>공지 내용</h2><p>주말 원정경기 일정 조정과 금요일 훈련 시간 변경을 안내합니다.</p><dl><div><dt>훈련 변경</dt><dd>7/25(금) 훈련 17:30 → 18:00 · B구장</dd></div><div><dt>경기 일정</dt><dd>7/27(일) 수원FC U18전 · 13:30 집합</dd></div><div><dt>준비 사항</dt><dd>원정 유니폼 · 신분증 · 개인 물병</dd></div><div><dt>응답 요청</dt><dd>학부모는 7/25 18:00까지 이동 여부 확인</dd></div></dl></section>
        <section className="role-visibility-card"><h2>대상별 노출 내용</h2><div><article><Badge tone="purple">선수단</Badge><strong>훈련 시간·준비물</strong><p>개인 준비와 집합 시간을 표시</p></article><article><Badge tone="green">학부모</Badge><strong>집합·이동·응답</strong><p>이동 여부와 준비 정보를 표시</p></article><article><Badge tone="orange">지도자</Badge><strong>운영 체크리스트</strong><p>담당자와 확인 마감 표시</p></article></div></section>
        <section className="notice-detail-card related-assets"><h2>관련 일정·첨부</h2><div><Link href="/schedule/match-20260720"><small>일정</small><strong>7/27 수원FC U18전 · 원정</strong></Link><button><small>첨부</small><strong>원정경기 운영안.pdf · 1.8MB</strong></button></div></section>
        <section className="notice-detail-card change-history"><h2>변경 이력</h2><p>10:31 · 경기 집합 시간을 13:20 → 13:30으로 수정</p><p>10:24 · 전체 대상 공지 게시</p></section>
      </main>
      <aside>
        <section className="notice-detail-card delivery-card"><header><h2>전달·확인 현황</h2><Badge tone="green">96%</Badge></header><strong>55 / 57 확인</strong><ProgressBar value={96} tone="green" /><span><b>미확인 2명</b><small>오늘 18:00 재알림 예정</small></span><div><button>미확인자 보기</button><button onClick={() => setReminded(true)}>전체 재알림</button></div></section>
        <section className="notice-detail-card audience-breakdown"><h2>대상별 확인</h2>{[["선수단", "25/26", 96, "purple"], ["학부모", "25/26", 96, "green"], ["지도자", "5/5", 100, "orange"]].map(([label, value, rate, tone]) => <div key={label as string}><Badge tone={tone as "purple" | "green" | "orange"}>{label}</Badge><strong>{value}</strong><ProgressBar value={rate as number} tone={tone as "purple" | "green" | "orange"} /></div>)}</section>
        <section className="notice-detail-card publish-settings"><h2>게시 설정</h2><div><span>중요 공지 · 상단 고정</span><Badge tone="green">사용 중</Badge></div><div><span>푸시 알림 · 앱 내 공지</span><Badge tone="blue">발송 완료</Badge></div></section>
        <section className="notice-audit-card"><h2>작성·권한</h2><p>작성자 {notice.author} · 수정 가능</p><p>공지 변경과 재알림은 감사 로그에 기록됩니다.</p>{reminded && <div><Icon name="check" size={15} />재알림이 예약되었습니다.</div>}</section>
      </aside>
    </div>
  </div>;
}
