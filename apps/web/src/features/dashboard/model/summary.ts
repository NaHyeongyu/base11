export type SummaryTone = "blue" | "green" | "orange";

export interface TeamSummary {
  label: string;
  value: string;
  helper: string;
  tone: SummaryTone;
}

