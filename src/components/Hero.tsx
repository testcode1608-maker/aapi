import { Link } from "react-router-dom";
import { useTranslation } from "../i18n/I18nProvider";

function Hero() {
  const { t } = useTranslation();
  return (
    <section className="aapi-hero">
      <div className="aapi-hero-background"></div>
      <div className="aapi-hero-overlay"></div>
      <div className="aapi-hero-pattern"></div>
      <div className="container">
        <div className="aapi-hero-content">
          <div className="aapi-hero-eyebrow"><span></span>{t("hero.eyebrow")}<span></span></div>
          <h1 className="aapi-hero-title">{t("hero.title")}</h1>
          <p className="aapi-hero-description">{t("hero.description")}</p>
          <div className="aapi-hero-actions">
            <Link to="/opportunities" className="aapi-hero-primary-button"><span>{t("hero.opportunities")}</span><i className="bi bi-arrow-left"></i></Link>
            <Link to="/investor" className="aapi-hero-secondary-button"><span>{t("hero.investorSpace")}</span><i className="bi bi-arrow-left"></i></Link>
          </div>
          <div className="aapi-hero-badge"><i className="bi bi-shield-check"></i><span>{t("hero.badge")}</span></div>
        </div>
      </div>
    </section>
  );
}
export default Hero;
