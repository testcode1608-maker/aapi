import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { Bell, Moon, Search, Sun } from "lucide-react";
import "../styles/main.css";
import "../styles/admin-quick-theme.css";
import "../styles/admin-theme.css";
import "../styles/admin-soft-ui.css";
import "../styles/admin-layout-fix.css";
import "../styles/admin-navbar-overrides.css";
import "../styles/admin-chart-canvas.css";
import "../styles/investor/index.css";
import "../styles/investor-admin-copy.css";
import InvestorAdminNavbar from "../components/investor/InvestorAdminNavbar";
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

const sectionNames: Record<string, string> = {
  dashboard: "لوحة التحكم",
  projects: "المشاريع",
  investments: "الاستثمارات",
  requests: "الطلبات",
  documents: "الوثائق",
  messages: "الرسائل",
  notifications: "الإشعارات",
  profile: "الملف الشخصي",
  settings: "الإعدادات",
};

const getInitialLightMode = () => {
  try {
    return localStorage.getItem("aapi-dashboard-theme") === "light";
  } catch {
    return false;
  }
};

export default function InvestorDashboardRefactored() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lightMode, setLightMode] = useState(getInitialLightMode);

  const {
    user, profile, stats, projects, investments, requests, documents,
    notifications, activities, projectCompletion, completedInvestments,
    loading, error, reload,
  } = useInvestorDashboard();
  const createProject = useCreateInvestorProject(reload);
  const createInvestment = useCreateInvestorInvestment(projects, reload);
  const section = location.pathname.split("/")[3] || "dashboard";
  const fullName = getUserFullName(user);
  const userPhotoUrl = getUserPhotoUrl(user);
  const current = sectionNames[section] ?? "لوحة التحكم";

  useEffect(() => {
    document.body.classList.toggle("aapi-admin-light", lightMode);
    try {
      localStorage.setItem("aapi-dashboard-theme", lightMode ? "light" : "dark");
    } catch {
      // Ignore storage errors.
    }

    return () => {
      document.body.classList.remove("aapi-admin-light");
    };
  }, [lightMode]);

  const toggleTheme = () => setLightMode(value => !value);

  const navClass = (name: string) => location.pathname === paths[name]
    ? "investor-dashboard-nav-link active" : "investor-dashboard-nav-link";

  if (loading) return (
    <div className="administrator-shell investor-admin-copy" dir="rtl">
      <div className="investor-dashboard-loading investor-dashboard-rtl" dir="rtl">
        <div className="investor-dashboard-loading-spinner" />
        <p>{t("investorDashboard.loading")}</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="administrator-shell investor-admin-copy" dir="rtl">
      <div className="investor-dashboard-error-page investor-dashboard-rtl" dir="rtl">
        <div className="investor-dashboard-error-card">
          <i className="bi bi-exclamation-triangle" />
          <h2>{t("investorDashboard.errorTitle")}</h2>
          <p>{error}</p>
          <button type="button" className="investor-dashboard-primary-btn" onClick={() => void reload()}>{t("common.retry")}</button>
        </div>
      </div>
    </div>
  );

  let content: ReactNode;
  switch (section) {
    case "projects": content = <>
      <InvestorProjectCreateForm form={createProject.form} setForm={createProject.setForm} creating={createProject.creating} error={createProject.error} success={createProject.success} onSubmit={createProject.submit} onReset={createProject.resetForm} />
      <InvestorProjectList projects={projects} />
    </>; break;
    case "investments": content = <>
      <InvestorInvestmentCreateForm form={createInvestment.form} setForm={createInvestment.setForm} projects={createInvestment.eligibleProjects} creating={createInvestment.creating} error={createInvestment.error} success={createInvestment.success} onSubmit={createInvestment.submit} onReset={createInvestment.resetForm} />
      <InvestorInvestmentsSection investments={investments} />
    </>; break;
    case "requests": content = <InvestorRequestsSection requests={requests} projects={projects} reload={reload} />; break;
    case "documents": content = <InvestorDocumentsSection documents={documents} />; break;
    case "messages": content = <InvestorMessagesSection />; break;
    case "notifications": content = <InvestorNotificationsSection notifications={notifications} />; break;
    case "profile": content = <InvestorProfileSection user={user} profile={profile} fullName={fullName} userPhotoUrl={userPhotoUrl} />; break;
    case "settings": content = <InvestorSettingsSection user={user} />; break;
    default: content = <InvestorDashboardOverview stats={stats} projects={projects} investments={investments} activities={activities} projectCompletion={projectCompletion} completedInvestments={completedInvestments} />;
  }

  return (
    <div className="administrator-shell investor-admin-copy" dir="rtl">
      <InvestorAdminNavbar onToggle={() => setSidebarOpen(value => !value)} />
      {sidebarOpen && <button className="admin-navbar-overlay" aria-label="إغلاق القائمة" onClick={() => setSidebarOpen(false)} />}
      <div className="admin-main-content">
        <header className="soft-admin-topbar">
          <div className="soft-admin-breadcrumb">
            <span>الوكالة الجزائرية لترقية الاستثمار</span><b>/</b><strong>{current}</strong>
          </div>
          <div className="soft-admin-topbar-actions">
            <label className="soft-admin-search"><Search size={15} /><input placeholder="اكتب هنا للبحث..." aria-label="بحث المستثمر" /></label>
            <button className="soft-admin-icon-button" type="button" aria-label={lightMode ? "الوضع الداكن" : "الوضع الفاتح"} title={lightMode ? "الوضع الداكن" : "الوضع الفاتح"} onClick={toggleTheme}>
              {lightMode ? <Moon size={17} /> : <Sun size={17} />}
            </button>
            <button className="soft-admin-icon-button" type="button" aria-label="الإشعارات" onClick={() => navigate("/investor/dashboard/notifications")}><Bell size={17} /></button>
            <div className="soft-admin-profile">
              <span>{String(user?.prenom ?? user?.nom ?? "A").slice(0, 1).toUpperCase()}</span>
              <div><strong>{fullName || "مستثمر"}</strong><small>المستثمر</small></div>
            </div>
          </div>
        </header>
        <main className="admin-dashboard-main investor-dashboard-admin-main">
          {content}
        </main>
      </div>
    </div>
  );
}
