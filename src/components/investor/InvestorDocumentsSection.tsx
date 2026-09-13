import type { DashboardDocument } from "../../types/investorDashboard";
import { formatDate, getDocumentStatus, getFileUrl } from "../../utils/investorDashboard";
import { useTranslation } from "../../i18n/I18nProvider";

interface Props { documents: DashboardDocument[]; }

export default function InvestorDocumentsSection({ documents }: Props) {
  const { t } = useTranslation();
  const tr = (key: string) => t(`investorDashboard.documents.${key}`);

  return (
    <section className="investor-dashboard-section">
      <div className="investor-dashboard-page-header"><div><span className="investor-dashboard-overline">{tr("overline")}</span><h1>{tr("title")}</h1><p>{tr("description")}</p></div></div>
      <div className="investor-dashboard-grid">
        {documents.map((document) => {
          const status = getDocumentStatus(document.statut);
          const documentUrl = getFileUrl(document.fichier);
          return (
            <div className="investor-dashboard-card investor-dashboard-projects-card" key={document.id}>
              <div className="investor-dashboard-card-header"><div><span className="investor-dashboard-card-overline">{tr("document")}</span><h2>{document.titre}</h2></div><span className={status.className}>{status.label}</span></div>
              <div className="investor-dashboard-project-list"><div className="investor-dashboard-project-item"><div className="investor-dashboard-project-icon"><i className="bi bi-file-earmark-text" /></div><div className="investor-dashboard-project-info"><strong>{document.nom_original || document.titre}</strong><span>{document.type_document}</span><small>{document.uploaded_at ? formatDate(document.uploaded_at) : "—"}</small></div>{documentUrl && <a href={documentUrl} target="_blank" rel="noreferrer" className="investor-dashboard-status success">{tr("download")}</a>}</div></div>
            </div>
          );
        })}
        {documents.length === 0 && <div className="investor-dashboard-card investor-dashboard-projects-card"><div className="investor-dashboard-card-header"><div><span className="investor-dashboard-card-overline">{tr("overline")}</span><h2>{tr("empty")}</h2></div></div></div>}
      </div>
    </section>
  );
}
