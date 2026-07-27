import type { Tone } from "@/shared/model/tone";

export const microcycleDays = [
  { id: "MD-6", day: "월", date: "7.14", title: "회복·리셋", objective: "회복과 개별 보완", load: "Low", duration: 70, status: "완료", tone: "green" as Tone },
  { id: "MD-5", day: "화", date: "7.15", title: "빌드업 원칙", objective: "1·2선 연결과 전진", load: "Medium", duration: 100, status: "완료", tone: "blue" as Tone },
  { id: "MD-4", day: "수", date: "7.16", title: "연습 경기", objective: "상대 압박 대응 검증", load: "High", duration: 110, status: "데이터 완료", tone: "orange" as Tone },
  { id: "MD-3", day: "목", date: "7.17", title: "OFF", objective: "완전 휴식", load: "Off", duration: 0, status: "완료", tone: "gray" as Tone },
  { id: "MD-2", day: "금", date: "7.18", title: "포지션 훈련", objective: "수원FC전 역할 정교화", load: "Medium", duration: 120, status: "검토 완료", tone: "purple" as Tone },
  { id: "MD-1", day: "토", date: "7.19", title: "세트피스", objective: "공격·수비 세트피스", load: "Low", duration: 65, status: "초안", tone: "blue" as Tone },
  { id: "MD", day: "일", date: "7.20", title: "수원FC U18전", objective: "K리그 주니어 13R", load: "Match", duration: 90, status: "게시됨", tone: "orange" as Tone },
];

export type CalendarEventType = "training" | "match" | "meeting" | "recovery" | "off";

export type CalendarEvent = {
  id: string;
  day: number;
  time?: string;
  title: string;
  type: CalendarEventType;
  duration?: number;
  location?: string;
  detail?: string;
};

export type WeekCalendarEvent = CalendarEvent & {
  top: number;
  height: number;
};

export const calendarEvents: CalendarEvent[] = [
  { id: "training-0701", day: 1, time: "18:00", title: "팀 훈련", type: "training", duration: 100 },
  { id: "meeting-0703", day: 3, time: "16:00", title: "영상 미팅", type: "meeting", duration: 60 },
  { id: "match-0705", day: 5, time: "15:00", title: "연습 경기", type: "match", duration: 110 },
  { id: "training-0707", day: 7, time: "17:00", title: "빌드업 훈련", type: "training", duration: 90 },
  { id: "training-0709", day: 9, time: "18:00", title: "팀 훈련", type: "training", duration: 100 },
  { id: "meeting-0712", day: 12, title: "원정 이동", type: "meeting", detail: "차량 2대" },
  { id: "recovery-0714", day: 14, time: "17:30", title: "회복 세션", type: "recovery", duration: 70 },
  { id: "meeting-0715", day: 15, time: "16:00", title: "스태프 미팅", type: "meeting", duration: 60 },
  { id: "match-0716", day: 16, time: "18:00", title: "연습 경기", type: "match", duration: 110 },
  { id: "meeting-0718", day: 18, time: "09:30", title: "스태프 미팅", type: "meeting", duration: 30 },
  { id: "training-20260718", day: 18, time: "18:00", title: "포지션 전환 훈련", type: "training", duration: 120, location: "보조구장 B" },
  { id: "recovery-0718", day: 18, time: "20:10", title: "회복 체크", type: "recovery", duration: 20 },
  { id: "training-0719", day: 19, time: "11:00", title: "세트피스", type: "training", duration: 65 },
  { id: "match-20260720", day: 20, time: "15:00", title: "수원FC U18전", type: "match", duration: 110, location: "수원월드컵 보조구장", detail: "K리그 주니어 13R" },
  { id: "recovery-0722", day: 22, time: "10:00", title: "회복 세션", type: "recovery", duration: 60 },
  { id: "training-0724", day: 24, time: "18:00", title: "팀 훈련", type: "training", duration: 100 },
  { id: "meeting-0727", day: 27, title: "대회 이동", type: "meeting", detail: "충주 숙소" },
  { id: "match-0728", day: 28, time: "10:00", title: "예선 1차전", type: "match", duration: 100 },
  { id: "training-0730", day: 30, time: "18:00", title: "팀 훈련", type: "training", duration: 100 },
];

export const weekCalendarEvents: WeekCalendarEvent[] = [
  { id: "recovery-0714", day: 14, time: "17:30", title: "회복·리셋", type: "recovery", duration: 70, top: 73.1, height: 8.3 },
  { id: "training-0715", day: 15, time: "16:00", title: "빌드업 원칙", type: "training", duration: 60, top: 61.2, height: 7.4 },
  { id: "match-0716", day: 16, time: "18:00", title: "연습 경기", type: "match", duration: 110, top: 76.1, height: 13.2 },
  { id: "off-0717", day: 17, time: "08:10", title: "OFF · 완전 휴식", type: "off", top: 8.2, height: 5.2 },
  { id: "meeting-0718", day: 18, time: "09:30", title: "스태프 미팅", type: "meeting", duration: 30, top: 17.2, height: 4.6 },
  { id: "training-20260718", day: 18, time: "18:00", title: "포지션 전환 훈련", type: "training", duration: 120, location: "보조구장 B", top: 76.1, height: 14.2 },
  { id: "recovery-0718", day: 18, time: "20:10", title: "회복 체크", type: "recovery", duration: 20, top: 91.2, height: 4.4 },
  { id: "training-0719", day: 19, time: "11:00", title: "세트피스", type: "training", duration: 65, top: 27.6, height: 7.8 },
  { id: "match-20260720", day: 20, time: "15:00", title: "수원FC U18전", type: "match", duration: 110, location: "수원월드컵 보조구장", detail: "K리그 주니어 13R", top: 53.7, height: 11.2 },
];

export const trainingBlocks = [
  { time: "17:00", duration: "15분", title: "프리액티베이션", owner: "최은지", group: "전체", intensity: "Low" },
  { time: "17:15", duration: "25분", title: "포지션별 패턴", owner: "박성진", group: "공격·미드필더", intensity: "Medium" },
  { time: "17:40", duration: "30분", title: "전환 게임 8v8+3", owner: "김태호", group: "전체", intensity: "High" },
  { time: "18:10", duration: "30분", title: "수원FC 빌드업 대응", owner: "김태호", group: "수비·미드필더", intensity: "Medium" },
  { time: "18:40", duration: "20분", title: "쿨다운·개별 목표", owner: "최은지", group: "전체", intensity: "Low" },
];

export const sessionPlayers = [
  { number: 11, name: "김민수", status: "정상", minutes: "90′", distance: "10.9km", hsr: "1.14km", sprint: "21", rpe: "6", max: "31.8", feedback: "총평 대기" },
  { number: 7, name: "박준호", status: "정상", minutes: "90′", distance: "11.2km", hsr: "1.22km", sprint: "23", rpe: "7", max: "32.4", feedback: "회고 완료" },
  { number: 4, name: "이도윤", status: "관찰", minutes: "68′", distance: "7.8km", hsr: "0.72km", sprint: "14", rpe: "6", max: "29.1", feedback: "우선 작성" },
  { number: 20, name: "윤시우", status: "재활", minutes: "22′", distance: "3.1km", hsr: "0.31km", sprint: "2", rpe: "4", max: "30.0", feedback: "메모 연결" },
  { number: 18, name: "최우진", status: "제한", minutes: "90′", distance: "10.2km", hsr: "0.96km", sprint: "10", rpe: "5", max: "30.7", feedback: "전달 완료" },
  { number: 9, name: "오세훈", status: "GPS 누락", minutes: "76′", distance: "—", hsr: "—", sprint: "—", rpe: "—", max: "—", feedback: "데이터 확인" },
];

export const matchMoments = [
  { minute: "18′", type: "GOAL", title: "김민수 선제골", detail: "박준호 컷백 → 문전 마무리" },
  { minute: "43′", type: "GOAL", title: "수원FC 동점골", detail: "세컨드볼 대응 지연" },
  { minute: "58′", type: "TACTIC", title: "4-3-3 → 4-2-3-1", detail: "중원 압박 수치 조정" },
  { minute: "68′", type: "MEDICAL", title: "이도윤 교체", detail: "오른쪽 발목 불편 보고" },
  { minute: "72′", type: "GOAL", title: "박준호 결승골", detail: "전환 6초 · 왼발 슈팅" },
];
