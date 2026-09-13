import { useState } from "react";
import type { DashboardRequest } from "../../types/investorDashboard";
import { formatDate, getRequestStatus } from "../../utils/investorDashboard";
import { useInvestorDashboard } from "../../hooks/useInvestorDashboard";
import { useCreateInvestorRequest } from "../../hooks/useCreateInvestorRequest";
import InvestorRequestCreateForm from "./InvestorRequestCreateForm";

interface Props { requests: DashboardRequest[]; }

export default function InvestorRequestsSection({ requests }: Props) {
  const dashboard = useInvestorDashboard();
  const createRequest = useCreateInvestorRequest(dashboard.projects, dashboard.reload);
  const [showForm, setShowForm] = useState(true);

  return (
    <section className="investor-dashboard-section">
      <div className="investor-dashboard-page-header">
        <div>
          <span className="investor-dashboard-overline">الخدمات</span>
          <h1>طلباتي الاستثمارية</h1>
          <p>إرسال الطلبات ومتابعة حالتها وإرفاق الوثائق اللازمة.</p>
        </div>
        <button type="button" className="investor-dashboard-primary-btn" onClick={() => setShowForm(v => !v)}>
          <i className={showForm ? "bi bi-dash-circle" : "bi bi-plus-circle"} /> {showForm ? "إخفاء النموذج" : "طلب جديد"}
        </button>
      </div>

      {showForm && (
        <InvestorRequestCreateForm
          form={createRequest.form}
          setForm={createRequest.setForm}
          setDocuments={createRequest.setDocuments}
          projects={createRequest.eligibleProjects}
          creating={createRequest.creating}
          error={createRequest.error}
          success={createRequest.success}
          onSubmit={createRequest.submit}
          onReset={createRequest.resetForm}
        />
      )}

      <div className="investor-dashboard-grid">
        {requests.map(request => {
          const status = getRequestStatus(request.statut);
          return (
            <div className="investor-dashboard-card investor-dashboard-projects-card" key={request.id}>
              <div className="investor-dashboard-card-header">
                <div><span className="investor-dashboard-card-overline">{request.type_demande || "طلب استثماري"}</span><h2>{request.objet}</h2></div>
                <span className={status.className}>{status.label}</span>
              </div>
              <div className="investor-dashboard-project-list">
                <div className="investor-dashboard-project-item">
                  <div className="investor-dashboard-project-icon"><i className="bi bi-file-earmark-text" /></div>
                  <div className="investor-dashboard-project-info">
                    <strong>{request.projet_titre || "بدون مشروع مرتبط"}</strong>
                    <span>{request.wilaya || "الولاية غير محددة"}</span>
                    <small>{request.created_at ? formatDate(request.created_at) : "—"}</small>
                  </div>
                </div>
                {request.description && <p className="investor-request-description">{request.description}</p>}
                {request.reponse && <div className="investor-request-response"><strong>رد الإدارة:</strong><span>{request.reponse}</span></div>}
              </div>
            </div>
          );
        })}
        {requests.length === 0 && (
          <div className="investor-dashboard-card investor-dashboard-projects-card">
            <div className="investor-dashboard-card-header"><div><span className="investor-dashboard-card-overline">الطلبات</span><h2>لا توجد طلبات بعد</h2></div></div>
            <p>أرسل أول طلب استثماري من النموذج أعلاه.</p>
          </div>
        )}
      </div>
    </section>
  );
}
