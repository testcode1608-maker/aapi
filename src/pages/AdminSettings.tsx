import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Building2, Check, LayoutDashboard, LogOut, Menu, Moon, Settings, Users, UserCheck, FolderKanban, Wallet, ClipboardList, MessageSquare, FileCheck2, X, UserRound, Save } from "lucide-react";
import { useTranslation } from "../i18n/I18nProvider";
import "../styles/admin-theme.css";

const menu = [
  ["/admin/dashboard", "dashboard", LayoutDashboard],
  ["/admin/users", "users", Users],
  ["/admin/investors", "investors", UserCheck],
  ["/admin/projects", "projects", FolderKanban],
  ["/admin/investments", "investments", Wallet],
  ["/admin/requests", "requests", ClipboardList],
  ["/admin/messages", "messages", MessageSquare],
  ["/admin/documents", "documents", FileCheck2],
] as const;

type Theme = "dark" | "light";
type Account = {
  id?: number;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  role?: string;
  statut?: string;
  photo?: string | null;
};

function applyTheme(theme: Theme) {
  document.body.classList.toggle("aapi-admin-light", theme === "light");
  localStorage.setItem("aapi-admin-theme", theme);
  window.dispatchEvent(new CustomEvent("aapi-theme-change", { detail: theme }));
}

function readAccount(): Account {
  try {
    return JSON.parse(localStorage.getItem("aapi_user") || "{}") as Account;
  } catch {
    return {};
  }
}

export default function AdminSettings() {
  const navigate = useNavigate();
  const { language, t } = useTranslation();
  const direction = language === "ar" ? "rtl" : "ltr";
  const [theme, setTheme] = useState<Theme>(() => localStorage.getItem("aapi-admin-theme") === "light" ? "light" : "dark");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [account, setAccount] = useState<Account>(() => readAccount());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    applyTheme(theme);
    return () => document.body.classList.remove("aapi-admin-light");
  }, [theme]);

  const logout = () => {
    localStorage.removeItem("aapi_user");
    navigate("/login", { replace: true });
  };
  const closeMobile = () => setMobileMenu(false);
  const change = (key: keyof Account, value: string) => setAccount(prev => ({ ...prev, [key]: value }));
  const saveAccount = () => {
    const current = readAccount();
    localStorage.setItem("aapi_user", JSON.stringify({ ...current, ...account }));
    setAccount(prev => ({ ...current, ...prev }));
    setSaved(true);
    window.dispatchEvent(new CustomEvent("aapi-account-change"));
    window.setTimeout(() => setSaved(false), 2200);
  };

  return <div className={`admin-settings-layout${mobileMenu ? " mobile-menu-open" : ""}`} dir={direction} lang={language}>
    <button className="admin-settings-mobile-bar" type="button" onClick={() => setMobileMenu(true)} aria-label={t("admin.settings.openMenu")}><Menu size={20}/><strong>AAPI</strong><span>{t("admin.settings.title")}</span></button>
    {mobileMenu && <button className="admin-settings-mobile-overlay" type="button" aria-label={t("admin.settings.closeMenu")} onClick={closeMobile}/>} 
    <aside className="admin-settings-sidebar">
      <div className="admin-settings-mobile-head"><strong>AAPI</strong><button type="button" onClick={closeMobile} aria-label={t("admin.settings.closeMenu")}><X size={19}/></button></div>
      <button className="admin-settings-brand" onClick={() => navigate("/admin/dashboard")}><span>A</span><div><strong>AAPI</strong><small>{t("admin.brand.centralAdministration")}</small></div></button>
      <div className="admin-settings-user"><b>{String(account.prenom ?? account.nom ?? "A").slice(0,2).toUpperCase()}</b><div><strong>{`${account.prenom ?? ""} ${account.nom ?? ""}`.trim() || account.email || t("admin.settings.admin")}</strong><small>{t("admin.brand.systemAdmin")}</small></div></div>
      <nav>{menu.map(([path, key, Icon]) => <NavLink key={path} to={path} onClick={closeMobile}><Icon size={17}/><span>{t(`admin.nav.${key}`)}</span></NavLink>)}</nav>
      <div className="admin-settings-sidebar-bottom"><button onClick={() => navigate("/")}><Building2 size={16}/> {t("admin.nav.publicSite")}</button><button onClick={logout}><LogOut size={16}/> {t("admin.nav.logout")}</button></div>
    </aside>

    <main className="admin-settings-main">
      <header className="admin-settings-header"><div><span>{t("admin.settings.eyebrow")}</span><h1>{t("admin.settings.title")}</h1><p>{t("admin.settings.subtitle")}</p></div></header>

      <section className="admin-settings-card">
        <div className="admin-settings-title"><div className="admin-settings-title-icon"><UserRound size={22}/></div><div><h2>{t("admin.settings.account")}</h2><p>{t("admin.settings.accountSubtitle")}</p></div></div>
        <div className="admin-account-form">
          <label><span>{t("admin.settings.firstName")}</span><input value={account.nom ?? ""} onChange={e => change("nom", e.target.value)} placeholder={t("admin.settings.firstName")} /></label>
          <label><span>{t("admin.settings.lastName")}</span><input value={account.prenom ?? ""} onChange={e => change("prenom", e.target.value)} placeholder={t("admin.settings.lastName")} /></label>
          <label><span>{t("admin.settings.email")}</span><input type="email" value={account.email ?? ""} onChange={e => change("email", e.target.value)} placeholder="admin@aapi.dz" /></label>
          <label><span>{t("admin.settings.phone")}</span><input value={account.telephone ?? ""} onChange={e => change("telephone", e.target.value)} placeholder={t("admin.settings.phone")} /></label>
          <label><span>{t("admin.settings.role")}</span><input value={account.role === "admin" ? t("admin.settings.admin") : account.role ?? "—"} readOnly /></label>
          <label><span>{t("admin.settings.accountStatus")}</span><input value={account.statut === "actif" ? t("admin.settings.active") : account.statut ?? "—"} readOnly /></label>
        </div>
        <div className="admin-account-actions"><button type="button" onClick={saveAccount}><Save size={16}/>{saved ? t("admin.settings.saved") : t("admin.settings.save")}</button></div>
      </section>

      <section className="admin-settings-card">
        <div className="admin-settings-title"><div className="admin-settings-title-icon"><Settings size={22}/></div><div><h2>{t("admin.settings.appearance")}</h2><p>{t("admin.settings.appearanceSubtitle")}</p></div></div>
        <div className="admin-theme-options">
          <button type="button" className={`admin-theme-choice ${theme === "dark" ? "active" : ""}`} onClick={() => setTheme("dark")}>
            <div className="admin-theme-choice-preview dark"><Moon size={25}/><div><strong>{t("admin.settings.dark")}</strong><span>Dark Mode</span></div></div><div className="admin-theme-check">{theme === "dark" && <Check size={15}/>}</div>
          </button>
          <button type="button" className={`admin-theme-choice ${theme === "light" ? "active" : ""}`} onClick={() => setTheme("light")}>
            <div className="admin-theme-choice-preview light"><Settings size={25}/><div><strong>{t("admin.settings.light")}</strong><span>Light Mode</span></div></div><div className="admin-theme-check">{theme === "light" && <Check size={15}/>}</div>
          </button>
        </div>
        <div className="admin-settings-current"><span>{t("admin.settings.current")}</span><strong>{theme === "dark" ? t("admin.settings.dark") : t("admin.settings.light")}</strong></div>
      </section>
    </main>
  </div>;
}
