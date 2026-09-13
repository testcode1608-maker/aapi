import type { DashboardInvestment } from "../../types/investorDashboard";
import { formatAmount, formatDate, getInvestmentStatus } from "../../utils/investorDashboard";
import { useTranslation } from "../../i18n/I18nProvider";

interface Props { investments: DashboardInvestment[]; }

export default function InvestorInvestmentsSection({ investments }: Props) {
  const { t } = useTranslation();
  const tr = (key: string) => t(`investorDashboard.investments.${key}`);

  return (
    <section className="investor-dashboard-section">
      <div className="investor-dashboard-page-header"><div><span className="investor-dashboard-overline">{tr("overline")}</span><h1>{tr("title")}</h1><p>{tr("description")}</p></div></div>
      <div className="investor-dashboard-grid">
        {investments.map((investment) => {
          const status = getInvestmentStatus(investment.statut);
          return (
            <div className="investor-dashboard-card investor-dashboard-projects-card" key={investment.id}>
              <div className="investor-dashboard-card-header"><div><span className="investor-dashboard-card-overline">{tr("investment")}</span><h2>{investment.projet_titre || tr("investment")}</h2></div><span className={status.className}>{status.label}</span></div>
              <div className="investor-dashboard-investment-total"><span>{tr("amount")}</span><strong>{formatAmount(investment.montant)}</strong></div>
              <div className="investor-dashboard-investment-items"><div><span>{tr("reference")}</span><strong>{investment.reference || "—"}</strong></div><div><span>{tr("date")}</span><strong>{formatDate(investment.date_investissement)}</strong></div></div>
            </div>
          );
        })}
        {investments.length === 0 && <div className="investor-dashboard-card investor-dashboard-projects-card"><div className="investor-dashboard-card-header"><div><span className="investor-dashboard-card-overline">{tr("overline")}</span><h2>{tr("empty")}</h2></div></div></div>}
      </div>
    </section>
  );
}
