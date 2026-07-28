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

export type TrainingPlanBlock = {
  id: string;
  title: string;
  duration: number;
  point: string;
};

export type TrainingPlayerData = {
  playerId: number;
  number: number;
  name: string;
  condition: number;
  status: "정상" | "관찰" | "제한" | "재활";
  participation: "전체" | "제한" | "제외";
  rpe: number;
  feedback: string;
  feedbackSent: boolean;
};

export type CalendarEvent = {
  id: string;
  day: number;
  time?: string;
  title: string;
  type: CalendarEventType;
  duration?: number;
  location?: string;
  detail?: string;
  objective?: string;
  coachingPoints?: string;
  memo?: string;
  opponent?: string;
  competition?: string;
  planBlocks?: TrainingPlanBlock[];
  playerData?: TrainingPlayerData[];
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

export const defaultTrainingPlan: TrainingPlanBlock[] = [
  { id: "warmup", title: "프리액티베이션", duration: 15, point: "가동범위와 부상 위험 확인" },
  { id: "position", title: "포지션별 패턴", duration: 25, point: "받기 전 시야와 몸의 각도" },
  { id: "transition", title: "전환 게임 8v8+3", duration: 30, point: "볼 상실 후 5초 반응" },
  { id: "tactical", title: "상대 빌드업 대응", duration: 30, point: "1선 압박 방향과 2선 간격" },
  { id: "cooldown", title: "쿨다운·개별 목표", duration: 20, point: "통증 확인과 다음 과제 공유" },
];

export const sessionPlayers = [
  { number: 11, name: "김민수", status: "정상", minutes: "90′", distance: "10.9km", hsr: "1.14km", sprint: "21", rpe: "6", max: "31.8", feedback: "총평 대기" },
  { number: 7, name: "박준호", status: "정상", minutes: "90′", distance: "11.2km", hsr: "1.22km", sprint: "23", rpe: "7", max: "32.4", feedback: "회고 완료" },
  { number: 4, name: "이도윤", status: "관찰", minutes: "68′", distance: "7.8km", hsr: "0.72km", sprint: "14", rpe: "6", max: "29.1", feedback: "우선 작성" },
  { number: 20, name: "윤시우", status: "재활", minutes: "22′", distance: "3.1km", hsr: "0.31km", sprint: "2", rpe: "4", max: "30.0", feedback: "메모 연결" },
  { number: 18, name: "최우진", status: "제한", minutes: "90′", distance: "10.2km", hsr: "0.96km", sprint: "10", rpe: "5", max: "30.7", feedback: "전달 완료" },
  { number: 9, name: "오세훈", status: "GPS 누락", minutes: "76′", distance: "—", hsr: "—", sprint: "—", rpe: "—", max: "—", feedback: "데이터 확인" },
];

export const defaultTrainingPlayerData: TrainingPlayerData[] = [
  { playerId: 1, number: 11, name: "김민수", condition: 86, status: "정상", participation: "전체", rpe: 6, feedback: "첫 터치 전에 다음 패스 방향을 먼저 확인해보자.", feedbackSent: false },
  { playerId: 2, number: 7, name: "박준호", condition: 78, status: "정상", participation: "전체", rpe: 7, feedback: "전환 순간 첫 세 걸음의 속도를 끝까지 유지해보자.", feedbackSent: true },
  { playerId: 3, number: 4, name: "이도윤", condition: 52, status: "관찰", participation: "제한", rpe: 5, feedback: "발목 상태를 보면서 방향 전환 각도를 작게 시작하자.", feedbackSent: false },
  { playerId: 4, number: 18, name: "최우진", condition: 91, status: "제한", participation: "제한", rpe: 5, feedback: "고강도 반복 수보다 움직임의 타이밍에 집중하자.", feedbackSent: true },
  { playerId: 5, number: 1, name: "정현우", condition: 84, status: "정상", participation: "전체", rpe: 6, feedback: "빌드업 시작 위치를 조금 더 빠르게 잡아보자.", feedbackSent: false },
  { playerId: 6, number: 14, name: "한지민", condition: 73, status: "정상", participation: "전체", rpe: 6, feedback: "압박 전 등 뒤 공간을 한 번 더 확인해보자.", feedbackSent: false },
  { playerId: 7, number: 20, name: "윤시우", condition: 45, status: "재활", participation: "제외", rpe: 3, feedback: "오늘은 패스와 전술 설명만 참여하고 통증을 바로 알려줘.", feedbackSent: true },
  { playerId: 8, number: 9, name: "오세훈", condition: 82, status: "정상", participation: "전체", rpe: 6, feedback: "문전에서 첫 선택을 단순하게 가져가보자.", feedbackSent: false },
];

export type TrainingTemplate = {
  id: string;
  name: string;
  title: string;
  duration: number;
  location: string;
  objective: string;
  coachingPoints: string;
  memo: string;
  planBlocks: TrainingPlanBlock[];
  builtIn?: boolean;
};

export const initialTrainingTemplates: TrainingTemplate[] = [
  {
    id: "template-md2-transition",
    name: "MD-2 전환·전술",
    title: "포지션 전환 훈련",
    duration: 120,
    location: "보조구장 B",
    objective: "경기 상황에서 공수 전환 원칙과 포지션별 역할을 정교화합니다.",
    coachingPoints: "볼 상실 후 5초 반응 / 첫 패스 전 몸의 각도 / 수비 간격 8m 유지",
    memo: "제한 참여 선수는 고강도 블록 반복 수를 조정합니다.",
    planBlocks: defaultTrainingPlan,
    builtIn: true,
  },
  {
    id: "template-md1-setpiece",
    name: "MD-1 세트피스",
    title: "세트피스 훈련",
    duration: 65,
    location: "메인구장",
    objective: "경기 전 공격·수비 세트피스 역할과 킥 위치를 최종 확인합니다.",
    coachingPoints: "세컨드볼 위치 / 키커 신호 / 수비 라인 동시 출발",
    memo: "고강도 러닝 없이 전술 정확도 중심으로 운영합니다.",
    planBlocks: [
      { id: "setpiece-warmup", title: "볼 워밍업", duration: 10, point: "킥 감각과 가동범위 확인" },
      { id: "attacking-setpiece", title: "공격 세트피스", duration: 25, point: "키커 신호와 1·2차 움직임" },
      { id: "defending-setpiece", title: "수비 세트피스", duration: 20, point: "마킹 전달과 세컨드볼 위치" },
      { id: "setpiece-review", title: "상황 복기", duration: 10, point: "선수별 역할 재확인" },
    ],
    builtIn: true,
  },
  {
    id: "template-recovery",
    name: "경기 후 회복",
    title: "회복·리셋 훈련",
    duration: 70,
    location: "회복실·보조구장",
    objective: "경기 부하를 낮추고 개인별 통증과 회복 상태를 확인합니다.",
    coachingPoints: "통증 즉시 공유 / 낮은 심박 유지 / 개인 보완 분리",
    memo: "경기 60분 이상 출전 선수와 미출전 선수를 분리 운영합니다.",
    planBlocks: [
      { id: "recovery-bike", title: "저강도 유산소", duration: 20, point: "RPE 3 이하 유지" },
      { id: "recovery-mobility", title: "모빌리티", duration: 20, point: "고관절·발목 가동범위" },
      { id: "recovery-individual", title: "개별 보완", duration: 20, point: "출전 시간별 프로그램 분리" },
      { id: "recovery-check", title: "컨디션 체크", duration: 10, point: "통증과 다음 참여 판단" },
    ],
    builtIn: true,
  },
];

export const matchMoments = [
  { minute: "18′", type: "GOAL", title: "김민수 선제골", detail: "박준호 컷백 → 문전 마무리" },
  { minute: "43′", type: "GOAL", title: "수원FC 동점골", detail: "세컨드볼 대응 지연" },
  { minute: "58′", type: "TACTIC", title: "4-3-3 → 4-2-3-1", detail: "중원 압박 수치 조정" },
  { minute: "68′", type: "MEDICAL", title: "이도윤 교체", detail: "오른쪽 발목 불편 보고" },
  { minute: "72′", type: "GOAL", title: "박준호 결승골", detail: "전환 6초 · 왼발 슈팅" },
];
