import type {
  DashboardActivity,
  DashboardInvestment,
  DashboardProject,
  DashboardStats,
} from "../../types/investorDashboard";
import {
  formatAmount,
  formatRelativeTime,
  getProjectStatus,
  toNumber,
} from "../../utils/investorDashboard";

interface InvestorDashboardOverviewProps {
  stats: DashboardStats | null;
  projects: DashboardProject[];
  investments: DashboardInvestment[];
  activities: DashboardActivity[];
  projectCompletion: number;
  completedInvestments: number;
}

const StatCard = ({ icon, label, value, detail }: { icon: string; label: string; value: number; detail: React.ReactNode }) => (
  <div className="investor-dashboard-stat-card">
    <div className="investor-dashboard-stat-icon"><i className={icon} /></div>
    <div className="investor-dashboard-stat-content">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  </div>
);

export default function InvestorDashboardOverview({
  stats,
  projects,
  investments,
  activities,
  projectCompletion,
  completedInvestments,
}: InvestorDashboardOverviewProps) {
  const latestProjects = projects.slice(0, 3);

  return (
    <section className="investor-dashboard-section">
      <div className="investor-dashboard-section-header">
        <div>
          <span className="investor-dashboard-overline">لوحة التحكم</span>
          <h1>مرحباً بك في فضاء المستثمر</h1>
          <p>تابع مشاريعك واستثماراتك وطلباتك من مكان واحد.</p>
        </div>
      </div>

      <div className="investor-dashboard-stats">
        <StatCard icon="bi bi-building" label="إجمالي المشاريع" value={toNumber(stats?.projects_total)} detail={`${toNumber(stats?.projects_active)} مشروع نشط`} />
        <StatCard icon="bi bi-cash-stack" label="الاستثمارات النشطة" value={toNumber(stats?.investments_active)} detail={formatAmount(stats?.total_investment)} />
        <StatCard icon="bi bi-file-earmark-text" label="الطلبات قيد المعالجة" value={toNumber(stats?.requests_pending)} detail={`من أصل ${toNumber(stats?.requests_total)}`} />
        <StatCard icon="bi bi-folder2-open" label="الوثائق" value={toNumber(stats?.documents_total)} detail="وثيقة مسجلة" />
      </div>

      <div className="investor-dashboard-grid">
        <div className="investor-dashboard-card investor-dashboard-projects-card">
          <div className="investor-dashboard-card-header">
            <div><span className="investor-dashboard-card-overline">المشاريع</span><h2>آخر مشاريعي</h2></div>
            <a href="/investor/dashboard/projects">عرض الكل</a>
          </div>
          <div className="investor-dashboard-project-list">
            {latestProjects.map((project) => {
              const status = getProjectStatus(project.statut);
              return (
                <div className="investor-dashboard-project-item" key={project.id}>
                  <div className="investor-dashboard-project-icon"><i className="bi bi-building" /></div>
                  <div className="investor-dashboard-project-info">
                    <strong>{project.titre}</strong>
                    <span>{project.secteurs || "قطاع استثماري"}</span>
                    <small>{formatAmount(project.montant_investissement)} · {project.nombre_emplois} منصب</small>
                  </div>
                  <span className={status.className}>{status.label}</span>
                </div>
              );
            })}
            {projects.length === 0 && (
              <div className="investor-dashboard-project-item">
                <div className="investor-dashboard-project-icon"><i className="bi bi-building" /></div>
                <div className="investor-dashboard-project-info"><strong>لا توجد مشاريع بعد</strong><span>يمكنك إضافة مشروع استثماري جديد.</span></div>
              </div>
            )}
          </div>
        </div>

        <div className="investor-dashboard-card investor-dashboard-investment-summary">
          <div className="investor-dashboard-card-header">
            <div><span className="investor-dashboard-card-overline">الاستثمارات</span><h2>ملخص الاستثمارات</h2></div>
          </div>
          <div className="investor-dashboard-investment-total">
            <span>إجمالي الاستثمارات</span><strong>{formatAmount(stats?.total_investment)}</strong>
          </div>
          <div className="investor-dashboard-progress">
            <div className="investor-dashboard-progress-header"><span>نسبة المشاريع المكتملة</span><strong>{projectCompletion}%</strong></div>
            <div className="investor-dashboard-progress-bar"><span style={{ width: `${projectCompletion}%` }} /></div>
          </div>
          <div className="investor-dashboard-investment-items">
            <div><span>الاستثمارات النشطة</span><strong>{toNumber(stats?.investments_active)}</strong></div>
            <div><span>الاستثمارات المكتملة</span><strong>{completedInvestments}</strong></div>
            <div><span>إجمالي العمليات</span><strong>{toNumber(stats?.investments_total ?? investments.length)}</strong></div>
          </div>
        </div>

        <div className="investor-dashboard-card investor-dashboard-activity-card">
          <div className="investor-dashboard-card-header"><div><span className="investor-dashboard-card-overline">النشاط</span><h2>آخر النشاطات</h2></div></div>
          <div className="investor-dashboard-activity-list">
            {activities.map((activity, index) => (
              <div className="investor-dashboard-activity-item" key={`${activity.title}-${activity.date || ""}-${index}`}>
                <div className="investor-dashboard-activity-icon"><i className={`bi ${activity.icon || "bi-clock-history"}`} /></div>
                <div className="investor-dashboard-activity-content"><strong>{activity.title}</strong><span>{activity.text}</span><small>{formatRelativeTime(activity.date)}</small></div>
              </div>
            ))}
            {activities.length === 0 && (
              <div className="investor-dashboard-activity-item">
                <div className="investor-dashboard-activity-icon"><i className="bi bi-clock-history" /></div>
                <div className="investor-dashboard-activity-content"><strong>لا توجد نشاطات حديثة</strong><span>ستظهر هنا آخر التحديثات المتعلقة بحسابك.</span></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
