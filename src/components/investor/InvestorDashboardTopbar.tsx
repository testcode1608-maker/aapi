import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { DashboardStats, DashboardUser } from "../../types/investorDashboard";
import { getFileUrl, getUserFullName, getUserInitials, toNumber } from "../../utils/investorDashboard";

interface InvestorDashboardTopbarProps { user: DashboardUser | null; stats: DashboardStats | null; userPhotoUrl?: string; }
const THEME_KEY = "aapi-investor-theme";

export default function InvestorDashboardTopbar({ user, stats, userPhotoUrl = "" }: InvestorDashboardTopbarProps) {
  const fullName = getUserFullName(user);
  const initials = getUserInitials(user?.prenom, user?.nom);
  const photoUrl = userPhotoUrl || getFileUrl(user?.photo);
  const unreadNotifications = toNumber(stats?.notifications_unread);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem(THEME_KEY) === "dark");

  useEffect(() => {
    document.body.classList.toggle("aapi-investor-dark", darkMode);
    localStorage.setItem(THEME_KEY, darkMode ? "dark" : "light");
    return () => document.body.classList.remove("aapi-investor-dark");
  }, [darkMode]);

  return <header className="investor-dashboard-topbar">
    <div className="investor-dashboard-brand"><div className="investor-dashboard-brand-mark"><i className="bi bi-buildings" /></div><div className="investor-dashboard-brand-text"><strong>AAPI</strong><span>فضاء المستثمر</span></div></div>
    <div className="investor-dashboard-topbar-actions">
      <button type="button" className="investor-dashboard-theme-toggle" onClick={() => setDarkMode(v => !v)} aria-label={darkMode ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"} title={darkMode ? "الوضع النهاري" : "الوضع الليلي"}><i className={darkMode ? "bi bi-sun-fill" : "bi bi-moon-stars-fill"} /></button>
      <Link to="/investor/dashboard/notifications" className="investor-dashboard-notification" aria-label="الإشعارات"><i className="bi bi-bell" />{unreadNotifications > 0 && <span className="investor-dashboard-notification-badge">{unreadNotifications}</span>}</Link>
      <div className="investor-dashboard-user"><div className="investor-dashboard-user-avatar">{photoUrl ? <img src={photoUrl} alt={fullName} /> : initials}</div><div className="investor-dashboard-user-info"><strong>{fullName}</strong><span>{user?.email || "—"}</span></div></div>
    </div>
  </header>;
}
