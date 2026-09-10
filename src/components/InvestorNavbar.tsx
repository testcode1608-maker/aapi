import { useEffect, useState, type ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Bell, Building2, ClipboardList, FileCheck2, FolderKanban, LayoutDashboard, LogOut, Menu, MessageSquare, Settings, User, Wallet, X } from "lucide-react";
import "../styles/main.css";

interface InvestorNavbarProps { currentPage?: string; }
interface InvestorUser { id?: number | string; nom?: string; prenom?: string; name?: string; email?: string; photo?: string | null; role?: string; }

const getStoredUser = (): InvestorUser | null => {
  try { const raw = localStorage.getItem("aapi_user"); if (!raw) return null; const parsed = JSON.parse(raw); return parsed && typeof parsed === "object" ? parsed : null; } catch { return null; }
};

export default function InvestorNavbar({ currentPage = "dashboard" }: InvestorNavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [investor, setInvestor] = useState<InvestorUser | null>(getStoredUser);

  useEffect(() => { setInvestor(getStoredUser()); }, [location.pathname]);
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const name = investor?.prenom || investor?.nom ? `${investor?.prenom ?? ""} ${investor?.nom ?? ""}`.trim() : investor?.name || investor?.email || "المستثمر";
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part.charAt(0)).join("").toUpperCase() || "I";
  const active = (page: string) => page === "dashboard" ? location.pathname === "/investor/dashboard" || currentPage === "dashboard" : location.pathname.startsWith(`/investor/dashboard/${page}`);

  const items: Array<[string, string, ReactNode, string]> = [
    ["/investor/dashboard", "لوحة التحكم", <LayoutDashboard size={18} />, "dashboard"],
    ["/investor/dashboard/projects", "مشاريعي", <FolderKanban size={18} />, "projects"],
    ["/investor/dashboard/investments", "استثماراتي", <Wallet size={18} />, "investments"],
    ["/investor/dashboard/requests", "طلباتي", <ClipboardList size={18} />, "requests"],
    ["/investor/dashboard/documents", "وثائقي", <FileCheck2 size={18} />, "documents"],
    ["/investor/dashboard/messages", "رسائلي", <MessageSquare size={18} />, "messages"],
    ["/investor/dashboard/notifications", "الإشعارات", <Bell size={18} />, "notifications"],
  ];

  const logout = () => { ["aapi_user", "investor", "investor_user", "investor_token"].forEach(key => localStorage.removeItem(key)); navigate("/login", { replace: true }); };

  return <>
    <div className="admin-mobile-header"><button className="admin-mobile-menu-button" onClick={() => setMobileOpen(v => !v)} aria-label="فتح القائمة"><Menu size={20} /></button><strong>AAPI</strong></div>
    <aside className={`admin-navbar${mobileOpen ? " admin-navbar-open" : ""}`}>
      <div className="admin-navbar-brand"><button className="admin-navbar-brand-button" onClick={() => navigate("/investor/dashboard")}><span className="admin-navbar-logo">A</span><span className="admin-navbar-brand-text"><strong>AAPI</strong><small>فضاء المستثمر</small></span></button><button className="admin-navbar-mobile-close" onClick={() => setMobileOpen(false)}><X size={18} /></button></div>
      <div className="admin-navbar-user"><span className="admin-navbar-user-avatar">{investor?.photo ? <img src={investor.photo} alt={name} /> : initials}</span><span className="admin-navbar-user-info"><strong>{name}</strong><span>مستثمر</span></span></div>
      <nav className="admin-navbar-menu">
        <div className="admin-navbar-section"><div className="admin-navbar-section-title">فضاء المستثمر</div><div className="admin-navbar-section-items">{items.map(([to, label, icon, page]) => <NavLink key={to} to={to} className={`admin-nav-link${active(page) ? " active" : ""}`} onClick={() => setMobileOpen(false)}><span className="admin-nav-icon">{icon}</span><span className="admin-nav-label">{label}</span></NavLink>)}</div></div>
        <div className="admin-navbar-section"><div className="admin-navbar-section-title">الحساب</div><div className="admin-navbar-section-items"><NavLink to="/investor/dashboard/profile" className={({ isActive }) => `admin-nav-link${isActive ? " active" : ""}`}><span className="admin-nav-icon"><User size={18} /></span><span className="admin-nav-label">ملفي الشخصي</span></NavLink><NavLink to="/investor/dashboard/settings" className={({ isActive }) => `admin-nav-link${isActive ? " active" : ""}`}><span className="admin-nav-icon"><Settings size={18} /></span><span className="admin-nav-label">الإعدادات</span></NavLink></div></div>
      </nav>
      <div className="admin-navbar-bottom"><button className="admin-navbar-bottom-button" onClick={() => navigate("/")}><Building2 size={17} /> الموقع العام</button><button className="admin-navbar-bottom-button admin-navbar-logout" onClick={logout}><LogOut size={17} /> تسجيل الخروج</button></div>
    </aside>
  </>;
}
