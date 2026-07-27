export type NoticeAudience = "전체" | "선수단" | "학부모" | "지도자";

export type Notice = {
  id: number;
  title: string;
  audience: NoticeAudience;
  author: string;
  date: string;
  read: number;
  total: number;
  pinned?: boolean;
  important?: boolean;
  scheduled?: boolean;
};

export const notices: Notice[] = [
  { id: 108, title: "7월 훈련 일정 변경 안내", audience: "전체", author: "김태호", date: "오늘 10:24", read: 55, total: 57, pinned: true, important: true },
  { id: 107, title: "이번 주 개인 회복 프로그램", audience: "선수단", author: "최은지", date: "오늘 09:10", read: 23, total: 26 },
  { id: 106, title: "학부모 경기 이동 안내", audience: "학부모", author: "구단 운영팀", date: "7월 23일", read: 25, total: 26 },
  { id: 105, title: "주말 경기 운영 체크리스트", audience: "지도자", author: "박성진", date: "7월 22일", read: 4, total: 5, important: true },
  { id: 104, title: "하계 대회 일정 및 준비물", audience: "전체", author: "김태호", date: "7월 20일", read: 57, total: 57 },
  { id: 103, title: "신체 측정 일정 안내", audience: "선수단", author: "최은지", date: "7월 19일", read: 21, total: 26 },
  { id: 102, title: "학부모 정기 간담회", audience: "학부모", author: "구단 운영팀", date: "7월 18일", read: 24, total: 26, scheduled: true },
];
