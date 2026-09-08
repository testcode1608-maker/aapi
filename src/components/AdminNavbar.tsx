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
  telephone?: string | null;
  role?: string;
  statut?: string;
  photo?: string | null;
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

/* ============================================================
   ADMIN NAVBAR
   لا يستدعي dashboard.php
   البيانات الأساسية تأتي من localStorage
   ============================================================ */

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
    telephone: null,
    role: "admin",
    statut: "actif",
    photo: null,
  });

  /* ============================================================
     تحميل بيانات المدير من localStorage فقط
     ============================================================ */

  useEffect(() => {
    let cancelled = false;

    const loadAdminFromStorage = () => {
      try {
        const storedUser = localStorage.getItem("aapi_user");

        if (!storedUser) {
          return;
        }

        const user = JSON.parse(storedUser) as AdminUser;

        if (!user || !user.id) {
          console.warn(
            "AdminNavbar: بيانات المستخدم غير صالحة."
          );
          return;
        }

        if (
          String(user.role || "").toLowerCase() !==
          "admin"
        ) {
          console.warn(
            "AdminNavbar: المستخدم الحالي ليس Admin."
          );
          return;
        }

        if (!cancelled) {
          setAdmin({
            ...user,
            role: "admin",
          });
        }
      } catch (error) {
        console.error(
          "AdminNavbar: خطأ في قراءة aapi_user:",
          error
        );
      }
    };

    loadAdminFromStorage();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ============================================================
     تحديث بيانات المدير إذا تغير localStorage
     ============================================================ */

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const storedUser =
          localStorage.getItem("aapi_user");

        if (!storedUser) {
          return;
        }

        const user =
          JSON.parse(storedUser) as AdminUser;

        if (
          user?.id &&
          String(user.role || "").toLowerCase() ===
            "admin"
        ) {
          setAdmin({
            ...user,
            role: "admin",
          });
        }
      } catch (error) {
        console.error(
          "AdminNavbar: خطأ أثناء تحديث المستخدم:",
          error
        );
      }
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  /* ============================================================
     إغلاق القائمة بعد تغيير الصفحة
     ============================================================ */

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  /* ============================================================
     منع Scroll عند فتح القائمة في الهاتف
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

    /* لوحة التحكم */
    if (page === "dashboard") {
      return (
        pathname === "/admin" ||
        pathname === "/admin/dashboard"
      );
    }

    /* الصفحة الحالية حسب URL */
    if (
      pathname === `/admin/${page}` ||
      pathname.startsWith(`/admin/${page}/`)
    ) {
      return true;
    }

    /* الصفحة الحالية حسب currentPage */
    const normalizedCurrentPage =
      currentPage
        .toLowerCase()
        .trim();

    const normalizedPage =
      page
        .toLowerCase()
        .trim();

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
    admin.prenom
      ?.trim()
      ?.charAt(0) || "";

  const lastInitial =
    admin.nom
      ?.trim()
      ?.charAt(0) || "م";

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

              <strong>
                AAPI
              </strong>

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
                    onError={(event) => {
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
