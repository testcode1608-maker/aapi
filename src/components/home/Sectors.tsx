import { Link } from "react-router-dom";
import { useTranslation } from "../../i18n/I18nProvider";

function Sectors() {
  const { t, language } = useTranslation();
  const sectors = [
    { icon:"bi-buildings", number:"01", title:t("sectors.industry"), text:t("sectors.industryText") },
    { icon:"bi-tree", number:"02", title:t("sectors.agriculture"), text:t("sectors.agricultureText") },
    { icon:"bi-lightning-charge", number:"03", title:t("sectors.energy"), text:t("sectors.energyText") },
    { icon:"bi-cpu", number:"04", title:t("sectors.technology"), text:t("sectors.technologyText") },
    { icon:"bi-water", number:"05", title:t("sectors.tourism"), text:t("sectors.tourismText") },
    { icon:"bi-truck", number:"06", title:t("sectors.logistics"), text:t("sectors.logisticsText") },
  ];

  const directionClass = language === "ar" ? "sector-card-number-rtl" : "sector-card-number-ltr";

  return (
    <section className="sectors-section" id="investment">
      <div className="container">
        <div className="aapi-section-header centered">
          <span className="section-overline">{t("sectors.overline")}</span>
          <h2>{t("sectors.title")} <strong>{t("sectors.titleStrong")}</strong></h2>
          <p>{t("sectors.description")}</p>
        </div>
        <div className="row g-0 sectors-grid">
          {sectors.map(sector => <div className="col-xl-4 col-lg-4 col-md-6" key={sector.number}>
            <article className="sector-card">
              <div className={`sector-card-number ${directionClass}`}>{sector.number}</div>
              <div className="sector-icon"><i className={`bi ${sector.icon}`} aria-hidden="true"></i></div>
              <div className="sector-content"><h3>{sector.title}</h3><p>{sector.text}</p><Link to="/sectors" className="sector-link"><span>{t("common.discover")}</span><i className="bi bi-arrow-left" aria-hidden="true"></i></Link></div>
            </article>
          </div>)}
        </div>
        <div className="sectors-button-wrapper"><Link to="/sectors" className="green-outline-button"><span>{t("common.allSectors")}</span><i className="bi bi-arrow-left" aria-hidden="true"></i></Link></div>
      </div>
    </section>
  );
}
export default Sectors;
