import { useCallback, useEffect, useState } from "react";
import {
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import "../styles/AdminNavbar.css";
/* ============================================================
   TYPES
   ============================================================ */

interface AdminNavbarProps {
  currentPage?: string;
}

interface StoredUser {
  id?: number;
  nom?: string;
  prenom?: string;
  email?: string;
  role?: string;
  statut?: string;
  photo?: string | null;
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

/* ============================================================
   API
   ============================================================ */

const MESSAGES_API =
  "http://localhost/aapi-api/auth/admin/messages.php";

/* ============================================================
   GET USER
   ============================================================ */

function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem("aapi_user");

    if (!raw) {
      return null;
    }

    const user = JSON.parse(raw);

    if (!user || typeof user !== "object") {
      return null;
    }

    return user as StoredUser;
  } catch (error) {
    console.error(
      "Erreur lecture utilisateur:",
      error
    );

    return null;
  }
}

/* ============================================================
   ADMIN NAVBAR
   ============================================================ */

function AdminNavbar({
  currentPage = "",
}: AdminNavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] =
    useState<StoredUser | null>(null);

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [unreadCount, setUnreadCount] =
    useState(0);

  /* ==========================================================
     LOAD USER
     ========================================================== */

  useEffect(() => {
    const loadUser = () => {
      setUser(getStoredUser());
    };

    loadUser();

    window.addEventListener(
      "storage",
      loadUser
    );

    return () => {
      window.removeEventListener(
        "storage",
        loadUser
      );
    };
  }, []);

  /* ==========================================================
     ADMIN ID
     ========================================================== */

  const getAdminId = useCallback(() => {
    const currentUser = getStoredUser();

    if (!currentUser) {
      return null;
    }

    if (currentUser.role !== "admin") {
      return null;
    }

    if (!currentUser.id) {
      return null;
    }

    return Number(currentUser.id);
  }, []);

  /* ==========================================================
     LOAD UNREAD MESSAGES
     ========================================================== */

  const loadUnreadMessages =
    useCallback(async () => {
      const adminId = getAdminId();

      if (!adminId) {
        setUnreadCount(0);
        return;
      }

      try {
        const response = await fetch(
          `${MESSAGES_API}?user_id=${adminId}&unread_only=1`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          );
        }

        const data =
          await response.json();

        /*
         * Format:
         * {
         *   success: true,
         *   messages: [...]
         * }
         */

        if (
          Array.isArray(
            data?.messages
          )
        ) {
          setUnreadCount(
            data.messages.length
          );

          return;
        }

        /*
         * Format:
         * {
         *   unread_count: 5
         * }
         */

        if (
          typeof data?.unread_count ===
          "number"
        ) {
          setUnreadCount(
            data.unread_count
          );

          return;
        }

        /*
         * Format:
         * {
         *   stats: {
         *     messages_non_lus: 5
         *   }
         * }
         */

        if (
          typeof data?.stats
            ?.messages_non_lus ===
          "number"
        ) {
          setUnreadCount(
            data.stats.messages_non_lus
          );

          return;
        }

        setUnreadCount(0);
      } catch (error) {
        console.warn(
          "Messages non lus indisponibles:",
          error
        );

        /*
         * Ne jamais bloquer le Dashboard
         * si l'API messages n'est pas disponible.
         */
        setUnreadCount(0);
      }
    }, [getAdminId]);

  /* ==========================================================
     INITIAL MESSAGE LOAD
     ========================================================== */

  useEffect(() => {
    loadUnreadMessages();

    const interval =
      window.setInterval(() => {
        loadUnreadMessages();
      }, 30000);

    return () => {
      window.clearInterval(interval);
    };
  }, [loadUnreadMessages]);

  /* ==========================================================
     CLOSE MOBILE MENU ON ROUTE CHANGE
     ========================================================== */

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  /* ==========================================================
     MENU
     ========================================================== */

  const menuSections: MenuSection[] = [
    {
      title: "عام",

      items: [
        {
          id: "dashboard",
          label: "لوحة التحكم",
          icon: "▦",
          path: "/admin/dashboard",
        },

        {
          id: "users",
          label: "المستخدمون",
          icon: "♙",
          path: "/admin/users",
        },

        {
          id: "investors",
          label: "المستثمرون",
          icon: "♙",
          path: "/admin/investors",
        },

        {
          id: "projects",
          label: "المشاريع",
          icon: "◈",
          path: "/admin/projects",
        },
      ],
    },

    {
      title: "الإدارة",

      items: [
        {
          id: "investments",
          label: "الاستثمارات",
          icon: "◉",
          path: "/admin/investments",
        },

        {
          id: "requests",
          label: "الطلبات",
          icon: "⌁",
          path: "/admin/requests",
        },

        {
          id: "messages",
          label: "الرسائل",
          icon: "✉",
          path: "/admin/messages",
        },

        {
          id: "documents",
          label: "الوثائق",
          icon: "▤",
          path: "/admin/documents",
        },
      ],
    },

    {
      title: "النظام",

      items: [
        {
          id: "settings",
          label: "الإعدادات",
          icon: "⚙",
          path: "/admin/settings",
        },
      ],
    },
  ];

  /* ==========================================================
     USER DISPLAY
     ========================================================== */

  const firstName =
    user?.prenom?.trim() || "";

  const lastName =
    user?.nom?.trim() || "";

  const fullName =
    `${firstName} ${lastName}`.trim() ||
    "Administrateur";

  const initials =
    `${firstName.charAt(0)}${lastName.charAt(
      0
    )}`.toUpperCase() || "AD";

  /* ==========================================================
     ACTIVE ROUTE
     ========================================================== */

  const isItemActive = (
    item: MenuItem
  ) => {
    const pathname =
      location.pathname;

    /*
     * Dashboard
     */
    if (item.id === "dashboard") {
      return (
        pathname === "/admin" ||
        pathname === "/admin/" ||
        pathname === "/admin/dashboard"
      );
    }

    /*
     * Toutes les autres pages
     */
    return (
      pathname === item.path ||
      pathname.startsWith(
        `${item.path}/`
      )
    );
  };

  /* ==========================================================
     NAVIGATION
     ========================================================== */

  const navigateTo = (
    path: string
  ) => {
    setMobileOpen(false);
    setProfileOpen(false);

    navigate(path);
  };

  /* ==========================================================
     LOGOUT
     ========================================================== */

  const handleLogout = () => {
    localStorage.removeItem(
      "aapi_user"
    );

    localStorage.removeItem(
      "aapi_token"
    );

    localStorage.removeItem(
      "token"
    );

    setUser(null);

    navigate("/login", {
      replace: true,
    });
  };

  /* ==========================================================
     PROFILE
     ========================================================== */

  const openProfile = () => {
    setProfileOpen(false);
    setMobileOpen(false);

    navigate("/admin/profile");
  };

  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <>
      {/* ======================================================
          MOBILE OVERLAY
         ====================================================== */}

      {mobileOpen && (
        <button
          type="button"
          className="admin-navbar-overlay"
          aria-label="إغلاق القائمة"
          onClick={() =>
            setMobileOpen(false)
          }
        />
      )}

      {/* ======================================================
          MOBILE TOP BAR
         ====================================================== */}

      <div
        className="admin-mobile-header"
        dir="rtl"
      >
        <button
          type="button"
          className="admin-mobile-menu-button"
          onClick={() =>
            setMobileOpen(true)
          }
          aria-label="فتح القائمة"
        >
          ☰
        </button>

        <button
          type="button"
          className="admin-mobile-brand"
          onClick={() =>
            navigateTo(
              "/admin/dashboard"
            )
          }
        >
          <span className="admin-mobile-logo">
            A
          </span>

          <span>
            AAPI
          </span>
        </button>
      </div>

      {/* ======================================================
          SIDEBAR
         ====================================================== */}

      <aside
        className={`admin-navbar ${
          mobileOpen
            ? "admin-navbar-open"
            : ""
        }`}
        dir="rtl"
      >
        {/* ====================================================
            BRAND
           ==================================================== */}

        <div className="admin-navbar-brand">
          <button
            type="button"
            className="admin-navbar-brand-button"
            onClick={() =>
              navigateTo(
                "/admin/dashboard"
              )
            }
          >
            <span className="admin-navbar-logo">
              A
            </span>

            <span className="admin-navbar-brand-text">
              <strong>AAPI</strong>
              <small>
                الإدارة
              </small>
            </span>
          </button>

          <button
            type="button"
            className="admin-navbar-mobile-close"
            onClick={() =>
              setMobileOpen(false)
            }
            aria-label="إغلاق"
          >
            ×
          </button>
        </div>

        {/* ====================================================
            ADMIN USER
           ==================================================== */}

        <div className="admin-navbar-user">
          <div className="admin-navbar-user-avatar">
            {user?.photo ? (
              <img
                src={user.photo}
                alt={fullName}
              />
            ) : (
              initials
            )}
          </div>

          <div className="admin-navbar-user-info">
            <strong>
              {fullName}
            </strong>

            <span>
              مدير النظام
            </span>
          </div>
        </div>

        {/* ====================================================
            MENU
           ==================================================== */}

        <nav className="admin-navbar-menu">
          {menuSections.map(
            (section) => (
              <div
                className="admin-navbar-section"
                key={section.title}
              >
                <div className="admin-navbar-section-title">
                  {section.title}
                </div>

                <div className="admin-navbar-section-items">
                  {section.items.map(
                    (item) => {
                      const active =
                        isItemActive(
                          item
                        );

                      return (
                        <NavLink
                          key={item.id}
                          to={item.path}
                          end={
                            item.id ===
                            "dashboard"
                          }
                          className={
                            active
                              ? "admin-nav-link active"
                              : "admin-nav-link"
                          }
                          onClick={() => {
                            setMobileOpen(
                              false
                            );

                            setProfileOpen(
                              false
                            );
                          }}
                        >
                          <span className="admin-nav-icon">
                            {item.icon}
                          </span>

                          <span className="admin-nav-label">
                            {item.label}
                          </span>

                          {item.id ===
                            "messages" &&
                            unreadCount >
                              0 && (
                              <span className="admin-nav-badge">
                                {unreadCount >
                                99
                                  ? "99+"
                                  : unreadCount}
                              </span>
                            )}
                        </NavLink>
                      );
                    }
                  )}
                </div>
              </div>
            )
          )}
        </nav>

        {/* ====================================================
            BOTTOM
           ==================================================== */}

        <div className="admin-navbar-bottom">
          {/* PROFILE */}

          <button
            type="button"
            className="admin-navbar-bottom-button"
            onClick={() =>
              setProfileOpen(
                (value) => !value
              )
            }
          >
            <span className="admin-nav-icon">
              ◉
            </span>

            <span>
              الملف الشخصي
            </span>
          </button>

          {/* LOGOUT */}

          <button
            type="button"
            className="admin-navbar-bottom-button admin-navbar-logout"
            onClick={
              handleLogout
            }
          >
            <span className="admin-nav-icon">
              ⇥
            </span>

            <span>
              تسجيل الخروج
            </span>
          </button>
        </div>

        {/* ====================================================
            PROFILE DROPDOWN
           ==================================================== */}

        {profileOpen && (
          <div className="admin-navbar-profile-dropdown">
            <div className="admin-navbar-profile-header">
              <div className="admin-navbar-profile-avatar">
                {user?.photo ? (
                  <img
                    src={user.photo}
                    alt={fullName}
                  />
                ) : (
                  initials
                )}
              </div>

              <div>
                <strong>
                  {fullName}
                </strong>

                <span>
                  {user?.email ||
                    "admin@aapi.dz"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={
                openProfile
              }
            >
              الملف الشخصي
            </button>

            <button
              type="button"
              onClick={() =>
                navigateTo(
                  "/admin/settings"
                )
              }
            >
              الإعدادات
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

export default AdminNavbar;