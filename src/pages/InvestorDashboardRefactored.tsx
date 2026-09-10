import { useLocation, useNavigate } from "react-router-dom";
import "../styles/main.css";
import "../styles/investor-dashboard.css";
import "../styles/investor-dashboard-extra.css";
import "../styles/investor-projects.css";
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
import { useInvestorDashboard } from "../hooks/useInvestorDashboard";
import { useCreateInvestorProject } from "../hooks/useCreateInvestorProject";
import { getUserFullName, getUserPhotoUrl } from "../utils/investorDashboard";

export default function InvestorDashboardRefactored() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, stats, projects, investments, requests, documents, messages, notifications, activities, projectCompletion, completedInvestments, loading, error, reload } = useInvestorDashboard();
  const createProject = useCreateInvestorProject(reload);
  const section = location.pathname.split("/")[3] || "dashboard";
  const fullName = getUserFullName(user);
  const userPhotoUrl = getUserPhotoUrl(user);
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
  const navClass = (name: string) => location.pathname === paths[name] ? "investor-dashboard-nav-link active" : "investor-dashboard-nav-link";
  const logout = () => { localStorage.removeItem("aapi_user"); navigate("/login", { replace: true }); };

  if (loading) return <div className="investor-dashboard-loading"><div className="investor-dashboard-loading-spinner"/><p>جاري تحميل لوحة المستثمر...</p></div>;
  if (error) return <div className="investor-dashboard-error"><i className="bi bi-exclamation-triangle"/><h2>تعذر تحميل لوحة المستثمر</h2><p>{error}</p><button className="investor-dashboard-primary-btn" onClick={() => void reload()}>إعادة المحاولة</button></div>;

  let content;
  switch (section) {
    case "projects": content = <><div className="investor-dashboard-page-header"><div><span className="investor-dashboard-overline">الاستثمار</span><h1>مشاريعي الاستثمارية</h1><p>إنشاء ومتابعة المشاريع المرسلة إلى الإدارة.</p></div></div><InvestorProjectCreateForm {...createProject} /><InvestorProjectList projects={projects} /></>; break;
    case "investments": content = <InvestorInvestmentsSection investments={investments} />; break;
    case "requests": content = <InvestorRequestsSection requests={requests} />; break;
    case "documents": content = <InvestorDocumentsSection documents={documents} />; break;
    case "messages": content = <InvestorMessagesSection messages={messages} />; break;
    case "notifications": content = <InvestorNotificationsSection notifications={notifications} />; break;
    case "profile": content = <InvestorProfileSection user={user} profile={profile} fullName={fullName} userPhotoUrl={userPhotoUrl} />; break;
    case "settings": content = <InvestorSettingsSection user={user} />; break;
    default: content = <InvestorDashboardOverview stats={stats} projects={projects} investments={investments} activities={activities} projectCompletion={projectCompletion} completedInvestments={completedInvestments} />;
  }

  return <div className="investor-dashboard-page"><InvestorDashboardTopbar user={user} stats={stats} userPhotoUrl={userPhotoUrl} /><div className="investor-dashboard-layout"><InvestorDashboardSidebar user={user} stats={stats} projectsCount={projects.length} userPhotoUrl={userPhotoUrl} navClass={navClass} onLogout={logout} /><main className="investor-dashboard-main">{content}</main></div></div>;
}
