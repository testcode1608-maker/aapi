import { useEffect, useState } from "react";
import {
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

interface InvestorNavbarProps {
  currentPage?: string;
}

interface InvestorUser {
  id?: number | string;
  nom?: string;
  prenom?: string;
  name?: string;
  email?: string;
  photo?: string | null;
  role?: string;
}

export default function InvestorNavbar({
  currentPage = "dashboard",
}: InvestorNavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [investor, setInvestor] = useState<InvestorUser | null>(null);

  /* ============================================================
     CHARGER L'INVESTISSEUR CONNECTÉ
     ============================================================ */

  useEffect(() => {
    try {
      const storedInvestor =
        localStorage.getItem("investor") ||
        localStorage.getItem("investor_user") ||
        localStorage.getItem("user");

      if (storedInvestor) {
        const parsed = JSON.parse(storedInvestor);
        setInvestor(parsed);
      }
    } catch (error) {
      console.error(
        "Erreur lors du chargement du profil investisseur :",
        error
      );
    }
  }, []);

  /* ============================================================
     FERMER LES MENUS LORS D'UN CHANGEMENT DE PAGE
     ============================================================ */

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  /* ============================================================
     NOM INVESTISSEUR
     ============================================================ */

  const getInvestorName = () => {
    if (!investor) {
      return "Investisseur";
    }

    if (investor.prenom || investor.nom) {
      return `${investor.prenom ?? ""} ${
        investor.nom ?? ""
      }`.trim();
    }

    if (investor.name) {
      return investor.name;
    }

    return "Investisseur";
  };

  const investorName = getInvestorName();

  const getInitials = () => {
    if (!investorName) {
      return "I";
    }

    const parts = investorName
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length >= 2) {
      return (
        parts[0].charAt(0) +
        parts[parts.length - 1].charAt(0)
      ).toUpperCase();
    }

    return investorName.charAt(0).toUpperCase();
  };

  /* ============================================================
     ACTIVE NAVIGATION
     ============================================================ */

  const isCurrentPage = (page: string) => {
    if (currentPage === page) {
      return true;
    }

    if (page === "dashboard") {
      return location.pathname === "/investor/dashboard";
    }

    if (page === "projects") {
      return location.pathname.startsWith(
        "/investor/dashboard/projects"
      );
    }

    if (page === "investments") {
      return location.pathname.startsWith(
        "/investor/dashboard/investments"
      );
    }

    if (page === "requests") {
      return location.pathname.startsWith(
        "/investor/dashboard/requests"
      );
    }

    if (page === "profile") {
      return location.pathname.startsWith(
        "/investor/dashboard/profile"
      );
    }

    return false;
  };

  /* ============================================================
     DÉCONNEXION
     ============================================================ */

  const handleLogout = () => {
    try {
      localStorage.removeItem("investor_token");
      localStorage.removeItem("investor");
      localStorage.removeItem("investor_user");

      /*
       * Si ton application utilise aussi une clé générale
       * pour l'authentification, elle peut être supprimée ici.
       *
       * localStorage.removeItem("token");
       * localStorage.removeItem("user");
       */

      setInvestor(null);
      setProfileOpen(false);
      setMobileMenuOpen(false);

      navigate("/investor/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Erreur lors de la déconnexion :",
        error
      );

      navigate("/investor/login", {
        replace: true,
      });
    }
  };

  /* ============================================================
     NAVIGATION MOBILE
     ============================================================ */

  const handleMobileNavigation = () => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
  };

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    
  <header
    style={{
      display: "block",
      width: "100%",
      minHeight: "80px",
      background: "#087443",
      color: "white",
      padding: "20px",
      position: "relative",
      zIndex: 999999,
      boxSizing: "border-box",
    }}
  >
    <h2 style={{ margin: 0, color: "white" }}>
      INVESTOR NAVBAR
    </h2>
  


      {/* ======================================================
          MENU PRINCIPAL
          ====================================================== */}

      <nav
        className={`investor-navbar-menu ${
          mobileMenuOpen
            ? "investor-navbar-menu-open"
            : ""
        }`}
      >

        {/* DASHBOARD */}

        <NavLink
          to="/investor/dashboard"
          onClick={handleMobileNavigation}
          className={() =>
            `investor-navbar-link ${
              isCurrentPage("dashboard")
                ? "active"
                : ""
            }`
          }
        >
          <span className="investor-navbar-link-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect
                x="3"
                y="3"
                width="7"
                height="7"
                rx="1"
              />
              <rect
                x="14"
                y="3"
                width="7"
                height="7"
                rx="1"
              />
              <rect
                x="3"
                y="14"
                width="7"
                height="7"
                rx="1"
              />
              <rect
                x="14"
                y="14"
                width="7"
                height="7"
                rx="1"
              />
            </svg>
          </span>

          <span>Tableau de bord</span>
        </NavLink>

        {/* PROJETS */}

        <NavLink
          to="/investor/dashboard/projects"
          onClick={handleMobileNavigation}
          className={() =>
            `investor-navbar-link ${
              isCurrentPage("projects")
                ? "active"
                : ""
            }`
          }
        >
          <span className="investor-navbar-link-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 7h6l2 2h10v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
              <path d="M3 7V5a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v2" />
            </svg>
          </span>

          <span>Mes projets</span>
        </NavLink>

        {/* INVESTISSEMENTS */}

        <NavLink
          to="/investor/dashboard/investments"
          onClick={handleMobileNavigation}
          className={() =>
            `investor-navbar-link ${
              isCurrentPage("investments")
                ? "active"
                : ""
            }`
          }
        >
          <span className="investor-navbar-link-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
              />
              <path d="M12 7v10" />
              <path d="M15 9.5c0-1.1-1.3-2-3-2s-3 .9-3 2 1.3 2 3 2 3 .9 3 2-1.3 2-3 2-3-.9-3-2" />
            </svg>
          </span>

          <span>Mes investissements</span>
        </NavLink>

        {/* DEMANDES */}

        <NavLink
          to="/investor/dashboard/requests"
          onClick={handleMobileNavigation}
          className={() =>
            `investor-navbar-link ${
              isCurrentPage("requests")
                ? "active"
                : ""
            }`
          }
        >
          <span className="investor-navbar-link-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 4h16v16H4z" />
              <path d="M8 8h8" />
              <path d="M8 12h8" />
              <path d="M8 16h5" />
            </svg>
          </span>

          <span>Mes demandes</span>
        </NavLink>

      </nav>

      {/* ======================================================
          PARTIE DROITE
          ====================================================== */}

      <div className="investor-navbar-right">

        {/* NOTIFICATIONS */}

        <button
          type="button"
          className="investor-navbar-notification"
          aria-label="Notifications"
          title="Notifications"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            <path d="M10 21h4" />
          </svg>

          <span className="investor-navbar-notification-badge">
            0
          </span>
        </button>

        {/* ==================================================
            PROFIL
            ================================================== */}

        <div className="investor-navbar-profile">

          <button
            type="button"
            className="investor-navbar-profile-button"
            onClick={() =>
              setProfileOpen((value) => !value)
            }
            aria-expanded={profileOpen}
          >

            <span className="investor-navbar-avatar">

              {investor?.photo ? (
                <img
                  src={investor.photo}
                  alt={investorName}
                />
              ) : (
                getInitials()
              )}

            </span>

            <span className="investor-navbar-profile-info">

              <strong>
                {investorName}
              </strong>

              <small>
                Investisseur
              </small>

            </span>

            <svg
              className={`investor-navbar-chevron ${
                profileOpen ? "open" : ""
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>

          </button>

          {/* MENU PROFIL */}

          {profileOpen && (
            <div className="investor-navbar-profile-dropdown">

              <div className="investor-navbar-dropdown-header">

                <span className="investor-navbar-dropdown-avatar">
                  {getInitials()}
                </span>

                <div>
                  <strong>
                    {investorName}
                  </strong>

                  <small>
                    {investor?.email ||
                      "Compte investisseur"}
                  </small>
                </div>

              </div>

              <div className="investor-navbar-dropdown-divider" />

              <NavLink
                to="/investor/dashboard/profile"
                className="investor-navbar-dropdown-item"
                onClick={() => {
                  setProfileOpen(false);
                  setMobileMenuOpen(false);
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle
                    cx="12"
                    cy="8"
                    r="4"
                  />
                  <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>

                <span>Mon profil</span>
              </NavLink>

              <NavLink
                to="/investor/dashboard/settings"
                className="investor-navbar-dropdown-item"
                onClick={() => {
                  setProfileOpen(false);
                  setMobileMenuOpen(false);
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                  />
                  <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.6V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H6v-2.6h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V5h2.6v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v2.6h-.2a1.7 1.7 0 0 0-1.6 1Z" />
                </svg>

                <span>Paramètres</span>
              </NavLink>

              <div className="investor-navbar-dropdown-divider" />

              <button
                type="button"
                className="investor-navbar-dropdown-item investor-navbar-logout"
                onClick={handleLogout}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <path d="M16 17l5-5-5-5" />
                  <path d="M21 12H9" />
                </svg>

                <span>Déconnexion</span>
              </button>

            </div>
          )}

        </div>

        {/* ==================================================
            BOUTON MOBILE
            ================================================== */}

        <button
          type="button"
          className={`investor-navbar-mobile-button ${
            mobileMenuOpen ? "open" : ""
          }`}
          onClick={() =>
            setMobileMenuOpen((value) => !value)
          }
          aria-label="Menu"
          aria-expanded={mobileMenuOpen}
        >
          <span />
          <span />
          <span />
        </button>

      </div>

    </header>
  );
}

