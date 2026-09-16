import type { DashboardInvestment } from "../../types/investorDashboard";
import { formatAmount, formatDate, getInvestmentStatus } from "../../utils/investorDashboard";
import { useTranslation } from "../../i18n/I18nProvider";

interface Props { investments: DashboardInvestment[]; }

export default function InvestorInvestmentsSection({ investments }: Props) {
  const { t } = useTranslation();
  const tr = (key: string) => t(`investorDashboard.${key}`);

  return (
    <section className="investor-dashboard-section">
      <div className="investor-dashboard-page-header"><div><span className="investor-dashboard-overline">{tr("overview.investments")}</span><h1>{tr("investmentsTitle")}</h1><p>{tr("investmentsDescription")}</p></div></div>
      <div className="investor-dashboard-grid">
        {investments.map((investment) => {
          const status = getInvestmentStatus(investment.statut);
          return (
            <div className="investor-dashboard-card investor-dashboard-projects-card investor-soft-billing-card" key={investment.id}>
              <div className="investor-soft-billing-icon-wrap">
                <div className="investor-soft-billing-icon">
                  <i className="bi bi-wallet2" aria-hidden="true"></i>
                </div>
              </div>
              <div className="investor-soft-billing-body">
                <span className="investor-dashboard-card-overline">{tr("projectList.investment")}</span>
                <h2>{investment.projet_titre || tr("projectList.investment")}</h2>
                <span className={`investor-dashboard-status ${status.className}`}>{status.label}</span>
                <hr className="investor-soft-billing-divider" />
                <span className="investor-soft-billing-label">{tr("investmentForm.amount")}</span>
                <strong className="investor-soft-billing-amount">{formatAmount(investment.montant)}</strong>
                <div className="investor-soft-billing-meta">
                  <div>
                    <span>ID</span>
                    <strong>{investment.reference || "—"}</strong>
                  </div>
                  <div>
                    <span>{tr("investmentForm.date")}</span>
                    <strong>{formatDate(investment.date_investissement)}</strong>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {investments.length === 0 && <div className="investor-dashboard-card investor-dashboard-projects-card"><div className="investor-dashboard-card-header"><div><span className="investor-dashboard-card-overline">{tr("overview.investments")}</span><h2>{tr("overview.investmentSummary")}</h2></div></div></div>}
      </div>
    </section>
  );
}
