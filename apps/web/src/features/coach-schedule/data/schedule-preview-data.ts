import type { Tone } from "@/shared/model/tone";
import { players } from "@/features/players/data/player-preview-data";
import type { ConditionScore } from "@/features/players/model/player";

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
export type TrainingIntensity = "Low" | "Medium" | "High";

export type TrainingPitchPreset = "full" | "half" | "third" | "blank";
export type TrainingBoardItemType = "player-a" | "player-b" | "goalkeeper" | "cone" | "vest" | "ball" | "goal" | "zone" | "pole" | "hurdle" | "mannequin" | "text";
export type TrainingBoardLineType = "pass" | "dribble" | "shot" | "run" | "press" | "draw";

export type TrainingBoardPoint = {
  x: number;
  y: number;
};

export type TrainingBoardItem = {
  id: string;
  type: TrainingBoardItemType;
  x: number;
  y: number;
  label?: string;
  name?: string;
  rotation?: number;
  scale?: number;
};

export type TrainingBoardLine = {
  id: string;
  type: TrainingBoardLineType;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  cx?: number;
  cy?: number;
  animated?: boolean;
  duration?: number;
  startDelay?: number;
  pauseAfter?: number;
  sequenceStep?: number;
  sourceItemId?: string;
  points?: TrainingBoardPoint[];
  color?: string;
  strokeWidth?: number;
};

export type TrainingBoardState = {
  pitchPreset?: TrainingPitchPreset;
  items: TrainingBoardItem[];
  lines: TrainingBoardLine[];
};

export type TrainingPlanBlock = {
  id: string;
  sourceDrillId?: string;
  title: string;
  duration: number;
  point: string;
  intensity?: TrainingIntensity;
  group?: string;
  setup?: string;
  method?: string;
  keyPoints?: string[];
  successCriteria?: string;
  rules?: string;
  playerCount?: string;
  area?: string;
  equipment?: string;
  objective?: string;
  board?: TrainingBoardState;
};

export type TrainingDrill = TrainingPlanBlock & {
  builtIn?: boolean;
  category?: "training" | "set-piece";
  setPieceType?: "corner" | "free-kick" | "throw-in" | "kickoff";
  setPiecePhase?: "attack" | "defense";
};

export type TrainingPlayerData = {
  playerId: number;
  number: number;
  name: string;
  condition: ConditionScore;
  status: "정상" | "관찰" | "제한" | "재활";
  participation: "전체" | "제한" | "제외";
  rpe: number;
  feedback: string;
  feedbackSent: boolean;
  feedbackVisibleToParent?: boolean;
};

export type TrainingStatus = "작성 중" | "지도자 공유" | "팀 공개" | "정리 필요" | "완료" | "취소";
export type TrainingReviewStatus = "작성 중" | "검토 요청" | "확인 완료";
export type TrainingPublicationStatus = "미공개" | "공개" | "변경됨";
export type TrainingPlanCompletion = "계획대로" | "일부 변경" | "대폭 변경";
export type TrainingExceptionType = "불참" | "지각" | "조기 종료" | "제한 참여" | "통증·부상" | "계획 변경";

export type TrainingException = {
  id: string;
  type: TrainingExceptionType;
  playerId?: number;
  playerName?: string;
  detail: string;
  createdAt?: string;
};

export type MatchMomentType = "GOAL" | "CONCEDED" | "SUB" | "CARD" | "MEDICAL" | "TACTIC";

export type MatchMoment = {
  id: string;
  minute: string;
  type: MatchMomentType;
  title: string;
  detail: string;
};

export type MatchStatus = "작성 중" | "지도자 공유" | "팀 공개" | "경기 진행" | "정리 필요" | "완료" | "연기" | "취소" | "예정" | "진행 중" | "결과 확인";
export type MatchReviewStatus = "작성 중" | "검토 요청" | "확인 완료";
export type MatchPublicationStatus = "미공개" | "공개" | "변경됨";

export type MatchPlayerData = {
  playerId: number;
  number: number;
  name: string;
  position: string;
  role: "선발" | "교체" | "미출전";
  status: "정상" | "관찰" | "제한" | "재활" | "GPS 누락";
  minutes: number;
  distance: number | null;
  hsr: number | null;
  sprints: number | null;
  maxSpeed: number | null;
  rating: number;
  feedback: string;
  feedbackSent: boolean;
  feedbackVisibleToParent?: boolean;
};

export type CalendarEvent = {
  id: string;
  day: number;
  date?: string;
  time?: string;
  title: string;
  type: CalendarEventType;
  duration?: number;
  intensity?: TrainingIntensity;
  location?: string;
  detail?: string;
  objective?: string;
  coachingPoints?: string;
  memo?: string;
  opponent?: string;
  competition?: string;
  matchStatus?: MatchStatus;
  homeScore?: number;
  awayScore?: number;
  formation?: string;
  homeAway?: "홈" | "원정" | "중립";
  gatheringTime?: string;
  gatheringPlace?: string;
  matchEquipment?: string;
  matchObjective?: string;
  matchCoachNote?: string;
  matchReviewStatus?: MatchReviewStatus;
  matchPublicationStatus?: MatchPublicationStatus;
  playerReadCount?: number;
  parentReadCount?: number;
  matchMoments?: MatchMoment[];
  matchPlayerData?: MatchPlayerData[];
  trainingStatus?: TrainingStatus;
  trainingReviewStatus?: TrainingReviewStatus;
  trainingPublicationStatus?: TrainingPublicationStatus;
  trainingGatheringTime?: string;
  trainingGroup?: string;
  trainingEquipment?: string;
  trainingCoachNote?: string;
  trainingPlayerReadCount?: number;
  trainingParentReadCount?: number;
  plannedIntensityScore?: number;
  actualDuration?: number;
  actualIntensityScore?: number;
  trainingPlanCompletion?: TrainingPlanCompletion;
  trainingExceptions?: TrainingException[];
  trainingCompletedAt?: string;
  planBlocks?: TrainingPlanBlock[];
  playerData?: TrainingPlayerData[];
};

export type WeekCalendarEvent = CalendarEvent & {
  top: number;
  height: number;
};

export const calendarEvents: CalendarEvent[] = [
  { id: "training-0701", day: 1, time: "18:00", title: "7월 첫 팀 훈련", type: "training", duration: 100, location: "탄천종합운동장 보조구장", objective: "휴식기 이후 기본 체력과 빌드업 원칙을 다시 맞춥니다.", coachingPoints: "첫 터치 방향 / 센터백 간격 / 전환 후 5초 반응" },
  { id: "recovery-0702", day: 2, time: "17:30", title: "저강도 회복·모빌리티", type: "recovery", duration: 60, location: "클럽하우스·실내 트레이닝실", detail: "1학년은 기초 근력 추가" },
  { id: "meeting-0703", day: 3, time: "16:00", title: "부천전 사전 영상 미팅", type: "meeting", duration: 50, location: "분석실", detail: "상대 전방 압박과 세트피스 확인" },
  { id: "training-0703", day: 3, time: "18:00", title: "압박 탈출·전진 패스", type: "training", duration: 95, location: "보조구장 A" },
  { id: "training-0704", day: 4, time: "16:30", title: "경기 전 활성화", type: "training", duration: 65, location: "메인구장", objective: "세트피스 역할과 경기 초반 압박 방향을 최종 확인합니다." },
  { id: "match-0705", day: 5, time: "15:00", title: "부천 FC U15 연습경기", type: "match", duration: 110, location: "부천체육관 보조구장", opponent: "부천 FC U15", competition: "주말 연습경기", detail: "원정 · 집합 12:20" },
  { id: "off-0706", day: 6, title: "OFF · 개별 회복", type: "off", detail: "통증 선수 오전 전화 체크" },
  { id: "training-0707", day: 7, time: "17:00", title: "후방 빌드업 훈련", type: "training", duration: 90, location: "보조구장 B", objective: "상대 2톱 압박에서 골키퍼를 포함해 안정적으로 전진합니다." },
  { id: "recovery-0708", day: 8, time: "17:30", title: "피지컬 측정·회복", type: "recovery", duration: 80, location: "체력단련실", detail: "CMJ · 30m 스프린트 · 체중" },
  { id: "training-0709", day: 9, time: "18:00", title: "측면 공격 패턴", type: "training", duration: 100, location: "메인구장", objective: "풀백 오버래핑과 윙포워드의 안쪽 침투 타이밍을 맞춥니다." },
  { id: "meeting-0710", day: 10, time: "15:30", title: "1학년 개별 면담", type: "meeting", duration: 75, location: "코칭스태프실", detail: "6명 · 적응 및 개인 목표 점검" },
  { id: "training-0710", day: 10, time: "18:00", title: "수비 전환 6v6+3", type: "training", duration: 85, location: "보조구장 A" },
  { id: "training-0711", day: 11, time: "16:00", title: "고강도 게임·세트피스", type: "training", duration: 105, location: "메인구장" },
  { id: "meeting-0712", day: 12, time: "09:00", title: "청주 원정 이동", type: "meeting", duration: 180, location: "클럽하우스 주차장", detail: "버스 1대 · 선수 24명 · 스태프 5명" },
  { id: "match-0712", day: 12, time: "15:30", title: "청주 FCK U15전", type: "match", duration: 110, location: "청주종합운동장 보조구장", opponent: "청주 FCK U15", competition: "중등 주말리그 10R", detail: "원정 · 흰색 유니폼" },
  { id: "off-0713", day: 13, title: "OFF · 경기 후 휴식", type: "off", detail: "60분 이상 출전 선수 완전 휴식" },
  { id: "recovery-0714", day: 14, time: "17:30", title: "회복·리셋", type: "recovery", duration: 70, location: "회복실·보조구장", detail: "출전 시간별 3개 그룹 운영" },
  { id: "meeting-0718", day: 18, time: "09:30", title: "스태프 미팅", type: "meeting", duration: 30 },
  { id: "meeting-0715", day: 15, time: "16:00", title: "주간 스태프 미팅", type: "meeting", duration: 45, location: "분석실", detail: "수원전 엔트리·부상자·훈련 부하" },
  { id: "training-0715", day: 15, time: "17:00", title: "빌드업 원칙", type: "training", duration: 100, location: "보조구장 A" },
  { id: "match-0716", day: 16, time: "18:00", title: "성남 U18 B팀 연습경기", type: "match", duration: 110, location: "메인구장", opponent: "성남 U18 B", competition: "내부 연습경기", detail: "3×30분 · 전 선수 출전" },
  { id: "off-0717", day: 17, time: "08:10", title: "OFF · 완전 휴식", type: "off", detail: "자가 컨디션 체크만 제출" },
  { id: "training-20260718", day: 18, time: "18:00", title: "포지션 전환 훈련", type: "training", duration: 120, location: "보조구장 B" },
  { id: "recovery-0718", day: 18, time: "20:10", title: "회복 체크", type: "recovery", duration: 20 },
  { id: "training-0719", day: 19, time: "11:00", title: "세트피스·경기 활성화", type: "training", duration: 65, location: "메인구장", objective: "공격·수비 세트피스 역할과 경기 시작 15분 운영을 확인합니다." },
  { id: "match-20260720", day: 20, time: "15:00", title: "수원FC U18전", type: "match", duration: 110, location: "수원월드컵 보조구장", detail: "K리그 주니어 13R" },
  { id: "recovery-0721", day: 21, time: "17:00", title: "경기 후 회복", type: "recovery", duration: 70, location: "회복실", detail: "선발·교체·미출전 분리 운영" },
  { id: "meeting-0722", day: 22, time: "16:00", title: "수원전 리뷰", type: "meeting", duration: 45, location: "분석실", detail: "좋았던 장면 6개 · 개선 장면 4개" },
  { id: "training-0722", day: 22, time: "17:30", title: "전환·마무리", type: "training", duration: 90, location: "보조구장 A" },
  { id: "training-0723", day: 23, time: "18:00", title: "중원 압박·세컨드볼", type: "training", duration: 105, location: "메인구장" },
  { id: "training-0724", day: 24, time: "18:00", title: "대회 대비 팀 훈련", type: "training", duration: 100, location: "보조구장 B", objective: "짧은 대회 일정에 맞춰 선수별 역할과 교체 시나리오를 점검합니다." },
  { id: "match-0725", day: 25, time: "16:00", title: "자체 청백전", type: "match", duration: 100, location: "메인구장", opponent: "성남 U15 B", competition: "내부 평가전", detail: "25분×3쿼터 · 전원 출전", matchStatus: "정리 필요", homeScore: 3, awayScore: 2, matchReviewStatus: "검토 요청", matchPublicationStatus: "미공개" },
  { id: "off-0726", day: 26, title: "OFF · 대회 준비", type: "off", detail: "개인 장비·신분증 확인" },
  { id: "meeting-0727", day: 27, time: "13:00", title: "충주 대회 이동", type: "meeting", duration: 210, location: "클럽하우스 주차장", detail: "버스 1대 · 충주 켄싱턴 리조트" },
  { id: "meeting-0727-team", day: 27, time: "19:30", title: "대회 운영 미팅", type: "meeting", duration: 35, location: "숙소 미팅룸", detail: "예선 일정·식사·회복 동선" },
  { id: "match-0728", day: 28, time: "10:00", title: "예선 1차전 · 부산 아이파크", type: "match", duration: 100, location: "충주 탄금대 2구장", opponent: "부산 아이파크 U15", competition: "2026 전국중등축구대회", detail: "중립 · 조별리그 1차전", matchStatus: "팀 공개", gatheringTime: "07:40", gatheringPlace: "충주 숙소 1층 로비", matchReviewStatus: "확인 완료", matchPublicationStatus: "공개", playerReadCount: 21, parentReadCount: 19 },
  { id: "recovery-0728", day: 28, time: "17:30", title: "호텔 회복 세션", type: "recovery", duration: 45, location: "숙소 세미나실", detail: "마사지·모빌리티·통증 체크" },
  { id: "meeting-0729", day: 29, time: "10:30", title: "1차전 리뷰·2차전 준비", type: "meeting", duration: 45, location: "숙소 미팅룸" },
  { id: "training-0729", day: 29, time: "16:30", title: "비출전·저출전 보완", type: "training", duration: 65, location: "충주 탄금대 보조구장" },
  { id: "training-0730", day: 30, time: "17:00", title: "경기 전 활성화·세트피스", type: "training", duration: 70, location: "충주 탄금대 3구장" },
  { id: "match-0731", day: 31, time: "14:00", title: "예선 2차전 · 포항 스틸러스", type: "match", duration: 100, location: "충주 탄금대 1구장", opponent: "포항 스틸러스 U15", competition: "2026 전국중등축구대회", detail: "중립 · 조별리그 2차전", matchStatus: "지도자 공유", matchReviewStatus: "검토 요청", matchPublicationStatus: "미공개", playerReadCount: 0, parentReadCount: 0 },
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
  { id: "match-20260720", day: 20, date: "2026-07-20", time: "15:00", title: "수원FC U18전", type: "match", duration: 110, location: "수원월드컵 보조구장", opponent: "수원FC U18", competition: "K리그 주니어 13R", detail: "홈 경기", matchStatus: "완료", homeScore: 2, awayScore: 1, formation: "4-3-3", memo: "후반 중원 숫자를 조정한 뒤 세컨드볼 회수와 전진 속도가 좋아졌습니다. 다음 훈련에서는 수비 전환 첫 위치를 다시 확인합니다.", top: 53.7, height: 11.2 },
];

export const trainingBlocks = [
  { time: "17:00", duration: "15분", title: "프리액티베이션", owner: "최은지", group: "전체", intensity: "Low" },
  { time: "17:15", duration: "25분", title: "포지션별 패턴", owner: "박성진", group: "공격·미드필더", intensity: "Medium" },
  { time: "17:40", duration: "30분", title: "전환 게임 8v8+3", owner: "김태호", group: "전체", intensity: "High" },
  { time: "18:10", duration: "30분", title: "수원FC 빌드업 대응", owner: "김태호", group: "수비·미드필더", intensity: "Medium" },
  { time: "18:40", duration: "20분", title: "쿨다운·개별 목표", owner: "최은지", group: "전체", intensity: "Low" },
];

export const defaultTrainingPlan: TrainingPlanBlock[] = [
  { id: "warmup", title: "프리액티베이션", duration: 15, intensity: "Low", group: "전체", setup: "20×20m · 4개 스테이션", point: "가동범위와 부상 위험 확인", objective: "훈련 전 관절 가동범위와 몸 상태를 확인하고 본 훈련을 준비합니다.", method: "3분씩 네 스테이션을 순환하고 마지막 3분은 볼을 사용한 반응 동작으로 마무리합니다.", rules: "통증이 있거나 좌우 움직임 차이가 큰 선수는 즉시 코치에게 알립니다.", keyPoints: ["동작 속도보다 정확한 자세", "발목·고관절 가동범위 확인", "통증 선수 즉시 분리"], playerCount: "26명 · 4개 조", area: "20×20m", equipment: "매트 8개 · 미니밴드 13개 · 볼 8개" },
  { id: "position", title: "포지션별 패턴", duration: 25, intensity: "Medium", group: "포지션 그룹", setup: "30×25m · 3개 구역", point: "받기 전 시야와 몸의 각도", objective: "포지션별로 볼을 받기 전 확인과 첫 터치 방향을 반복합니다.", method: "수비·미드필더·공격 세 그룹으로 나누고 6분 진행 후 1분 코칭을 세 번 반복합니다.", rules: "패스를 받기 전 최소 한 번 뒤를 확인하고 첫 터치는 다음 플레이 방향으로 둡니다.", keyPoints: ["받기 전 어깨 너머 확인", "열린 몸 방향", "첫 터치 후 두 번 안에 연결"], playerCount: "8~9명씩 3개 조", area: "30×25m", equipment: "볼 12개 · 콘 20개 · 조끼 3색" },
  { id: "transition", title: "전환 게임 8v8+3", duration: 30, intensity: "High", group: "전체", setup: "48×40m · 미니골 4개", point: "볼 상실 후 5초 반응", objective: "볼을 잃거나 되찾은 직후 첫 행동과 팀 간격을 빠르게 전환합니다.", method: "5분 경기와 2분 회복을 네 세트 진행하며 중립 선수 3명은 항상 공격 팀에 가담합니다.", rules: "볼을 되찾은 팀은 8초 안에 미니골을 공격하고, 잃은 팀은 5초 동안 즉시 압박합니다.", keyPoints: ["볼 상실 지점 주변 즉시 압박", "첫 전진 패스 선택", "반대편 선수의 폭 확보"], playerCount: "8v8+중립 3명", area: "48×40m", equipment: "볼 8개 · 조끼 3색 · 미니골 4개" },
  { id: "tactical", title: "상대 빌드업 대응", duration: 30, intensity: "Medium", group: "수비·미드필더", setup: "하프 코트 · 10v8", point: "1선 압박 방향과 2선 간격", objective: "상대 후방 빌드업을 한쪽으로 유도하고 1·2선이 같은 타이밍에 압박합니다.", method: "상대 빌드업 시작 위치를 세 가지로 바꾸며 6분씩 진행하고 상황 사이마다 위치를 교정합니다.", rules: "공격 팀이 하프라인을 통과하면 성공, 수비 팀이 탈취 후 10초 안에 마무리하면 2점입니다.", keyPoints: ["1선이 바깥 패스를 유도", "2선 간격 8~10m 유지", "탈취 후 첫 패스 전진"], playerCount: "공격 10명 · 수비 8명", area: "하프 코트", equipment: "풀사이즈 골대 · 볼 10개 · 조끼 2색" },
  { id: "cooldown", title: "쿨다운·개별 목표", duration: 20, intensity: "Low", group: "전체", setup: "하프라인 · 2개 회복 구역", point: "통증 확인과 다음 과제 공유", objective: "훈련 부하를 낮추고 선수별 통증과 다음 훈련 과제를 확인합니다.", method: "저강도 조깅 5분, 스트레칭 10분, 컨디션·통증 확인 5분 순서로 진행합니다.", rules: "불편 부위가 있는 선수는 강도와 관계없이 반드시 지도자에게 직접 공유합니다.", keyPoints: ["호흡과 심박 안정", "통증 부위 직접 확인", "선수별 다음 과제 한 가지"], playerCount: "전체", area: "하프라인", equipment: "매트 13개 · 폼롤러 8개" },
];

const initialSetPieceDrills: TrainingDrill[] = [
  {
    id: "set-piece-corner-near-screen",
    title: "코너킥 니어 스크린",
    duration: 5,
    intensity: "Medium",
    point: "니어 움직임으로 수비 시선을 끌고 중앙 침투 공간을 만듭니다.",
    objective: "니어 스크린 뒤 중앙 침투 선수에게 마무리 공간을 만듭니다.",
    method: "키커의 신호에 맞춰 니어 선수와 중앙 침투 선수가 동시에 출발합니다.",
    rules: "첫 움직임과 킥 타이밍을 같은 신호로 통일합니다.",
    keyPoints: ["키커와 첫 움직임의 신호", "니어 선수의 스크린 위치", "세컨드볼 대기 위치"],
    playerCount: "공격 5명 · 수비 5명 · GK",
    area: "하프코트",
    equipment: "볼 · 조끼",
    category: "set-piece",
    setPieceType: "corner",
    setPiecePhase: "attack",
    builtIn: true,
    board: {
      pitchPreset: "half",
      items: [
        { id: "sp-corner-ball", type: "ball", x: 7, y: 7, rotation: 0, scale: .8 },
        { id: "sp-corner-kicker", type: "player-a", x: 12, y: 12, label: "7", rotation: 0, scale: 1 },
        { id: "sp-corner-near", type: "player-a", x: 39, y: 31, label: "9", rotation: 0, scale: 1 },
        { id: "sp-corner-center", type: "player-a", x: 55, y: 38, label: "4", rotation: 0, scale: 1 },
        { id: "sp-corner-back", type: "player-a", x: 68, y: 45, label: "11", rotation: 0, scale: 1 },
        { id: "sp-corner-gk", type: "goalkeeper", x: 50, y: 14, rotation: 0, scale: 1 },
        { id: "sp-corner-d1", type: "player-b", x: 43, y: 23, label: "2", rotation: 0, scale: 1 },
        { id: "sp-corner-d2", type: "player-b", x: 51, y: 25, label: "5", rotation: 0, scale: 1 },
        { id: "sp-corner-d3", type: "player-b", x: 59, y: 26, label: "6", rotation: 0, scale: 1 },
      ],
      lines: [
        { id: "sp-corner-run-near", type: "run", x1: 39, y1: 31, x2: 46, y2: 18, cx: 40, cy: 20, animated: true, duration: 1.3, startDelay: 0, sourceItemId: "sp-corner-near" },
        { id: "sp-corner-run-center", type: "run", x1: 55, y1: 38, x2: 52, y2: 21, cx: 58, cy: 27, animated: true, duration: 1.5, startDelay: .3, sourceItemId: "sp-corner-center" },
        { id: "sp-corner-pass", type: "pass", x1: 7, y1: 7, x2: 52, y2: 21, cx: 27, cy: 4, animated: true, duration: 1.2, startDelay: .8, sourceItemId: "sp-corner-ball" },
      ],
    },
  },
  {
    id: "set-piece-free-kick-overlap",
    title: "공격 프리킥 오버랩",
    duration: 5,
    intensity: "Medium",
    point: "첫 번째 움직임을 미끼로 사용하고 바깥 오버랩에 패스합니다.",
    objective: "직접 슈팅처럼 보인 뒤 측면 오버랩으로 수비벽을 우회합니다.",
    method: "첫 키커가 볼을 지나가면 두 번째 키커가 측면 침투 선수에게 패스합니다.",
    rules: "두 키커의 간격과 측면 선수의 출발 시점을 고정합니다.",
    keyPoints: ["첫 키커의 시선", "오버랩 출발 타이밍", "문전 2선 침투"],
    playerCount: "공격 6명 · 수비 6명 · GK",
    area: "하프코트",
    equipment: "볼 · 마네킹",
    category: "set-piece",
    setPieceType: "free-kick",
    setPiecePhase: "attack",
    builtIn: true,
    board: {
      pitchPreset: "half",
      items: [
        { id: "sp-fk-ball", type: "ball", x: 50, y: 58, rotation: 0, scale: .8 },
        { id: "sp-fk-k1", type: "player-a", x: 44, y: 66, label: "10", rotation: 0, scale: 1 },
        { id: "sp-fk-k2", type: "player-a", x: 56, y: 65, label: "8", rotation: 0, scale: 1 },
        { id: "sp-fk-wide", type: "player-a", x: 76, y: 54, label: "7", rotation: 0, scale: 1 },
        { id: "sp-fk-runner", type: "player-a", x: 63, y: 41, label: "9", rotation: 0, scale: 1 },
        { id: "sp-fk-gk", type: "goalkeeper", x: 50, y: 13, rotation: 0, scale: 1 },
        { id: "sp-fk-m1", type: "mannequin", x: 42, y: 39, rotation: 0, scale: .8 },
        { id: "sp-fk-m2", type: "mannequin", x: 48, y: 38, rotation: 0, scale: .8 },
        { id: "sp-fk-m3", type: "mannequin", x: 54, y: 38, rotation: 0, scale: .8 },
        { id: "sp-fk-m4", type: "mannequin", x: 60, y: 39, rotation: 0, scale: .8 },
      ],
      lines: [
        { id: "sp-fk-decoy", type: "run", x1: 44, y1: 66, x2: 55, y2: 52, cx: 48, cy: 55, animated: true, duration: 1, startDelay: 0, sourceItemId: "sp-fk-k1" },
        { id: "sp-fk-overlap", type: "run", x1: 76, y1: 54, x2: 82, y2: 30, cx: 86, cy: 43, animated: true, duration: 1.4, startDelay: .2, sourceItemId: "sp-fk-wide" },
        { id: "sp-fk-pass", type: "pass", x1: 50, y1: 58, x2: 82, y2: 30, cx: 71, cy: 49, animated: true, duration: 1.2, startDelay: .8, sourceItemId: "sp-fk-ball" },
      ],
    },
  },
  {
    id: "set-piece-corner-zone-defense",
    title: "수비 코너 지역 혼합",
    duration: 5,
    intensity: "Medium",
    point: "골문 앞 지역을 먼저 지키고 핵심 공격수는 대인 방어합니다.",
    objective: "니어·중앙·파 포스트의 우선 지역과 대인 방어 대상을 명확히 합니다.",
    method: "지역 수비 4명과 대인 수비 3명의 시작 위치와 첫 이동을 반복합니다.",
    rules: "클리어 선수와 세컨드볼 선수의 역할을 분리합니다.",
    keyPoints: ["볼과 골문을 함께 보기", "첫 경합 이후 전진", "박스 밖 세컨드볼"],
    playerCount: "수비 8명 · 공격 6명",
    area: "하프코트",
    equipment: "볼 · 조끼",
    category: "set-piece",
    setPieceType: "corner",
    setPiecePhase: "defense",
    builtIn: true,
    board: {
      pitchPreset: "half",
      items: [
        { id: "sp-def-ball", type: "ball", x: 8, y: 7, rotation: 0, scale: .8 },
        { id: "sp-def-gk", type: "goalkeeper", x: 50, y: 13, rotation: 0, scale: 1 },
        { id: "sp-def-z1", type: "player-b", x: 38, y: 21, label: "4", rotation: 0, scale: 1 },
        { id: "sp-def-z2", type: "player-b", x: 47, y: 22, label: "5", rotation: 0, scale: 1 },
        { id: "sp-def-z3", type: "player-b", x: 56, y: 22, label: "6", rotation: 0, scale: 1 },
        { id: "sp-def-z4", type: "player-b", x: 65, y: 25, label: "3", rotation: 0, scale: 1 },
        { id: "sp-def-edge", type: "player-b", x: 54, y: 45, label: "8", rotation: 0, scale: 1 },
        { id: "sp-def-a1", type: "player-a", x: 42, y: 33, label: "9", rotation: 0, scale: 1 },
        { id: "sp-def-a2", type: "player-a", x: 59, y: 35, label: "11", rotation: 0, scale: 1 },
      ],
      lines: [
        { id: "sp-def-step1", type: "press", x1: 38, y1: 21, x2: 34, y2: 29, cx: 35, cy: 24, animated: true, duration: 1, startDelay: .3, sourceItemId: "sp-def-z1" },
        { id: "sp-def-step2", type: "run", x1: 54, y1: 45, x2: 52, y2: 34, cx: 57, cy: 39, animated: true, duration: 1.2, startDelay: .8, sourceItemId: "sp-def-edge" },
      ],
    },
  },
];

const defaultTrainingBoards: Record<string, TrainingBoardState> = {
  warmup: {
    pitchPreset: "third",
    items: [
      { id: "wu-a1", type: "player-a", x: 32, y: 34, label: "1" },
      { id: "wu-a2", type: "player-a", x: 50, y: 23, label: "2" },
      { id: "wu-a3", type: "player-a", x: 68, y: 34, label: "3" },
      { id: "wu-a4", type: "player-a", x: 50, y: 61, label: "4" },
      { id: "wu-c1", type: "cone", x: 25, y: 20 },
      { id: "wu-c2", type: "cone", x: 75, y: 20 },
      { id: "wu-c3", type: "cone", x: 75, y: 72 },
      { id: "wu-c4", type: "cone", x: 25, y: 72 },
    ],
    lines: [
      { id: "wu-run-1", type: "run", x1: 32, y1: 34, x2: 50, y2: 23, cx: 38, cy: 20, animated: false },
      { id: "wu-run-2", type: "run", x1: 50, y1: 23, x2: 68, y2: 34, cx: 62, cy: 20, animated: false },
      { id: "wu-run-3", type: "run", x1: 68, y1: 34, x2: 50, y2: 61, cx: 68, cy: 55, animated: false },
    ],
  },
  position: {
    pitchPreset: "third",
    items: [
      { id: "pos-ball", type: "ball", x: 22, y: 54 },
      { id: "pos-a1", type: "player-a", x: 22, y: 42, label: "4" },
      { id: "pos-a2", type: "player-a", x: 48, y: 28, label: "8" },
      { id: "pos-a3", type: "player-a", x: 74, y: 42, label: "7" },
      { id: "pos-a4", type: "player-a", x: 54, y: 70, label: "10" },
      { id: "pos-m1", type: "mannequin", x: 48, y: 48 },
      { id: "pos-m2", type: "mannequin", x: 65, y: 59 },
    ],
    lines: [
      { id: "pos-pass-1", type: "pass", x1: 22, y1: 54, x2: 48, y2: 28, cx: 34, cy: 34, animated: false },
      { id: "pos-pass-2", type: "pass", x1: 48, y1: 28, x2: 74, y2: 42, cx: 62, cy: 31, animated: false },
      { id: "pos-run-1", type: "run", x1: 54, y1: 70, x2: 65, y2: 42, cx: 62, cy: 57, animated: false },
    ],
  },
  transition: {
    pitchPreset: "third",
    items: [
      { id: "tr-ball", type: "ball", x: 50, y: 52 },
      { id: "tr-a1", type: "player-a", x: 27, y: 30, label: "2" },
      { id: "tr-a2", type: "player-a", x: 35, y: 66, label: "6" },
      { id: "tr-a3", type: "player-a", x: 55, y: 25, label: "8" },
      { id: "tr-a4", type: "player-a", x: 65, y: 67, label: "10" },
      { id: "tr-b1", type: "player-b", x: 38, y: 38, label: "3" },
      { id: "tr-b2", type: "player-b", x: 47, y: 68, label: "7" },
      { id: "tr-b3", type: "player-b", x: 62, y: 42, label: "9" },
      { id: "tr-g1", type: "goal", x: 9, y: 50, rotation: 90 },
      { id: "tr-g2", type: "goal", x: 91, y: 50, rotation: 90 },
    ],
    lines: [
      { id: "tr-press-1", type: "press", x1: 38, y1: 38, x2: 50, y2: 52, cx: 45, cy: 43, animated: false },
      { id: "tr-press-2", type: "press", x1: 62, y1: 42, x2: 50, y2: 52, cx: 56, cy: 45, animated: false },
      { id: "tr-pass", type: "pass", x1: 50, y1: 52, x2: 82, y2: 50, cx: 66, cy: 43, animated: false },
    ],
  },
  tactical: {
    pitchPreset: "half",
    items: [
      { id: "ta-ball", type: "ball", x: 27, y: 49 },
      { id: "ta-b1", type: "player-b", x: 26, y: 35, label: "4" },
      { id: "ta-b2", type: "player-b", x: 26, y: 66, label: "5" },
      { id: "ta-b3", type: "player-b", x: 46, y: 48, label: "6" },
      { id: "ta-a1", type: "player-a", x: 43, y: 28, label: "9" },
      { id: "ta-a2", type: "player-a", x: 48, y: 68, label: "11" },
      { id: "ta-a3", type: "player-a", x: 63, y: 48, label: "10" },
      { id: "ta-gk", type: "goalkeeper", x: 11, y: 50 },
    ],
    lines: [
      { id: "ta-press-1", type: "press", x1: 43, y1: 28, x2: 29, y2: 39, cx: 35, cy: 29, animated: false },
      { id: "ta-press-2", type: "press", x1: 48, y1: 68, x2: 29, y2: 61, cx: 37, cy: 68, animated: false },
      { id: "ta-run", type: "run", x1: 63, y1: 48, x2: 49, y2: 49, cx: 56, cy: 45, animated: false },
    ],
  },
  cooldown: {
    pitchPreset: "blank",
    items: [
      { id: "cd-text", type: "text", x: 50, y: 20, label: "회복 · 통증 확인 · 개별 목표" },
      { id: "cd-a1", type: "player-a", x: 24, y: 52, label: "1" },
      { id: "cd-a2", type: "player-a", x: 37, y: 52, label: "2" },
      { id: "cd-a3", type: "player-a", x: 50, y: 52, label: "3" },
      { id: "cd-a4", type: "player-a", x: 63, y: 52, label: "4" },
      { id: "cd-a5", type: "player-a", x: 76, y: 52, label: "5" },
      { id: "cd-c1", type: "cone", x: 18, y: 72 },
      { id: "cd-c2", type: "cone", x: 82, y: 72 },
    ],
    lines: [],
  },
};

export const initialTrainingDrills: TrainingDrill[] = [
  ...defaultTrainingPlan.map((drill) => ({
  ...drill,
  objective: drill.point,
  method: "진행 방법과 선수 동선을 작전판과 함께 설명합니다.",
  rules: "인원, 터치 수, 득점 조건 등 현장에서 바꿀 규칙을 입력하세요.",
  keyPoints: [drill.point],
  board: defaultTrainingBoards[drill.id],
  category: "training" as const,
  builtIn: true,
  })),
  ...initialSetPieceDrills,
];

export const sessionPlayers = [
  { number: 11, name: "김민수", status: "정상", minutes: "90′", distance: "10.9km", hsr: "1.14km", sprint: "21", rpe: "6", max: "31.8", feedback: "총평 대기" },
  { number: 7, name: "박준호", status: "정상", minutes: "90′", distance: "11.2km", hsr: "1.22km", sprint: "23", rpe: "7", max: "32.4", feedback: "회고 완료" },
  { number: 4, name: "이도윤", status: "관찰", minutes: "68′", distance: "7.8km", hsr: "0.72km", sprint: "14", rpe: "6", max: "29.1", feedback: "우선 작성" },
  { number: 20, name: "윤시우", status: "재활", minutes: "22′", distance: "3.1km", hsr: "0.31km", sprint: "2", rpe: "4", max: "30.0", feedback: "메모 연결" },
  { number: 18, name: "최우진", status: "제한", minutes: "90′", distance: "10.2km", hsr: "0.96km", sprint: "10", rpe: "5", max: "30.7", feedback: "전달 완료" },
  { number: 9, name: "오세훈", status: "GPS 누락", minutes: "76′", distance: "—", hsr: "—", sprint: "—", rpe: "—", max: "—", feedback: "데이터 확인" },
  ...players.filter((player) => ![11, 7, 4, 20, 18, 9].includes(player.number)).map((player, index) => ({
    number: player.number,
    name: player.name,
    status: player.status === "정상" ? "정상" : "관찰",
    minutes: `${index < 7 ? 90 : 45 + (index % 4) * 10}′`,
    distance: `${(8.2 + (index % 6) * 0.48).toFixed(1)}km`,
    hsr: `${(0.61 + (index % 5) * 0.13).toFixed(2)}km`,
    sprint: `${9 + (index % 7) * 2}`,
    rpe: `${5 + (index % 3)}`,
    max: `${(29.4 + (index % 6) * 0.6).toFixed(1)}`,
    feedback: index % 4 === 0 ? "총평 대기" : index % 4 === 1 ? "회고 완료" : index % 4 === 2 ? "전달 완료" : "코치 확인",
  })),
];

export const defaultTrainingPlayerData: TrainingPlayerData[] = [
  { playerId: 1, number: 11, name: "김민수", condition: 9, status: "정상", participation: "전체", rpe: 6, feedback: "첫 터치 전에 다음 패스 방향을 먼저 확인해보자.", feedbackSent: false },
  { playerId: 2, number: 7, name: "박준호", condition: 8, status: "정상", participation: "전체", rpe: 7, feedback: "전환 순간 첫 세 걸음의 속도를 끝까지 유지해보자.", feedbackSent: true, feedbackVisibleToParent: true },
  { playerId: 3, number: 4, name: "이도윤", condition: 5, status: "관찰", participation: "제한", rpe: 5, feedback: "발목 상태를 보면서 방향 전환 각도를 작게 시작하자.", feedbackSent: false },
  { playerId: 4, number: 18, name: "최우진", condition: 9, status: "제한", participation: "제한", rpe: 5, feedback: "고강도 반복 수보다 움직임의 타이밍에 집중하자.", feedbackSent: true },
  { playerId: 5, number: 1, name: "정현우", condition: 8, status: "정상", participation: "전체", rpe: 6, feedback: "빌드업 시작 위치를 조금 더 빠르게 잡아보자.", feedbackSent: false },
  { playerId: 6, number: 14, name: "한지민", condition: 7, status: "정상", participation: "전체", rpe: 6, feedback: "압박 전 등 뒤 공간을 한 번 더 확인해보자.", feedbackSent: false },
  { playerId: 7, number: 20, name: "윤시우", condition: 5, status: "재활", participation: "제외", rpe: 3, feedback: "오늘은 패스와 전술 설명만 참여하고 통증을 바로 알려줘.", feedbackSent: true },
  { playerId: 8, number: 9, name: "오세훈", condition: 8, status: "정상", participation: "전체", rpe: 6, feedback: "문전에서 첫 선택을 단순하게 가져가보자.", feedbackSent: false },
  ...players.slice(8).map<TrainingPlayerData>((player, index) => ({
    playerId: player.id,
    number: player.number,
    name: player.name,
    condition: player.condition,
    status: player.status === "관찰" ? "관찰" : "정상",
    participation: player.status === "관찰" ? "제한" : "전체",
    rpe: 5 + (index % 3),
    feedback: [
      "공을 받기 전에 전방과 반대편을 한 번 더 확인하자.",
      "압박이 시작되면 첫 두 걸음을 더 빠르게 가져가자.",
      "수비 라인과 간격을 유지하면서 먼저 대화해보자.",
      "좋은 위치를 잡았어. 다음에는 첫 선택까지 더 단순하게 가보자.",
      "볼이 없는 순간의 움직임을 한 번 더 일찍 시작하자.",
      "경기 속도에서도 정확한 자세와 타이밍을 유지해보자.",
    ][index % 6],
    feedbackSent: index % 3 === 0,
    feedbackVisibleToParent: index % 6 === 0,
  })),
];

export type TrainingTemplate = {
  id: string;
  name: string;
  duration: number;
  intensity: TrainingIntensity;
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
    duration: 120,
    intensity: "High",
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
    duration: 65,
    intensity: "Low",
    location: "메인구장",
    objective: "경기 전 공격·수비 세트피스 역할과 킥 위치를 최종 확인합니다.",
    coachingPoints: "세컨드볼 위치 / 키커 신호 / 수비 라인 동시 출발",
    memo: "고강도 러닝 없이 전술 정확도 중심으로 운영합니다.",
    planBlocks: [
      { id: "setpiece-warmup", title: "볼 워밍업", duration: 10, intensity: "Low", group: "전체", setup: "페널티 박스 외곽 · 볼 10개", point: "킥 감각과 가동범위 확인" },
      { id: "attacking-setpiece", title: "공격 세트피스", duration: 25, intensity: "Medium", group: "공격조", setup: "풀 사이즈 골대 · 10v8", point: "키커 신호와 1·2차 움직임" },
      { id: "defending-setpiece", title: "수비 세트피스", duration: 20, intensity: "Medium", group: "수비조", setup: "풀 사이즈 골대 · 8v10", point: "마킹 전달과 세컨드볼 위치" },
      { id: "setpiece-review", title: "상황 복기", duration: 10, intensity: "Low", group: "전체", setup: "센터서클", point: "선수별 역할 재확인" },
    ],
    builtIn: true,
  },
  {
    id: "template-recovery",
    name: "경기 후 회복",
    duration: 70,
    intensity: "Low",
    location: "회복실·보조구장",
    objective: "경기 부하를 낮추고 개인별 통증과 회복 상태를 확인합니다.",
    coachingPoints: "통증 즉시 공유 / 낮은 심박 유지 / 개인 보완 분리",
    memo: "경기 60분 이상 출전 선수와 미출전 선수를 분리 운영합니다.",
    planBlocks: [
      { id: "recovery-bike", title: "저강도 유산소", duration: 20, intensity: "Low", group: "60분 이상 출전", setup: "회복실 · 바이크", point: "RPE 3 이하 유지" },
      { id: "recovery-mobility", title: "모빌리티", duration: 20, intensity: "Low", group: "전체", setup: "매트 · 폼롤러", point: "고관절·발목 가동범위" },
      { id: "recovery-individual", title: "개별 보완", duration: 20, intensity: "Medium", group: "미출전·저출전", setup: "보조구장 · 볼·미니골", point: "출전 시간별 프로그램 분리" },
      { id: "recovery-check", title: "컨디션 체크", duration: 10, intensity: "Low", group: "전체", setup: "회복실", point: "통증과 다음 참여 판단" },
    ],
    builtIn: true,
  },
];

export const matchMoments: MatchMoment[] = [
  { id: "match-goal-18", minute: "18′", type: "GOAL", title: "김민수 선제골", detail: "박준호 컷백 · 문전 오른발 마무리" },
  { id: "match-conceded-43", minute: "43′", type: "CONCEDED", title: "수원FC 동점골", detail: "세컨드볼 대응 지연" },
  { id: "match-tactic-58", minute: "58′", type: "TACTIC", title: "4-3-3 → 4-2-3-1", detail: "중원 숫자와 압박 위치 조정" },
  { id: "match-medical-68", minute: "68′", type: "MEDICAL", title: "이도윤 교체", detail: "오른쪽 발목 불편 보고" },
  { id: "match-goal-72", minute: "72′", type: "GOAL", title: "박준호 결승골", detail: "전환 6초 · 왼발 슈팅" },
];

const matchPositions = ["LW", "RW", "CB", "CM", "GK", "DM", "ST", "AM", "RB", "LB", "CB", "CM", "LW", "RW", "DM", "CB", "ST", "GK"];

export const defaultMatchPlayerData: MatchPlayerData[] = sessionPlayers.slice(0, 18).map((player, index) => {
  const minutes = Number.parseInt(player.minutes, 10) || 0;
  const distance = player.distance === "—" ? null : Number.parseFloat(player.distance);
  const hsr = player.hsr === "—" ? null : Number.parseFloat(player.hsr);
  const sprints = player.sprint === "—" ? null : Number(player.sprint);
  const maxSpeed = player.max === "—" ? null : Number(player.max);
  const sourcePlayer = players.find((item) => item.number === player.number);
  return {
    playerId: sourcePlayer?.id ?? index + 1,
    number: player.number,
    name: player.name,
    position: matchPositions[index] ?? "MF",
    role: index < 11 ? "선발" : index < 18 ? "교체" : "미출전",
    status: player.status as MatchPlayerData["status"],
    minutes,
    distance,
    hsr,
    sprints,
    maxSpeed,
    rating: [8.2, 8.6, 6.8, 6.5, 7.4, 6.9, 7.1, 7.3, 6.7, 7.0, 7.2, 6.8, 7.4, 6.6, 6.9, 7.1, 6.7, 6.8][index] ?? 7,
    feedback: [
      "문전에서 첫 선택이 좋았어. 수비 전환 때 첫 압박 위치만 조금 더 빠르게 잡아보자.",
      "전환 순간의 속도와 마무리가 좋았어. 같은 판단을 다음 경기에서도 반복해보자.",
      "라인을 올릴 때 옆 센터백과 거리를 먼저 확인하자.",
      "발목 상태를 우선 확인하고 회복 훈련 참여 범위를 결정하자.",
    ][index % 4],
    feedbackSent: index % 3 === 1,
    feedbackVisibleToParent: index % 6 === 1,
  };
});
