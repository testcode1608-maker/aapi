import type { DashboardUser } from "../../types/investorDashboard";

interface Props { user: DashboardUser | null; }

export default function InvestorSettingsSection({ user }: Props) {
  const items = [
    ["bi-envelope", "البريد الإلكتروني", user?.email || "—"],
    ["bi-person-badge", "نوع الحساب", "مستثمر"],
    ["bi-shield-check", "حالة الحساب", user?.statut === "actif" ? "حساب نشط" : user?.statut || "—"],
    ["bi-phone", "رقم الهاتف", user?.telephone || "غير مسجل"],
  ];
  return (
    <section className="investor-dashboard-section">
      <div className="investor-dashboard-page-header"><div><span className="investor-dashboard-overline">الحساب</span><h1>الإعدادات</h1><p>معلومات وإعدادات حساب المستثمر.</p></div></div>
      <div className="investor-dashboard-card"><div className="investor-dashboard-settings-list">{items.map(([icon, label, value]) => <div className="investor-dashboard-setting-item" key={label}><div className="investor-dashboard-setting-icon"><i className={`bi ${icon}`} /></div><div><strong>{label}</strong><span>{value}</span></div></div>)}</div></div>
    </section>
  );
}
