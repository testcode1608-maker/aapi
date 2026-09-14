import { useLocation, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import "../styles/investor-dashboard.css";
import "../styles/investor-dashboard-dark.css";
import "../styles/investor-projects.css";
import "../styles/investor-investments.css";
import "../styles/investor-dashboard-extra.css";
import "../styles/investor-dashboard-fixes.css";
import "../styles/investor-dashboard-direction.css";
import InvestorDashboardSidebar from "../components/investor/InvestorDashboardSidebar";
import InvestorDashboardTopbar from "../components/investor/InvestorDashboardTopbar";
import InvestorDashboardOverview from "../components/investor/InvestorDashboardOverview";
import InvestorProjectCreateForm from "../components/investor/InvestorProjectCreateForm";
import InvestorProjectList from "../components/investor/InvestorProjectList";
import InvestorInvestmentCreateForm from "../components/investor/InvestorInvestmentCreateForm";
import InvestorInvestmentsSection from "../components/investor/InvestorInvestmentsSection";
import InvestorRequestsSection from "../components/investor/InvestorRequestsSection";
import InvestorDocumentsSection from "../components/investor/InvestorDocumentsSection";
import InvestorMessagesSection from "../components/investor/InvestorMessagesSection";
import InvestorNotificationsSection from "../components/investor/InvestorNotificationsSection";
import InvestorProfileSection from "../components/investor/InvestorProfileSection";
import InvestorSettingsSection from "../components/investor/InvestorSettingsSection";
import { useInvestorDashboard } from "../hooks/useInvestorDashboard";
import { useCreateInvestorProject } from "../hooks/useCreateInvestorProject";
import { useCreateInvestorInvestment } from "../hooks/useCreateInvestorInvestment";
import { getUserFullName, getUserPhotoUrl } from "../utils/investorDashboard";
import { useTranslation } from "../i18n/I18nProvider";

const paths: Record<string, string> = {
  dashboard: "/investor/dashboard",
  projects: "/investor/dashboard/projects",
  investments: "/investor/dashboard/investments",
  requests: "/investor/dashboard/requests",
  documents: "/investor/dashboard/documents",
  messages: "/investor/dashboard/messages",
  notifications: "/investor/dashboard/notifications",
  profile: "/investor/dashboard/profile",
  settings: "/investor/dashboard/settings",
};

export default function InvestorDashboardRefactored() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, t } = useTranslation();
  const {
    user,
    profile,
    stats,
    projects,
    investments,
    requests,
    documents,
    notifications,
    activities,
    projectCompletion,
    completedInvestments,
    loading,
    error,
    reload,
  } = useInvestorDashboard();
  const createProject = useCreateInvestorProject(reload);
  const createInvestment = useCreateInvestorInvestment(projects, reload);
  const section = location.pathname.split("/")[3] || "dashboard";
  const fullName = getUserFullName(user);
  const userPhotoUrl = getUserPhotoUrl(user);
  const direction = language === "ar" ? "rtl" : "ltr";
  const navClass = (name: string) =>
    location.pathname === paths[name]
      ? "investor-dashboard-nav-link active"
      : "investor-dashboard-nav-link";
  const logout = () => {
    localStorage.removeItem("aapi_user");
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div className={`investor-dashboard-loading investor-dashboard-${direction}`} dir={direction}>
        <div className="investor-dashboard-loading-spinner" />
        <p>{t("investorDashboard.loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`investor-dashboard-error-page investor-dashboard-${direction}`} dir={direction}>
        <div className="investor-dashboard-error-card">
          <i className="bi bi-exclamation-triangle" />
          <h2>{t("investorDashboard.errorTitle")}</h2>
          <p>{error}</p>
          <button type="button" className="investor-dashboard-primary-btn" onClick={() => void reload()}>
            {t("common.retry")}
          </button>
        </div>
      </div>
    );
  }

  let content: ReactNode;
  switch (section) {
    case "projects":
      content = (
        <>
          <InvestorProjectCreateForm {...createProject} />
          <InvestorProjectList projects={projects} />
        </>
      );
      break;
    case "investments":
      content = (
        <>
          <InvestorInvestmentCreateForm {...createInvestment} />
          <InvestorInvestmentsSection investments={investments} />
        </>
      );
      break;
    case "requests":
      content = <InvestorRequestsSection requests={requests} projects={projects} reload={reload} />;
      break;
    case "documents":
      content = <InvestorDocumentsSection documents={documents} />;
      break;
    case "messages":
      content = <InvestorMessagesSection />;
      break;
    case "notifications":
      content = <InvestorNotificationsSection notifications={notifications} />;
      break;
    case "profile":
      content = (
        <InvestorProfileSection
          user={user}
          profile={profile}
          fullName={fullName}
          userPhotoUrl={userPhotoUrl}
        />
      );
      break;
    case "settings":
      content = <InvestorSettingsSection user={user} />;
      break;
    default:
      content = (
        <InvestorDashboardOverview
          stats={stats}
          projects={projects}
          investments={investments}
          activities={activities}
          projectCompletion={projectCompletion}
          completedInvestments={completedInvestments}
        />
      );
  }

  return (
    <div className={`investor-dashboard-page investor-dashboard-${direction}`} dir={direction} data-language={language}>
      <InvestorDashboardTopbar user={user} stats={stats} userPhotoUrl={userPhotoUrl} />
      <div className="investor-dashboard-layout">
        <InvestorDashboardSidebar
          user={user}
          stats={stats}
          projectsCount={projects.length}
          userPhotoUrl={userPhotoUrl}
          navClass={navClass}
          onLogout={logout}
        />
        <main className="investor-dashboard-main">{content}</main>
      </div>
    </div>
  );
}
