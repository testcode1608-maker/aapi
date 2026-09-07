import {
  useEffect,
  useState,
  type KeyboardEvent,
} from "react";

import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

function Header() {
  const navigate = useNavigate();

  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    document.body.style.overflow = mobileMenu ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenu]);

  const closeMobileMenu = () => {
    setMobileMenu(false);
  };

  const handleSearch = () => {
    const value = searchValue.trim();

    if (!value) {
      return;
    }

    navigate(`/news?search=${encodeURIComponent(value)}`);

    setSearchValue("");
    setSearchOpen(false);
  };

  const handleSearchKeyDown = (
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      handleSearch();
    }

    if (event.key === "Escape") {
      setSearchOpen(false);
      setSearchValue("");
    }
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "aapi-nav-link active"
      : "aapi-nav-link";

  const dropdownLinkClass = ({
    isActive,
  }: {
    isActive: boolean;
  }) =>
    isActive
      ? "aapi-dropdown-link active"
      : "aapi-dropdown-link";

  return (
    <header className="aapi-header">

      {/* ============================================================
          TOP BAR
          ============================================================ */}

      <div className="aapi-top-header">

        <div className="container">

          <div className="aapi-top-content">

            <div className="official-text">

              <i className="bi bi-building"></i>

              الجمهورية الجزائرية الديمقراطية الشعبية

            </div>

            <div className="top-actions">

              <Link to="/">
                <i className="bi bi-house"></i>
                الرئيسية
              </Link>

              <span className="separator">|</span>

              <button
                type="button"
                className="top-search"
                aria-label="البحث"
                onClick={() =>
                  setSearchOpen(!searchOpen)
                }
              >
                <i className="bi bi-search"></i>
              </button>

            </div>

          </div>

        </div>

      </div>


      {/* ============================================================
          MAIN HEADER
          ============================================================ */}

      <div className="aapi-main-header">

        <div className="container">

          <div className="aapi-header-content">

            {/* ======================================================
                LOGO
                ====================================================== */}

            <Link
              to="/"
              className="aapi-logo"
              onClick={closeMobileMenu}
            >

              <div className="aapi-logo-symbol">

                <img
                  src="/logo.png"
                  alt="الوكالة الجزائرية لترقية الاستثمار"
                  className="aapi-logo-image"
                />

              </div>

              <div className="aapi-logo-text">

                <strong>
                  الوكالة الجزائرية
                </strong>

                <span>
                  لترقية الاستثمار
                </span>

              </div>

            </Link>


            {/* ======================================================
                DESKTOP NAVIGATION
                ====================================================== */}

            <nav
              className="aapi-navigation"
              aria-label="القائمة الرئيسية"
            >

              {/* HOME */}

              <NavLink
                to="/"
                end
                className={navClass}
              >
                الرئيسية
              </NavLink>


              {/* ==================================================
                  AGENCY
                  ================================================== */}

              <div className="aapi-nav-dropdown">

                <button
                  type="button"
                  className="aapi-nav-dropdown-button"
                >
                  الوكالة

                  <i className="bi bi-chevron-down"></i>

                </button>

                <div className="aapi-dropdown-menu">

                  <NavLink
                    to="/agency"
                    className={dropdownLinkClass}
                  >
                    <i className="bi bi-building"></i>
                    تقديم الوكالة
                  </NavLink>

                  <NavLink
                    to="/agency#missions"
                    className={dropdownLinkClass}
                  >
                    <i className="bi bi-bullseye"></i>
                    مهام الوكالة
                  </NavLink>

                  <NavLink
                    to="/agency#values"
                    className={dropdownLinkClass}
                  >
                    <i className="bi bi-award"></i>
                    مبادئ الوكالة
                  </NavLink>

                  <NavLink
                    to="/agency#journey"
                    className={dropdownLinkClass}
                  >
                    <i className="bi bi-signpost-2"></i>
                    مسار الاستثمار
                  </NavLink>

                </div>

              </div>


              {/* ==================================================
                  INVESTOR
                  ================================================== */}

              <div className="aapi-nav-dropdown">

                <button
                  type="button"
                  className="aapi-nav-dropdown-button"
                >
                  المستثمر

                  <i className="bi bi-chevron-down"></i>

                </button>

                <div className="aapi-dropdown-menu">

                  <NavLink
                    to="/investor"
                    className={dropdownLinkClass}
                  >
                    <i className="bi bi-person-badge"></i>
                    فضاء المستثمر
                  </NavLink>

                  <NavLink
                    to="/investor#investor-services"
                    className={dropdownLinkClass}
                  >
                    <i className="bi bi-headset"></i>
                    خدمات المستثمر
                  </NavLink>

                  <NavLink
                    to="/investor#investor-steps"
                    className={dropdownLinkClass}
                  >
                    <i className="bi bi-list-check"></i>
                    مسار الاستثمار
                  </NavLink>

                  <NavLink
                    to="/investor#investor-faq"
                    className={dropdownLinkClass}
                  >
                    <i className="bi bi-question-circle"></i>
                    الأسئلة الشائعة
                  </NavLink>

                </div>

              </div>


              {/* ==================================================
                  INVESTMENT
                  ================================================== */}

              <div className="aapi-nav-dropdown">

                <button
                  type="button"
                  className="aapi-nav-dropdown-button"
                >
                  الاستثمار

                  <i className="bi bi-chevron-down"></i>

                </button>

                <div className="aapi-dropdown-menu">

                  <NavLink
                    to="/opportunities"
                    className={dropdownLinkClass}
                  >
                    <i className="bi bi-lightbulb"></i>
                    فرص الاستثمار
                  </NavLink>

                  <NavLink
                    to="/sectors"
                    className={dropdownLinkClass}
                  >
                    <i className="bi bi-grid"></i>
                    قطاعات الاستثمار
                  </NavLink>

                  <NavLink
                    to="/opportunities"
                    className={dropdownLinkClass}
                  >
                    <i className="bi bi-diagram-3"></i>
                    المشاريع الاستثمارية
                  </NavLink>

                </div>

              </div>


              {/* NEWS */}

              <NavLink
                to="/news"
                className={navClass}
              >
                الأخبار
              </NavLink>


              {/* ANNOUNCEMENTS */}

              <NavLink
                to="/announcements"
                className={navClass}
              >
                الإعلانات
              </NavLink>


              {/* CONTACT */}

              <NavLink
                to="/contact"
                className={navClass}
              >
                اتصل بنا
              </NavLink>

            </nav>


            {/* ======================================================
                AUTH BUTTONS
                ====================================================== */}

            <div className="aapi-header-auth">

              {/* REGISTER */}

              <Link
                to="/inscription"
                className="aapi-header-register"
                onClick={closeMobileMenu}
              >
                <i className="bi bi-person-plus"></i>

                التسجيل
              </Link>


              {/* LOGIN */}

              <Link
                to="/login"
                className="aapi-header-login"
                onClick={closeMobileMenu}
              >
                <i className="bi bi-box-arrow-in-left"></i>

                تسجيل الدخول
              </Link>

            </div>


            {/* ======================================================
                MOBILE BUTTON
                ====================================================== */}

            <button
              type="button"
              className="mobile-menu-button"
              onClick={() =>
                setMobileMenu(!mobileMenu)
              }
              aria-label={
                mobileMenu
                  ? "إغلاق القائمة"
                  : "فتح القائمة"
              }
              aria-expanded={mobileMenu}
            >
              <i
                className={
                  mobileMenu
                    ? "bi bi-x-lg"
                    : "bi bi-list"
                }
              ></i>
            </button>

          </div>

        </div>

      </div>


      {/* ============================================================
          SEARCH BAR
          ============================================================ */}

      <div
        className={
          searchOpen
            ? "aapi-search-panel open"
            : "aapi-search-panel"
        }
      >

        <div className="container">

          <div className="aapi-search-content">

            <div className="aapi-search-input-wrapper">

              <i className="bi bi-search"></i>

              <input
                type="search"
                value={searchValue}
                onChange={(event) =>
                  setSearchValue(event.target.value)
                }
                onKeyDown={handleSearchKeyDown}
                placeholder="ابحث في الموقع..."
                aria-label="البحث في الموقع"
                autoFocus={searchOpen}
              />

              {searchValue && (
                <button
                  type="button"
                  className="aapi-search-clear"
                  onClick={() => setSearchValue("")}
                  aria-label="مسح البحث"
                >
                  <i className="bi bi-x"></i>
                </button>
              )}

            </div>

            <button
              type="button"
              className="aapi-search-submit"
              onClick={handleSearch}
            >
              بحث

              <i className="bi bi-arrow-left"></i>
            </button>

            <button
              type="button"
              className="aapi-search-close"
              onClick={() => {
                setSearchOpen(false);
                setSearchValue("");
              }}
              aria-label="إغلاق البحث"
            >
              <i className="bi bi-x-lg"></i>
            </button>

          </div>

        </div>

      </div>


      {/* ============================================================
          MOBILE NAVIGATION
          ============================================================ */}

      <div
        className={
          mobileMenu
            ? "mobile-navigation open"
            : "mobile-navigation"
        }
      >

        <div className="mobile-navigation-inner">

          {/* HOME */}

          <NavLink
            to="/"
            end
            onClick={closeMobileMenu}
            className={navClass}
          >
            <i className="bi bi-house"></i>

            الرئيسية
          </NavLink>


          {/* ======================================================
              AGENCY
              ====================================================== */}

          <div className="mobile-nav-group">

            <span className="mobile-nav-title">

              <i className="bi bi-building"></i>

              الوكالة

            </span>

            <NavLink
              to="/agency"
              onClick={closeMobileMenu}
            >
              تقديم الوكالة
            </NavLink>

            <NavLink
              to="/agency#missions"
              onClick={closeMobileMenu}
            >
              مهام الوكالة
            </NavLink>

            <NavLink
              to="/agency#values"
              onClick={closeMobileMenu}
            >
              مبادئ الوكالة
            </NavLink>

            <NavLink
              to="/agency#journey"
              onClick={closeMobileMenu}
            >
              مسار الاستثمار
            </NavLink>

          </div>


          {/* ======================================================
              INVESTOR
              ====================================================== */}

          <div className="mobile-nav-group">

            <span className="mobile-nav-title">

              <i className="bi bi-person-badge"></i>

              المستثمر

            </span>

            <NavLink
              to="/investor"
              onClick={closeMobileMenu}
            >
              فضاء المستثمر
            </NavLink>

            <NavLink
              to="/investor#investor-services"
              onClick={closeMobileMenu}
            >
              خدمات المستثمر
            </NavLink>

            <NavLink
              to="/investor#investor-steps"
              onClick={closeMobileMenu}
            >
              مسار الاستثمار
            </NavLink>

            <NavLink
              to="/investor#investor-faq"
              onClick={closeMobileMenu}
            >
              الأسئلة الشائعة
            </NavLink>

          </div>


          {/* ======================================================
              INVESTMENT
              ====================================================== */}

          <div className="mobile-nav-group">

            <span className="mobile-nav-title">

              <i className="bi bi-graph-up-arrow"></i>

              الاستثمار

            </span>

            <NavLink
              to="/opportunities"
              onClick={closeMobileMenu}
            >
              فرص الاستثمار
            </NavLink>

            <NavLink
              to="/sectors"
              onClick={closeMobileMenu}
            >
              قطاعات الاستثمار
            </NavLink>

            <NavLink
              to="/opportunities"
              onClick={closeMobileMenu}
            >
              المشاريع الاستثمارية
            </NavLink>

          </div>


          {/* NEWS */}

          <NavLink
            to="/news"
            onClick={closeMobileMenu}
          >
            <i className="bi bi-newspaper"></i>

            الأخبار
          </NavLink>


          {/* ANNOUNCEMENTS */}

          <NavLink
            to="/announcements"
            onClick={closeMobileMenu}
          >
            <i className="bi bi-megaphone"></i>

            الإعلانات
          </NavLink>


          {/* CONTACT */}

          <NavLink
            to="/contact"
            onClick={closeMobileMenu}
          >
            <i className="bi bi-envelope"></i>

            اتصل بنا
          </NavLink>


          {/* ======================================================
              MOBILE AUTH
              ====================================================== */}

          <div className="mobile-auth-buttons">

            <Link
              to="/inscription"
              onClick={closeMobileMenu}
            >
              <i className="bi bi-person-plus"></i>

              التسجيل
            </Link>

            <Link
              to="/login"
              onClick={closeMobileMenu}
            >
              <i className="bi bi-box-arrow-in-left"></i>

              تسجيل الدخول
            </Link>

          </div>


          {/* MOBILE SEARCH */}

          <button
            type="button"
            className="mobile-search-button"
            onClick={() => {
              closeMobileMenu();
              setSearchOpen(true);
            }}
          >
            <i className="bi bi-search"></i>

            البحث في الموقع
          </button>

        </div>

      </div>


      {/* ============================================================
          MOBILE OVERLAY
          ============================================================ */}

      {mobileMenu && (
        <button
          type="button"
          className="mobile-menu-overlay"
          onClick={closeMobileMenu}
          aria-label="إغلاق القائمة"
        ></button>
      )}

    </header>
  );
}

export default Header;