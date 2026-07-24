import { players } from "@/features/players/data/player-preview-data";

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
