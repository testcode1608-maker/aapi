import type { DashboardStats } from "../../types/investorDashboard";
import { formatAmount, toNumber } from "../../utils/investorDashboard";

interface InvestorDashboardStatsProps {
  stats: DashboardStats | null;
}

interface StatCardProps {
  icon: string;
  label: string;
  value: React.ReactNode;
  detail: React.ReactNode;
}

const StatCard = ({ icon, label, value, detail }: StatCardProps) => (
  <div className="investor-dashboard-stat-card">
    <div className="investor-dashboard-stat-icon">
      <i className={icon} />
    </div>
    <div className="investor-dashboard-stat-content">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  </div>
);

export default function InvestorDashboardStats({ stats }: InvestorDashboardStatsProps) {
  return (
    <div className="investor-dashboard-stats">
      <StatCard
        icon="bi bi-building"
        label="إجمالي المشاريع"
        value={toNumber(stats?.projects_total)}
        detail={`${toNumber(stats?.projects_active)} مشروع نشط`}
      />
      <StatCard
        icon="bi bi-cash-stack"
        label="الاستثمارات النشطة"
        value={toNumber(stats?.investments_active)}
        detail={formatAmount(stats?.total_investment)}
      />
      <StatCard
        icon="bi bi-file-earmark-text"
        label="الطلبات قيد المعالجة"
        value={toNumber(stats?.requests_pending)}
        detail={`${toNumber(stats?.requests_total)} طلب إجمالاً`}
      />
      <StatCard
        icon="bi bi-folder2-open"
        label="الوثائق"
        value={toNumber(stats?.documents_total)}
        detail={`${toNumber(stats?.documents_validated)} وثيقة مصادق عليها`}
      />
    </div>
  );
}
