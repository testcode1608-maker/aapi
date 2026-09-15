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

const sectionNames: Record<string, string> = {
  dashboard: "لوحة التحكم", projects: "المشاريع", investments: "الاستثمارات",
  requests: "الطلبات", documents: "الوثائق", messages: "الرسائل",
  notifications: "الإشعارات", profile: "الملف الشخصي", settings: "الإعدادات",
};

export default function InvestorDashboardRefactored() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
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
  const current = sectionNames[section] ?? "لوحة التحكم";

  if (loading) return <div className="administrator-shell investor-admin-copy" dir="rtl"><div className="investor-dashboard-loading investor-dashboard-rtl" dir="rtl"><div className="investor-dashboard-loading-spinner" /><p>{t("investorDashboard.loading")}</p></div></div>;
  if (error) return <div className="administrator-shell investor-admin-copy" dir="rtl"><div className="investor-dashboard-error-page investor-dashboard-rtl" dir="rtl"><div className="investor-dashboard-error-card"><i className="bi bi-exclamation-triangle" /><h2>{t("investorDashboard.errorTitle")}</h2><p>{error}</p><button type="button" className="investor-dashboard-primary-btn" onClick={() => void reload()}>{t("common.retry")}</button></div></div></div>;

  let content: ReactNode;
  switch (section) {
    case "projects":
      content = <>
        <div className="investor-dashboard-page-header"><div><span className="investor-dashboard-overline">المشاريع</span><h1>مشاريعي الاستثمارية</h1><p>إدارة ومتابعة مشاريعك الاستثمارية.</p></div><button type="button" className="investor-dashboard-primary-btn" onClick={() => setProjectFormOpen(true)}><i className="bi bi-plus-circle" /> إضافة مشروع</button></div>
        <InvestorProjectList projects={projects} />
        <InvestorFormModal open={projectFormOpen} onClose={() => setProjectFormOpen(false)}><InvestorProjectCreateForm form={createProject.form} setForm={createProject.setForm} creating={createProject.creating} error={createProject.error} success={createProject.success} onSubmit={createProject.submit} onReset={createProject.resetForm} /></InvestorFormModal>
      </>;
      break;
    case "investments":
      content = <>
        <div className="investor-dashboard-page-header"><div><span className="investor-dashboard-overline">الاستثمارات</span><h1>استثماراتي</h1><p>متابعة استثماراتك وتسجيل عمليات استثمار جديدة.</p></div><button type="button" className="investor-dashboard-primary-btn" onClick={() => setInvestmentFormOpen(true)}><i className="bi bi-plus-circle" /> إضافة استثمار</button></div>
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

  return <div className="administrator-shell investor-admin-copy" dir="rtl"><InvestorAdminNavbar onToggle={() => setSidebarOpen(value => !value)} />{sidebarOpen && <button className="admin-navbar-overlay" aria-label="إغلاق القائمة" onClick={() => setSidebarOpen(false)} />}<div className="admin-main-content"><header className="soft-admin-topbar"><div className="soft-admin-breadcrumb"><span>الوكالة الجزائرية لترقية الاستثمار</span><b>/</b><strong>{current}</strong></div><div className="soft-admin-topbar-actions"><label className="soft-admin-search"><Search size={15} /><input placeholder="اكتب هنا للبحث..." aria-label="بحث المستثمر" /></label><button className="soft-admin-icon-button" type="button" aria-label="الإشعارات" onClick={() => navigate("/investor/dashboard/notifications")}><Bell size={17} /></button><div className="soft-admin-profile">{userPhotoUrl ? <img src={userPhotoUrl} alt={fullName || "صورة المستثمر"} style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover", display: "block", border: "2px solid #087443", flexShrink: 0 }} onError={(event) => { event.currentTarget.style.display = "none"; const fallback = event.currentTarget.nextElementSibling as HTMLElement | null; if (fallback) fallback.style.display = "grid"; }} /> : null}<span style={{ width: 42, height: 42, borderRadius: "50%", display: userPhotoUrl ? "none" : "grid", placeItems: "center", background: "#087443", color: "#fff", fontWeight: 800, flexShrink: 0 }}>{userInitials}</span><div><strong>{fullName || "مستثمر"}</strong><small>المستثمر</small></div></div></div></header><main className="admin-dashboard-main investor-dashboard-admin-main">{content}</main></div></div>;
}
