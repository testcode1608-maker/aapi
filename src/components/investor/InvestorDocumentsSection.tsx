import type { DashboardDocument } from "../../types/investorDashboard";
import { formatDate, getDocumentStatus, getFileUrl } from "../../utils/investorDashboard";

interface Props { documents: DashboardDocument[]; }

export default function InvestorDocumentsSection({ documents }: Props) {
  return (
    <section className="investor-dashboard-section">
      <div className="investor-dashboard-page-header">
        <div>
          <span className="investor-dashboard-overline">الوثائق</span>
          <h1>وثائقي</h1>
          <p>جميع الوثائق المرتبطة بحسابك ومشاريعك.</p>
        </div>
      </div>
      <div className="investor-dashboard-grid">
        {documents.map((document) => {
          const status = getDocumentStatus(document.statut);
          const documentUrl = getFileUrl(document.fichier);
          return (
            <div className="investor-dashboard-card investor-dashboard-projects-card" key={document.id}>
              <div className="investor-dashboard-card-header">
                <div><span className="investor-dashboard-card-overline">وثيقة</span><h2>{document.titre}</h2></div>
                <span className={status.className}>{status.label}</span>
              </div>
              <div className="investor-dashboard-project-list">
                <div className="investor-dashboard-project-item">
                  <div className="investor-dashboard-project-icon"><i className="bi bi-file-earmark-text" /></div>
                  <div className="investor-dashboard-project-info">
                    <strong>{document.nom_original || document.titre}</strong>
                    <span>{document.type_document}</span>
                    <small>{document.uploaded_at ? formatDate(document.uploaded_at) : "—"}</small>
                  </div>
                  {documentUrl && <a href={documentUrl} target="_blank" rel="noreferrer" className="investor-dashboard-status success">تحميل</a>}
                </div>
              </div>
            </div>
          );
        })}
        {documents.length === 0 && (
          <div className="investor-dashboard-card investor-dashboard-projects-card">
            <div className="investor-dashboard-card-header"><div><span className="investor-dashboard-card-overline">الوثائق</span><h2>لا توجد وثائق</h2></div></div>
          </div>
        )}
      </div>
    </section>
  );
}
