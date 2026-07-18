import { Icon, type IconName } from "@/features/coach-shell/icon";
import type { Player, Tone } from "@/features/coach-data/mock-data";

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <header className="page-header"><div><p className="page-eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-description">{description}</p></div>{action && <div className="page-actions">{action}</div>}</header>;
}

export function ActionButton({ children, icon = "plus", secondary = false }: { children: React.ReactNode; icon?: IconName; secondary?: boolean }) {
  return <button className={secondary ? "action-button secondary" : "action-button"}><Icon name={icon} size={17} />{children}</button>;
}

export function MetricCard({ label, value, helper, tone = "blue", delta }: { label: string; value: string; helper: string; tone?: Tone; delta?: string }) {
  return <article className={`metric-card tone-${tone}`}><div className="metric-top"><span>{label}</span>{delta && <em>{delta}</em>}</div><strong>{value}</strong><p>{helper}</p><i className="metric-accent" /></article>;
}

export function Panel({ title, description, action, children, className = "" }: { title: string; description?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return <section className={`content-panel ${className}`}><header className="panel-title"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</header>{children}</section>;
}

export function Badge({ children, tone = "gray" }: { children: React.ReactNode; tone?: Tone }) {
  return <span className={`status-badge tone-${tone}`}>{children}</span>;
}

export function PlayerIdentity({ player, compact = false }: { player: Player; compact?: boolean }) {
  return <div className="player-identity"><span className={`avatar position-${player.position.toLowerCase()}`}>{player.number}</span><span><strong>{player.name}</strong><small>{compact ? `${player.position} · ${player.grade}` : `No.${player.number} · ${player.position} · ${player.grade}`}</small></span></div>;
}

export function ProgressBar({ value, tone = "blue" }: { value: number; tone?: Tone }) {
  return <div className={`progress-track tone-${tone}`}><span style={{ width: `${value}%` }} /></div>;
}

export function EmptyState({ icon, title, description }: { icon: IconName; title: string; description: string }) {
  return <div className="empty-state"><span><Icon name={icon} size={24} /></span><strong>{title}</strong><p>{description}</p></div>;
}
