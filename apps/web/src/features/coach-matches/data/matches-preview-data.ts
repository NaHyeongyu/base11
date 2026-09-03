export type MatchPreview = {
  id: string;
  date: string;
  competition: string;
  opponent: string;
  home: number;
  away: number;
  result: "승" | "무" | "패";
  possession: number;
  shots: number;
  venue: string;
};

export const matches: MatchPreview[] = [
  { id: "match-20260720", date: "7.20", competition: "전국중등축구리그 U15", opponent: "수원 FC U15", home: 2, away: 1, result: "승", possession: 53, shots: 12, venue: "수원월드컵 보조구장" },
  { id: "match-0712", date: "7.12", competition: "전국중등축구리그 U15", opponent: "청주 FCK U15", home: 3, away: 0, result: "승", possession: 58, shots: 15, venue: "청주종합운동장 보조구장" },
  { id: "match-0705", date: "7.05", competition: "주말 연습경기", opponent: "부천 FC U15", home: 1, away: 1, result: "무", possession: 51, shots: 10, venue: "부천체육관 보조구장" },
  { id: "match-0628", date: "6.28", competition: "전국중등축구리그 U15", opponent: "서울 이랜드 U15", home: 2, away: 0, result: "승", possession: 55, shots: 13, venue: "탄천종합운동장" },
  { id: "match-0621", date: "6.21", competition: "전국중등축구리그 U15", opponent: "수원 삼성 U15", home: 1, away: 2, result: "패", possession: 47, shots: 8, venue: "매탄고 운동장" },
  { id: "match-0614", date: "6.14", competition: "전국중등축구리그 U15", opponent: "안산 그리너스 U15", home: 3, away: 1, result: "승", possession: 56, shots: 14, venue: "탄천종합운동장" },
  { id: "match-0607", date: "6.07", competition: "전국중등축구리그 U15", opponent: "FC 서울 U15", home: 2, away: 2, result: "무", possession: 48, shots: 11, venue: "오산고 운동장" },
  { id: "match-0531", date: "5.31", competition: "전국중등축구리그 U15", opponent: "용인시축구센터 U15", home: 4, away: 1, result: "승", possession: 59, shots: 17, venue: "탄천종합운동장" },
  { id: "match-0524", date: "5.24", competition: "전국중등축구리그 U15", opponent: "인천 유나이티드 U15", home: 0, away: 1, result: "패", possession: 50, shots: 9, venue: "인천축구전용경기장 보조구장" },
  { id: "match-0517", date: "5.17", competition: "전국중등축구리그 U15", opponent: "김포 FC U15", home: 2, away: 0, result: "승", possession: 54, shots: 12, venue: "탄천종합운동장" },
  { id: "match-0510", date: "5.10", competition: "전국중등축구리그 U15", opponent: "광주 FC U15", home: 3, away: 2, result: "승", possession: 52, shots: 13, venue: "광주축구센터" },
  { id: "match-0503", date: "5.03", competition: "전국중등축구리그 U15", opponent: "천안시티 U15", home: 1, away: 0, result: "승", possession: 57, shots: 10, venue: "탄천종합운동장" },
];
