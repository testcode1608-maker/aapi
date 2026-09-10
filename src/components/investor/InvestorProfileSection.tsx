import type { DashboardProfile, DashboardUser } from "../../types/investorDashboard";

interface Props { user: DashboardUser | null; profile: DashboardProfile | null; fullName: string; initials: string; userPhotoUrl: string; }

export default function InvestorProfileSection({ user, profile, fullName, initials, userPhotoUrl }: Props) {
  const location = `${profile?.wilaya || "—"}${profile?.commune ? ` · ${profile.commune}` : ""}`;
  return (
    <section className="investor-dashboard-section">
      <div className="investor-dashboard-page-header"><div><span className="investor-dashboard-overline">الحساب</span><h1>ملفي الشخصي</h1><p>معلومات المستثمر المسجلة في قاعدة البيانات.</p></div></div>
      <div className="investor-dashboard-card investor-dashboard-profile">
        <div className="investor-dashboard-profile-avatar">{userPhotoUrl ? <img src={userPhotoUrl} alt={fullName} /> : initials}</div>
        <div className="investor-dashboard-profile-info"><h2>{fullName}</h2><span>{user?.email || "—"}</span><span>{user?.telephone || "لا يوجد رقم هاتف"}</span><span>{profile?.nom_entreprise || "مستثمر فردي"}</span><span>{location}</span></div>
      </div>
      <div className="investor-dashboard-grid">
        <InfoCard title="معلومات المستثمر" overline="البيانات الشخصية" items={[
          ["bi-person", "الاسم الكامل", fullName], ["bi-envelope", "البريد الإلكتروني", user?.email || "—"], ["bi-telephone", "الهاتف", user?.telephone || "—"]
        ]} />
        <InfoCard title="معلومات النشاط" overline="الشركة" items={[
          ["bi-building", "المؤسسة", profile?.nom_entreprise || "—"], ["bi-briefcase", "النشاط", profile?.secteur_activite || "—"], ["bi-geo-alt", "الموقع", location]
        ]} />
      </div>
    </section>
  );
}

function InfoCard({ title, overline, items }: { title: string; overline: string; items: string[][] }) {
  return <div className="investor-dashboard-card"><div className="investor-dashboard-card-header"><div><span className="investor-dashboard-card-overline">{overline}</span><h2>{title}</h2></div></div><div className="investor-dashboard-settings-list">{items.map(([icon, label, value]) => <div className="investor-dashboard-setting-item" key={label}><div className="investor-dashboard-setting-icon"><i className={`bi ${icon}`} /></div><div><strong>{label}</strong><span>{value}</span></div></div>)}</div></div>;
}
