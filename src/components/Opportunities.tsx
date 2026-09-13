import { Link } from "react-router-dom";
import { useTranslation } from "../i18n/I18nProvider";

interface Opportunity { image: string; category: string; title: string; location: string; amount: string; }

function Opportunities() {
  const { t } = useTranslation();
  const opportunities: Opportunity[] = [
    { image: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=1000&q=80", category: t("sectors.industry"), title: t("homeOpportunities.industryTitle"), location: t("locations.algiers"), amount: "120 مليون دج" },
    { image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80", category: t("sectors.agriculture"), title: t("homeOpportunities.agricultureTitle"), location: t("locations.biskra"), amount: "85 مليون دج" },
    { image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1000&q=80", category: t("sectors.energy"), title: t("homeOpportunities.energyTitle"), location: t("locations.oran"), amount: "250 مليون دج" },
  ];
  return (
    <section className="opportunities-section"><div className="container">
      <div className="opportunities-header"><div className="opportunities-title"><span className="section-overline">{t("homeOpportunities.overline")}</span><h2>{t("homeOpportunities.title")}<strong> {t("homeOpportunities.titleStrong")}</strong></h2></div><div className="opportunities-intro"><p>{t("homeOpportunities.description")}</p><Link to="/opportunities" className="opportunities-header-link"><span>{t("homeOpportunities.viewAll")}</span><i className="bi bi-arrow-left" aria-hidden="true" /></Link></div></div>
      <div className="row g-4">{opportunities.map((opportunity) => <div className="col-xl-4 col-lg-4 col-md-6" key={opportunity.title}><article className="opportunity-card"><div className="opportunity-image-wrapper"><img src={opportunity.image} alt={opportunity.title} className="opportunity-image" /><div className="opportunity-image-overlay" /><span className="opportunity-category">{opportunity.category}</span><span className="opportunity-status"><i className="bi bi-check-circle-fill" aria-hidden="true" />{t("homeOpportunities.available")}</span></div><div className="opportunity-content"><h3>{opportunity.title}</h3><div className="opportunity-details"><div className="opportunity-detail"><i className="bi bi-geo-alt" aria-hidden="true" /><span>{opportunity.location}</span></div><div className="opportunity-detail"><i className="bi bi-cash-stack" aria-hidden="true" /><span>{opportunity.amount}</span></div></div><div className="opportunity-footer"><span>{t("investment.projects")}</span><Link to="/opportunities" aria-label={`${t("homeOpportunities.view")} ${opportunity.title}`}><i className="bi bi-arrow-left" aria-hidden="true" /></Link></div></div></article></div>)}</div>
      <div className="opportunities-bottom"><Link to="/opportunities" className="green-outline-button"><span>{t("homeOpportunities.exploreAll")}</span><i className="bi bi-arrow-left" aria-hidden="true" /></Link></div>
    </div></section>
  );
}
export default Opportunities;
