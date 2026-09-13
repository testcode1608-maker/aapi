import { Link } from "react-router-dom";
import { useTranslation } from "../i18n/I18nProvider";

function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="aapi-footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/logo.png" alt={t("footer.agency")} className="footer-logo-image" />
            </div>
            <h3>{t("header.agencyName")}<br />{t("header.agencyPromotion")}</h3>
            <p>{t("footer.description")}</p>
            <div className="footer-social">
              <a href="#" aria-label="Facebook"><i className="bi bi-facebook" /></a>
              <a href="#" aria-label="LinkedIn"><i className="bi bi-linkedin" /></a>
              <a href="#" aria-label="YouTube"><i className="bi bi-youtube" /></a>
              <a href="#" aria-label="Instagram"><i className="bi bi-instagram" /></a>
            </div>
          </div>

          <div className="footer-column">
            <h4>{t("footer.agencyLinks")}</h4>
            <Link to="/agency">{t("agency.presentation")}</Link>
            <Link to="/agency#missions">{t("agency.missions")}</Link>
            <Link to="/agency#values">{t("agency.values")}</Link>
            <Link to="/agency#journey">{t("agency.journey")}</Link>
          </div>

          <div className="footer-column">
            <h4>{t("footer.investorLinks")}</h4>
            <Link to="/investor">{t("investor.space")}</Link>
            <Link to="/opportunities">{t("investment.opportunities")}</Link>
            <Link to="/sectors">{t("investment.sectors")}</Link>
            <Link to="/investor#investor-faq">{t("investor.faq")}</Link>
          </div>

          <div className="footer-column">
            <h4>{t("footer.contact")}</h4>
            <div className="footer-contact"><i className="bi bi-geo-alt" /><span>{t("footer.address")}</span></div>
            <div className="footer-contact"><i className="bi bi-envelope" /><span>contact@aapi.dz</span></div>
            <div className="footer-contact"><i className="bi bi-telephone" /><span>+213 21 00 00 00</span></div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} {t("footer.copyright")}. {t("footer.rights")}</span>
          <div><Link to="/contact">{t("footer.privacy")}</Link><Link to="/contact">{t("footer.terms")}</Link></div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
