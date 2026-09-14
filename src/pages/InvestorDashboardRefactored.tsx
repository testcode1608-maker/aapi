import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/investor-dashboard.css";
import "../styles/investor-dashboard-dark.css";
import "../styles/investor-projects.css";
import "../styles/investor-investments.css";
import "../styles/investor-dashboard-extra.css";
import "../styles/investor-dashboard-fixes.css";
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
    user, profile, stats, projects, investments, requests, documents,
    notifications, activities, projectCompletion, completedInvestments,
    loading, error, reload,
  } = useInvestorDashboard();

  const createProject = useCreateInvestorProject(reload);
  const createInvestment = useCreateInvestorInvestment(projects, reload);
  const [showProjectForm, setShowProjectForm] = useState(true);
  const [showInvestmentForm, setShowInvestmentForm] = useState(true);

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
    const errorMessage =
      error === "INVALID_RESPONSE" || error === "DASHBOARD_REQUEST_FAILED"
        ? t("investorDashboard.errorTitle")
        : error;

    return (
      <div className={`investor-dashboard-error investor-dashboard-${direction}`} dir={direction}>
        <i className="bi bi-exclamation-triangle" />
        <h2>{t("investorDashboard.errorTitle")}</h2>
        <p>{errorMessage}</p>
        <button className="investor-dashboard-primary-btn" onClick={() => void reload()}>
          {t("investorDashboard.retry")}
        </button>
      </div>
    );
  }

  let content;

  switch (section) {
    case "projects":
      content = (
        <section className="investor-dashboard-section">
          <div className="investor-dashboard-page-header">
            <div>
              <span className="investor-dashboard-overline">{t("investorDashboard.projectsOverline")}</span>
              <h1>{t("investorDashboard.projectsTitle")}</h1>
              <p>{t("investorDashboard.projectsDescription")}</p>
            </div>
            <button type="button" className="investor-dashboard-primary-btn" onClick={() => setShowProjectForm((value) => !value)}>
              <i className={showProjectForm ? "bi bi-dash-circle" : "bi bi-plus-circle"} />
              {showProjectForm ? t("investorDashboard.hideForm") : t("investorDashboard.newProject")}
            </button>
          </div>
          {showProjectForm && (
            <InvestorProjectCreateForm
              form={createProject.form}
              setForm={createProject.setForm}
              creating={createProject.creating}
              error={createProject.error}
              success={createProject.success}
              onSubmit={createProject.submit}
              onReset={createProject.resetForm}
            />
          )}
          <InvestorProjectList projects={projects} />
        </section>
      );
      break;

    case "investments":
      content = (
        <section className="investor-dashboard-section">
          <div className="investor-dashboard-page-header">
            <div>
              <span className="investor-dashboard-overline">{t("investorDashboard.investmentsOverline")}</span>
              <h1>{t("investorDashboard.investmentsTitle")}</h1>
              <p>{t("investorDashboard.investmentsDescription")}</p>
            </div>
            <button type="button" className="investor-dashboard-primary-btn" onClick={() => setShowInvestmentForm((value) => !value)}>
              <i className={showInvestmentForm ? "bi bi-dash-circle" : "bi bi-plus-circle"} />
              {showInvestmentForm ? t("investorDashboard.hideForm") : t("investorDashboard.newInvestment")}
            </button>
          </div>
          {showInvestmentForm && (
            <InvestorInvestmentCreateForm
              form={createInvestment.form}
              setForm={createInvestment.setForm}
              projects={createInvestment.eligibleProjects}
              creating={createInvestment.creating}
              error={createInvestment.error}
              success={createInvestment.success}
              onSubmit={createInvestment.submit}
              onReset={createInvestment.resetForm}
            />
          )}
          <InvestorInvestmentsSection investments={investments} />
        </section>
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
      content = <InvestorProfileSection user={user} profile={profile} fullName={fullName} userPhotoUrl={userPhotoUrl} />;
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
        <InvestorDashboardSidebar user={user} stats={stats} projectsCount={projects.length} userPhotoUrl={userPhotoUrl} navClass={navClass} onLogout={logout} />
        <main className="investor-dashboard-main">{content}</main>
      </div>
    </div>
  );
}
