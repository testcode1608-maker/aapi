import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { Bell, Search } from "lucide-react";
import "../styles/main.css";
import "../styles/admin-quick-theme.css";
import "../styles/admin-theme.css";
import "../styles/admin-soft-ui.css";
import "../styles/admin-layout-fix.css";
import "../styles/admin-navbar-overrides.css";
import "../styles/admin-chart-canvas.css";
import "../styles/investor/index.css";
import "../styles/investor-admin-copy.css";
import "../styles/investor-page-header-theme.css";
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
import InvestorFormModal from "../components/investor/InvestorFormModal";
import { useInvestorDashboard } from "../hooks/useInvestorDashboard";
import { useCreateInvestorProject } from "../hooks/useCreateInvestorProject";
import { useCreateInvestorInvestment } from "../hooks/useCreateInvestorInvestment";
import { getUserFullName, getUserInitials, getUserPhotoUrl } from "../utils/investorDashboard";
import { useTranslation } from "../i18n/I18nProvider";

const sectionKeys: Record<string, string> = {
  dashboard: "dashboard",
  projects: "projects",
  investments: "investments",
  requests: "requests",
  documents: "documents",
  messages: "messages",
  notifications: "notifications",
  profile: "profile",
  settings: "settings",
};

export default function InvestorDashboardRefactored() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const direction = language === "ar" ? "rtl" : "ltr";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [investmentFormOpen, setInvestmentFormOpen] = useState(false);
  const { user, profile, stats, projects, investments, requests, documents, notifications, activities, projectCompletion, completedInvestments, loading, error, reload } = useInvestorDashboard();
  const createProject = useCreateInvestorProject(reload);
  const createInvestment = useCreateInvestorInvestment(projects, reload);
  const section = location.pathname.split("/")[3] || "dashboard";
  const fullName = getUserFullName(user);
  const userPhotoUrl = getUserPhotoUrl(user);
  const userInitials = getUserInitials(user?.prenom, user?.nom);
  const currentKey = sectionKeys[section] ?? "dashboard";
  const current = t(`investorDashboard.sidebar.${currentKey}`);

  if (loading) return <div className="administrator-shell investor-admin-copy" dir={direction} lang={language}><div className="investor-dashboard-loading investor-dashboard-rtl" dir={direction}><div className="investor-dashboard-loading-spinner" /><p>{t("investorDashboard.loading")}</p></div></div>;
  if (error) return <div className="administrator-shell investor-admin-copy" dir={direction} lang={language}><div className="investor-dashboard-error-page investor-dashboard-rtl" dir={direction}><div className="investor-dashboard-error-card"><i className="bi bi-exclamation-triangle" /><h2>{t("investorDashboard.errorTitle")}</h2><p>{error}</p><button type="button" className="investor-dashboard-primary-btn" onClick={() => void reload()}>{t("investorDashboard.retry")}</button></div></div></div>;

  let content: ReactNode;
  switch (section) {
    case "projects":
      content = <>
        <div className="investor-dashboard-page-header" dir={direction}><div><span className="investor-dashboard-overline">{t("investorDashboard.projectsOverline")}</span><h1>{t("investorDashboard.projectsTitle")}</h1><p>{t("investorDashboard.projectsDescription")}</p></div><button type="button" className="investor-dashboard-primary-btn" onClick={() => setProjectFormOpen(true)}><i className="bi bi-plus-circle" /> {t("investorDashboard.newProject")}</button></div>
        <InvestorProjectList projects={projects} />
        <InvestorFormModal open={projectFormOpen} onClose={() => setProjectFormOpen(false)}><InvestorProjectCreateForm form={createProject.form} setForm={createProject.setForm} creating={createProject.creating} error={createProject.error} success={createProject.success} onSubmit={createProject.submit} onReset={createProject.resetForm} /></InvestorFormModal>
      </>;
      break;
    case "investments":
      content = <>
        <div className="investor-dashboard-page-header" dir={direction}><div><span className="investor-dashboard-overline">{t("investorDashboard.investmentsOverline")}</span><h1>{t("investorDashboard.investmentsTitle")}</h1><p>{t("investorDashboard.investmentsDescription")}</p></div><button type="button" className="investor-dashboard-primary-btn" onClick={() => setInvestmentFormOpen(true)}><i className="bi bi-plus-circle" /> {t("investorDashboard.newInvestment")}</button></div>
        <InvestorInvestmentsSection investments={investments} />
        <InvestorFormModal open={investmentFormOpen} onClose={() => setInvestmentFormOpen(false)}><InvestorInvestmentCreateForm form={createInvestment.form} setForm={createInvestment.setForm} projects={createInvestment.eligibleProjects} creating={createInvestment.creating} error={createInvestment.error} success={createInvestment.success} onSubmit={createInvestment.submit} onReset={createInvestment.resetForm} /></InvestorFormModal>
      </>;
      break;
    case "requests": content = <InvestorRequestsSection requests={requests} projects={projects} reload={reload} />; break;
    case "documents": content = <InvestorDocumentsSection documents={documents} />; break;
    case "messages": content = <InvestorMessagesSection />; break;
    case "notifications": content = <InvestorNotificationsSection notifications={notifications} />; break;
    case "profile": content = <InvestorProfileSection user={user} profile={profile} fullName={fullName} userPhotoUrl={userPhotoUrl} />; break;
    case "settings": content = <InvestorSettingsSection user={user} />; break;
    default: content = <InvestorDashboardOverview stats={stats} projects={projects} investments={investments} activities={activities} projectCompletion={projectCompletion} completedInvestments={completedInvestments} />;
  }

  return <div className="administrator-shell investor-admin-copy" dir={direction} lang={language}>
    <InvestorAdminNavbar onToggle={() => setSidebarOpen(value => !value)} />
    {sidebarOpen && <button className="admin-navbar-overlay" aria-label={language === "ar" ? "إغلاق القائمة" : "Close menu"} onClick={() => setSidebarOpen(false)} />}
    <div className="admin-main-content" dir={direction}>
      <header className="soft-admin-topbar" dir={direction}>
        <div className="soft-admin-breadcrumb"><span>{t("investorDashboard.topbar.investorSpace")}</span><b>/</b><strong>{current}</strong></div>
        <div className="soft-admin-topbar-actions">
          <label className="soft-admin-search"><Search size={15} /><input placeholder={language === "ar" ? "اكتب هنا للبحث..." : language === "fr" ? "Écrivez ici pour rechercher..." : "Type here to search..."} aria-label={language === "ar" ? "بحث المستثمر" : language === "fr" ? "Recherche investisseur" : "Investor search"} /></label>
          <button className="soft-admin-icon-button" type="button" aria-label={t("investorDashboard.topbar.notifications")} onClick={() => navigate("/investor/dashboard/notifications")}><Bell size={17} /></button>
          <div className="soft-admin-profile">
            {userPhotoUrl ? <img src={userPhotoUrl} alt={fullName || t("investorDashboard.sidebar.investor")} style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover", display: "block", border: "2px solid #087443", flexShrink: 0 }} onError={(event) => { event.currentTarget.style.display = "none"; const fallback = event.currentTarget.nextElementSibling as HTMLElement | null; if (fallback) fallback.style.display = "grid"; }} /> : null}
            <span style={{ width: 42, height: 42, borderRadius: "50%", display: userPhotoUrl ? "none" : "grid", placeItems: "center", background: "#087443", color: "#fff", fontWeight: 800, flexShrink: 0 }}>{userInitials}</span>
            <div><strong>{fullName || t("investorDashboard.sidebar.investor")}</strong><small>{t("investorDashboard.sidebar.investor")}</small></div>
          </div>
        </div>
      </header>
      <main className="admin-dashboard-main investor-dashboard-admin-main" dir={direction}>{content}</main>
    </div>
  </div>;
}
