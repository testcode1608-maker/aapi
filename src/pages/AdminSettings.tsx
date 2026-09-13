import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Building2, Check, LayoutDashboard, LogOut, Menu, Moon, Settings, Users, UserCheck, FolderKanban, Wallet, ClipboardList, MessageSquare, FileCheck2, X, UserRound, Save } from "lucide-react";
import "../styles/admin-theme.css";

const menu = [
  ["/admin/dashboard", "لوحة التحكم", LayoutDashboard],
  ["/admin/users", "المستخدمون", Users],
  ["/admin/investors", "المستثمرون", UserCheck],
  ["/admin/projects", "المشاريع", FolderKanban],
  ["/admin/investments", "الاستثمارات", Wallet],
  ["/admin/requests", "الطلبات", ClipboardList],
  ["/admin/messages", "الرسائل", MessageSquare],
  ["/admin/documents", "الوثائق", FileCheck2],
] as const;

type Theme = "dark" | "light";
type Account = {
  id?: number;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  role?: string;
  statut?: string;
  photo?: string | null;
};

function applyTheme(theme: Theme) {
  document.body.classList.toggle("aapi-admin-light", theme === "light");
  localStorage.setItem("aapi-admin-theme", theme);
  window.dispatchEvent(new CustomEvent("aapi-theme-change", { detail: theme }));
}

function readAccount(): Account {
  try {
    return JSON.parse(localStorage.getItem("aapi_user") || "{}") as Account;
  } catch {
    return {};
  }
}

export default function AdminSettings() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<Theme>(() => localStorage.getItem("aapi-admin-theme") === "light" ? "light" : "dark");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [account, setAccount] = useState<Account>(() => readAccount());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    applyTheme(theme);
    return () => document.body.classList.remove("aapi-admin-light");
  }, [theme]);

  const logout = () => {
    localStorage.removeItem("aapi_user");
    navigate("/login", { replace: true });
  };
  const closeMobile = () => setMobileMenu(false);
  const change = (key: keyof Account, value: string) => setAccount(prev => ({ ...prev, [key]: value }));
  const saveAccount = () => {
    const current = readAccount();
    localStorage.setItem("aapi_user", JSON.stringify({ ...current, ...account }));
    setAccount(prev => ({ ...current, ...prev }));
    setSaved(true);
    window.dispatchEvent(new CustomEvent("aapi-account-change"));
    window.setTimeout(() => setSaved(false), 2200);
  };

  return <div className={`admin-settings-layout${mobileMenu ? " mobile-menu-open" : ""}`} dir="rtl">
    <button className="admin-settings-mobile-bar" type="button" onClick={() => setMobileMenu(true)} aria-label="فتح قائمة الإدارة"><Menu size={20}/><strong>AAPI</strong><span>الإعدادات</span></button>
    {mobileMenu && <button className="admin-settings-mobile-overlay" type="button" aria-label="إغلاق القائمة" onClick={closeMobile}/>} 
    <aside className="admin-settings-sidebar">
      <div className="admin-settings-mobile-head"><strong>AAPI</strong><button type="button" onClick={closeMobile} aria-label="إغلاق"><X size={19}/></button></div>
      <button className="admin-settings-brand" onClick={() => navigate("/admin/dashboard")}><span>A</span><div><strong>AAPI</strong><small>الإدارة المركزية</small></div></button>
      <div className="admin-settings-user"><b>{String(account.prenom ?? account.nom ?? "A").slice(0,2).toUpperCase()}</b><div><strong>{`${account.prenom ?? ""} ${account.nom ?? ""}`.trim() || account.email || "Administrateur"}</strong><small>مسؤول النظام</small></div></div>
      <nav>{menu.map(([path, label, Icon]) => <NavLink key={path} to={path} onClick={closeMobile}><Icon size={17}/><span>{label}</span></NavLink>)}</nav>
      <div className="admin-settings-sidebar-bottom"><button onClick={() => navigate("/")}><Building2 size={16}/> الموقع العام</button><button onClick={logout}><LogOut size={16}/> تسجيل الخروج</button></div>
    </aside>

    <main className="admin-settings-main">
      <header className="admin-settings-header"><div><span>AAPI / SYSTEM</span><h1>الإعدادات</h1><p>إدارة معلومات حساب المسؤول ومظهر لوحة الإدارة.</p></div></header>

      <section className="admin-settings-card">
        <div className="admin-settings-title"><div className="admin-settings-title-icon"><UserRound size={22}/></div><div><h2>معلومات الحساب</h2><p>تعديل المعلومات الشخصية الظاهرة في حساب المسؤول.</p></div></div>
        <div className="admin-account-form">
          <label><span>الاسم</span><input value={account.nom ?? ""} onChange={e => change("nom", e.target.value)} placeholder="الاسم" /></label>
          <label><span>اللقب</span><input value={account.prenom ?? ""} onChange={e => change("prenom", e.target.value)} placeholder="اللقب" /></label>
          <label><span>البريد الإلكتروني</span><input type="email" value={account.email ?? ""} onChange={e => change("email", e.target.value)} placeholder="admin@aapi.dz" /></label>
          <label><span>رقم الهاتف</span><input value={account.telephone ?? ""} onChange={e => change("telephone", e.target.value)} placeholder="رقم الهاتف" /></label>
          <label><span>الدور</span><input value={account.role === "admin" ? "Administrateur" : account.role ?? "—"} readOnly /></label>
          <label><span>حالة الحساب</span><input value={account.statut === "actif" ? "نشط" : account.statut ?? "—"} readOnly /></label>
        </div>
        <div className="admin-account-actions"><button type="button" onClick={saveAccount}><Save size={16}/>{saved ? "تم الحفظ" : "حفظ معلومات الحساب"}</button></div>
      </section>

      <section className="admin-settings-card">
        <div className="admin-settings-title"><div className="admin-settings-title-icon"><Settings size={22}/></div><div><h2>مظهر لوحة التحكم</h2><p>اختر الوضع الذي تريد استخدامه. سيتم حفظ اختيارك تلقائياً.</p></div></div>
        <div className="admin-theme-options">
          <button type="button" className={`admin-theme-choice ${theme === "dark" ? "active" : ""}`} onClick={() => setTheme("dark")}>
            <div className="admin-theme-choice-preview dark"><Moon size={25}/><div><strong>الوضع الداكن</strong><span>Dark Mode</span></div></div><div className="admin-theme-check">{theme === "dark" && <Check size={15}/>}</div>
          </button>
          <button type="button" className={`admin-theme-choice ${theme === "light" ? "active" : ""}`} onClick={() => setTheme("light")}>
            <div className="admin-theme-choice-preview light"><Settings size={25}/><div><strong>الوضع الفاتح</strong><span>Light Mode</span></div></div><div className="admin-theme-check">{theme === "light" && <Check size={15}/>}</div>
          </button>
        </div>
        <div className="admin-settings-current"><span>الوضع الحالي</span><strong>{theme === "dark" ? "الوضع الداكن" : "الوضع الفاتح"}</strong></div>
      </section>
    </main>
  </div>;
}
