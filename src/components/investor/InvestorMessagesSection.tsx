import type { DashboardMessage } from "../../types/investorDashboard";
import { formatRelativeTime, toNumber } from "../../utils/investorDashboard";

interface Props { messages: DashboardMessage[]; }

export default function InvestorMessagesSection({ messages }: Props) {
  return (
    <section className="investor-dashboard-section">
      <div className="investor-dashboard-page-header"><div><span className="investor-dashboard-overline">التواصل</span><h1>الرسائل</h1><p>الرسائل الواردة إلى حسابك.</p></div></div>
      <div className="investor-dashboard-card investor-dashboard-activity-card">
        <div className="investor-dashboard-activity-list">
          {messages.map((message) => {
            const sender = `${message.sender_prenom || ""} ${message.sender_nom || ""}`.trim();
            return <div className="investor-dashboard-activity-item" key={message.id}>
              <div className="investor-dashboard-activity-icon"><i className="bi bi-chat-left-text" /></div>
              <div className="investor-dashboard-activity-content"><strong>{message.sujet || "رسالة جديدة"}</strong><span>{sender || message.sender_email || "مرسل غير معروف"}</span><small>{formatRelativeTime(message.created_at)}</small></div>
              {!toNumber(message.lu) && <span className="investor-dashboard-status warning">جديدة</span>}
            </div>;
          })}
          {messages.length === 0 && <div className="investor-dashboard-activity-item"><div className="investor-dashboard-activity-icon"><i className="bi bi-chat-left-text" /></div><div className="investor-dashboard-activity-content"><strong>لا توجد رسائل</strong><span>لا توجد رسائل واردة حالياً.</span></div></div>}
        </div>
      </div>
    </section>
  );
}
