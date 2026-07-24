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
