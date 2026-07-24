export type Player = {
  id: number;
  name: string;
  number: number;
  position: string;
  grade: string;
  attendance: number;
  goalProgress: number;
  sessionLoad: number;
  condition: number;
  status: "정상" | "관찰" | "부상";
  dominantFoot: "오른발" | "왼발";
  height: number;
  weight: number;
};
