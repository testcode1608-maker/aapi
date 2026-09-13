import type { DashboardNotification } from "../../types/investorDashboard";
import { formatRelativeTime, toNumber } from "../../utils/investorDashboard";
import "../../styles/investor-notifications.css";

interface Props { notifications: DashboardNotification[]; }

export default function InvestorNotificationsSection({ notifications }: Props) {
  return (
    <section className="investor-dashboard-section">
      <div className="investor-dashboard-page-header">
        <div>
          <span className="investor-dashboard-overline">التنبيهات</span>
          <h1>الإشعارات</h1>
          <p>آخر الإشعارات والتحديثات المتعلقة بحسابك.</p>
        </div>
      </div>

      <div className="investor-notifications-card">
        <div className="investor-notifications-header">
          <div className="investor-notifications-header-title">
            <div className="investor-notifications-header-icon"><i className="bi bi-bell-fill" /></div>
            <div>
              <h2>مركز الإشعارات</h2>
              <p>تابع آخر المستجدات المتعلقة باستثماراتك.</p>
            </div>
          </div>
          <span className="investor-notifications-count">{notifications.length}</span>
        </div>

        {notifications.length > 0 ? (
          <div className="investor-notifications-list">
            {notifications.map((notification) => {
              const icon = notification.type === "document"
                ? "bi-file-earmark-text"
                : notification.type === "message"
                  ? "bi-chat-left-text"
                  : notification.type === "projet"
                    ? "bi-building"
                    : notification.type === "demande"
                      ? "bi-file-earmark-text"
                      : "bi-bell";
              const unread = !toNumber(notification.lu);
              const typeClass = notification.type ? `type-${notification.type}` : "type-default";

              return (
                <div className={`investor-notification-item ${unread ? "unread" : ""} ${typeClass}`} key={notification.id}>
                  <div className="investor-notification-icon"><i className={`bi ${icon}`} /></div>
                  <div className="investor-notification-content">
                    <strong className="investor-notification-title">{notification.titre}</strong>
                    <span className="investor-notification-message">{notification.message}</span>
                    <small className="investor-notification-time">
                      <i className="bi bi-clock" />
                      {formatRelativeTime(notification.created_at)}
                    </small>
                  </div>
                  {unread && <span className="investor-notification-new">جديد</span>}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="investor-notifications-empty">
            <div className="investor-notifications-empty-icon"><i className="bi bi-bell-slash" /></div>
            <strong>لا توجد إشعارات</strong>
            <span>لا توجد إشعارات جديدة حالياً.</span>
          </div>
        )}
      </div>
    </section>
  );
}
