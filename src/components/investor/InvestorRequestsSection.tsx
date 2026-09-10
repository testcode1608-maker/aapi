import type { DashboardRequest } from "../../types/investorDashboard";
import { formatDate, getRequestStatus } from "../../utils/investorDashboard";

interface Props { requests: DashboardRequest[]; }

export default function InvestorRequestsSection({ requests }: Props) {
  return (
    <section className="investor-dashboard-section">
      <div className="investor-dashboard-page-header">
        <div>
          <span className="investor-dashboard-overline">الطلبات</span>
          <h1>طلباتي</h1>
          <p>متابعة جميع طلباتك الاستثمارية.</p>
        </div>
      </div>
      <div className="investor-dashboard-grid">
        {requests.map((request) => {
          const status = getRequestStatus(request.statut);
          return (
            <div className="investor-dashboard-card investor-dashboard-projects-card" key={request.id}>
              <div className="investor-dashboard-card-header">
                <div><span className="investor-dashboard-card-overline">طلب استثماري</span><h2>{request.objet}</h2></div>
                <span className={status.className}>{status.label}</span>
              </div>
              <div className="investor-dashboard-project-list">
                <div className="investor-dashboard-project-item">
                  <div className="investor-dashboard-project-icon"><i className="bi bi-file-earmark-text" /></div>
                  <div className="investor-dashboard-project-info">
                    <strong>{request.type_demande}</strong>
                    <span>{request.projet_titre || "بدون مشروع مرتبط"}</span>
                    <small>{request.created_at ? formatDate(request.created_at) : "—"}</small>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {requests.length === 0 && (
          <div className="investor-dashboard-card investor-dashboard-projects-card">
            <div className="investor-dashboard-card-header"><div><span className="investor-dashboard-card-overline">الطلبات</span><h2>لا توجد طلبات</h2></div></div>
          </div>
        )}
      </div>
    </section>
  );
}
