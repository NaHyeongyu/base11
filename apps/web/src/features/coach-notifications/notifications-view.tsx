import { notifications } from "@/features/coach-notifications/data/notifications-preview-data";
import { Badge, PageHeader, Panel } from "@/shared/ui/components";
import { Icon } from "@/shared/ui/icon";

function notificationIcon(group: string) { if (group === "선수 상태") return "heart" as const; if (group === "스태프 검토") return "feedback" as const; if (group === "공지") return "notice" as const; if (group === "피드백") return "feedback" as const; return "match" as const; }

export function NotificationsView() {
  return <>
    <PageHeader eyebrow="INBOX" title="알림" description="팀 운영에서 놓치면 안 되는 변화와 마감 일정입니다." action={<button className="table-action">모두 읽음 처리</button>} />
    <div className="notification-layout">
      <Panel title="최근 알림" description="읽지 않은 알림 3개">
        <div className="notification-list">{notifications.map((item) => <article key={item.id} className={item.unread ? "unread" : ""}><span className={`notification-icon group-${item.group.replace(" ", "-")}`}><Icon name={notificationIcon(item.group)} /></span><div><span><Badge tone={item.unread ? "blue" : "gray"}>{item.group}</Badge>{item.unread && <i />}</span><strong>{item.title}</strong><p>{item.body}</p></div><button className="more-button"><Icon name="more" /></button></article>)}</div>
      </Panel>
      <Panel title="알림 설정" description="역할에 맞게 필요한 알림만 받으세요.">
        <div className="setting-list"><label><span><strong>선수 통증·제한 보고</strong><small>새로운 예외 입력 즉시</small></span><input type="checkbox" defaultChecked /></label><label><span><strong>스태프 검토 요청</strong><small>내 담당 영역의 새 제안</small></span><input type="checkbox" defaultChecked /></label><label><span><strong>피드백 마감</strong><small>마감일 오전 9시</small></span><input type="checkbox" defaultChecked /></label><label><span><strong>계획 변경 게시</strong><small>역할별 영향이 있는 변경</small></span><input type="checkbox" defaultChecked /></label></div>
      </Panel>
    </div>
  </>;
}
