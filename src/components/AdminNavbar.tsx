import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

/* ============================================================
   TYPES
   ============================================================ */

interface AdminNavbarProps {
  currentPage?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface StoredUser {
  id?: number;
  nom?: string;
  prenom?: string;
  email?: string;
  role?: string;
  photo?: string | null;
}

/* ============================================================
   API
   ============================================================ */

const MESSAGES_API =
  "http://localhost/aapi-api/auth/admin/messages.php";

/* ============================================================
   HELPERS
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
   COMPONENT
   ============================================================ */

function AdminNavbar({
  currentPage = "",
}: AdminNavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  /* ==========================================================
     STATE
     ========================================================== */

  const [user, setUser] =
    useState<StoredUser | null>(null);

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [messagesOpen, setMessagesOpen] =
    useState(false);

  const [unreadCount, setUnreadCount] =
    useState(0);

  /* ==========================================================
     LOAD USER
     ========================================================== */

  useEffect(() => {
    const currentUser = getStoredUser();

    setUser(currentUser);
  }, []);

  /* ==========================================================
     GET ADMIN ID
     ========================================================== */

  const getAdminId = useCallback((): number | null => {
    const currentUser = getStoredUser();

    if (!currentUser?.id) {
      return null;
    }

    if (currentUser.role !== "admin") {
      return null;
    }

    return Number(currentUser.id);
  }, []);

  /* ==========================================================
     LOAD UNREAD MESSAGES
     ========================================================== */

  const loadUnreadMessages = useCallback(
    async () => {
      const adminId = getAdminId();

      if (!adminId) {
        setUnreadCount(0);
        return;
      }

      try {
        const url =
          `${MESSAGES_API}?user_id=${adminId}&unread_only=1`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          );
        }

        const data = await response.json();

        if (
          data &&
          Array.isArray(data.messages)
        ) {
          const count =
            data.messages.length;

          setUnreadCount(count);
          return;
        }

        if (
          data &&
          typeof data.unread_count ===
            "number"
        ) {
          setUnreadCount(
            data.unread_count
          );

          return;
        }

        if (
          data &&
          data.stats &&
          typeof data.stats
            .messages_non_lus ===
            "number"
        ) {
          setUnreadCount(
            data.stats.messages_non_lus
          );

          return;
        }

        setUnreadCount(0);
      } catch (error) {
        /*
         * Le backend messages peut ne pas être
         * encore disponible. On ne bloque pas
         * la navbar dans ce cas.
         */
        console.warn(
          "Impossible de charger les messages non lus:",
          error
        );

        setUnreadCount(0);
      }
    },
    [getAdminId]
  );

  /* ==========================================================
     INITIAL LOAD + AUTO REFRESH
     ========================================================== */

  useEffect(() => {
    loadUnreadMessages();

    const interval = window.setInterval(
      () => {
        loadUnreadMessages();
      },
      30000
    );

    return () => {
      window.clearInterval(interval);
    };
  }, [loadUnreadMessages]);

  /* ==========================================================
     STORAGE EVENT
     ========================================================== */

  useEffect(() => {
    const handleStorage = () => {
      const currentUser =
        getStoredUser();

      setUser(currentUser);

      loadUnreadMessages();
    };

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, [loadUnreadMessages]);

  /* ==========================================================
     ACTIVE MENU
     ========================================================== */

  const isActive = (
    page: string
  ): boolean => {
    const pathname =
      location.pathname;

    if (page === "dashboard") {
      return (
        pathname === "/admin" ||
        pathname === "/admin/" ||
        pathname === "/admin/dashboard"
      );
    }

    const expectedPath =
      `/admin/${page}`;

    if (
      pathname === expectedPath ||
      pathname.startsWith(
        `${expectedPath}/`
      )
    ) {
      return true;
    }

    if (
      currentPage &&
      currentPage.toLowerCase().trim() ===
        page.toLowerCase().trim()
    ) {
      return true;
    }

    return false;
  };

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

        /*
         * =====================================================
         * INVESTORS
         * =====================================================
         */

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
          id: "messages",
          label: "الرسائل",
          icon: "✉",
          path: "/admin/messages",
          badge: unreadCount,
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
     DISPLAY USER
     ========================================================== */

  const firstName =
    user?.prenom || "";

  const lastName =
    user?.nom || "";

  const fullName =
    `${firstName} ${lastName}`
      .trim() || "Administrateur";

  const initials =
    `${firstName.charAt(0)}${lastName.charAt(
      0
    )}`.toUpperCase() || "AD";

  /* ==========================================================
     NAVIGATION
     ========================================================== */

  const handleNavigation = (
    path: string
  ) => {
    setMobileOpen(false);
    setProfileOpen(false);
    setMessagesOpen(false);

    navigate(path);
  };

  /* ==========================================================
     LOGOUT
     ========================================================== */

  const handleLogout = () => {
    try {
      localStorage.removeItem(
        "aapi_user"
      );

      localStorage.removeItem(
        "aapi_token"
      );

      localStorage.removeItem(
        "token"
      );
    } catch (error) {
      console.error(
        "Erreur déconnexion:",
        error
      );
    }

    setUser(null);

    navigate("/login", {
      replace: true,
    });
  };

  /* ==========================================================
     CLOSE MOBILE MENU
     ========================================================== */

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  /* ==========================================================
     MARK MESSAGES READ
     ========================================================== */

  const handleMessagesClick = () => {
    setMessagesOpen(false);
    setMobileOpen(false);

    navigate("/admin/messages");
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
        <div
          className="admin-navbar-overlay"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* ======================================================
          NAVBAR
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
              handleNavigation(
                "/admin/dashboard"
              )
            }
            aria-label="لوحة التحكم"
          >
            <div className="admin-navbar-logo">
              A
            </div>

            <div className="admin-navbar-brand-text">
              <strong>AAPI</strong>

              <span>
                الإدارة
              </span>
            </div>
          </button>

          {/* Mobile close */}
          <button
            type="button"
            className="admin-navbar-mobile-close"
            onClick={closeMobileMenu}
            aria-label="إغلاق القائمة"
          >
            ×
          </button>
        </div>

        {/* ====================================================
            ADMIN PROFILE
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
            NAVIGATION
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
                        isActive(
                          item.id
                        );

                      return (
                        <NavLink
                          key={item.id}
                          to={item.path}
                          className={`admin-nav-link ${
                            active
                              ? "active"
                              : ""
                          }`}
                          onClick={() => {
                            setMobileOpen(
                              false
                            );
                            setProfileOpen(
                              false
                            );
                            setMessagesOpen(
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

                          {item.badge !==
                            undefined &&
                            item.badge > 0 && (
                              <span className="admin-nav-badge">
                                {item.badge >
                                99
                                  ? "99+"
                                  : item.badge}
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
            BOTTOM ACTIONS
           ==================================================== */}

        <div className="admin-navbar-bottom">
          {/* Messages */}
          <button
            type="button"
            className="admin-navbar-bottom-button"
            onClick={
              handleMessagesClick
            }
          >
            <span className="admin-nav-icon">
              ✉
            </span>

            <span>
              الرسائل
            </span>

            {unreadCount > 0 && (
              <span className="admin-nav-badge">
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>
            )}
          </button>

          {/* Profile */}
          <button
            type="button"
            className="admin-navbar-bottom-button"
            onClick={() => {
              setProfileOpen(
                (previous) =>
                  !previous
              );

              setMessagesOpen(false);
            }}
          >
            <span className="admin-nav-icon">
              ◉
            </span>

            <span>
              الملف الشخصي
            </span>
          </button>

          {/* Logout */}
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
              onClick={() =>
                handleNavigation(
                  "/admin/profile"
                )
              }
            >
              الملف الشخصي
            </button>

            <button
              type="button"
              onClick={() =>
                handleNavigation(
                  "/admin/settings"
                )
              }
            >
              الإعدادات
            </button>
          </div>
        )}
      </aside>

      {/* ========================================================
          MOBILE HEADER
         ======================================================== */}

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

        <div className="admin-mobile-brand">
          <div className="admin-navbar-logo">
            A
          </div>

          <div>
            <strong>AAPI</strong>

            <span>
              الإدارة
            </span>
          </div>
        </div>

        <button
          type="button"
          className="admin-mobile-message-button"
          onClick={
            handleMessagesClick
          }
          aria-label="الرسائل"
        >
          ✉

          {unreadCount > 0 && (
            <span>
              {unreadCount > 99
                ? "99+"
                : unreadCount}
            </span>
          )}
        </button>
      </div>
    </>
  );
}

export default AdminNavbar;
