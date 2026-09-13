import { useEffect, useState, type KeyboardEvent } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "../i18n/I18nProvider";

function Header() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    document.body.style.overflow = mobileMenu ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenu]);

  const closeMobileMenu = () => setMobileMenu(false);
  const handleSearch = () => {
    const value = searchValue.trim();
    if (!value) return;
    navigate(`/news?search=${encodeURIComponent(value)}`);
    setSearchValue("");
    setSearchOpen(false);
  };
  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") handleSearch();
    if (event.key === "Escape") { setSearchOpen(false); setSearchValue(""); }
  };
  const navClass = ({ isActive }: { isActive: boolean }) => isActive ? "aapi-nav-link active" : "aapi-nav-link";
  const dropdownLinkClass = ({ isActive }: { isActive: boolean }) => isActive ? "aapi-dropdown-link active" : "aapi-dropdown-link";

  return (
    <header className="aapi-header">
      <div className="aapi-top-header">
        <div className="container">
          <div className="aapi-top-content">
            <div className="official-text"><i className="bi bi-building" />{t("header.republic")}</div>
            <div className="top-actions">
              <Link to="/"><i className="bi bi-house" />{t("common.home")}</Link>
              <span className="separator">|</span>
              <button type="button" className="top-search" aria-label={t("common.search")} onClick={() => setSearchOpen(!searchOpen)}>
                <i className="bi bi-search" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="aapi-main-header">
        <div className="container">
          <div className="aapi-header-content">
            <Link to="/" className="aapi-logo" onClick={closeMobileMenu}>
              <div className="aapi-logo-symbol"><img src="/logo.png" alt={t("footer.agency")} className="aapi-logo-image" /></div>
              <div className="aapi-logo-text"><strong>{t("header.agencyName")}</strong><span>{t("header.agencyPromotion")}</span></div>
            </Link>

            <nav className="aapi-navigation" aria-label={t("header.mainMenu")}>
              <NavLink to="/" end className={navClass}>{t("common.home")}</NavLink>

              <div className="aapi-nav-dropdown">
                <button type="button" className="aapi-nav-dropdown-button">{t("common.agency")} <i className="bi bi-chevron-down" /></button>
                <div className="aapi-dropdown-menu">
                  <NavLink to="/agency" className={dropdownLinkClass}><i className="bi bi-building" />{t("agency.presentation")}</NavLink>
                  <NavLink to="/agency#missions" className={dropdownLinkClass}><i className="bi bi-bullseye" />{t("agency.missions")}</NavLink>
                  <NavLink to="/agency#values" className={dropdownLinkClass}><i className="bi bi-award" />{t("agency.values")}</NavLink>
                  <NavLink to="/agency#journey" className={dropdownLinkClass}><i className="bi bi-signpost-2" />{t("agency.journey")}</NavLink>
                </div>
              </div>

              <div className="aapi-nav-dropdown">
                <button type="button" className="aapi-nav-dropdown-button">{t("common.investor")} <i className="bi bi-chevron-down" /></button>
                <div className="aapi-dropdown-menu">
                  <NavLink to="/investor" className={dropdownLinkClass}><i className="bi bi-person-badge" />{t("investor.space")}</NavLink>
                  <NavLink to="/investor#investor-services" className={dropdownLinkClass}><i className="bi bi-headset" />{t("investor.services")}</NavLink>
                  <NavLink to="/investor#investor-steps" className={dropdownLinkClass}><i className="bi bi-list-check" />{t("investor.steps")}</NavLink>
                  <NavLink to="/investor#investor-faq" className={dropdownLinkClass}><i className="bi bi-question-circle" />{t("investor.faq")}</NavLink>
                </div>
              </div>

              <div className="aapi-nav-dropdown">
                <button type="button" className="aapi-nav-dropdown-button">{t("common.investment")} <i className="bi bi-chevron-down" /></button>
                <div className="aapi-dropdown-menu">
                  <NavLink to="/opportunities" className={dropdownLinkClass}><i className="bi bi-lightbulb" />{t("investment.opportunities")}</NavLink>
                  <NavLink to="/sectors" className={dropdownLinkClass}><i className="bi bi-grid" />{t("investment.sectors")}</NavLink>
                  <NavLink to="/opportunities" className={dropdownLinkClass}><i className="bi bi-diagram-3" />{t("investment.projects")}</NavLink>
                </div>
              </div>

              <NavLink to="/news" className={navClass}>{t("common.news")}</NavLink>
              <NavLink to="/announcements" className={navClass}>{t("common.announcements")}</NavLink>
              <NavLink to="/contact" className={navClass}>{t("common.contact")}</NavLink>
            </nav>

            <div className="aapi-header-auth">
              <Link to="/inscription" className="aapi-header-register" onClick={closeMobileMenu}><i className="bi bi-person-plus" />{t("common.register")}</Link>
              <Link to="/login" className="aapi-header-login" onClick={closeMobileMenu}><i className="bi bi-box-arrow-in-left" />{t("common.login")}</Link>
            </div>

            <button type="button" className="mobile-menu-button" onClick={() => setMobileMenu(!mobileMenu)} aria-label={mobileMenu ? t("common.closeMenu") : t("common.openMenu")} aria-expanded={mobileMenu}>
              <i className={mobileMenu ? "bi bi-x-lg" : "bi bi-list"} />
            </button>
          </div>
        </div>
      </div>

      <div className={searchOpen ? "aapi-search-panel open" : "aapi-search-panel"}>
        <div className="container">
          <div className="aapi-search-content">
            <div className="aapi-search-input-wrapper">
              <i className="bi bi-search" />
              <input type="search" value={searchValue} onChange={(event) => setSearchValue(event.target.value)} onKeyDown={handleSearchKeyDown} placeholder={t("common.searchPlaceholder")} aria-label={t("common.searchSite")} autoFocus={searchOpen} />
              {searchValue && <button type="button" className="aapi-search-clear" onClick={() => setSearchValue("")} aria-label={t("common.clearSearch")}><i className="bi bi-x" /></button>}
            </div>
            <button type="button" className="aapi-search-submit" onClick={handleSearch}>{t("common.search")} <i className="bi bi-arrow-left" /></button>
            <button type="button" className="aapi-search-close" onClick={() => { setSearchOpen(false); setSearchValue(""); }} aria-label={t("common.searchClose")}><i className="bi bi-x-lg" /></button>
          </div>
        </div>
      </div>

      <div className={mobileMenu ? "mobile-navigation open" : "mobile-navigation"}>
        <div className="mobile-navigation-inner">
          <NavLink to="/" end onClick={closeMobileMenu} className={navClass}><i className="bi bi-house" />{t("common.home")}</NavLink>

          <div className="mobile-nav-group">
            <span className="mobile-nav-title"><i className="bi bi-building" />{t("common.agency")}</span>
            <NavLink to="/agency" onClick={closeMobileMenu}>{t("agency.presentation")}</NavLink>
            <NavLink to="/agency#missions" onClick={closeMobileMenu}>{t("agency.missions")}</NavLink>
            <NavLink to="/agency#values" onClick={closeMobileMenu}>{t("agency.values")}</NavLink>
            <NavLink to="/agency#journey" onClick={closeMobileMenu}>{t("agency.journey")}</NavLink>
          </div>

          <div className="mobile-nav-group">
            <span className="mobile-nav-title"><i className="bi bi-person-badge" />{t("common.investor")}</span>
            <NavLink to="/investor" onClick={closeMobileMenu}>{t("investor.space")}</NavLink>
            <NavLink to="/investor#investor-services" onClick={closeMobileMenu}>{t("investor.services")}</NavLink>
            <NavLink to="/investor#investor-steps" onClick={closeMobileMenu}>{t("investor.steps")}</NavLink>
            <NavLink to="/investor#investor-faq" onClick={closeMobileMenu}>{t("investor.faq")}</NavLink>
          </div>

          <div className="mobile-nav-group">
            <span className="mobile-nav-title"><i className="bi bi-graph-up-arrow" />{t("common.investment")}</span>
            <NavLink to="/opportunities" onClick={closeMobileMenu}>{t("investment.opportunities")}</NavLink>
            <NavLink to="/sectors" onClick={closeMobileMenu}>{t("investment.sectors")}</NavLink>
            <NavLink to="/opportunities" onClick={closeMobileMenu}>{t("investment.projects")}</NavLink>
          </div>

          <NavLink to="/news" onClick={closeMobileMenu}><i className="bi bi-newspaper" />{t("common.news")}</NavLink>
          <NavLink to="/announcements" onClick={closeMobileMenu}><i className="bi bi-megaphone" />{t("common.announcements")}</NavLink>
          <NavLink to="/contact" onClick={closeMobileMenu}><i className="bi bi-envelope" />{t("common.contact")}</NavLink>

          <div className="mobile-auth-buttons">
            <Link to="/inscription" onClick={closeMobileMenu}><i className="bi bi-person-plus" />{t("common.register")}</Link>
            <Link to="/login" onClick={closeMobileMenu}><i className="bi bi-box-arrow-in-left" />{t("common.login")}</Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
