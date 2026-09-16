import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Bell, Search } from "lucide-react";
import { useTranslation } from "../i18n/I18nProvider";
import "../styles/main.css";
import "../styles/admin-quick-theme.css";
import "../styles/admin-theme.css";
import "../styles/admin-toolbar.css";
import "../styles/admin-soft-ui.css";
import "../styles/admin-layout-fix.css";
import "../styles/admin-soft-ui-overrides.css";
import "../styles/admin-navbar-overrides.css";
import "../styles/admin-chart-canvas.css";
import "../styles/admin-language-switcher.css";
import AdminNavbar from "../components/admin/AdminNavbar";
import AdminDashboardOverview from "../components/admin/AdminDashboardOverview";
import AdminDataPage from "../components/admin/AdminDataPage";

type R = Record<string, any>;
type Section = "dashboard" | "users" | "investors" | "projects" | "investments" | "requests" | "messages" | "documents";

const getUser = (): R | null => {
  try { const x = localStorage.getItem("aapi_user"); const u = x ? JSON.parse(x) : null; return u && typeof u === "object" ? u : null; }
  catch { return null; }
};

export default function Administrator() {
  const loc = useLocation();
  const { language, setLanguage, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const user = getUser();
  const userId = Number(user?.id ?? 0);
  const name = loc.pathname.split("/")[2] as Section | undefined;
  const section: Section = name && ["users", "investors", "projects", "investments", "requests", "messages", "documents"].includes(name) ? name : "dashboard";
  const names: Record<string, string> = {
    dashboard: t("admin.nav.dashboard"), users: t("admin.nav.users"), investors: t("admin.nav.investors"), projects: t("admin.nav.projects"),
    investments: t("admin.nav.investments"), requests: t("admin.nav.requests"), messages: t("admin.nav.messages"), documents: t("admin.nav.documents"), settings: t("admin.nav.settings")
  };
  const current = names[name ?? "dashboard"] ?? t("admin.nav.dashboard");

  return <div className={`administrator-shell ${open ? "admin-sidebar-open" : ""}`} dir={language === "ar" ? "rtl" : "ltr"} lang={language}>
    <AdminNavbar onToggle={() => setOpen(v => !v)} />
    {open && <button className="admin-navbar-overlay" aria-label={t("admin.nav.closeMenu")} onClick={() => setOpen(false)} />}
    <div className="admin-main-content">
      <header className="soft-admin-topbar">
        <div className="soft-admin-breadcrumb"><span>{t("admin.topbar.agency")}</span><b>/</b><strong>{current}</strong></div>
        <div className="soft-admin-topbar-actions">
          <label className="soft-admin-search"><Search size={15} /><input placeholder={t("admin.topbar.search")} aria-label={t("admin.topbar.searchAria")} /></label>
          <button className="soft-admin-icon-button" aria-label={t("admin.topbar.notifications")} title={t("admin.topbar.notifications")}><Bell size={17} /></button>
          <label className="admin-language-switcher" aria-label={t("common.language")} title={t("common.language")}>
            <span>{language.toUpperCase()}</span>
            <select value={language} onChange={e => setLanguage(e.target.value as "ar" | "fr" | "en")} aria-label={t("common.language")}>
              <option value="ar">العربية</option>
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </label>
          <div className="soft-admin-profile"><span>{String(user?.prenom ?? user?.nom ?? "A").slice(0, 1).toUpperCase()}</span><div><strong>{`${user?.prenom ?? ""} ${user?.nom ?? ""}`.trim() || "Administrateur"}</strong><small>{t("admin.brand.systemAdmin")}</small></div></div>
        </div>
      </header>
      {section === "dashboard" ? <AdminDashboardOverview userId={userId} /> : <AdminDataPage section={section} userId={userId} />}
    </div>
  </div>;
}
