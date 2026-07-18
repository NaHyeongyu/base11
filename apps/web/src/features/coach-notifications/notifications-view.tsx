import { notifications } from "@/features/coach-data/mock-data";
import { Badge, PageHeader, Panel } from "@/features/coach-ui/components";
import { Icon } from "@/features/coach-shell/icon";

function notificationIcon(group: string) { if (group === "선수 상태") return "heart" as const; if (group === "출석") return "check" as const; if (group === "공지") return "notice" as const; if (group === "피드백") return "feedback" as const; return "match" as const; }

export function NotificationsView() {
  return <>
    <PageHeader eyebrow="INBOX" title="알림" description="팀 운영에서 놓치면 안 되는 변화와 마감 일정입니다." action={<button className="table-action">모두 읽음 처리</button>} />
    <div className="notification-layout">
      <Panel title="최근 알림" description="읽지 않은 알림 3개">
        <div className="notification-list">{notifications.map((item) => <article key={item.id} className={item.unread ? "unread" : ""}><span className={`notification-icon group-${item.group.replace(" ", "-")}`}><Icon name={notificationIcon(item.group)} /></span><div><span><Badge tone={item.unread ? "blue" : "gray"}>{item.group}</Badge>{item.unread && <i />}</span><strong>{item.title}</strong><p>{item.body}</p></div><button className="more-button"><Icon name="more" /></button></article>)}</div>
      </Panel>
      <Panel title="알림 설정" description="역할에 맞게 필요한 알림만 받으세요.">
        <div className="setting-list"><label><span><strong>선수 통증 보고</strong><small>새로운 통증 입력 즉시</small></span><input type="checkbox" defaultChecked /></label><label><span><strong>출석 미응답</strong><small>일정 시작 3시간 전</small></span><input type="checkbox" defaultChecked /></label><label><span><strong>피드백 마감</strong><small>마감일 오전 9시</small></span><input type="checkbox" defaultChecked /></label><label><span><strong>공지 확인율</strong><small>게시 24시간 후</small></span><input type="checkbox" /></label></div>
      </Panel>
    </div>
  </>;
}
