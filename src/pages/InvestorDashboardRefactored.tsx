import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import InvestorDashboardSidebar from "../components/investor/InvestorDashboardSidebar";
import InvestorDashboardTopbar from "../components/investor/InvestorDashboardTopbar";
import InvestorDashboardOverview from "../components/investor/InvestorDashboardOverview";
import InvestorProjectCreateForm from "../components/investor/InvestorProjectCreateForm";
import InvestorProjectList from "../components/investor/InvestorProjectList";
import InvestorInvestmentsSection from "../components/investor/InvestorInvestmentsSection";
import InvestorRequestsSection from "../components/investor/InvestorRequestsSection";
import InvestorDocumentsSection from "../components/investor/InvestorDocumentsSection";
import InvestorMessagesSection from "../components/investor/InvestorMessagesSection";
import InvestorNotificationsSection from "../components/investor/InvestorNotificationsSection";
import InvestorProfileSection from "../components/investor/InvestorProfileSection";
import InvestorSettingsSection from "../components/investor/InvestorSettingsSection";
import useInvestorDashboard from "../hooks/useInvestorDashboard";
import useCreateInvestorProject from "../hooks/useCreateInvestorProject";
import { getFileUrl, getUserFullName } from "../utils/investorDashboard";

export default function InvestorDashboardRefactored() {
  const location = useLocation();
  const navigate = useNavigate();
  const dashboard = useInvestorDashboard();
  const projectCreate = useCreateInvestorProject();

  const dashboardSection = useMemo(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    return parts[2] || "dashboard";
  }, [location.pathname]);

  const navClass = useCallback((section: string) => {
    const active = dashboardSection === section;
    return `investor-dashboard-nav-link${active ? " active" : ""}`;
  }, [dashboardSection]);

  const fullName = getUserFullName(dashboard.user?.prenom, dashboard.user?.nom);
  const userPhotoUrl = getFileUrl(dashboard.user?.photo);

  const logout = useCallback(() => {
    localStorage.removeItem("aapi_user");
    navigate("/login", { replace: true });
  }, [navigate]);

  if (dashboard.loading) {
    return <div className="investor-dashboard-page" dir="rtl"><div className="investor-dashboard-loading"><div className="investor-dashboard-loading-spinner" /><p>جاري تحميل فضاء المستثمر...</p></div></div>;
  }

  if (dashboard.error) {
    return <div className="investor-dashboard-page" dir="rtl"><div className="investor-dashboard-error"><i className="bi bi-exclamation-triangle" /><h2>تعذر تحميل لوحة التحكم</h2><p>{dashboard.error}</p><button type="button" className="investor-dashboard-primary-btn" onClick={() => void dashboard.reload()}><i className="bi bi-arrow-clockwise" /> إعادة المحاولة</button></div></div>;
  }

  const section = (() => {
    switch (dashboardSection) {
      case "projects":
        return <section className="investor-dashboard-section">
          <div className="investor-dashboard-page-header"><div><span className="investor-dashboard-overline">المشاريع</span><h1>مشاريعي</h1><p>إدارة ومتابعة مشاريعك الاستثمارية.</p></div></div>
          <InvestorProjectCreateForm form={projectCreate.form} setForm={projectCreate.setForm} creating={projectCreate.creating} error={projectCreate.error} success={projectCreate.success} onSubmit={projectCreate.submit} onReset={projectCreate.resetForm} />
          <InvestorProjectList projects={dashboard.projects} />
        </section>;
      case "investments": return <InvestorInvestmentsSection investments={dashboard.investments} />;
      case "requests": return <InvestorRequestsSection requests={dashboard.requests} />;
      case "documents": return <InvestorDocumentsSection documents={dashboard.documents} />;
      case "messages": return <InvestorMessagesSection messages={dashboard.messages} />;
      case "notifications": return <InvestorNotificationsSection notifications={dashboard.notifications} />;
      case "profile": return <InvestorProfileSection user={dashboard.user} profile={dashboard.profile} fullName={fullName} userPhotoUrl={userPhotoUrl} />;
      case "settings": return <InvestorSettingsSection user={dashboard.user} />;
      default: return <InvestorDashboardOverview stats={dashboard.stats} projects={dashboard.projects} investments={dashboard.investments} activities={dashboard.activities} projectCompletion={dashboard.projectCompletion} completedInvestments={dashboard.completedInvestments} />;
    }
  })();

  return <div className="investor-dashboard-page" dir="rtl">
    <InvestorDashboardTopbar user={dashboard.user} stats={dashboard.stats} userPhotoUrl={userPhotoUrl} />
    <div className="investor-dashboard-layout">
      <InvestorDashboardSidebar user={dashboard.user} stats={dashboard.stats} projectsCount={dashboard.projects.length} userPhotoUrl={userPhotoUrl} navClass={navClass} onLogout={logout} />
      <main className="investor-dashboard-main">{section}</main>
    </div>
  </div>;
}
