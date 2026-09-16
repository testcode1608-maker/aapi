import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Building2, ClipboardList, FileCheck2, FolderKanban, LayoutDashboard, LogOut, Menu, MessageSquare, Settings, UserCheck, Wallet, X } from "lucide-react";

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

const items: Array<[string, string, ReactNode]> = [
  ["/investor/dashboard", "لوحة التحكم", <LayoutDashboard size={18} />],
  ["/investor/dashboard/projects", "مشاريعي", <FolderKanban size={18} />],
  ["/investor/dashboard/investments", "استثماراتي", <Wallet size={18} />],
  ["/investor/dashboard/requests", "طلباتي", <ClipboardList size={18} />],
  ["/investor/dashboard/documents", "وثائقي", <FileCheck2 size={18} />],
  ["/investor/dashboard/messages", "رسائلي", <MessageSquare size={18} />],
  ["/investor/dashboard/notifications", "إشعاراتي", <UserCheck size={18} />],
  ["/investor/dashboard/profile", "ملفي الشخصي", <UserCheck size={18} />],
];

export default function InvestorAdminNavbar({ onToggle }: { onToggle: () => void }) {
  const navigate = useNavigate();
  const user = getUser() ?? {};
  const close = () => onToggle();
  const logout = () => {
    localStorage.removeItem("aapi_user");
    navigate("/login", { replace: true });
  };

  return (
    <>
      <div className="admin-mobile-header">
        <button className="admin-mobile-menu-button" onClick={onToggle} aria-label="فتح القائمة"><Menu size={20} /></button>
        <strong>AAPI</strong>
      </div>
      <aside className="admin-navbar">
        <div className="admin-navbar-brand">
          <button className="admin-navbar-brand-button" onClick={() => { navigate("/investor/dashboard"); close(); }}>
            <span className="admin-navbar-logo">A</span>
            <span className="admin-navbar-brand-text"><strong>AAPI</strong><small>فضاء المستثمر</small></span>
          </button>
          <button className="admin-navbar-mobile-close" onClick={close} aria-label="إغلاق القائمة"><X size={18} /></button>
        </div>

        <div className="admin-navbar-user">
          <span className="admin-navbar-user-avatar">{String(user.prenom ?? user.nom ?? "A").slice(0, 2).toUpperCase()}</span>
          <span className="admin-navbar-user-info">
            <strong>{`${user.prenom ?? ""} ${user.nom ?? ""}`.trim() || user.email || "مستثمر"}</strong>
            <span>المستثمر</span>
          </span>
        </div>

        <nav className="admin-navbar-menu">
          <div className="admin-navbar-section">
            <div className="admin-navbar-section-title">مساحة المستثمر</div>
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
            <div className="admin-navbar-section-title">النظام</div>
            <NavLink to="/investor/dashboard/settings" onClick={close} className={({ isActive }) => `admin-nav-link${isActive ? " active" : ""}`}>
              <span className="admin-nav-icon"><Settings size={18} /></span>
              <span className="admin-nav-label">الإعدادات</span>
            </NavLink>
          </div>
        </nav>

        <div className="admin-navbar-bottom">
          <button className="admin-navbar-bottom-button" onClick={() => navigate("/")}><Building2 size={17} /> الموقع العام</button>
          <button className="admin-navbar-bottom-button admin-navbar-logout" onClick={logout}><LogOut size={17} /> تسجيل الخروج</button>
        </div>
      </aside>
    </>
  );
}
