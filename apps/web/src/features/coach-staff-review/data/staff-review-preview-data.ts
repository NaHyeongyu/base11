import type { Tone } from "@/shared/model/tone";

export const staffReviews = [
  { id: 1, session: "MD-2 포지션 훈련", author: "박성진 수석코치", message: "공격조 전환 게임을 12분으로 늘려주세요.", status: "반영 대기", tone: "orange" as Tone },
  { id: 2, session: "MD-1 세트피스", author: "이상훈 GK 코치", message: "수비 코너킥 2번 패턴 영상을 연결했습니다.", status: "확인 필요", tone: "purple" as Tone },
  { id: 3, session: "MD 경기", author: "구단 운영팀", message: "버스 출발 시간이 12:40으로 변경되었습니다.", status: "게시 대기", tone: "blue" as Tone },
];
