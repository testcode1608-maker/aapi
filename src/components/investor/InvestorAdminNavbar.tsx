import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Building2, ClipboardList, FileCheck2, FolderKanban, LayoutDashboard, LogOut, Menu, MessageSquare, Settings, UserCheck, Wallet, X } from "lucide-react";
import { useTranslation } from "../../i18n/I18nProvider";
import { getUserFullName, getUserInitials, getUserPhotoUrl } from "../../utils/investorDashboard";

type R = Record<string, any>;

const getUser = (): R | null => {
  try {
    const raw = localStorage.getItem("aapi_user");
    const user = raw ? JSON.parse(raw) : null;
    return user && typeof user === "object" ? user : null;
  } catch {
    return null;
  }
};

export default function InvestorAdminNavbar({ onToggle }: { onToggle: () => void }) {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const direction = language === "ar" ? "rtl" : "ltr";
  const user = getUser() ?? {};
  const fullName = getUserFullName(user);
  const userPhotoUrl = getUserPhotoUrl(user);
  const userInitials = getUserInitials(user?.prenom, user?.nom);
  const close = () => onToggle();
  const logout = () => {
    localStorage.removeItem("aapi_user");
    navigate("/login", { replace: true });
  };

  const items: Array<[string, string, ReactNode]> = [
    ["/investor/dashboard", t("investorDashboard.sidebar.dashboard"), <LayoutDashboard size={18} />],
    ["/investor/dashboard/projects", t("investorDashboard.sidebar.projects"), <FolderKanban size={18} />],
    ["/investor/dashboard/investments", t("investorDashboard.sidebar.investments"), <Wallet size={18} />],
    ["/investor/dashboard/requests", t("investorDashboard.sidebar.requests"), <ClipboardList size={18} />],
    ["/investor/dashboard/documents", t("investorDashboard.sidebar.documents"), <FileCheck2 size={18} />],
    ["/investor/dashboard/messages", t("investorDashboard.sidebar.messages"), <MessageSquare size={18} />],
    ["/investor/dashboard/notifications", t("investorDashboard.sidebar.notifications"), <UserCheck size={18} />],
    ["/investor/dashboard/profile", t("investorDashboard.sidebar.profile"), <UserCheck size={18} />],
  ];

  return (
    <>
      <div className="admin-mobile-header" dir={direction}>
        <button className="admin-mobile-menu-button" onClick={onToggle} aria-label={language === "ar" ? "فتح القائمة" : language === "fr" ? "Ouvrir le menu" : "Open menu"}><Menu size={20} /></button>
        <strong>AAPI</strong>
      </div>
      <aside className="admin-navbar investor-admin-navbar" dir={direction} lang={language}>
        <div className="admin-navbar-brand">
          <button className="admin-navbar-brand-button" onClick={() => { navigate("/investor/dashboard"); close(); }}>
            <span className="admin-navbar-logo"><img src="/logo.png" alt="AAPI" className="admin-navbar-logo-image" /></span>
            <span className="admin-navbar-brand-text"><strong>AAPI</strong><small>{t("investorDashboard.topbar.investorSpace")}</small></span>
          </button>
          <button className="admin-navbar-mobile-close" onClick={close} aria-label={language === "ar" ? "إغلاق القائمة" : language === "fr" ? "Fermer le menu" : "Close menu"}><X size={18} /></button>
        </div>

        <div className="admin-navbar-user">
          {userPhotoUrl ? (
            <img
              src={userPhotoUrl}
              alt={fullName || t("investorDashboard.sidebar.investor")}
              className="investor-navbar-user-photo"
              onError={(event) => {
                event.currentTarget.style.display = "none";
                const fallback = event.currentTarget.nextElementSibling as HTMLElement | null;
                if (fallback) fallback.style.display = "grid";
              }}
            />
          ) : null}
          <span className="admin-navbar-user-avatar investor-navbar-user-fallback" style={{ display: userPhotoUrl ? "none" : "grid" }}>{userInitials}</span>
          <span className="admin-navbar-user-info">
            <strong>{fullName || user.email || t("investorDashboard.sidebar.investor")}</strong>
            <span>{t("investorDashboard.sidebar.investor")}</span>
          </span>
        </div>

        <nav className="admin-navbar-menu">
          <div className="admin-navbar-section">
            <div className="admin-navbar-section-title">{t("investorDashboard.topbar.investorSpace")}</div>
            <div className="admin-navbar-section-items">
              {items.map(([to, label, icon]) => (
                <NavLink key={to} to={to} end={to === "/investor/dashboard"} onClick={close} className={({ isActive }) => `admin-nav-link${isActive ? " active" : ""}`}>
                  <span className="admin-nav-icon">{icon}</span>
                  <span className="admin-nav-label">{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
          <div className="admin-navbar-section">
            <div className="admin-navbar-section-title">{language === "ar" ? "النظام" : language === "fr" ? "Système" : "System"}</div>
            <NavLink to="/investor/dashboard/settings" onClick={close} className={({ isActive }) => `admin-nav-link${isActive ? " active" : ""}`}>
              <span className="admin-nav-icon"><Settings size={18} /></span>
              <span className="admin-nav-label">{t("investorDashboard.sidebar.settings")}</span>
            </NavLink>
          </div>
        </nav>

        <div className="admin-navbar-bottom">
          <button className="admin-navbar-bottom-button" onClick={() => navigate("/")}><Building2 size={17} /> {language === "ar" ? "الموقع العام" : language === "fr" ? "Site public" : "Public website"}</button>
          <button className="admin-navbar-bottom-button admin-navbar-logout" onClick={logout}><LogOut size={17} /> {t("investorDashboard.sidebar.logout")}</button>
        </div>
      </aside>
    </>
  );
}
