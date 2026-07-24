import type { Player } from "@/features/players/model/player";

export function PlayerIdentity({ player, compact = false }: { player: Player; compact?: boolean }) {
  return <div className="player-identity"><span className={`avatar position-${player.position.toLowerCase()}`}>{player.number}</span><span><strong>{player.name}</strong><small>{compact ? `${player.position} · ${player.grade}` : `No.${player.number} · ${player.position} · ${player.grade}`}</small></span></div>;
}
