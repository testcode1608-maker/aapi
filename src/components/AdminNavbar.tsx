import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "../styles/AdminNavbar.css";

interface AdminNavbarProps {
  currentPage?: string;
}

interface AdminUser {
  nom?: string;
  prenom?: string;
  email?: string;
  photo?: string | null;
}

const API_URL = "http://localhost/aapi-api/auth/admin/dashboard.php";

function AdminNavbar({ currentPage = "dashboard" }: AdminNavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [admin, setAdmin] = useState<AdminUser>({
    nom: "Administrateur",
    prenom: "",
    email: "",
    photo: null,
  });

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const response = await fetch(API_URL, {
          credentials: "include",
        });

        if (!response.ok) return;

        const data = await response.json();

        if (data?.user) {
          setAdmin(data.user);
        }

        if (data?.stats?.messages_non_lus !== undefined) {
          setUnreadCount(Number(data.stats.messages_non_lus) || 0);
        }
      } catch {
        // Mode local : on garde les valeurs par défaut
      }
    };

    loadAdminData();
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("token");
    sessionStorage.clear();

    navigate("/admin/login");
  };

  const isActive = (page: string) => {
    if (currentPage === page) return true;

    if (page === "dashboard") {
      return location.pathname === "/admin/dashboard";
    }

    return location.pathname.includes(`/admin/${page}`);
  };

  const menuSections = [
    {
      title: "Général",
      items: [
        {
          id: "dashboard",
          label: "Tableau de bord",
          icon: "▦",
          path: "/admin/dashboard",
        },
        {
          id: "users",
          label: "Utilisateurs",
          icon: "♙",
          path: "/admin/users",
        },
        {
          id: "projects",
          label: "Projets",
          icon: "◈",
          path: "/admin/projects",
        },
      ],
    },
    {
      title: "Gestion",
      items: [
        {
          id: "investments",
          label: "Investissements",
          icon: "◉",
          path: "/admin/investments",
        },
        {
          id: "messages",
          label: "Messages",
          icon: "✉",
          path: "/admin/messages",
          badge: unreadCount,
        },
        {
          id: "documents",
          label: "Documents",
          icon: "▤",
          path: "/admin/documents",
        },
      ],
    },
    {
      title: "Système",
      items: [
        {
          id: "settings",
          label: "Paramètres",
          icon: "⚙",
          path: "/admin/settings",
        },
      ],
    },
  ];

  const displayName =
    [admin.prenom, admin.nom].filter(Boolean).join(" ") ||
    "Administrateur";

  const initials =
    `${admin.prenom?.[0] || ""}${admin.nom?.[0] || "A"}`.toUpperCase();

  return (
    <>
      <header
  className={`admin-navbar ${
    mobileOpen ? "mobile-open" : ""
  }`}
  dir="rtl"
>
        <div className="admin-navbar-inner">

          {/* BRAND */}
          <div className="admin-navbar-brand">
            <div className="admin-brand-logo">
              A
            </div>

            <div className="admin-brand-text">
              <strong>AAPI</strong>
              <span>Administration</span>
            </div>
          </div>

          {/* COLLAPSE */}
          

          {/* MENU */}
          <nav className="admin-navbar-menu">

            {menuSections.map((section) => (
              <div
                className="admin-menu-section"
                key={section.title}
              >
                <div className="admin-menu-title">
                  {section.title}
                </div>

                <div className="admin-menu-items">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      className={`admin-nav-link ${
                        isActive(item.id) ? "active" : ""
                      }`}
                    >
                      <span className="admin-nav-icon-wrapper">
                        <span className="admin-nav-icon">
                          {item.icon}
                        </span>

                        {item.badge && item.badge > 0 && (
                          <span className="admin-notification-badge">
                            {item.badge > 99 ? "99+" : item.badge}
                          </span>
                        )}
                      </span>

                      <span className="admin-nav-label">
                        {item.label}
                      </span>
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}

            {/* MOBILE BOTTOM */}
            <div className="admin-menu-bottom">
              <button
                type="button"
                className="admin-nav-link admin-logout-button"
                onClick={handleLogout}
              >
                <span className="admin-nav-icon-wrapper">
                  <span className="admin-nav-icon">↪</span>
                </span>

                <span className="admin-nav-label">
                  Déconnexion
                </span>
              </button>
            </div>
          </nav>

          {/* ACTIONS */}
          <div className="admin-navbar-actions">

            <button
              type="button"
              className="admin-navbar-icon-button"
              onClick={() => navigate("/admin/messages")}
              aria-label="Messages"
            >
              <span>✉</span>

              {unreadCount > 0 && (
                <span className="admin-notification-dot" />
              )}
            </button>

            <button
              type="button"
              className="admin-profile"
              onClick={() => navigate("/admin/profile")}
            >
              <div className="admin-profile-avatar">
                {admin.photo ? (
                  <img
                    src={admin.photo}
                    alt={displayName}
                  />
                ) : (
                  initials
                )}
              </div>

              <div className="admin-profile-info">
                <strong>{displayName}</strong>
                <span>Administrateur</span>
              </div>
            </button>

            <button
              type="button"
              className="admin-logout-button admin-desktop-logout"
              onClick={handleLogout}
              title="Déconnexion"
            >
              <span className="admin-nav-icon">↪</span>
              <span className="admin-nav-label">
                Déconnexion
              </span>
            </button>
          </div>
        </div>

        <div className="admin-navbar-page-indicator">
          <span />
          <small>
            {currentPage}
          </small>
        </div>
      </header>

      {/* MOBILE TOGGLE */}
      <button
        type="button"
        className="admin-mobile-toggle"
        onClick={() => setMobileOpen((value) => !value)}
        aria-label="Menu"
      >
        <span />
        <span />
        <span />
      </button>

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <button
          type="button"
          className="admin-sidebar-overlay"
          onClick={() => setMobileOpen(false)}
          aria-label="Fermer le menu"
        />
      )}
    </>
  );
}

export default AdminNavbar;