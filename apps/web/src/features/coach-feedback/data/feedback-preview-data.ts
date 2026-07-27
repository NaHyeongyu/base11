import { players } from "@/features/players/data/player-preview-data";

export type RecommendationStatus = "review" | "delivered" | "hold";

export type ImprovementRecommendation = {
  id: number;
  player: (typeof players)[number];
  issue: string;
  category: "기술" | "피지컬" | "전술";
  source: string;
  timing: string;
  status: RecommendationStatus;
  priority?: boolean;
  drills: string[];
  cues: string[];
  successTarget: string;
  nextReview: string;
  evidence: {
    tag: string;
    matchNote: string;
    confidence: string;
  };
};

export const improvementRecommendations: ImprovementRecommendation[] = [
  {
    id: 1,
    player: players[0],
    issue: "압박 상황에서 첫 터치 방향 만들기",
    category: "기술",
    source: "반복 2회",
    timing: "오늘",
    status: "review",
    priority: true,
    drills: [
      "벽 패스 후 좌우 방향 터치 · 30회",
      "콘을 활용한 오픈 바디 터치 · 3세트",
      "2대1 압박 탈출 · 훈련 전 8분",
    ],
    cues: [
      "공을 받기 전 최소 두 번 주변 확인",
      "몸을 반쯤 열고 상대 반대 방향으로 터치",
      "첫 터치 후 두 번째 행동까지 빠르게 연결",
    ],
    successTarget: "방향 전환 10회 중 7회",
    nextReview: "7월 30일",
    evidence: {
      tag: "코치 태그 · 최근 2회",
      matchNote: "경기 메모 · 중앙으로 첫 터치",
      confidence: "높음 87%",
    },
  },
  {
    id: 2,
    player: players[1],
    issue: "후반 반복 스프린트 유지",
    category: "피지컬",
    source: "GPS",
    timing: "오늘",
    status: "review",
    drills: [
      "15m 왕복 스프린트 · 6회 2세트",
      "감속 후 재가속 드릴 · 4분",
      "후반부 템포 러닝 · 8분",
    ],
    cues: [
      "첫 세 걸음에서 보폭보다 빈도 유지",
      "감속 직후 상체가 뒤로 젖지 않게 제어",
      "마지막 반복까지 출발 자세를 동일하게 유지",
    ],
    successTarget: "6회차 속도 저하 8% 이내",
    nextReview: "8월 1일",
    evidence: {
      tag: "GPS 고강도 주행 · 최근 3회",
      matchNote: "후반 20분 이후 반복 질주 감소",
      confidence: "중간 79%",
    },
  },
  {
    id: 3,
    player: players[2],
    issue: "수비 전환 복귀 위치",
    category: "전술",
    source: "경기 메모",
    timing: "내일",
    status: "review",
    drills: [
      "볼 상실 후 5초 전환 게임 · 3세트",
      "센터백 기준 위치 복귀 · 12회",
      "3대3+2 전환 훈련 · 8분",
    ],
    cues: [
      "볼보다 먼저 골대와 상대를 함께 확인",
      "첫 복귀 지점을 중앙 통로로 설정",
      "동료 수비수와 간격을 8m 안으로 유지",
    ],
    successTarget: "복귀 위치 성공 10회 중 8회",
    nextReview: "8월 2일",
    evidence: {
      tag: "코치 태그 · 최근 1회",
      matchNote: "전환 순간 측면에 머문 장면 반복",
      confidence: "높음 84%",
    },
  },
  {
    id: 4,
    player: players[3],
    issue: "침투 전 주변 확인",
    category: "전술",
    source: "코치 태그",
    timing: "2일 전",
    status: "delivered",
    drills: ["시야 확보 후 침투 · 20회", "패서와 타이밍 맞추기 · 3세트"],
    cues: ["출발 전 수비 라인을 먼저 확인", "패서가 고개를 들 때 속도를 높이기"],
    successTarget: "오프사이드 없이 침투 8회",
    nextReview: "7월 29일",
    evidence: {
      tag: "코치 태그 · 최근 3회",
      matchNote: "침투 타이밍 개선 필요",
      confidence: "높음 90%",
    },
  },
  {
    id: 5,
    player: players[5],
    issue: "약발 패스 정확도",
    category: "기술",
    source: "훈련 기록",
    timing: "3일 전",
    status: "hold",
    drills: ["약발 벽 패스 · 50회", "이동 중 약발 패스 · 3세트"],
    cues: ["지지발을 목표 방향에 두기", "발목을 고정하고 공 중앙을 타격"],
    successTarget: "15m 패스 10회 중 8회",
    nextReview: "8월 4일",
    evidence: {
      tag: "훈련 기록 · 최근 2회",
      matchNote: "약발 선택 시 템포 지연",
      confidence: "중간 74%",
    },
  },
];

export const completedImprovementTasks = [
  { title: "수비 전환 첫 세 걸음", date: "7월 13일" },
  { title: "침투 전 주변 확인", date: "7월 6일" },
  { title: "약발 패스 정확도", date: "6월 24일" },
];
