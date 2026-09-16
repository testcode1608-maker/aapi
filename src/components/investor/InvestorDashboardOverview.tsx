import type { DashboardActivity, DashboardInvestment, DashboardProject, DashboardStats } from "../../types/investorDashboard";
import { formatAmount, formatRelativeTime, getProjectStatus, toNumber } from "../../utils/investorDashboard";
import { useTranslation } from "../../i18n/I18nProvider";

interface Props {
  stats: DashboardStats | null;
  projects: DashboardProject[];
  investments: DashboardInvestment[];
  activities: DashboardActivity[];
  projectCompletion: number;
  completedInvestments: number;
}

function Kpi({ icon, label, value, note }: { icon: string; label: string; value: string | number; note: string }) {
  return (
    <article className="soft-investor-kpi">
      <div className="soft-investor-kpi-icon"><i className={icon} /></div>
      <div className="soft-investor-kpi-body"><span>{label}</span><strong>{value}</strong><small>{note}</small></div>
    </article>
  );
}

export default function InvestorDashboardOverview({ stats, projects, investments, activities, projectCompletion, completedInvestments }: Props) {
  const { t } = useTranslation();
  const totalProjects = toNumber(stats?.projects_total);
  const activeProjects = toNumber(stats?.projects_active);
  const totalInvestments = toNumber(stats?.investments_total ?? investments.length);
  const activeInvestments = toNumber(stats?.investments_active);
  const pendingRequests = toNumber(stats?.requests_pending);
  const documents = toNumber(stats?.documents_total);
  const investmentRate = totalInvestments ? Math.round((completedInvestments / totalInvestments) * 100) : 0;
  const projectRate = Math.min(100, Math.max(0, Math.round(projectCompletion)));
  const recentProjects = projects.slice(0, 5);
  const recentActivities = activities.slice(0, 5);

  return (
    <section className="soft-investor-dashboard">
      <div className="soft-investor-page-head">
        <div>
          <span className="soft-investor-eyebrow">AAPI · INVESTOR PORTAL</span>
          <h1>{t("investorDashboard.overview.welcome")}</h1>
          <p>{t("investorDashboard.overview.description")}</p>
        </div>
      </div>

      <div className="soft-investor-kpi-grid">
        <Kpi icon="bi bi-building" label={t("investorDashboard.overview.totalProjects")} value={totalProjects} note={`${activeProjects} ${t("investorDashboard.overview.activeProjects")}`} />
        <Kpi icon="bi bi-wallet2" label={t("investorDashboard.overview.activeInvestments")} value={activeInvestments} note={formatAmount(stats?.total_investment)} />
        <Kpi icon="bi bi-file-earmark-text" label={t("investorDashboard.overview.pendingRequests")} value={pendingRequests} note={`${toNumber(stats?.requests_total)} ${t("investorDashboard.overview.totalRequests")}`} />
        <Kpi icon="bi bi-folder2-open" label={t("investorDashboard.overview.documents")} value={documents} note={t("investorDashboard.overview.registeredDocument")} />
      </div>

      <div className="soft-investor-main-grid">
        <article className="soft-investor-card soft-investor-project-card">
          <div className="soft-investor-card-head">
            <div><span>{t("investorDashboard.overview.projects")}</span><h2>{t("investorDashboard.overview.latestProjects")}</h2></div>
            <a href="/investor/dashboard/projects">{t("investorDashboard.overview.viewAll")}</a>
          </div>
          <div className="soft-investor-table-wrap">
            <table className="soft-investor-table">
              <thead><tr><th>{t("investorDashboard.overview.projects")}</th><th>{t("investorDashboard.overview.investmentSector")}</th><th>{t("investorDashboard.overview.totalInvestments")}</th><th>{t("investorDashboard.overview.projectProgress")}</th></tr></thead>
              <tbody>
                {recentProjects.map((project) => {
                  const status = getProjectStatus(project.statut);
                  return <tr key={project.id}>
                    <td><div className="soft-investor-project-name"><span><i className="bi bi-buildings" /></span><div><strong>{project.titre}</strong><small>{project.nombre_emplois} {t("investorDashboard.overview.positions")}</small></div></div></td>
                    <td>{project.secteurs || t("investorDashboard.overview.investmentSector")}</td>
                    <td>{formatAmount(project.montant_investissement)}</td>
                    <td><div className="soft-investor-progress"><span>{status.label}</span><div><i style={{ width: `${project.statut === "realise" ? 100 : project.statut === "en_cours" ? 70 : project.statut === "approuve" ? 50 : 25}%` }} /></div></div></td>
                  </tr>;
                })}
                {!recentProjects.length && <tr><td colSpan={4} className="soft-investor-empty">{t("investorDashboard.overview.noProjects")}</td></tr>}
              </tbody>
            </table>
          </div>
        </article>

        <article className="soft-investor-card soft-investor-progress-card">
          <div className="soft-investor-card-head"><div><span>{t("investorDashboard.overview.investments")}</span><h2>{t("investorDashboard.overview.investmentSummary")}</h2></div></div>
          <div className="soft-investor-big-number"><small>{t("investorDashboard.overview.totalInvestments")}</small><strong>{formatAmount(stats?.total_investment)}</strong></div>
          <div className="soft-investor-progress-row"><div className="soft-investor-ring green"><b>{investmentRate}%</b></div><div><strong>{t("investorDashboard.overview.completed")}</strong><span>{completedInvestments} / {totalInvestments}</span></div></div>
          <div className="soft-investor-progress-row"><div className="soft-investor-ring gold"><b>{projectRate}%</b></div><div><strong>{t("investorDashboard.overview.projectProgress")}</strong><span>{activeProjects} {t("investorDashboard.overview.activeProjects")}</span></div></div>
          <div className="soft-investor-mini-stats"><div><span>{t("investorDashboard.overview.totalOperations")}</span><b>{totalInvestments}</b></div><div><span>{t("investorDashboard.overview.activeInvestments")}</span><b>{activeInvestments}</b></div></div>
        </article>

        <article className="soft-investor-card soft-investor-orders-card">
          <div className="soft-investor-card-head"><div><span>{t("investorDashboard.overview.activity")}</span><h2>{t("investorDashboard.overview.latestActivities")}</h2></div><a href="/investor/dashboard/notifications">{t("investorDashboard.overview.viewAll")}</a></div>
          <div className="soft-investor-orders">
            {recentActivities.map((activity, index) => <div className="soft-investor-order" key={`${activity.title}-${index}`}><span className="soft-investor-order-icon"><i className={`bi ${activity.icon || "bi-clock-history"}`} /></span><div><strong>{activity.title}</strong><p>{activity.text}</p><small>{formatRelativeTime(activity.date)}</small></div></div>)}
            {!recentActivities.length && <div className="soft-investor-empty">{t("investorDashboard.overview.noActivities")}</div>}
          </div>
        </article>

        <article className="soft-investor-card soft-investor-analytics-card">
          <div className="soft-investor-card-head"><div><span>AAPI</span><h2>{t("investorDashboard.overview.projectProgress")}</h2></div><span className="soft-investor-growth">+{projectRate}%</span></div>
          <div className="soft-investor-bars" aria-hidden="true"><i style={{ height: "38%" }} /><i style={{ height: "52%" }} /><i style={{ height: "44%" }} /><i style={{ height: "68%" }} /><i style={{ height: "58%" }} /><i style={{ height: `${Math.max(20, projectRate)}%` }} /><i style={{ height: "82%" }} /></div>
          <div className="soft-investor-chart-labels"><span>01</span><span>02</span><span>03</span><span>04</span><span>05</span><span>06</span><span>07</span></div>
        </article>
      </div>
    </section>
  );
}
