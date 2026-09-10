import type { DashboardInvestment } from "../../types/investorDashboard";
import { formatAmount, formatDate, getInvestmentStatus } from "../../utils/investorDashboard";

interface Props { investments: DashboardInvestment[]; }

export default function InvestorInvestmentsSection({ investments }: Props) {
  return (
    <section className="investor-dashboard-section">
      <div className="investor-dashboard-page-header">
        <div>
          <span className="investor-dashboard-overline">الاستثمارات</span>
          <h1>استثماراتي</h1>
          <p>جميع عمليات الاستثمار المرتبطة بحسابك.</p>
        </div>
      </div>
      <div className="investor-dashboard-grid">
        {investments.map((investment) => {
          const status = getInvestmentStatus(investment.statut);
          return (
            <div className="investor-dashboard-card investor-dashboard-projects-card" key={investment.id}>
              <div className="investor-dashboard-card-header">
                <div>
                  <span className="investor-dashboard-card-overline">استثمار</span>
                  <h2>{investment.projet_titre || "استثمار"}</h2>
                </div>
                <span className={status.className}>{status.label}</span>
              </div>
              <div className="investor-dashboard-investment-total">
                <span>مبلغ الاستثمار</span>
                <strong>{formatAmount(investment.montant)}</strong>
              </div>
              <div className="investor-dashboard-investment-items">
                <div><span>المرجع</span><strong>{investment.reference || "—"}</strong></div>
                <div><span>التاريخ</span><strong>{formatDate(investment.date_investissement)}</strong></div>
              </div>
            </div>
          );
        })}
        {investments.length === 0 && (
          <div className="investor-dashboard-card investor-dashboard-projects-card">
            <div className="investor-dashboard-card-header"><div><span className="investor-dashboard-card-overline">الاستثمارات</span><h2>لا توجد استثمارات</h2></div></div>
          </div>
        )}
      </div>
    </section>
  );
}
