import { feedbackQueue } from "@/features/coach-feedback/data/feedback-preview-data";
import { players } from "@/features/players/data/player-preview-data";
import { PlayerIdentity } from "@/features/players/ui/player-identity";
import { ActionButton, Badge, MetricCard, PageHeader, Panel } from "@/shared/ui/components";
import { Icon } from "@/shared/ui/icon";

export function FeedbackView() {
  return <>
    <PageHeader eyebrow="PRIVATE COACHING LOOP" title="회고·피드백" description="선수의 세션 회고에 지도자의 구체적인 행동 피드백을 연결하고 다음 목표에 반영합니다." action={<ActionButton secondary icon="filter">피드백 템플릿</ActionButton>} />
    <div className="metric-grid four compact">
      <MetricCard label="피드백 대기" value="5건" helper="오늘 마감 2건" tone="orange" />
      <MetricCard label="이번 주 완료" value="21건" helper="선수 18명" tone="green" />
      <MetricCard label="평균 응답 시간" value="14시간" helper="지난주 대비 -3시간" tone="blue" />
      <MetricCard label="목표 연결률" value="81%" helper="피드백 17/21건" tone="purple" />
    </div>
    <div className="content-grid feedback-grid">
      <Panel title="피드백 대기열" description="우선순위와 마감 시간순입니다." action={<Badge tone="orange">3건 표시</Badge>}>
        <div className="feedback-queue">{feedbackQueue.map((item, index) => <article key={item.player.id} className={index === 0 ? "selected" : ""}><PlayerIdentity player={item.player} compact /><p>{item.session}</p><span>{item.priority && <Badge tone="red">우선</Badge>}<Badge tone={item.due === "오늘" ? "orange" : "gray"}>{item.due} 마감</Badge></span><Icon name="chevron" /></article>)}</div>
      </Panel>
      <Panel title={`${feedbackQueue[0].player.name} · 훈련 리뷰`} description={feedbackQueue[0].session} action={<button className="more-button"><Icon name="more" /></button>}>
        <div className="feedback-detail">
          <div className="reflection-box"><span>선수 회고</span><p>“{feedbackQueue[0].self}”</p><small>훈련 후 21:14 작성</small></div>
          <div className="mission-summary"><span><Icon name="target" />연결된 개인 목표</span><strong>수비 전환 3초 안에 복귀</strong><Badge tone="orange">근거 추가</Badge></div>
          <label className="feedback-input"><span>지도자 피드백</span><textarea defaultValue="전반에는 복귀 속도가 좋았어. 후반에 체력이 떨어졌을 때도 첫 세 걸음의 속도를 유지해보자." /><small>구체적인 행동 하나에 집중하면 선수가 실행하기 쉽습니다.</small></label>
          <div className="next-mission"><label><input type="checkbox" defaultChecked /> 이 피드백을 다음 세션 목표에 연결</label><button className="action-button"><Icon name="feedback" size={17} />비공개 피드백 보내기</button></div>
        </div>
      </Panel>
    </div>
    <Panel title="최근 완료한 피드백" description="선수에게 전달된 지도 기록입니다.">
      <div className="recent-feedback">{players.slice(3, 6).map((player, index) => <div key={player.id}><PlayerIdentity player={player} compact /><p>{["침투 전 수비수와의 거리를 한 번 더 확인하자.","빌드업 첫 터치를 바깥쪽으로 열어두자.","압박을 벗어난 뒤 전진 선택이 좋아졌어."][index]}</p><span>{index + 1}일 전</span><Badge tone="green">전달 완료</Badge></div>)}</div>
    </Panel>
  </>;
}
