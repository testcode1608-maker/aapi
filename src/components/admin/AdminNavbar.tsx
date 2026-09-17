import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Building2, ClipboardList, FileCheck2, FolderKanban, LayoutDashboard, LogOut, Menu, MessageSquare, Settings, UserCheck, Users, Wallet, X } from "lucide-react";
import { useTranslation } from "../../i18n/I18nProvider";

type R = Record<string, any>;
const getUser = (): R | null => { try { const x = localStorage.getItem("aapi_user"), u = x ? JSON.parse(x) : null; return u && typeof u === "object" ? u : null; } catch { return null; } };

export default function AdminNavbar({ onToggle }: { onToggle: () => void }) {
  const nav = useNavigate(), u = getUser() ?? {};
  const { t, language } = useTranslation();
  const direction = language === "ar" ? "rtl" : "ltr";
  const items: Array<[string, string, ReactNode]> = [
    ["/admin/dashboard", t("admin.nav.dashboard"), <LayoutDashboard size={18} />],
    ["/admin/users", t("admin.nav.users"), <Users size={18} />],
    ["/admin/investors", t("admin.nav.investors"), <UserCheck size={18} />],
    ["/admin/projects", t("admin.nav.projects"), <FolderKanban size={18} />],
    ["/admin/investments", t("admin.nav.investments"), <Wallet size={18} />],
    ["/admin/requests", t("admin.nav.requests"), <ClipboardList size={18} />],
    ["/admin/messages", t("admin.nav.messages"), <MessageSquare size={18} />],
    ["/admin/documents", t("admin.nav.documents"), <FileCheck2 size={18} />],
  ];
  const logout = () => { localStorage.removeItem("aapi_user"); nav("/login", { replace: true }); };
  const close = () => onToggle();
  return <>
    <div className="admin-mobile-header"><button className="admin-mobile-menu-button" onClick={onToggle} aria-label={t("admin.nav.openMenu")}><Menu size={20} /></button><strong>AAPI</strong></div>
    <aside className="admin-navbar" dir={direction} lang={language}>
      <div className="admin-navbar-brand"><button className="admin-navbar-brand-button" onClick={() => { nav("/admin/dashboard"); close(); }}><span className="admin-navbar-logo"><img src="/logo.png" alt="AAPI" className="admin-navbar-logo-image" /></span><span className="admin-navbar-brand-text"><strong>AAPI</strong><small>{t("admin.brand.centralAdministration")}</small></span></button><button className="admin-navbar-mobile-close" onClick={close} aria-label={t("admin.nav.closeMenu")}><X size={18} /></button></div>
      <div className="admin-navbar-user"><span className="admin-navbar-user-avatar">{String(u.prenom ?? u.nom ?? "A").slice(0, 2).toUpperCase()}</span><span className="admin-navbar-user-info"><strong>{`${u.prenom ?? ""} ${u.nom ?? ""}`.trim() || u.email || "Administrateur"}</strong><span>{t("admin.brand.systemAdmin")}</span></span></div>
      <nav className="admin-navbar-menu"><div className="admin-navbar-section"><div className="admin-navbar-section-title">{t("admin.nav.administration")}</div><div className="admin-navbar-section-items">{items.map(([to, n, icon]) => <NavLink key={to} to={to} onClick={close} className={({ isActive }) => `admin-nav-link${isActive ? " active" : ""}`}><span className="admin-nav-icon">{icon}</span><span className="admin-nav-label">{n}</span></NavLink>)}</div></div><div className="admin-navbar-section"><div className="admin-navbar-section-title">{t("admin.nav.system")}</div><NavLink to="/admin/settings" onClick={close} className={({ isActive }) => `admin-nav-link${isActive ? " active" : ""}`}><span className="admin-nav-icon"><Settings size={18} /></span><span className="admin-nav-label">{t("admin.nav.settings")}</span></NavLink></div></nav>
      <div className="admin-navbar-bottom"><button className="admin-navbar-bottom-button" onClick={() => nav("/")}><Building2 size={17} /> {t("admin.nav.publicSite")}</button><button className="admin-navbar-bottom-button admin-navbar-logout" onClick={logout}><LogOut size={17} /> {t("admin.nav.logout")}</button></div>
    </aside>
  </>;
}
