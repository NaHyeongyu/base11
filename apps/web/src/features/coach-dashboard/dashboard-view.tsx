import Link from "next/link";
import { microcycleDays } from "@/features/coach-schedule/data/schedule-preview-data";
import { staffReviews } from "@/features/coach-staff-review/data/staff-review-preview-data";
import { playerIssues } from "@/features/coach-wellbeing/data/wellbeing-preview-data";
import { PlayerIdentity } from "@/features/players/ui/player-identity";
import { Badge, MetricCard, PageHeader, Panel, ProgressBar } from "@/shared/ui/components";
import { Icon } from "@/shared/ui/icon";

export function DashboardView() {
  return <>
    <PageHeader
      eyebrow="NEXT MATCH · SUWON FC U18 · MD-2"
      title="마이크로사이클 대시보드"
      description="수원FC전을 기준으로 이번 주 계획, 스태프 검토, 선수 이슈와 데이터 연결 상태를 확인합니다."
      action={<Link className="action-button" href="/schedule"><Icon name="calendar" size={17} />주간 계획 열기</Link>}
    />

    <div className="flow-strip" aria-label="현재 운영 단계">
      {["계획", "협업", "게시", "실행", "데이터", "다음 계획"].map((step, index) => <div className={index < 3 ? "done" : index === 3 ? "current" : ""} key={step}><span>{index + 1}</span><strong>{step}</strong>{index < 5 && <Icon name="chevron" size={14} />}</div>)}
    </div>

    <div className="metric-grid four compact">
      <MetricCard label="오늘 세션" value="MD-2" helper="포지션 훈련 · 17:00" tone="green" />
      <MetricCard label="선수 이슈" value="3건" helper="통증 1 · 복귀 1 · 목표 1" tone="orange" />
      <MetricCard label="스태프 검토" value="4 / 6" helper="코치 2명 확인 대기" tone="purple" />
      <MetricCard label="GPS 연결" value="3 / 4" helper="최근 세션 1개 미연결" tone="blue" />
    </div>

    <div className="content-grid dashboard-primary">
      <Panel title="수원FC전 마이크로사이클" description="경기일에서 역산한 주간 계획입니다." action={<Link className="text-link" href="/schedule">계획 편집 <Icon name="chevron" size={15} /></Link>}>
        <div className="microcycle-rail">
          {microcycleDays.map((day) => <Link href="/schedule" className={day.id === "MD-2" ? "active" : ""} key={day.id}>
            <span><small>{day.day} · {day.date}</small><Badge tone={day.tone}>{day.id}</Badge></span>
            <strong>{day.title}</strong>
            <p>{day.objective}</p>
            <i><span style={{ width: day.load === "High" || day.load === "Match" ? "88%" : day.load === "Medium" ? "64%" : day.load === "Low" ? "35%" : "8%" }} /></i>
          </Link>)}
        </div>
      </Panel>

      <Panel title="오늘 확인할 선수·스태프" description="정상 보고는 숨기고 결정이 필요한 항목만 보여줍니다." action={<Badge tone="orange">6건</Badge>}>
        <div className="decision-list">
          {playerIssues.map((item) => <article key={item.player.id}>
            <PlayerIdentity player={item.player} compact />
            <div><span><Badge tone={item.tone}>{item.type}</Badge><small>담당 {item.owner}</small></span><strong>{item.detail}</strong><p>{item.action}</p></div>
            <button aria-label={`${item.player.name} 이슈 확인`}><Icon name="chevron" size={16} /></button>
          </article>)}
          {staffReviews.slice(0, 2).map((review) => <article key={review.id}>
            <span className="decision-avatar"><Icon name="feedback" size={17} /></span>
            <div><span><Badge tone={review.tone}>스태프</Badge><small>{review.author}</small></span><strong>{review.session}</strong><p>{review.message}</p></div>
            <Link href="/staff-review" aria-label={`${review.session} 검토`}><Icon name="chevron" size={16} /></Link>
          </article>)}
        </div>
        <Link href="/staff-review" className="panel-footer-link">모든 검토 항목 보기 <Icon name="chevron" size={15} /></Link>
      </Panel>
    </div>

    <div className="content-grid dashboard-secondary elite-dashboard-secondary">
      <Panel title="오늘 세션 준비도" description="MD-2 포지션 훈련 · 17:00–19:00">
        <div className="session-readiness">
          <div><span>세션 설계</span><Badge tone="green">완료</Badge></div>
          <div><span>스태프 검토</span><Badge tone="green">4 / 4</Badge></div>
          <div><span>선수 목표 연결</span><Badge tone="orange">22 / 26</Badge></div>
          <div><span>GPS 템플릿</span><Badge tone="blue">STATSports</Badge></div>
        </div>
        <Link href="/schedule" className="panel-footer-link">세션 상세 열기 <Icon name="chevron" size={15} /></Link>
      </Panel>

      <Panel title="최근 세션 데이터" description="같은 세션 ID에 GPS·RPE·회고를 연결합니다.">
        <div className="data-completeness">
          <div><span>MD-4 연습 경기</span><strong>96%</strong></div><ProgressBar value={96} tone="green" />
          <div><span>MD-5 빌드업 원칙</span><strong>88%</strong></div><ProgressBar value={88} tone="blue" />
          <div><span>MD-6 회복·리셋</span><strong>100%</strong></div><ProgressBar value={100} tone="green" />
        </div>
        <Link href="/performance" className="panel-footer-link">데이터 연결 관리 <Icon name="chevron" size={15} /></Link>
      </Panel>

      <Panel title="다음 결정" description="데이터와 회고를 다음 계획에 반영합니다.">
        <div className="next-decision"><span><Icon name="target" size={24} /></span><strong>MD-1 세트피스 강도를 낮출까요?</strong><p>MD-4 경기 부하가 계획보다 12% 높고, 수비수 2명의 회복 지표가 낮습니다.</p><div><button>계획 유지</button><Link href="/schedule">수정하기</Link></div></div>
      </Panel>
    </div>
  </>;
}
