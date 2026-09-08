import { useEffect, useState } from "react";
import {
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import "../styles/AdminNavbar.css";

interface AdminNavbarProps {
  currentPage?: string;
}

interface AdminUser {
  id?: number;
  nom?: string;
  prenom?: string;
  email?: string;
  photo?: string | null;
  role?: string;
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

const API_URL =
  "http://localhost/aapi-api/auth/admin/dashboard.php";

function AdminNavbar({
  currentPage = "لوحة التحكم",
}: AdminNavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [admin, setAdmin] = useState<AdminUser>({
    id: undefined,
    nom: "المدير",
    prenom: "",
    email: "",
    photo: null,
    role: "admin",
  });

  /* ============================================================
     تحميل بيانات المدير
     ============================================================ */

  useEffect(() => {
    let cancelled = false;

    const loadAdminData = async () => {
      try {
        const storedUser =
          localStorage.getItem("aapi_user");

        if (!storedUser) {
          return;
        }

        let user: AdminUser;

        try {
          user = JSON.parse(storedUser);
        } catch {
          return;
        }

        if (!user?.id) {
          return;
        }

        const response = await fetch(
          `${API_URL}?user_id=${encodeURIComponent(
            String(user.id)
          )}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (cancelled) {
          return;
        }

        /* --------------------------------------------------------
           بيانات المدير
           -------------------------------------------------------- */

        if (data?.admin) {
          setAdmin({
            ...user,
            ...data.admin,
          });
        } else if (data?.user) {
          setAdmin({
            ...user,
            ...data.user,
          });
        } else {
          setAdmin(user);
        }

        /* --------------------------------------------------------
           الرسائل غير المقروءة
           -------------------------------------------------------- */

        if (data?.stats) {
          const count =
            data.stats.messages_unread ??
            data.stats.messages_non_lus ??
            data.stats.unread_messages ??
            0;

          setUnreadCount(
            Number(count) || 0
          );
        }
      } catch (error) {
        console.error(
          "خطأ أثناء تحميل بيانات المدير:",
          error
        );

        /*
         * في حالة عدم الاتصال بالخادم:
         * نستعمل البيانات الموجودة في localStorage
         */
      }
    };

    void loadAdminData();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ============================================================
     إغلاق القائمة بعد الانتقال إلى صفحة أخرى
     ============================================================ */

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  /* ============================================================
     منع Scroll الصفحة عند فتح القائمة على الهاتف
     ============================================================ */

  useEffect(() => {
    if (mobileOpen) {
      document.body.classList.add(
        "admin-menu-open"
      );
    } else {
      document.body.classList.remove(
        "admin-menu-open"
      );
    }

    return () => {
      document.body.classList.remove(
        "admin-menu-open"
      );
    };
  }, [mobileOpen]);

  /* ============================================================
     تسجيل الخروج
     ============================================================ */

  const handleLogout = () => {
    localStorage.removeItem("aapi_user");
    localStorage.removeItem("admin");
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");

    sessionStorage.clear();

    setMobileOpen(false);

    navigate("/login", {
      replace: true,
    });
  };

  /* ============================================================
     الصفحة النشطة
     ============================================================ */

  const isActive = (page: string) => {
    const pathname = location.pathname;

    /*
     * لوحة التحكم
     */
    if (page === "dashboard") {
      return (
        pathname === "/admin" ||
        pathname === "/admin/dashboard"
      );
    }

    /*
     * التحقق من URL
     */
    if (
      pathname === `/admin/${page}` ||
      pathname.startsWith(`/admin/${page}/`)
    ) {
      return true;
    }

    /*
     * الصفحة الحالية
     */
    const normalizedCurrentPage =
      currentPage
        .toLowerCase()
        .trim();

    const normalizedPage =
      page.toLowerCase().trim();

    return (
      normalizedCurrentPage ===
      normalizedPage
    );
  };

  /* ============================================================
     القائمة الرئيسية
     ============================================================ */

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

  /* ============================================================
     اسم المدير
     ============================================================ */

  const displayName =
    [
      admin.prenom,
      admin.nom,
    ]
      .filter(
        (value) =>
          Boolean(
            value &&
              value.trim()
          )
      )
      .join(" ") ||
    "المدير";

  /* ============================================================
     الأحرف الأولى
     ============================================================ */

  const firstInitial =
    admin.prenom?.trim()?.[0] || "";

  const lastInitial =
    admin.nom?.trim()?.[0] || "م";

  const initials =
    `${firstInitial}${lastInitial}`
      .toUpperCase();

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <>
      {/* ======================================================
          NAVBAR
          ====================================================== */}

      <header
        className={`admin-navbar ${
          mobileOpen
            ? "mobile-open"
            : ""
        }`}
        dir="rtl"
      >
        <div className="admin-navbar-inner">

          {/* ==================================================
              LOGO
              ================================================== */}

          <div className="admin-navbar-brand">

            <button
              type="button"
              className="admin-brand-logo"
              onClick={() =>
                navigate(
                  "/admin/dashboard"
                )
              }
              aria-label="AAPI"
            >
              A
            </button>

            <div className="admin-brand-text">
              <strong>AAPI</strong>

              <span>
                الإدارة
              </span>
            </div>

          </div>

          {/* ==================================================
              MENU
              ================================================== */}

          <nav
            className={`admin-navbar-menu ${
              mobileOpen
                ? "mobile-open"
                : ""
            }`}
            aria-label="قائمة الإدارة"
          >

            {menuSections.map(
              (section) => (
                <div
                  className="admin-menu-section"
                  key={section.title}
                >

                  <div className="admin-menu-title">
                    {section.title}
                  </div>

                  <div className="admin-menu-items">

                    {section.items.map(
                      (item) => (
                        <NavLink
                          key={item.id}
                          to={item.path}
                          end={
                            item.id ===
                            "dashboard"
                          }
                          className={() =>
                            `admin-nav-link ${
                              isActive(
                                item.id
                              )
                                ? "active"
                                : ""
                            }`
                          }
                          aria-current={
                            isActive(
                              item.id
                            )
                              ? "page"
                              : undefined
                          }
                        >

                          <span className="admin-nav-icon-wrapper">

                            <span
                              className="admin-nav-icon"
                              aria-hidden="true"
                            >
                              {item.icon}
                            </span>

                            {Boolean(
                              item.badge &&
                                item.badge > 0
                            ) && (
                              <span className="admin-notification-badge">
                                {item.badge! >
                                99
                                  ? "99+"
                                  : item.badge}
                              </span>
                            )}

                          </span>

                          <span className="admin-nav-label">
                            {item.label}
                          </span>

                        </NavLink>
                      )
                    )}

                  </div>

                </div>
              )
            )}

            {/* ==================================================
                MOBILE LOGOUT
                ================================================== */}

            <div className="admin-menu-bottom">

              <button
                type="button"
                className="admin-nav-link admin-logout-button"
                onClick={
                  handleLogout
                }
              >

                <span className="admin-nav-icon-wrapper">

                  <span
                    className="admin-nav-icon"
                    aria-hidden="true"
                  >
                    ↪
                  </span>

                </span>

                <span className="admin-nav-label">
                  تسجيل الخروج
                </span>

              </button>

            </div>

          </nav>

          {/* ==================================================
              ACTIONS
              ================================================== */}

          <div className="admin-navbar-actions">

            {/* ------------------------------------------------
                الرسائل
                ------------------------------------------------ */}

            <button
              type="button"
              className="admin-navbar-icon-button"
              onClick={() =>
                navigate(
                  "/admin/messages"
                )
              }
              aria-label={
                unreadCount > 0
                  ? `الرسائل، ${unreadCount} غير مقروءة`
                  : "الرسائل"
              }
            >

              <span
                aria-hidden="true"
              >
                ✉
              </span>

              {unreadCount > 0 && (
                <span
                  className="admin-notification-dot"
                  aria-hidden="true"
                />
              )}

            </button>

            {/* ------------------------------------------------
                الملف الشخصي
                ------------------------------------------------ */}

            <button
              type="button"
              className="admin-profile"
              onClick={() =>
                navigate(
                  "/admin/profile"
                )
              }
              aria-label="الملف الشخصي للمدير"
            >

              <div className="admin-profile-avatar">

                {admin.photo ? (
                  <img
                    src={admin.photo}
                    alt={displayName}
                    onError={(
                      event
                    ) => {
                      event.currentTarget.style.display =
                        "none";
                    }}
                  />
                ) : (
                  initials
                )}

              </div>

              <div className="admin-profile-info">

                <strong>
                  {displayName}
                </strong>

                <span>
                  مدير النظام
                </span>

              </div>

            </button>

            {/* ------------------------------------------------
                تسجيل الخروج Desktop
                ------------------------------------------------ */}

            <button
              type="button"
              className="admin-logout-button admin-desktop-logout"
              onClick={
                handleLogout
              }
              title="تسجيل الخروج"
              aria-label="تسجيل الخروج"
            >

              <span
                className="admin-nav-icon"
                aria-hidden="true"
              >
                ↪
              </span>

            </button>

          </div>

        </div>

        {/* ====================================================
            مؤشر الصفحة
            ==================================================== */}

        <div className="admin-navbar-page-indicator">

          <span />

          <small>
            {currentPage}
          </small>

        </div>

      </header>

      {/* ======================================================
          MOBILE BUTTON
          ====================================================== */}

      <button
        type="button"
        className={`admin-mobile-toggle ${
          mobileOpen
            ? "active"
            : ""
        }`}
        onClick={() =>
          setMobileOpen(
            (value) => !value
          )
        }
        aria-label={
          mobileOpen
            ? "إغلاق القائمة"
            : "فتح القائمة"
        }
        aria-expanded={
          mobileOpen
        }
      >

        <span />
        <span />
        <span />

      </button>

      {/* ======================================================
          MOBILE OVERLAY
          ====================================================== */}

      {mobileOpen && (
        <button
          type="button"
          className="admin-sidebar-overlay"
          onClick={() =>
            setMobileOpen(false)
          }
          aria-label="إغلاق القائمة"
        />
      )}
    </>
  );
}

export default AdminNavbar;
