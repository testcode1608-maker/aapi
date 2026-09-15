import { useState } from "react";
import type { DashboardProject, DashboardRequest } from "../../types/investorDashboard";
import { formatDate, getRequestStatus } from "../../utils/investorDashboard";
import { useCreateInvestorRequest } from "../../hooks/useCreateInvestorRequest";
import InvestorRequestCreateForm from "./InvestorRequestCreateForm";
import { useTranslation } from "../../i18n/I18nProvider";
import "../../styles/investor-requests.css";

interface Props {
  requests: DashboardRequest[];
  projects: DashboardProject[];
  reload: () => Promise<void>;
}

export default function InvestorRequestsSection({ requests, projects, reload }: Props) {
  const { t } = useTranslation();
  const createRequest = useCreateInvestorRequest(projects, reload);
  const [showForm, setShowForm] = useState(true);
  const tr = (key: string) => t(`investorDashboard.requests.${key}`);

  return (
    <section className="investor-dashboard-section">
      <div className="investor-dashboard-page-header">
        <div>
          <span className="investor-dashboard-overline">{tr("overline")}</span>
          <h1>{tr("title")}</h1>
          <p>{tr("description")}</p>
        </div>
        <button type="button" className="investor-dashboard-primary-btn" onClick={() => setShowForm((value) => !value)}>
          <i className={showForm ? "bi bi-dash-circle" : "bi bi-plus-circle"} />
          {showForm ? tr("hideForm") : tr("newRequest")}
        </button>
      </div>

      <div className="investor-dashboard-grid">
        {requests.map((request) => {
          const status = getRequestStatus(request.statut);
          return (
            <div className="investor-dashboard-card investor-dashboard-projects-card" key={request.id}>
              <div className="investor-dashboard-card-header">
                <div>
                  <span className="investor-dashboard-card-overline">{request.type_demande || tr("investmentRequest")}</span>
                  <h2>{request.objet}</h2>
                </div>
                <span className={status.className}>{status.label}</span>
              </div>
              <div className="investor-dashboard-project-list">
                <div className="investor-dashboard-project-item">
                  <div className="investor-dashboard-project-icon"><i className="bi bi-file-earmark-text" /></div>
                  <div className="investor-dashboard-project-info">
                    <strong>{request.projet_titre || tr("noProject")}</strong>
                    <span>{request.wilaya || tr("wilayaUnknown")}</span>
                    <small>{request.created_at ? formatDate(request.created_at) : "—"}</small>
                  </div>
                </div>
                {request.description && <p className="investor-request-description">{request.description}</p>}
                {request.reponse && (
                  <div className="investor-request-response">
                    <strong>{tr("adminResponse")}</strong>
                    <span>{request.reponse}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {requests.length === 0 && (
          <div className="investor-dashboard-card investor-dashboard-projects-card">
            <div className="investor-dashboard-card-header">
              <div><span className="investor-dashboard-card-overline">{tr("list")}</span><h2>{tr("empty")}</h2></div>
            </div>
            <p>{tr("emptyDescription")}</p>
          </div>
        )}
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
    </section>
  );
}
