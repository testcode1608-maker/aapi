import { Link } from "react-router-dom";
import { useTranslation } from "../i18n/I18nProvider";

type Sector = { icon: string; number: string; title: string; description: string; opportunities: string; featured: boolean };

const sectorMeta = [
  ["bi-buildings", "01", true], ["bi-tree", "02", false], ["bi-sun", "03", true],
  ["bi-water", "04", false], ["bi-cpu", "05", true], ["bi-truck", "06", false],
  ["bi-droplet", "07", false], ["bi-heart-pulse", "08", false], ["bi-house", "09", false],
] as const;

function SectorsPage() {
  const { t } = useTranslation();
  const sectors: Sector[] = sectorMeta.map(([icon, number, featured]) => ({
    icon, number, featured,
    title: t(`sectorsPage.s${number.replace(/^0/, "")}`),
    description: t(`sectorsPage.s${number.replace(/^0/, "")}Text`),
    opportunities: t(`sectorsPage.s${number.replace(/^0/, "")}Opp`),
  }));

  return (
    <>
      <section className="inner-hero sectors-inner-hero"><div className="container"><div className="inner-hero-content">
        <span>{t("sectorsPage.heroOverline")}</span><h1>{t("sectorsPage.heroTitle")}</h1><p>{t("sectorsPage.heroText")}</p>
      </div></div></section>

      <section className="sectors-page-intro"><div className="container"><div className="row align-items-end g-5">
        <div className="col-lg-7"><span className="section-overline">{t("sectorsPage.introOverline")}</span><h2 className="sectors-page-title">{t("sectorsPage.introTitle")}<strong>{t("sectorsPage.introStrong")}</strong></h2></div>
        <div className="col-lg-5"><p className="sectors-page-description">{t("sectorsPage.introText")}</p></div>
      </div></div></section>

      <section className="sectors-mini-stats"><div className="container"><div className="row g-0">
        <div className="col-lg-3 col-md-6"><div className="sector-mini-stat"><strong>09+</strong><span>{t("sectorsPage.statSectors")}</span></div></div>
        <div className="col-lg-3 col-md-6"><div className="sector-mini-stat"><strong>58</strong><span>{t("sectorsPage.statWilayas")}</span></div></div>
        <div className="col-lg-3 col-md-6"><div className="sector-mini-stat"><strong>48+</strong><span>{t("sectorsPage.statActivities")}</span></div></div>
        <div className="col-lg-3 col-md-6"><div className="sector-mini-stat"><strong>∞</strong><span>{t("sectorsPage.statPotential")}</span></div></div>
      </div></div></section>

      <section className="sectors-page-content"><div className="container"><div className="sectors-page-grid">
        {sectors.map((sector) => <article className={sector.featured ? "sector-page-card featured" : "sector-page-card"} key={sector.number}>
          <div className="sector-page-card-top"><span>{sector.number}</span><div className="sector-page-icon"><i className={`bi ${sector.icon}`} aria-hidden="true"></i></div></div>
          <h3>{sector.title}</h3><p>{sector.description}</p>
          <div className="sector-page-opportunity"><i className="bi bi-arrow-left" aria-hidden="true"></i><span>{sector.opportunities}</span></div>
          <Link to="/opportunities">{t("sectorsPage.explore")} <i className="bi bi-arrow-left" aria-hidden="true"></i></Link>
        </article>)}
      </div></div></section>

      <section className="why-algeria"><div className="container"><div className="row align-items-center g-5">
        <div className="col-lg-6"><div className="why-algeria-visual"><div className="why-algeria-circle"><i className="bi bi-geo-alt" aria-hidden="true"></i></div><div className="why-algeria-card card-one"><strong>58</strong><span>{t("sectorsPage.statWilayas")}</span></div><div className="why-algeria-card card-two"><strong>+</strong><span>{t("sectorsPage.statPotential")}</span></div></div></div>
        <div className="col-lg-6"><span className="section-overline">{t("sectorsPage.whyOverline")}</span><h2 className="why-algeria-title">{t("sectorsPage.whyTitle")}<strong>{t("sectorsPage.whyStrong")}</strong></h2><p className="why-algeria-text">{t("sectorsPage.whyText")}</p>
          <div className="why-algeria-list">
            {["strategic", "natural", "market", "human"].map((key) => <div key={key}><i className="bi bi-check-circle" aria-hidden="true"></i><span>{t(`sectorsPage.${key}`)}</span></div>)}
          </div>
        </div>
      </div></div></section>

      <section className="sectors-page-cta"><div className="container"><div className="sectors-cta-box"><div>
        <span>{t("sectorsPage.ctaOverline")}</span><h2>{t("sectorsPage.ctaTitle")}<strong>{t("sectorsPage.ctaStrong")}</strong></h2><p>{t("sectorsPage.ctaText")}</p>
      </div><Link to="/opportunities" className="sectors-cta-button">{t("sectorsPage.ctaButton")} <i className="bi bi-arrow-left" aria-hidden="true"></i></Link></div></div></section>
    </>
  );
}

export default SectorsPage;
