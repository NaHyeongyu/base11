import type { TeamSummary } from "../model/summary";

export function TeamSummaryCard({ label, value, helper, tone }: TeamSummary) {
  return (
    <article className={`summary-card ${tone}`}>
      <span className="summary-icon" aria-hidden="true" />
      <p>{label}</p>
      <strong>{value}</strong>
      <small>{helper}</small>
    </article>
  );
}

