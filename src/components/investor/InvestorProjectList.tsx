import type { DashboardProject } from "../../types/investorDashboard";
import { formatAmount, getProjectStatus } from "../../utils/investorDashboard";

interface Props { projects: DashboardProject[]; }

export default function InvestorProjectList({ projects }: Props) {
  return (
    <div className="investor-dashboard-grid">
      {projects.map((project) => {
        const status = getProjectStatus(project.statut);
        return (
          <div className="investor-dashboard-card investor-dashboard-projects-card" key={project.id}>
            <div className="investor-dashboard-card-header">
              <div><span className="investor-dashboard-card-overline">مشروع استثماري</span><h2>{project.titre}</h2></div>
              <span className={status.className}>{status.label}</span>
            </div>
            <div className="investor-dashboard-project-list">
              <div className="investor-dashboard-project-item">
                <div className="investor-dashboard-project-icon"><i className="bi bi-building" /></div>
                <div className="investor-dashboard-project-info">
                  <strong>{project.secteurs || "قطاع استثماري"}</strong>
                  <span>{project.wilaya || "—"}{project.commune ? ` · ${project.commune}` : ""}</span>
                  <small>الاستثمار: {formatAmount(project.montant_investissement)}</small>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {projects.length === 0 && (
        <div className="investor-dashboard-card investor-dashboard-projects-card">
          <div className="investor-dashboard-card-header">
            <div><span className="investor-dashboard-card-overline">المشاريع</span><h2>لا توجد مشاريع</h2></div>
          </div>
        </div>
      )}
    </div>
  );
}
