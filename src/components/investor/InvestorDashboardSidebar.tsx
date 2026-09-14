import { Link } from "react-router-dom";
import type { DashboardStats, DashboardUser } from "../../types/investorDashboard";
import { getFileUrl, getUserFullName, getUserInitials, toNumber } from "../../utils/investorDashboard";
import { useTranslation } from "../../i18n/I18nProvider";

interface InvestorDashboardSidebarProps {
  user: DashboardUser | null;
  stats: DashboardStats | null;
  projectsCount: number;
  userPhotoUrl: string;
  navClass: (section: string) => string;
  onLogout: () => void;
}

export default function InvestorDashboardSidebar({
  user,
  stats,
  projectsCount,
  userPhotoUrl,
  navClass,
  onLogout,
}: InvestorDashboardSidebarProps) {
  const { t } = useTranslation();
  const fullName = getUserFullName(user);
  const initials = getUserInitials(user?.prenom, user?.nom);
  const photoUrl = userPhotoUrl || getFileUrl(user?.photo);
  const activeInvestments = toNumber(stats?.investments_active);
  const pendingRequests = toNumber(stats?.requests_pending);
  const documentsTotal = toNumber(stats?.documents_total);
  const unreadMessages = toNumber(stats?.messages_unread);
  const unreadNotifications = toNumber(stats?.notifications_unread);

  return (
    <aside className="investor-dashboard-sidebar">
      <div className="investor-dashboard-sidebar-header">
        <div className="investor-dashboard-sidebar-avatar">
          {photoUrl ? <img src={photoUrl} alt={fullName} /> : initials}
        </div>
        <div>
          <strong>{fullName}</strong>
          <span>{t("investorDashboard.sidebar.investor")}</span>
        </div>
      </div>

      <nav className="investor-dashboard-nav" aria-label={t("investorDashboard.sidebar.menu")}>
        <Link to="/investor/dashboard" className={navClass("dashboard")}>
          <i className="bi bi-grid-1x2" />
          <span>{t("investorDashboard.sidebar.dashboard")}</span>
        </Link>

        <Link to="/investor/dashboard/projects" className={navClass("projects")}>
          <i className="bi bi-building" />
          <span>{t("investorDashboard.sidebar.projects")}</span>
          {projectsCount > 0 && <span className="investor-dashboard-nav-badge">{projectsCount}</span>}
        </Link>

        <Link to="/investor/dashboard/investments" className={navClass("investments")}>
          <i className="bi bi-cash-stack" />
          <span>{t("investorDashboard.sidebar.investments")}</span>
          {activeInvestments > 0 && <span className="investor-dashboard-nav-badge">{activeInvestments}</span>}
        </Link>

        <Link to="/investor/dashboard/requests" className={navClass("requests")}>
          <i className="bi bi-file-earmark-text" />
          <span>{t("investorDashboard.sidebar.requests")}</span>
          {pendingRequests > 0 && <span className="investor-dashboard-nav-badge">{pendingRequests}</span>}
        </Link>

        <Link to="/investor/dashboard/documents" className={navClass("documents")}>
          <i className="bi bi-folder2-open" />
          <span>{t("investorDashboard.sidebar.documents")}</span>
          {documentsTotal > 0 && <span className="investor-dashboard-nav-badge">{documentsTotal}</span>}
        </Link>

        <div className="investor-dashboard-nav-divider" />

        <Link to="/investor/dashboard/messages" className={navClass("messages")}>
          <i className="bi bi-chat-left-text" />
          <span>{t("investorDashboard.sidebar.messages")}</span>
          {unreadMessages > 0 && <span className="investor-dashboard-nav-badge">{unreadMessages}</span>}
        </Link>

        <Link to="/investor/dashboard/notifications" className={navClass("notifications")}>
          <i className="bi bi-bell" />
          <span>{t("investorDashboard.sidebar.notifications")}</span>
          {unreadNotifications > 0 && <span className="investor-dashboard-nav-badge">{unreadNotifications}</span>}
        </Link>

        <Link to="/investor/dashboard/profile" className={navClass("profile")}>
          <i className="bi bi-person" />
          <span>{t("investorDashboard.sidebar.profile")}</span>
        </Link>

        <Link to="/investor/dashboard/settings" className={navClass("settings")}>
          <i className="bi bi-gear" />
          <span>{t("investorDashboard.sidebar.settings")}</span>
        </Link>
      </nav>

      <div className="investor-dashboard-sidebar-footer">
        <Link to="/" className="investor-dashboard-sidebar-site-link">
          <i className="bi bi-buildings" />
          <span>الموقع العام</span>
        </Link>
        <button type="button" className="investor-dashboard-logout" onClick={onLogout}>
          <i className="bi bi-box-arrow-right" />
          <span>{t("investorDashboard.sidebar.logout")}</span>
        </button>
      </div>
    </aside>
  );
}
