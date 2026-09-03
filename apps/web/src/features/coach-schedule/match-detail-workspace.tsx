"use client";

import { useEffect, useMemo, useState } from "react";
import { buildParentMatchView, parentHiddenData } from "@/features/audience/parent-access-policy";
import {
  defaultMatchPlayerData,
  type CalendarEvent,
  type MatchMoment,
  type MatchMomentType,
  type MatchPlayerData,
} from "@/features/coach-schedule/data/schedule-preview-data";
import { MatchPlayerDataPanel } from "@/features/coach-schedule/match-player-data-panel";
import { Icon } from "@/shared/ui/icon";

type MatchDetailTab = "record" | "notes" | "players";
type AudiencePreview = "player" | "parent";

const teamName = "FC 성남 U15";
const momentLabels: Record<MatchMomentType, string> = {
  GOAL: "득점",
  CONCEDED: "실점",
  SUB: "교체",
  CARD: "카드",
  MEDICAL: "부상",
  TACTIC: "전술",
};

const pitchPositions = [
  { left: 50, top: 88 },
  { left: 14, top: 69 }, { left: 38, top: 72 }, { left: 62, top: 72 }, { left: 86, top: 69 },
  { left: 22, top: 47 }, { left: 50, top: 52 }, { left: 78, top: 47 },
  { left: 18, top: 20 }, { left: 50, top: 15 }, { left: 82, top: 20 },
];

function formatDate(date: string | undefined, day: number) {
  if (!date) return `2026년 7월 ${day}일`;
  const [year, month, dateValue] = date.split("-").map(Number);
  return `${year}년 ${month}월 ${dateValue}일`;
}

function startersForFormation(players: MatchPlayerData[]) {
  const starterPool = players.filter((player) => player.role === "선발");
  const remaining = [...starterPool];
  const formationOrder = ["GK", "RB", "CB", "CB", "LB", "DM", "CM", "AM", "RW", "ST", "LW"];
  return formationOrder.flatMap((position) => {
    const index = remaining.findIndex((player) => player.position === position);
    if (index < 0) return [];
    return remaining.splice(index, 1);
  }).concat(remaining).slice(0, 11);
}

function MatchLineupBoard({ players, formation, onEditPlayers }: {
  players: MatchPlayerData[];
  formation: string;
  onEditPlayers: () => void;
}) {
  const starters = startersForFormation(players);
  const bench = players.filter((player) => player.role === "교체");
  const excluded = players.filter((player) => player.role === "미출전");

  return <div className="match-lineup-layout match-prepare-lineup">
    <section className="match-v2-surface match-lineup-board-card">
      <header><div><h2>선발 라인업</h2><p>{formation} · 선수 역할은 지도자에게만 공개됩니다.</p></div><button onClick={onEditPlayers}><Icon name="edit" size={14} />명단 편집</button></header>
      <div className="match-pitch" aria-label={`${formation} 선발 포메이션`}>
        <div className="match-pitch-center" />
        <div className="match-pitch-box top" />
        <div className="match-pitch-box bottom" />
        {starters.map((player, index) => <article key={player.playerId} style={{ left: `${pitchPositions[index]?.left ?? 50}%`, top: `${pitchPositions[index]?.top ?? 50}%` }}>
          <span>{player.number}</span><strong>{player.name}</strong><small>{player.position}</small>
        </article>)}
      </div>
    </section>
    <aside className="match-lineup-side">
      <section className="match-v2-surface match-entry-summary">
        <header><div><h2>엔트리</h2><p>선발과 벤치 구성 상태입니다.</p></div><span>{starters.length === 11 ? "확정" : "확인 필요"}</span></header>
        <dl><div><dt>전체 엔트리</dt><dd>{players.length}명</dd></div><div><dt>선발</dt><dd>{starters.length}명</dd></div><div><dt>벤치</dt><dd>{bench.length}명</dd></div><div><dt>미출전</dt><dd>{excluded.length}명</dd></div></dl>
      </section>
      <section className="match-v2-surface match-bench-card">
        <header><div><h2>벤치</h2><p>교체 후보를 등번호 순으로 확인합니다.</p></div></header>
        <div>{bench.map((player) => <button type="button" key={player.playerId} onClick={onEditPlayers}><span>{player.number}</span><div><strong>{player.name}</strong><small>{player.position} · {player.status}</small></div><Icon name="chevron" size={14} /></button>)}</div>
      </section>
    </aside>
  </div>;
}

function MatchPreparationWorkspace({ session, players, onEdit, onPlayersChange, onMatchUpdate }: {
  session: CalendarEvent;
  players: MatchPlayerData[];
  onEdit: () => void;
  onPlayersChange: (players: MatchPlayerData[]) => void;
  onMatchUpdate: (updates: Partial<CalendarEvent>) => void;
}) {
  const [audience, setAudience] = useState<AudiencePreview>("player");
  const [squadEditorOpen, setSquadEditorOpen] = useState(false);
  const starters = players.filter((player) => player.role === "선발").length;
  const attentionPlayers = players.filter((player) => player.status === "관찰" || player.status === "제한" || player.status === "재활");
  const published = session.matchPublicationStatus === "공개";
  const reviewed = session.matchReviewStatus === "확인 완료";

  function publishMatch() {
    onMatchUpdate({
      matchStatus: "팀 공개",
      matchPublicationStatus: "공개",
      playerReadCount: session.playerReadCount || 1,
      parentReadCount: session.parentReadCount || 1,
    });
  }

  return <div className="match-preparation-workspace">
    <div className="match-prepare-top">
      <section className="match-v2-surface match-prepare-checklist">
        <header><div><h2>경기 준비</h2><p>공개 전에 세 가지만 확인합니다.</p></div><span>{[Boolean(session.time && session.location), starters === 11, reviewed].filter(Boolean).length}/3 완료</span></header>
        <div>
          <button type="button" onClick={onEdit}><i className={session.time && session.location ? "done" : ""}><Icon name={session.time && session.location ? "check" : "notice"} size={16} /></i><span><strong>일정·소집 정보</strong><small>{session.gatheringTime ?? "집결 미정"} · {session.gatheringPlace ?? "장소 미정"}</small></span><em>{session.time && session.location ? "완료" : "확인"}</em><Icon name="chevron" size={15} /></button>
          <button type="button" onClick={() => setSquadEditorOpen((value) => !value)}><i className={starters === 11 ? "done" : ""}><Icon name={starters === 11 ? "check" : "notice"} size={16} /></i><span><strong>엔트리·라인업</strong><small>선발 {starters}명 · 상태 확인 {attentionPlayers.length}명</small></span><em>{starters === 11 ? "완료" : "확인"}</em><Icon name="chevron" size={15} /></button>
          <button type="button" onClick={() => onMatchUpdate({ matchReviewStatus: reviewed ? "검토 요청" : "확인 완료", matchStatus: reviewed ? "지도자 공유" : session.matchStatus })}><i className={reviewed ? "done" : ""}><Icon name={reviewed ? "check" : "users"} size={16} /></i><span><strong>지도자 검토</strong><small>전술·선발·참가 제한을 내부에서 확인합니다.</small></span><em>{reviewed ? "확인 완료" : "검토 필요"}</em><Icon name="chevron" size={15} /></button>
        </div>
      </section>

      <section className="match-v2-surface match-plan-card">
        <header><div><h2>지도자 계획</h2><p>선수·학부모에게 공개되지 않습니다.</p></div><button onClick={onEdit}><Icon name="edit" size={14} />수정</button></header>
        <dl><div><dt>경기 목표</dt><dd>{session.matchObjective}</dd></div><div><dt>기본 포메이션</dt><dd>{session.formation ?? "4-3-3"}</dd></div><div><dt>지도자 메모</dt><dd>{session.matchCoachNote}</dd></div></dl>
      </section>
    </div>

    <section className="match-v2-surface match-audience-share">
      <header><div><h2>팀 공유</h2><p>같은 경기에서 각 대상에게 필요한 정보만 보여줍니다.</p></div><span className={published ? "published" : "draft"}>{published ? "팀에 공개됨" : "공개 전"}</span></header>
      <div className="match-audience-tabs" role="tablist" aria-label="공개 화면 미리보기"><button className={audience === "player" ? "active" : ""} onClick={() => setAudience("player")}>선수 화면</button><button className={audience === "parent" ? "active" : ""} onClick={() => setAudience("parent")}>학부모 화면</button></div>
      <div className="match-audience-preview">
        <div><span>{audience === "player" ? "선수에게 보이는 내용" : "학부모에게 보이는 내용"}</span><h3>{session.opponent}전</h3><p>{formatDate(session.date, session.day)} {session.time} · {session.location}</p></div>
        <dl>
          <div><dt>집결</dt><dd>{session.gatheringTime} · {session.gatheringPlace}</dd></div>
          <div><dt>준비물</dt><dd>{session.matchEquipment}</dd></div>
          {audience === "player" ? <div><dt>선수 안내</dt><dd>본인의 소집 여부와 지도자가 공개한 개인 전달사항</dd></div> : <div><dt>학부모 안내</dt><dd>이동·귀가 정보와 참가 여부 회신</dd></div>}
        </dl>
        <aside><strong>{audience === "player" ? `${session.playerReadCount ?? 0}/24 확인` : `${session.parentReadCount ?? 0}/24 확인`}</strong><small>전술·내부 메모·다른 선수 상태는 보이지 않습니다.</small><button type="button" onClick={publishMatch}>{published ? "변경 알림 보내기" : "팀에 공개"}</button></aside>
      </div>
    </section>

    <MatchLineupBoard players={players} formation={session.formation ?? "4-3-3"} onEditPlayers={() => setSquadEditorOpen((value) => !value)} />
    {squadEditorOpen && <section className="match-inline-squad-editor"><MatchPlayerDataPanel mode="prepare" players={players} onChange={onPlayersChange} /></section>}
  </div>;
}

function MatchRecordWorkspace({ session, moments, players, onChange, onFinish }: {
  session: CalendarEvent;
  moments: MatchMoment[];
  players: MatchPlayerData[];
  onChange: (moments: MatchMoment[]) => void;
  onFinish: () => void;
}) {
  const [minute, setMinute] = useState("0");
  const [type, setType] = useState<MatchMomentType>("GOAL");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const orderedMoments = useMemo(() => [...moments].sort((a, b) => Number.parseInt(a.minute, 10) - Number.parseInt(b.minute, 10)), [moments]);
  const appeared = players.filter((player) => player.minutes > 0);

  function addMoment() {
    const defaultTitle = type === "GOAL" ? `${teamName} 득점` : type === "CONCEDED" ? `${session.opponent} 득점` : "";
    const nextTitle = title.trim() || defaultTitle;
    if (!nextTitle) return;
    onChange([...moments, { id: `moment-${Date.now().toString(36)}`, minute: `${minute || "0"}′`, type, title: nextTitle, detail: detail.trim() }]);
    setTitle("");
    setDetail("");
  }

  return <div className="match-record-layout">
    <section className="match-v2-surface match-v2-timeline">
      <header><div><h2>경기 타임라인</h2><p>경기 흐름을 바꾼 장면만 남깁니다.</p></div>{moments.length > 0 && <button onClick={() => onChange(moments.slice(0, -1))}>마지막 기록 취소</button>}</header>
      <div className="match-v2-moments">
        {orderedMoments.length ? orderedMoments.map((moment) => <article key={moment.id}><time>{moment.minute}</time><span className={`type-${moment.type.toLowerCase()}`}>{momentLabels[moment.type]}</span><div><strong>{moment.title}</strong><p>{moment.detail || "추가 메모 없음"}</p></div></article>) : <div className="match-v2-empty"><span><Icon name="match" size={24} /></span><strong>아직 기록이 없습니다.</strong><p>경기 중에는 필요한 장면만 빠르게 추가하세요.</p></div>}
      </div>
    </section>
    <aside className="match-record-side">
      <section className="match-v2-surface match-quick-record">
        <header><div><h2>빠른 기록</h2><p>종류를 선택하고 선수나 상황만 입력합니다.</p></div></header>
        <div className="match-event-type-picker">{(["GOAL", "CONCEDED", "SUB", "CARD", "MEDICAL"] as MatchMomentType[]).map((item) => <button type="button" className={type === item ? "active" : ""} key={item} onClick={() => setType(item)}>{momentLabels[item]}</button>)}</div>
        <div className="match-quick-record-fields"><label><span>시간</span><div><input inputMode="numeric" value={minute} onChange={(event) => setMinute(event.target.value.replace(/\D/g, "").slice(0, 3))} /><em>분</em></div></label><label><span>선수·상황</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={type === "SUB" ? "예: 9 김민수 → 17 이도윤" : "선수 이름 또는 상황"} /></label><label className="detail"><span>선택 메모</span><input value={detail} onChange={(event) => setDetail(event.target.value)} placeholder="필요한 내용만 짧게" /></label></div>
        <button className="match-record-submit" type="button" disabled={!title.trim() && type !== "GOAL" && type !== "CONCEDED"} onClick={addMoment}><Icon name="plus" size={15} />기록 추가</button>
      </section>
      <section className="match-v2-surface match-live-summary">
        <header><div><h2>현재 기록</h2><p>기록을 종료한 뒤 출전 시간을 확인합니다.</p></div></header>
        <dl><div><dt>스코어</dt><dd>{moments.filter((item) => item.type === "GOAL").length} : {moments.filter((item) => item.type === "CONCEDED").length}</dd></div><div><dt>경기 이벤트</dt><dd>{moments.length}건</dd></div><div><dt>출전 확인</dt><dd>{appeared.length || "종료 후 확인"}</dd></div></dl>
        <button type="button" onClick={onFinish}>경기 종료·리뷰로 이동</button>
      </section>
    </aside>
  </div>;
}

function MatchMemo({ session, onSave }: { session: CalendarEvent; onSave: (memo: string) => void }) {
  const [memo, setMemo] = useState(session.memo ?? "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMemo(session.memo ?? "");
    setSaved(false);
  }, [session.id, session.memo]);

  return <section className="match-v2-surface match-v2-memo">
    <header><div><h2>팀 리뷰</h2><p>잘된 점과 다음 훈련에 연결할 내용만 남깁니다.</p></div></header>
    <textarea value={memo} onChange={(event) => { setMemo(event.target.value); setSaved(false); }} placeholder="예: 전환 후 첫 패스는 좋았고, 수비 전환 첫 위치는 다음 훈련에서 다시 확인합니다." />
    <footer><span>{saved ? "저장되었습니다." : "지도자 내부 기록"}</span><button onClick={() => { onSave(memo); setSaved(true); }}>{saved ? <><Icon name="check" size={15} />저장됨</> : "리뷰 저장"}</button></footer>
  </section>;
}

function MatchReviewWorkspace({ session, players, moments, onMemoSave, onPlayersChange, onComplete }: {
  session: CalendarEvent;
  players: MatchPlayerData[];
  moments: MatchMoment[];
  onMemoSave: (memo: string) => void;
  onPlayersChange: (players: MatchPlayerData[]) => void;
  onComplete: () => void;
}) {
  const appeared = players.filter((player) => player.minutes > 0);
  const connected = appeared.filter((player) => player.distance !== null);
  const teamGoals = moments.filter((moment) => moment.type === "GOAL").length;
  const opponentGoals = moments.filter((moment) => moment.type === "CONCEDED").length;
  const scoreMatches = teamGoals === (session.homeScore ?? 0) && opponentGoals === (session.awayScore ?? 0);
  const completed = session.matchStatus === "완료";

  return <div className="match-review-workspace">
    <div className="match-review-top">
      <section className="match-v2-surface match-close-card">
        <header><div><h2>{completed ? "경기 마감 완료" : "경기 마감"}</h2><p>점수와 출전 예외를 확인하면 선수·시즌 기록에 반영됩니다.</p></div><span className={completed ? "complete" : "check"}>{completed ? "완료" : "확인 필요"}</span></header>
        <div className="match-close-score"><span><small>{teamName}</small><strong>{session.homeScore ?? teamGoals}</strong></span><em>:</em><span><small>{session.opponent}</small><strong>{session.awayScore ?? opponentGoals}</strong></span></div>
        <div className="match-close-checks">
          <span className={scoreMatches ? "done" : "needs-check"}><Icon name={scoreMatches ? "check" : "notice"} size={16} /><strong>점수와 득점 기록</strong><em>{scoreMatches ? "일치" : `${teamGoals}:${opponentGoals} 확인`}</em></span>
          <span className={appeared.length > 0 ? "done" : "needs-check"}><Icon name={appeared.length > 0 ? "check" : "notice"} size={16} /><strong>출전 시간</strong><em>{appeared.length > 0 ? `${appeared.length}명 확인` : "입력 필요"}</em></span>
          <span className={connected.length === appeared.length ? "done" : "optional"}><Icon name={connected.length === appeared.length ? "check" : "download"} size={16} /><strong>GPS 데이터</strong><em>{connected.length}/{appeared.length} · 선택</em></span>
        </div>
        {appeared.length === 0 && <div className="match-minutes-shortcut"><span><strong>출전 시간을 아직 입력하지 않았습니다.</strong><small>선발을 기본값으로 채운 뒤 교체 선수만 수정할 수 있습니다.</small></span><button type="button" onClick={() => onPlayersChange(players.map((player) => ({ ...player, minutes: player.role === "선발" ? 80 : 0 })))}>선발 11명 · 80분 입력</button></div>}
        {!completed && <button type="button" className="match-complete-button" disabled={!scoreMatches || appeared.length === 0} onClick={onComplete}><Icon name="check" size={16} />경기 마감하기</button>}
      </section>
      <MatchMemo session={session} onSave={onMemoSave} />
    </div>
    <MatchPlayerDataPanel mode="review" players={players} onChange={onPlayersChange} />
  </div>;
}

function SimpleMatchRecord({ session, moments, onChange }: {
  session: CalendarEvent;
  moments: MatchMoment[];
  onChange: (moments: MatchMoment[]) => void;
}) {
  const [minute, setMinute] = useState("0");
  const [type, setType] = useState<MatchMomentType>("GOAL");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [selectedMoment, setSelectedMoment] = useState<MatchMoment | null>(null);
  const orderedMoments = useMemo(() => [...moments].sort((a, b) => Number.parseInt(a.minute, 10) - Number.parseInt(b.minute, 10)), [moments]);

  function addMoment() {
    const fallbackTitle = type === "GOAL" ? `${teamName} 득점` : type === "CONCEDED" ? `${session.opponent ?? "상대 팀"} 득점` : "";
    const nextTitle = title.trim() || fallbackTitle;
    if (!nextTitle) return;
    onChange([...moments, { id: `moment-${Date.now().toString(36)}`, minute: `${minute || "0"}′`, type, title: nextTitle, detail: detail.trim() }]);
    setTitle("");
    setDetail("");
  }

  return <>
    <div className="match-simple-record-layout">
      <section className="match-v2-surface match-simple-timeline">
        <header><div><span>경기 상세</span><h2>경기 기록</h2><p>스코어와 흐름을 바꾼 장면만 시간순으로 확인합니다.</p></div><strong>{moments.length}건</strong></header>
        <div className="match-simple-score"><span><small>{teamName}</small><strong>{session.homeScore ?? moments.filter((item) => item.type === "GOAL").length}</strong></span><em>:</em><span><small>{session.opponent ?? "상대 팀"}</small><strong>{session.awayScore ?? moments.filter((item) => item.type === "CONCEDED").length}</strong></span></div>
        <div className="match-simple-moments">
          {orderedMoments.map((moment) => <button type="button" key={moment.id} onClick={() => setSelectedMoment(moment)}>
            <time>{moment.minute}</time><span className={`type-${moment.type.toLowerCase()}`}>{momentLabels[moment.type]}</span><div><strong>{moment.title}</strong><p>{moment.detail || "추가 메모 없음"}</p></div><Icon name="chevron" size={15} />
          </button>)}
          {!orderedMoments.length && <div className="match-v2-empty"><span><Icon name="match" size={24} /></span><strong>아직 경기 기록이 없습니다.</strong><p>오른쪽에서 필요한 장면만 빠르게 추가하세요.</p></div>}
        </div>
      </section>

      <aside className="match-v2-surface match-simple-add">
        <header><div><span>빠른 입력</span><h2>경기 장면 추가</h2><p>득점·교체·부상처럼 다시 볼 장면만 기록합니다.</p></div></header>
        <div className="match-event-type-picker">{(["GOAL", "CONCEDED", "SUB", "CARD", "MEDICAL", "TACTIC"] as MatchMomentType[]).map((item) => <button type="button" className={type === item ? "active" : ""} key={item} onClick={() => setType(item)}>{momentLabels[item]}</button>)}</div>
        <div className="match-simple-add-fields">
          <label><span>시간</span><div><input inputMode="numeric" value={minute} onChange={(event) => setMinute(event.target.value.replace(/\D/g, "").slice(0, 3))} /><em>분</em></div></label>
          <label><span>장면</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="선수 이름 또는 상황" /></label>
          <label><span>메모 <small>선택</small></span><textarea value={detail} onChange={(event) => setDetail(event.target.value)} placeholder="필요한 내용만 짧게" /></label>
        </div>
        <button className="match-record-submit" type="button" disabled={!title.trim() && type !== "GOAL" && type !== "CONCEDED"} onClick={addMoment}><Icon name="plus" size={15} />기록 추가</button>
      </aside>
    </div>

    {selectedMoment && <div className="training-session-detail-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.currentTarget === event.target) setSelectedMoment(null);
    }}><aside className="training-session-detail-drawer match-moment-detail" role="dialog" aria-modal="true" aria-labelledby="match-moment-detail-title">
      <header><div><span>경기 장면 상세</span><h2 id="match-moment-detail-title">{selectedMoment.title}</h2><p>{selectedMoment.minute} · {momentLabels[selectedMoment.type]}</p></div><button type="button" onClick={() => setSelectedMoment(null)} aria-label="경기 장면 상세 닫기"><Icon name="close" size={18} /></button></header>
      <div className="training-session-detail-scroll"><section className="training-session-detail-primary"><span>기록 내용</span><p>{selectedMoment.detail || "추가로 입력한 메모가 없습니다."}</p></section><section><h3>공개 정책</h3><p>이 장면은 지도자 경기 기록입니다. 학부모에게는 연결된 자녀의 출전 데이터와 공개 피드백만 전달됩니다.</p></section></div>
      <footer><button type="button" onClick={() => setSelectedMoment(null)}>닫기</button><button className="danger" type="button" onClick={() => { onChange(moments.filter((item) => item.id !== selectedMoment.id)); setSelectedMoment(null); }}><Icon name="close" size={15} />기록 삭제</button></footer>
    </aside></div>}
  </>;
}

function MatchParentPreview({ session, players, onPublish }: {
  session: CalendarEvent;
  players: MatchPlayerData[];
  onPublish: () => void;
}) {
  const linkedPlayer = players.find((player) => player.feedbackSent && player.feedbackVisibleToParent) ?? players[0];
  const view = linkedPlayer ? buildParentMatchView({ ...session, matchPlayerData: players }, linkedPlayer.playerId) : null;
  if (!view) return null;
  const published = session.matchPublicationStatus === "공개";

  return <section className="match-v2-surface audience-child-preview match-parent-preview">
    <header><div><span>학부모 공개 범위</span><h2>연결된 자녀 기록만</h2><p>경기 전체 운영 정보가 아니라 해당 선수의 경기 데이터와 공개 피드백만 전달합니다.</p></div><strong>{published ? "공개됨" : "공개 전"}</strong></header>
    <div className="audience-child-preview-body">
      <div><small>{view.playerName} 선수의 경기</small><strong>{view.date} · {view.opponent}전</strong><p>경기 결과 {view.score}</p></div>
      <dl>
        <div><dt>출전</dt><dd>{view.role} · {view.minutes}분</dd></div>
        <div><dt>평점</dt><dd>{view.rating.toFixed(1)}<small>/10</small></dd></div>
        <div><dt>거리</dt><dd>{view.distance === null ? "미연동" : `${view.distance.toFixed(1)}km`}</dd></div>
      </dl>
      <blockquote>{view.feedback ?? "지도자가 학부모 공개로 전달한 피드백이 아직 없습니다."}</blockquote>
    </div>
    <footer><span>공개하지 않음</span><div>{parentHiddenData.map((item) => <em key={item}>{item}</em>)}</div><button type="button" onClick={onPublish}>{published ? "변경 내용 다시 알림" : "자녀 기록 공개"}</button></footer>
  </section>;
}

function MatchNotesWorkspace({ session, players, onEdit, onMemoSave, onPublish }: {
  session: CalendarEvent;
  players: MatchPlayerData[];
  onEdit: () => void;
  onMemoSave: (memo: string) => void;
  onPublish: () => void;
}) {
  return <div className="match-simple-notes">
    <section className="match-v2-surface match-simple-plan">
      <header><div><span>지도자 내부</span><h2>경기 목표·계획</h2><p>학부모에게는 노출되지 않는 지도자용 정보입니다.</p></div><button type="button" onClick={onEdit}><Icon name="edit" size={14} />수정</button></header>
      <dl><div><dt>경기 목표</dt><dd>{session.matchObjective || "경기 목표를 입력해주세요."}</dd></div><div><dt>기본 포메이션</dt><dd>{session.formation ?? "4-3-3"}</dd></div><div><dt>지도자 메모</dt><dd>{session.matchCoachNote || "내부 메모가 없습니다."}</dd></div></dl>
    </section>
    <MatchMemo session={session} onSave={onMemoSave} />
    <MatchParentPreview session={session} players={players} onPublish={onPublish} />
  </div>;
}

export function MatchDetailWorkspace({ session, onEdit, onMemoSave, onMatchMomentsChange, onPlayerDataChange, onMatchUpdate }: {
  session: CalendarEvent;
  onEdit: () => void;
  onMemoSave: (memo: string) => void;
  onMatchMomentsChange: (moments: MatchMoment[]) => void;
  onPlayerDataChange: (players: MatchPlayerData[]) => void;
  onMatchUpdate: (updates: Partial<CalendarEvent>) => void;
}) {
  const [activeTab, setActiveTab] = useState<MatchDetailTab>("record");
  const players = session.matchPlayerData?.length ? session.matchPlayerData : defaultMatchPlayerData;
  const moments = session.matchMoments ?? [];
  const completed = session.matchStatus === "완료" || session.matchStatus === "정리 필요" || session.matchStatus === "결과 확인";
  const opponent = session.opponent ?? session.title.replace(/전$/, "");

  function updateMoments(nextMoments: MatchMoment[]) {
    onMatchMomentsChange(nextMoments);
    onMatchUpdate({
      homeScore: nextMoments.filter((moment) => moment.type === "GOAL").length,
      awayScore: nextMoments.filter((moment) => moment.type === "CONCEDED").length,
    });
  }

  return <div className="match-v2-workspace match-operation-workspace">
    <section className="match-v2-header">
      <div className="match-v2-heading"><span>{session.matchStatus ?? "예정"}</span><h1>{opponent}전</h1><p>{session.competition ?? "경기"}</p></div>
      <div className="match-v2-scoreboard" aria-label={`${teamName} ${session.homeScore ?? 0} 대 ${session.awayScore ?? 0} ${opponent}`}><span><small>우리 팀</small><strong>{teamName}</strong></span><b>{completed || moments.length ? <>{session.homeScore ?? 0}<em>:</em>{session.awayScore ?? 0}</> : "VS"}</b><span><small>상대 팀</small><strong>{opponent}</strong></span></div>
      <button className="match-v2-edit" onClick={onEdit}><Icon name="edit" size={15} />경기 수정</button>
      <dl className="match-v2-meta"><div><dt>날짜</dt><dd>{formatDate(session.date, session.day)}</dd></div><div><dt>킥오프</dt><dd>{session.time ?? "미정"}</dd></div><div><dt>장소</dt><dd>{session.location ?? "장소 미정"}</dd></div><div><dt>구분</dt><dd>{session.homeAway ?? "홈"} 경기</dd></div></dl>
      <nav className="match-v2-tabs match-operation-tabs match-simple-tabs" role="tablist" aria-label="경기 상세 메뉴">
        <button role="tab" className={activeTab === "record" ? "active" : ""} aria-selected={activeTab === "record"} onClick={() => setActiveTab("record")}>경기 기록 <em>{moments.length}</em></button>
        <button role="tab" className={activeTab === "notes" ? "active" : ""} aria-selected={activeTab === "notes"} onClick={() => setActiveTab("notes")}>목표·메모</button>
        <button role="tab" className={activeTab === "players" ? "active" : ""} aria-selected={activeTab === "players"} onClick={() => setActiveTab("players")}>선수 정보 <em>{players.length}</em></button>
      </nav>
    </section>

    {activeTab === "record" && <div role="tabpanel"><SimpleMatchRecord session={session} moments={moments} onChange={updateMoments} /></div>}
    {activeTab === "notes" && <div role="tabpanel"><MatchNotesWorkspace session={session} players={players} onEdit={onEdit} onMemoSave={onMemoSave} onPublish={() => onMatchUpdate({ matchStatus: session.matchStatus === "작성 중" ? "지도자 공유" : session.matchStatus, matchPublicationStatus: "공개", parentReadCount: session.parentReadCount || 1 })} /></div>}
    {activeTab === "players" && <div role="tabpanel"><MatchPlayerDataPanel mode={completed ? "review" : "prepare"} paged players={players} onChange={onPlayerDataChange} /></div>}
  </div>;
}

export function MatchDetailEditor({ session, onClose, onSave }: {
  session: CalendarEvent;
  onClose: () => void;
  onSave: (updates: Partial<CalendarEvent>) => void;
}) {
  const [date, setDate] = useState(session.date ?? `2026-07-${String(session.day).padStart(2, "0")}`);
  const [time, setTime] = useState(session.time ?? "15:00");
  const [location, setLocation] = useState(session.location ?? "");
  const [opponent, setOpponent] = useState(session.opponent ?? "");
  const [competition, setCompetition] = useState(session.competition ?? "");
  const [formation, setFormation] = useState(session.formation ?? "4-3-3");
  const [homeAway, setHomeAway] = useState(session.homeAway ?? "홈");
  const [gatheringTime, setGatheringTime] = useState(session.gatheringTime ?? "");
  const [gatheringPlace, setGatheringPlace] = useState(session.gatheringPlace ?? "");
  const [equipment, setEquipment] = useState(session.matchEquipment ?? "");
  const [objective, setObjective] = useState(session.matchObjective ?? "");
  const [coachNote, setCoachNote] = useState(session.matchCoachNote ?? "");

  return <div className="schedule-modal-backdrop" role="presentation">
    <section className="match-editor-modal" role="dialog" aria-modal="true" aria-labelledby="match-editor-title">
      <header><div><span>경기 수정</span><h2 id="match-editor-title">경기 준비 정보</h2><p>일정과 소집, 지도자 계획을 한 번에 수정합니다.</p></div><button type="button" onClick={onClose} aria-label="경기 편집 닫기"><Icon name="close" size={18} /></button></header>
      <form onSubmit={(event) => {
        event.preventDefault();
        onSave({ date, day: Number(date.split("-")[2]) || session.day, time, location, opponent, title: `${opponent}전`, competition, formation, homeAway, gatheringTime, gatheringPlace, matchEquipment: equipment, matchObjective: objective, matchCoachNote: coachNote });
      }}>
        <div className="match-editor-scroll">
          <section className="match-editor-section"><header><h3>경기 정보</h3></header><div className="match-editor-basic-fields">
            <label><span>날짜</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label>
            <label><span>킥오프</span><input type="time" value={time} onChange={(event) => setTime(event.target.value)} required /></label>
            <label><span>상대 팀</span><input value={opponent} onChange={(event) => setOpponent(event.target.value)} required /></label>
            <label><span>대회·라운드</span><input value={competition} onChange={(event) => setCompetition(event.target.value)} required /></label>
            <label className="location"><span>장소</span><input value={location} onChange={(event) => setLocation(event.target.value)} required /></label>
            <label><span>홈·원정</span><select value={homeAway} onChange={(event) => setHomeAway(event.target.value as NonNullable<CalendarEvent["homeAway"]>)}><option>홈</option><option>원정</option><option>중립</option></select></label>
            <label><span>포메이션</span><select value={formation} onChange={(event) => setFormation(event.target.value)}><option>4-3-3</option><option>4-2-3-1</option><option>4-4-2</option><option>3-4-3</option><option>3-5-2</option></select></label>
          </div></section>
          <section className="match-editor-section"><header><div><h3>소집·준비물</h3><p>선수와 학부모에게 공개되는 내용입니다.</p></div></header><div className="match-editor-basic-fields">
            <label><span>집결 시간</span><input value={gatheringTime} onChange={(event) => setGatheringTime(event.target.value)} placeholder="예: 07:40" /></label>
            <label><span>집결 장소</span><input value={gatheringPlace} onChange={(event) => setGatheringPlace(event.target.value)} /></label>
            <label className="location"><span>준비물</span><input value={equipment} onChange={(event) => setEquipment(event.target.value)} /></label>
          </div></section>
          <section className="match-editor-section"><header><div><h3>지도자 계획</h3><p>지도자에게만 보이는 내부 정보입니다.</p></div></header><label className="match-editor-long-field"><span>경기 목표</span><textarea value={objective} onChange={(event) => setObjective(event.target.value)} /></label><label className="match-editor-long-field"><span>지도자 메모</span><textarea value={coachNote} onChange={(event) => setCoachNote(event.target.value)} /></label></section>
        </div>
        <footer><button type="button" onClick={onClose}>취소</button><button type="submit"><Icon name="check" size={15} />변경사항 저장</button></footer>
      </form>
    </section>
  </div>;
}
