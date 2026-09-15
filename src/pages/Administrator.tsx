import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Bell, Search } from "lucide-react";
import "../styles/main.css";
import "../styles/admin-quick-theme.css";
import "../styles/admin-theme.css";
import "../styles/admin-toolbar.css";
import "../styles/admin-soft-ui.css";
import "../styles/admin-layout-fix.css";
import "../styles/admin-soft-ui-overrides.css";
import "../styles/admin-navbar-overrides.css";
import "../styles/admin-chart-canvas.css";
import AdminNavbar from "../components/admin/AdminNavbar";
import AdminDashboardOverview from "../components/admin/AdminDashboardOverview";
import AdminDataPage from "../components/admin/AdminDataPage";

type R = Record<string, any>;
type Section = "dashboard" | "users" | "investors" | "projects" | "investments" | "requests" | "messages" | "documents";

const getUser = (): R | null => {
  try {
    const x = localStorage.getItem("aapi_user");
    const u = x ? JSON.parse(x) : null;
    return u && typeof u === "object" ? u : null;
  } catch { return null; }
};

const names: Record<string, string> = {
  dashboard: "لوحة التحكم", users: "المستخدمون", investors: "المستثمرون", projects: "المشاريع",
  investments: "الاستثمارات", requests: "الطلبات", messages: "الرسائل", documents: "الوثائق", settings: "الإعدادات"
};

export default function Administrator() {
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const user = getUser();
  const userId = Number(user?.id ?? 0);
  const name = loc.pathname.split("/")[2] as Section | undefined;
  const section: Section = name && ["users", "investors", "projects", "investments", "requests", "messages", "documents"].includes(name) ? name : "dashboard";
  const current = names[name ?? "dashboard"] ?? "لوحة التحكم";

  return <div className={`administrator-shell ${open ? "admin-sidebar-open" : ""}`} dir="rtl">
    <AdminNavbar onToggle={() => setOpen(v => !v)} />
    {open && <button className="admin-navbar-overlay" aria-label="إغلاق القائمة" onClick={() => setOpen(false)} />}
    <div className="admin-main-content">
      <header className="soft-admin-topbar">
        <div className="soft-admin-breadcrumb"><span>الوكالة الجزائرية لترقية الاستثمار</span><b>/</b><strong>{current}</strong></div>
        <div className="soft-admin-topbar-actions">
          <label className="soft-admin-search"><Search size={15} /><input placeholder="اكتب هنا للبحث..." aria-label="بحث الإدارة" /></label>
          <button className="soft-admin-icon-button" aria-label="الإشعارات"><Bell size={17} /></button>
          <div className="soft-admin-profile"><span>{String(user?.prenom ?? user?.nom ?? "A").slice(0, 1).toUpperCase()}</span><div><strong>{`${user?.prenom ?? ""} ${user?.nom ?? ""}`.trim() || "Administrateur"}</strong><small>مسؤول النظام</small></div></div>
        </div>
      </header>
      {section === "dashboard" ? <AdminDashboardOverview userId={userId} /> : <AdminDataPage section={section} userId={userId} />}
    </div>
  </div>;
}
