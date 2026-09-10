import type { DashboardNotification } from "../../types/investorDashboard";
import { formatRelativeTime, toNumber } from "../../utils/investorDashboard";

interface Props { notifications: DashboardNotification[]; }

export default function InvestorNotificationsSection({ notifications }: Props) {
  return (
    <section className="investor-dashboard-section">
      <div className="investor-dashboard-page-header"><div><span className="investor-dashboard-overline">التنبيهات</span><h1>الإشعارات</h1><p>آخر الإشعارات والتحديثات المتعلقة بحسابك.</p></div></div>
      <div className="investor-dashboard-card investor-dashboard-activity-card">
        <div className="investor-dashboard-activity-list">
          {notifications.map((notification) => {
            const icon = notification.type === "document" ? "bi-file-earmark-text" : notification.type === "message" ? "bi-chat-left-text" : notification.type === "projet" ? "bi-building" : notification.type === "demande" ? "bi-file-earmark-text" : "bi-bell";
            return <div className="investor-dashboard-activity-item" key={notification.id}>
              <div className="investor-dashboard-activity-icon"><i className={`bi ${icon}`} /></div>
              <div className="investor-dashboard-activity-content"><strong>{notification.titre}</strong><span>{notification.message}</span><small>{formatRelativeTime(notification.created_at)}</small></div>
              {!toNumber(notification.lu) && <span className="investor-dashboard-status warning">جديد</span>}
            </div>;
          })}
          {notifications.length === 0 && <div className="investor-dashboard-activity-item"><div className="investor-dashboard-activity-icon"><i className="bi bi-bell" /></div><div className="investor-dashboard-activity-content"><strong>لا توجد إشعارات</strong><span>لا توجد إشعارات جديدة حالياً.</span></div></div>}
        </div>
      </div>
    </section>
  );
}
