import { Link } from "react-router-dom";
import type { DashboardStats, DashboardUser } from "../../types/investorDashboard";
import { getFileUrl, getUserFullName, getUserInitials, toNumber } from "../../utils/investorDashboard";

interface InvestorDashboardSidebarProps {
  user: DashboardUser | null;
  stats: DashboardStats | null;
  projectsCount: number;
  userPhotoUrl: string;
  navClass: (section: string) => string;
  onLogout: () => void;
}

export default function InvestorDashboardSidebar({ user, stats, projectsCount, userPhotoUrl, navClass, onLogout }: InvestorDashboardSidebarProps) {
  const fullName = getUserFullName(user);
  const initials = getUserInitials(user?.prenom, user?.nom);
  const photoUrl = userPhotoUrl || getFileUrl(user?.photo);

  return (
    <aside className="investor-dashboard-sidebar">
      <div className="investor-dashboard-sidebar-header">
        <div className="investor-dashboard-sidebar-avatar">{photoUrl ? <img src={photoUrl} alt={fullName} /> : initials}</div>
        <div><strong>{fullName}</strong><span>مستثمر</span></div>
      </div>
      <nav className="investor-dashboard-nav" aria-label="قائمة المستثمر">
        <Link to="/investor/dashboard" className={navClass("dashboard")}><i className="bi bi-grid-1x2" /><span>لوحة التحكم</span></Link>
        <Link to="/investor/dashboard/projects" className={navClass("projects")}><i className="bi bi-building" /><span>مشاريعي</span>{projectsCount > 0 && <span className="investor-dashboard-nav-badge">{projectsCount}</span>}</Link>
        <Link to="/investor/dashboard/investments" className={navClass("investments")}><i className="bi bi-cash-stack" /><span>استثماراتي</span>{toNumber(stats?.investments_active) > 0 && <span className="investor-dashboard-nav-badge">{toNumber(stats?.investments_active)}</span>}</Link>
        <Link to="/investor/dashboard/requests" className={navClass("requests")}><i className="bi bi-file-earmark-text" /><span>طلباتي</span>{toNumber(stats?.requests_pending) > 0 && <span className="investor-dashboard-nav-badge">{toNumber(stats?.requests_pending)}</span>}</Link>
        <Link to="/investor/dashboard/documents" className={navClass("documents")}><i className="bi bi-folder2-open" /><span>وثائقي</span>{toNumber(stats?.documents_total) > 0 && <span className="investor-dashboard-nav-badge">{toNumber(stats?.documents_total)}</span>}</Link>
        <div className="investor-dashboard-nav-divider" />
        <Link to="/investor/dashboard/messages" className={navClass("messages")}><i className="bi bi-chat-left-text" /><span>الرسائل</span>{toNumber(stats?.messages_unread) > 0 && <span className="investor-dashboard-nav-badge">{toNumber(stats?.messages_unread)}</span>}</Link>
        <Link to="/investor/dashboard/notifications" className={navClass("notifications")}><i className="bi bi-bell" /><span>الإشعارات</span>{toNumber(stats?.notifications_unread) > 0 && <span className="investor-dashboard-nav-badge">{toNumber(stats?.notifications_unread)}</span>}</Link>
        <Link to="/investor/dashboard/profile" className={navClass("profile")}><i className="bi bi-person" /><span>ملفي الشخصي</span></Link>
        <Link to="/investor/dashboard/settings" className={navClass("settings")}><i className="bi bi-gear" /><span>الإعدادات</span></Link>
      </nav>
      <div className="investor-dashboard-sidebar-footer"><button type="button" className="investor-dashboard-logout" onClick={onLogout}><i className="bi bi-box-arrow-right" /><span>تسجيل الخروج</span></button></div>
    </aside>
  );
}
