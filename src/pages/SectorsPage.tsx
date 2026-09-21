import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../i18n/I18nProvider";
import "../styles/sectors-page-cards.css";

type Sector = { icon: string; number: string; title: string; description: string; opportunities: string; imageUrl?: string };

type ApiSector = { id: number; nom: string; description: string; image_url?: string };

const sectorMeta = [
  ["bi-buildings", "01"], ["bi-tree", "02"], ["bi-sun", "03"],
  ["bi-water", "04"], ["bi-cpu", "05"], ["bi-truck", "06"],
  ["bi-droplet", "07"], ["bi-heart-pulse", "08"], ["bi-house", "09"],
] as const;

function SectorsPage() {
  const { t } = useTranslation();
  const fallbackSectors: Sector[] = sectorMeta.map(([icon, number]) => ({
    icon,
    number,
    title: t(`sectorsPage.s${number.replace(/^0/, "")}`),
    description: t(`sectorsPage.s${number.replace(/^0/, "")}Text`),
    opportunities: t(`sectorsPage.s${number.replace(/^0/, "")}Opp`),
  }));
  const [dbSectors, setDbSectors] = useState<ApiSector[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("http://localhost/aapi-api/sectors.php")
      .then(async r => {
        const raw = await r.text();
        let data: { success?: boolean; sectors?: ApiSector[] };
        try { data = JSON.parse(raw); } catch { throw new Error("Invalid sectors API response"); }
        if (!r.ok || !data.success) throw new Error("Unable to load sectors");
        if (!cancelled) setDbSectors(Array.isArray(data.sectors) ? data.sectors : []);
      })
      .catch(() => { if (!cancelled) setDbSectors([]); });
    return () => { cancelled = true; };
  }, []);

  const iconForSector = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("agri")) return "bi-tree";
    if (n.includes("énergie") || n.includes("energie") || n.includes("renew")) return "bi-sun";
    if (n.includes("tour")) return "bi-water";
    if (n.includes("techn") || n.includes("numér") || n.includes("digital")) return "bi-cpu";
    if (n.includes("transport") || n.includes("logist")) return "bi-truck";
    if (n.includes("eau") || n.includes("environnement")) return "bi-droplet";
    if (n.includes("santé") || n.includes("sante") || n.includes("health")) return "bi-heart-pulse";
    if (n.includes("immobilier") || n.includes("service")) return "bi-house";
    return "bi-buildings";
  };

  const sectors: Sector[] = dbSectors && dbSectors.length > 0
    ? dbSectors.map((sector, index) => ({
        icon: iconForSector(sector.nom),
        number: String(index + 1).padStart(2, "0"),
        title: sector.nom,
        description: sector.description || "",
        opportunities: t("sectorsPage.explore"),
        imageUrl: sector.image_url,
      }))
    : fallbackSectors;

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
        <div className="col-lg-3 col-md-6"><div className="sector-mini-stat"><strong>{dbSectors && dbSectors.length > 0 ? `${String(dbSectors.length).padStart(2, "0")}+` : "09+"}</strong><span>{t("sectorsPage.statSectors")}</span></div></div>
        <div className="col-lg-3 col-md-6"><div className="sector-mini-stat"><strong>58</strong><span>{t("sectorsPage.statWilayas")}</span></div></div>
        <div className="col-lg-3 col-md-6"><div className="sector-mini-stat"><strong>48+</strong><span>{t("sectorsPage.statActivities")}</span></div></div>
        <div className="col-lg-3 col-md-6"><div className="sector-mini-stat"><strong>∞</strong><span>{t("sectorsPage.statPotential")}</span></div></div>
      </div></div></section>

      <section className="sectors-page-content"><div className="container"><div className="row g-4">
        {sectors.map((sector) => <div className="col-xl-4 col-lg-6 col-md-6" key={sector.number}>
          <article className="sector-page-card">
            <div className="sector-page-card-visual">
              {sector.imageUrl ? <img src={sector.imageUrl} alt={sector.title} loading="lazy" /> : <div className="sector-page-card-placeholder"><i className={`bi ${sector.icon}`} aria-hidden="true"></i></div>}
              <span className="sector-page-category">{t("sectorsPage.heroOverline")}</span>
              <div className="sector-page-number">{sector.number}</div>
            </div>
            <div className="sector-page-card-content">
              <div className="sector-card-small-meta">
                <span><i className={`bi ${sector.icon}`} aria-hidden="true"></i>{sector.title}</span>
              </div>
              <h3>{sector.title}</h3>
              <p>{sector.description}</p>
              <Link className="sector-read-more" to="/opportunities">{t("sectorsPage.explore")} <i className="bi bi-arrow-left" aria-hidden="true"></i></Link>
            </div>
          </article>
        </div>)}
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
