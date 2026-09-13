import { Link } from "react-router-dom";
import type { ReactNode, CSSProperties } from "react";
import type { DashboardActivity, DashboardInvestment, DashboardProject, DashboardStats } from "../../types/investorDashboard";
import { formatAmount, formatRelativeTime, getProjectStatus, toNumber } from "../../utils/investorDashboard";
import { useTranslation } from "../../i18n/I18nProvider";

interface InvestorDashboardOverviewProps {
  stats: DashboardStats | null;
  projects: DashboardProject[];
  investments: DashboardInvestment[];
  activities: DashboardActivity[];
  projectCompletion: number;
  completedInvestments: number;
}

function StatCard({ icon, label, value, detail }: { icon: string; label: string; value: number; detail: ReactNode }) {
  return <div className="investor-dashboard-stat-card"><div className="investor-dashboard-stat-icon"><i className={icon} /></div><div className="investor-dashboard-stat-content"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></div>;
}

function InvestmentCircle({ label, value, total, tone, icon }: { label: string; value: number; total: number; tone: "green" | "gold" | "blue"; icon: string }) {
  const safeTotal = Math.max(total, 0);
  const percentage = safeTotal > 0 ? Math.min(100, Math.round((value / safeTotal) * 100)) : 0;
  const style = { "--circle-progress": `${percentage * 3.6}deg` } as CSSProperties;
  return <div className={`investor-investment-circle-item ${tone}`}><div className={`investor-investment-circle ${tone}`} style={style}><div className="investor-investment-circle-inner"><strong>{percentage}%</strong><span><i className={icon} /></span></div></div><strong className="investor-investment-circle-value">{value}</strong><span className="investor-investment-circle-label">{label}</span></div>;
}

export default function InvestorDashboardOverview({ stats, projects, investments, activities, projectCompletion, completedInvestments }: InvestorDashboardOverviewProps) {
  const { t } = useTranslation();
  const latestProjects = projects.slice(0, 3);
  const totalInvestments = toNumber(stats?.investments_total ?? investments.length);
  const activeInvestments = toNumber(stats?.investments_active);
  const investmentCompletion = totalInvestments > 0 ? Math.min(100, Math.round((completedInvestments / totalInvestments) * 100)) : 0;
  const projectProgress = Math.min(100, Math.max(0, projectCompletion));
  const statsItems = [
    { icon: "bi bi-building", label: t("investorDashboard.overview.totalProjects"), value: toNumber(stats?.projects_total), detail: `${toNumber(stats?.projects_active)} ${t("investorDashboard.overview.activeProjects")}` },
    { icon: "bi bi-cash-stack", label: t("investorDashboard.overview.activeInvestments"), value: activeInvestments, detail: formatAmount(stats?.total_investment) },
    { icon: "bi bi-file-earmark-text", label: t("investorDashboard.overview.pendingRequests"), value: toNumber(stats?.requests_pending), detail: `${t("investorDashboard.overview.totalRequests")} ${toNumber(stats?.requests_total)}` },
    { icon: "bi bi-folder2-open", label: t("investorDashboard.overview.documents"), value: toNumber(stats?.documents_total), detail: t("investorDashboard.overview.registeredDocument") },
  ];

  return <section className="investor-dashboard-section">
    <div className="investor-dashboard-section-header"><div><span className="investor-dashboard-overline">{t("investorDashboard.overview.overline")}</span><h1>{t("investorDashboard.overview.welcome")}</h1><p>{t("investorDashboard.overview.description")}</p></div></div>
    <div className="investor-dashboard-stats">{statsItems.map((item) => <StatCard key={item.label} {...item} />)}</div>

    <div className="investor-dashboard-grid">
      <div className="investor-dashboard-card investor-dashboard-projects-card">
        <div className="investor-dashboard-card-header"><div><span className="investor-dashboard-card-overline">{t("investorDashboard.overview.projects")}</span><h2>{t("investorDashboard.overview.latestProjects")}</h2></div><Link to="/investor/dashboard/projects">{t("investorDashboard.overview.viewAll")}</Link></div>
        <div className="investor-dashboard-project-list">
          {latestProjects.map((project) => { const status = getProjectStatus(project.statut); return <div className="investor-dashboard-project-item" key={project.id}><div className="investor-dashboard-project-icon"><i className="bi bi-building" /></div><div className="investor-dashboard-project-info"><strong>{project.titre}</strong><span>{project.secteurs || t("investorDashboard.overview.investmentSector")}</span><small>{formatAmount(project.montant_investissement)} · {project.nombre_emplois} {t("investorDashboard.overview.positions")}</small></div><span className={status.className}>{status.label}</span></div>; })}
          {projects.length === 0 && <div className="investor-dashboard-project-item"><div className="investor-dashboard-project-icon"><i className="bi bi-building" /></div><div className="investor-dashboard-project-info"><strong>{t("investorDashboard.overview.noProjects")}</strong><span>{t("investorDashboard.overview.addProject")}</span></div></div>}
        </div>
      </div>

      <div className="investor-dashboard-card investor-dashboard-investment-summary">
        <div className="investor-dashboard-card-header"><div><span className="investor-dashboard-card-overline">{t("investorDashboard.overview.investments")}</span><h2>{t("investorDashboard.overview.investmentSummary")}</h2></div></div>
        <div className="investor-dashboard-investment-total"><span>{t("investorDashboard.overview.totalInvestments")}</span><strong>{formatAmount(stats?.total_investment)}</strong></div>
        <div className="investor-investment-circles"><InvestmentCircle label={t("investorDashboard.overview.active")} value={activeInvestments} total={totalInvestments} tone="green" icon="bi bi-lightning-charge-fill" /><InvestmentCircle label={t("investorDashboard.overview.completed")} value={completedInvestments} total={totalInvestments} tone="gold" icon="bi bi-check2-circle" /><InvestmentCircle label={t("investorDashboard.overview.projectProgress")} value={projectProgress} total={100} tone="blue" icon="bi bi-graph-up-arrow" /></div>
        <div className="investor-dashboard-investment-table"><div className="investor-investment-table-box"><span>{t("investorDashboard.overview.totalOperations")}</span><strong>{totalInvestments}</strong></div><div className="investor-investment-table-box"><span>{t("investorDashboard.overview.activeInvestments")}</span><strong>{activeInvestments}</strong></div><div className="investor-investment-table-box"><span>{t("investorDashboard.overview.completionRate")}</span><strong>{investmentCompletion}%</strong></div></div>
      </div>

      <div className="investor-dashboard-card investor-dashboard-activity-card">
        <div className="investor-dashboard-card-header"><div><span className="investor-dashboard-card-overline">{t("investorDashboard.overview.activity")}</span><h2>{t("investorDashboard.overview.latestActivities")}</h2></div></div>
        <div className="investor-dashboard-activity-list">
          {activities.map((activity, index) => <div className="investor-dashboard-activity-item" key={`${activity.title}-${activity.date || ""}-${index}`}><div className="investor-dashboard-activity-icon"><i className={`bi ${activity.icon || "bi-clock-history"}`} /></div><div className="investor-dashboard-activity-content"><strong>{activity.title}</strong><span>{activity.text}</span><small>{formatRelativeTime(activity.date)}</small></div></div>)}
          {activities.length === 0 && <div className="investor-dashboard-activity-item"><div className="investor-dashboard-activity-icon"><i className="bi bi-clock-history" /></div><div className="investor-dashboard-activity-content"><strong>{t("investorDashboard.overview.noActivities")}</strong><span>{t("investorDashboard.overview.activityDescription")}</span></div></div>}
        </div>
      </div>
    </div>
  </section>;
}
