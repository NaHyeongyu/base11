import { players } from "@/features/players/data/player-preview-data";
import type { Tone } from "@/shared/model/tone";

export const playerIssues = [
  { player: players[2], type: "통증", detail: "왼쪽 발목 4/10", action: "훈련 제한 검토", owner: "최은지", tone: "red" as Tone },
  { player: players[6], type: "복귀", detail: "햄스트링 재활 3주차", action: "피치 복귀 승인", owner: "최은지", tone: "orange" as Tone },
  { player: players[1], type: "목표", detail: "전진 패스 목표 리뷰", action: "세션 전 5분 미팅", owner: "김태호", tone: "purple" as Tone },
];
