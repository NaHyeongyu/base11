export type Tone = "blue" | "green" | "orange" | "red" | "gray" | "purple";

export type Player = {
  id: number;
  name: string;
  number: number;
  position: string;
  grade: string;
  attendance: number;
  condition: number;
  status: "정상" | "관찰" | "부상";
  dominantFoot: "오른발" | "왼발";
  height: number;
  weight: number;
};

export const players: Player[] = [
  { id: 1, name: "김민수", number: 11, position: "FW", grade: "3학년", attendance: 96, condition: 86, status: "정상", dominantFoot: "오른발", height: 178, weight: 70 },
  { id: 2, name: "박준호", number: 7, position: "MF", grade: "3학년", attendance: 92, condition: 78, status: "정상", dominantFoot: "왼발", height: 174, weight: 66 },
  { id: 3, name: "이도윤", number: 4, position: "DF", grade: "2학년", attendance: 88, condition: 52, status: "관찰", dominantFoot: "오른발", height: 182, weight: 74 },
  { id: 4, name: "최우진", number: 18, position: "FW", grade: "2학년", attendance: 94, condition: 91, status: "정상", dominantFoot: "오른발", height: 176, weight: 68 },
  { id: 5, name: "정현우", number: 1, position: "GK", grade: "3학년", attendance: 98, condition: 84, status: "정상", dominantFoot: "오른발", height: 187, weight: 79 },
  { id: 6, name: "한지민", number: 14, position: "MF", grade: "1학년", attendance: 90, condition: 73, status: "정상", dominantFoot: "오른발", height: 171, weight: 63 },
  { id: 7, name: "윤시우", number: 20, position: "DF", grade: "2학년", attendance: 84, condition: 45, status: "부상", dominantFoot: "왼발", height: 180, weight: 73 },
  { id: 8, name: "오세훈", number: 9, position: "FW", grade: "3학년", attendance: 95, condition: 82, status: "정상", dominantFoot: "오른발", height: 181, weight: 75 },
];

export const todaySchedule = [
  { time: "16:30", end: "17:10", title: "선수 개별 미팅", type: "미팅", location: "클럽하우스", participants: "3명", tone: "purple" as Tone },
  { time: "18:00", end: "20:00", title: "팀 전술 훈련", type: "훈련", location: "안양 보조구장", participants: "26명", tone: "blue" as Tone },
  { time: "20:10", end: "20:40", title: "코칭스태프 리뷰", type: "미팅", location: "전술실", participants: "5명", tone: "gray" as Tone },
];

export const weekEvents = [
  { date: 14, day: "월", events: [{ time: "18:00", title: "회복 훈련", tone: "green" as Tone }] },
  { date: 15, day: "화", events: [{ time: "18:00", title: "전술 훈련", tone: "blue" as Tone }] },
  { date: 16, day: "수", events: [{ time: "16:00", title: "연습 경기", tone: "orange" as Tone }] },
  { date: 17, day: "목", events: [{ time: "OFF", title: "휴식", tone: "gray" as Tone }] },
  { date: 18, day: "금", current: true, events: [{ time: "18:00", title: "팀 전술 훈련", tone: "blue" as Tone }, { time: "20:10", title: "코치 미팅", tone: "purple" as Tone }] },
  { date: 19, day: "토", events: [{ time: "10:00", title: "세트피스", tone: "blue" as Tone }] },
  { date: 20, day: "일", events: [{ time: "15:00", title: "vs 수원FC U18", tone: "orange" as Tone }] },
];

export const notices = [
  { id: 103, title: "주말 원정경기 집합 및 준비물 안내", target: "선수 · 학부모", author: "김태호", date: "7월 18일 10:24", read: 24, total: 26, pinned: true },
  { id: 102, title: "7월 훈련 일정 변경 안내", target: "전체 팀", author: "박성진", date: "7월 16일 18:42", read: 26, total: 26, pinned: false },
  { id: 101, title: "선수 컨디션 체크 운영 방식", target: "선수", author: "김태호", date: "7월 14일 09:10", read: 22, total: 26, pinned: false },
  { id: 100, title: "학부모 정기 간담회 안내", target: "학부모", author: "구단 운영팀", date: "7월 12일 14:30", read: 25, total: 26, pinned: false },
];

export const attendanceRows = [
  { player: players[0], response: "참석", checkIn: "17:34", condition: "좋음", pain: "없음" },
  { player: players[1], response: "지각", checkIn: "18:07", condition: "보통", pain: "없음" },
  { player: players[2], response: "일부 참여", checkIn: "17:38", condition: "주의", pain: "왼쪽 발목 4/10" },
  { player: players[3], response: "참석", checkIn: "17:29", condition: "좋음", pain: "없음" },
  { player: players[4], response: "참석", checkIn: "17:31", condition: "좋음", pain: "없음" },
  { player: players[5], response: "미응답", checkIn: "-", condition: "미확인", pain: "-" },
  { player: players[6], response: "결석", checkIn: "-", condition: "회복", pain: "오른쪽 햄스트링" },
  { player: players[7], response: "참석", checkIn: "17:40", condition: "보통", pain: "없음" },
];

export const missions = [
  { player: players[0], title: "박스 안 첫 선택을 빠르게", progress: 80, streak: 4, updated: "오늘" },
  { player: players[1], title: "전진 패스 전 주변 확인 2회", progress: 68, streak: 3, updated: "오늘" },
  { player: players[2], title: "수비 전환 3초 안에 복귀", progress: 54, streak: 2, updated: "어제" },
  { player: players[3], title: "왼발 슈팅 10회 이상 시도", progress: 72, streak: 5, updated: "오늘" },
  { player: players[5], title: "하프턴 후 전진 드리블", progress: 46, streak: 1, updated: "2일 전" },
];

export const feedbackQueue = [
  { player: players[2], session: "7월 18일 팀 전술 훈련", self: "미션을 의식했지만 후반에 집중력이 떨어졌습니다.", due: "오늘", priority: true },
  { player: players[1], session: "7월 16일 연습 경기", self: "전진 패스 타이밍은 좋았지만 반대 전환이 부족했습니다.", due: "오늘", priority: false },
  { player: players[5], session: "7월 15일 전술 훈련", self: "공을 받기 전에 한 번 더 볼 수 있었습니다.", due: "내일", priority: false },
];

export const matches = [
  { date: "7.13", competition: "K리그 주니어 U18", opponent: "부천FC U18", home: 2, away: 1, result: "승", possession: 54, shots: 11 },
  { date: "7.06", competition: "K리그 주니어 U18", opponent: "서울이랜드 U18", home: 0, away: 0, result: "무", possession: 49, shots: 8 },
  { date: "6.29", competition: "K리그 주니어 U18", opponent: "수원삼성 U18", home: 1, away: 3, result: "패", possession: 46, shots: 7 },
  { date: "6.22", competition: "전국고등축구리그", opponent: "용인시축구센터", home: 3, away: 1, result: "승", possession: 57, shots: 14 },
];

export const notifications = [
  { id: 1, title: "이도윤 선수가 통증을 보고했습니다", body: "왼쪽 발목 · 통증 4/10 · 오늘 17:22", group: "선수 상태", unread: true },
  { id: 2, title: "오늘 훈련에 2명이 아직 응답하지 않았습니다", body: "한지민, 강태윤 · 훈련 시작 2시간 전", group: "출석", unread: true },
  { id: 3, title: "공지 확인율이 92%입니다", body: "주말 원정경기 집합 및 준비물 안내", group: "공지", unread: true },
  { id: 4, title: "박준호 선수가 훈련 리뷰를 완료했습니다", body: "7월 16일 연습 경기 · 피드백 대기", group: "피드백", unread: false },
  { id: 5, title: "일요일 경기 명단 제출 마감 D-2", body: "vs 수원FC U18 · 7월 20일 15:00", group: "경기", unread: false },
];
