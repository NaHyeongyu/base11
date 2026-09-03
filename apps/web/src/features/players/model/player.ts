export type ConditionScore = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export function toConditionScore(value: number): ConditionScore {
  return Math.max(0, Math.min(10, Math.round(value))) as ConditionScore;
}

export type Player = {
  id: number;
  name: string;
  number: number;
  position: string;
  grade: string;
  attendance: number;
  goalProgress: number;
  sessionLoad: number;
  condition: ConditionScore;
  status: "정상" | "관찰" | "부상";
  dominantFoot: "오른발" | "왼발";
  height: number;
  weight: number;
};
