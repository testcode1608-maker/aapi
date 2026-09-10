import { useCallback, useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  RefreshCw,
  Settings,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
  X,
} from "lucide-react";
import "../styles/main.css";

const API = "http://localhost/aapi-api/auth/admin/admin.php";
type AnyRecord = Record<string, any>;
type Section = "dashboard" | "users" | "investors" | "projects" | "investments" | "requests" | "messages" | "documents";

const labels: Record<string, string> = {
  brouillon: "مسودة", soumis: "مُرسل", en_etude: "قيد الدراسة", approuve: "مقبول",
  en_cours: "قيد التنفيذ", realise: "منجز", rejete: "مرفوض", archive: "مؤرشف",
  actif: "نشط", inactif: "غير نشط", suspendu: "موقوف", en_attente: "في الانتظار",
  valide: "مقبول", termine: "منتهي", annule: "ملغى", nouvelle: "جديد", acceptee: "مقبول",
  refusee: "مرفوض", terminee: "منتهٍ", lu: "مقروء", non_lu: "غير مقروء",
  identite: "وثيقة هوية", registre_commerce: "السجل التجاري", document_fiscal: "وثيقة جبائية",
  business_plan: "دراسة جدوى", contrat: "عقد", attestation: "شهادة", certificat: "شهادة", autre: "أخرى",
  personne_physique: "شخص طبيعي", personne_morale: "شخص معنوي", investisseur_etranger: "مستثمر أجنبي",
};
const projectStatuses = ["brouillon", "soumis", "en_etude", "approuve", "en_cours", "realise", "rejete", "archive"];
const userStatuses = ["actif", "inactif", "suspendu"];
const investmentStatuses = ["en_attente", "valide", "en_cours", "termine", "annule"];
const requestStatuses = ["nouvelle", "en_cours", "en_attente", "acceptee", "refusee", "terminee"];
const documentStatuses = ["en_attente", "valide", "rejete"];

const getUser = (): AnyRecord | null => {
  try {
    const raw = localStorage.getItem("aapi_user");
    const user = raw ? JSON.parse(raw) : null;
    return user && typeof user === "object" ? user : null;
  } catch {
    return null;
  }
};
const text = (v: any) => labels[String(v ?? "")] ?? String(v ?? "—").replaceAll("_", " ");
const fmt = (v: any) => Number(v ?? 0).toLocaleString("fr-DZ");
const da = (v: any) => `${fmt(v)} DA`;
const person = (r: AnyRecord) => `${r.prenom ?? ""} ${r.nom ?? ""}`.trim() || r.email || "—";

function AdminNavbar({ onToggle }: { onToggle: () => void }) {
  const nav = useNavigate();
  const user = getUser() ?? {};
  const items: Array<[string, string, ReactNode]> = [
    ["/admin/dashboard", "لوحة التحكم", <LayoutDashboard size={18} />],
    ["/admin/users", "المستخدمون", <Users size={18} />],
    ["/admin/investors", "المستثمرون", <UserCheck size={18} />],
    ["/admin/projects", "المشاريع", <FolderKanban size={18} />],
    ["/admin/investments", "الاستثمارات", <Wallet size={18} />],
    ["/admin/requests", "الطلبات", <ClipboardList size={18} />],
    ["/admin/messages", "الرسائل", <MessageSquare size={18} />],
    ["/admin/documents", "الوثائق", <FileCheck2 size={18} />],
  ];
  const logout = () => { localStorage.removeItem("aapi_user"); nav("/login", { replace: true }); };
  return <>
    <div className="admin-mobile-header"><button className="admin-mobile-menu-button" onClick={onToggle}><Menu size={20} /></button><strong>AAPI</strong></div>
    <aside className="admin-navbar">
      <div className="admin-navbar-brand"><button className="admin-navbar-brand-button" onClick={() => nav("/admin/dashboard")}><span className="admin-navbar-logo">A</span><span className="admin-navbar-brand-text"><strong>AAPI</strong><small>الإدارة المركزية</small></span></button><button className="admin-navbar-mobile-close" onClick={onToggle}><X size={18} /></button></div>
      <div className="admin-navbar-user"><span className="admin-navbar-user-avatar">{String(user.prenom ?? user.nom ?? "A").slice(0, 2).toUpperCase()}</span><span className="admin-navbar-user-info"><strong>{`${user.prenom ?? ""} ${user.nom ?? ""}`.trim() || user.email || "Administrateur"}</strong><span>مسؤول النظام</span></span></div>
      <nav className="admin-navbar-menu"><div className="admin-navbar-section"><div className="admin-navbar-section-title">الإدارة</div><div className="admin-navbar-section-items">{items.map(([to, name, icon]) => <NavLink key={to} to={to} className={({ isActive }) => `admin-nav-link${isActive ? " active" : ""}`}><span className="admin-nav-icon">{icon}</span><span className="admin-nav-label">{name}</span></NavLink>)}</div></div><div className="admin-navbar-section"><div className="admin-navbar-section-title">النظام</div><div className="admin-navbar-section-items"><NavLink to="/admin/settings" className={({ isActive }) => `admin-nav-link${isActive ? " active" : ""}`}><span className="admin-nav-icon"><Settings size={18} /></span><span className="admin-nav-label">الإعدادات</span></NavLink></div></div></nav>
      <div className="admin-navbar-bottom"><button className="admin-navbar-bottom-button" onClick={() => nav("/")}><Building2 size={17} /> الموقع العام</button><button className="admin-navbar-bottom-button admin-navbar-logout" onClick={logout}><LogOut size={17} /> تسجيل الخروج</button></div>
    </aside>
  </>;
}

function Stat({ icon, title, value }: { icon: ReactNode; title: string; value: any }) { return <div className="admin-kpi-card"><div className="admin-kpi-icon">{icon}</div><div className="admin-kpi-content"><span>{title}</span><strong>{typeof value === "number" ? fmt(value) : value}</strong></div><TrendingUp className="admin-kpi-arrow" size={17} /></div>; }
function Progress({ title, value, total }: { title: string; value: any; total: any }) { const p = Number(total) ? Math.min(100, Math.round(Number(value) / Number(total) * 100)) : 0; return <div className="admin-progress-item"><div className="admin-progress-top"><span>{title}</span><strong>{p}%</strong></div><div className="admin-progress-bar"><span style={{ "--progress": `${p}%` } as CSSProperties} /></div></div>; }
function SelectStatus({ value, options, disabled, onChange }: { value: string; options: string[]; disabled?: boolean; onChange: (v: string) => void }) { return <select className={`status-select status-${value}`} value={value ?? ""} disabled={disabled} onChange={e => onChange(e.target.value)}>{options.map(s => <option key={s} value={s}>{text(s)}</option>)}</select>; }

function Dashboard({ userId }: { userId: number }) {
  const [data, setData] = useState<AnyRecord>({}); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = useCallback(async () => { setLoading(true); setError(""); try { const r = await fetch(`${API}?action=dashboard&user_id=${userId}`); const j = await r.json(); if (!j.success) throw new Error(j.message || "تعذر تحميل لوحة التحكم"); setData(j); } catch (e) { setError(e instanceof Error ? e.message : "حدث خطأ"); } finally { setLoading(false); } }, [userId]);
  useEffect(() => { void load(); }, [load]);
  const s = data.stats ?? {}; const inv = data.investments ?? {}; const projects = Array.isArray(data.projects) ? data.projects : Array.isArray(data.recent_projects) ? data.recent_projects : []; const total = Number(s.projects_total ?? s.total_projects ?? s.total ?? 0); const approved = Number(s.projects_approuve ?? s.approuve ?? 0); const active = Number(s.projects_en_cours ?? s.en_cours ?? 0); const investors = Number(s.investors_total ?? s.investisseurs ?? 0); const rate = total ? Math.round(approved / total * 100) : 0;
  return <div className="admin-dashboard"><header className="admin-dashboard-header"><div className="admin-dashboard-header-content"><div className="admin-dashboard-welcome"><span className="admin-dashboard-eyebrow">AAPI / ADMIN</span><h1>لوحة التحكم</h1><p>نظرة شاملة على نشاط الوكالة والاستثمار.</p></div><button className="admin-refresh-button" onClick={() => void load()} disabled={loading}><RefreshCw size={16} /> تحديث</button></div></header>{error && <div className="admin-dashboard-error"><span>{error}</span><button onClick={() => void load()}>إعادة المحاولة</button></div>}<main className="admin-dashboard-main"><div className="admin-kpi-grid"><Stat icon={<FolderKanban size={20} />} title="إجمالي المشاريع" value={total} /><Stat icon={<Users size={20} />} title="المستثمرون" value={investors} /><Stat icon={<Wallet size={20} />} title="قيمة الاستثمارات" value={da(s.investments_total ?? inv.montant_total ?? 0)} /><Stat icon={<BriefcaseBusiness size={20} />} title="مناصب العمل" value={s.jobs_total ?? s.total_jobs ?? 0} /></div><div className="admin-analytics-grid"><section className="admin-panel"><div className="admin-panel-header"><h2>مؤشرات المشاريع</h2><BarChart3 size={18} /></div><div className="admin-circular-stats"><div><div className="admin-circular-progress" style={{ "--progress": rate } as CSSProperties}><div className="admin-circular-inner">{rate}%</div></div><div className="admin-circular-info">المشاريع المقبولة</div></div><div><div className="admin-circular-progress" style={{ "--progress": total ? Math.round(active / total * 100) : 0 } as CSSProperties}><div className="admin-circular-inner">{total ? Math.round(active / total * 100) : 0}%</div></div><div className="admin-circular-info">المشاريع النشطة</div></div><div><div className="admin-circular-progress" style={{ "--progress": Number(s.documents_valid_percent ?? 0) } as CSSProperties}><div className="admin-circular-inner">{Number(s.documents_valid_percent ?? 0)}%</div></div><div className="admin-circular-info">الوثائق السليمة</div></div></div></section><section className="admin-panel"><div className="admin-panel-header"><h2>حالة الاستثمارات</h2><Wallet size={18} /></div><div className="admin-progress-list"><Progress title="في الانتظار" value={inv.en_attente ?? 0} total={inv.total ?? 0} /><Progress title="مقبولة" value={inv.valide ?? 0} total={inv.total ?? 0} /><Progress title="قيد التنفيذ" value={inv.en_cours ?? 0} total={inv.total ?? 0} /></div></section></div><section className="admin-recent-projects"><header><h2>آخر المشاريع</h2></header><div className="admin-project-table-wrapper"><table className="admin-project-table"><thead><tr><th>المشروع</th><th>المستثمر</th><th>الولاية</th><th>الحالة</th><th>القيمة</th></tr></thead><tbody>{projects.slice(0, 8).map((p: AnyRecord, i: number) => <tr key={p.id ?? i}><td className="admin-project-name">{p.titre ?? p.nom ?? "مشروع"}</td><td>{p.investisseur ?? person(p)}</td><td>{p.wilaya ?? "—"}</td><td><span className={`admin-status-badge status-${p.statut}`}>{text(p.statut)}</span></td><td>{da(p.montant_investissement ?? p.montant ?? 0)}</td></tr>)}</tbody></table>{projects.length === 0 && <div className="admin-empty-state">لا توجد مشاريع حالياً.</div>}</div></section></main></div>;
}

function DataPage({ section, userId }: { section: Exclude<Section, "dashboard">; userId: number }) {
  const cfg: Record<Exclude<Section, "dashboard">, { title: string; subtitle: string; action: string }> = {
    users: { title: "المستخدمون", subtitle: "إدارة حسابات مستخدمي المنصة", action: "users" },
    investors: { title: "المستثمرون", subtitle: "إدارة ملفات المستثمرين", action: "investors" },
    projects: { title: "المشاريع", subtitle: "متابعة ومراجعة مشاريع الاستثمار", action: "projects" },
    investments: { title: "الاستثمارات", subtitle: "متابعة عمليات الاستثمار", action: "investments" },
    requests: { title: "الطلبات", subtitle: "متابعة طلبات المستثمرين وتحديث حالتها", action: "requests" },
    messages: { title: "الرسائل", subtitle: "إدارة رسائل المستثمرين ومتابعة المقروء وغير المقروء", action: "messages" },
    documents: { title: "الوثائق", subtitle: "مراجعة وثائق المستثمرين والتحقق من حالتها", action: "documents" },
  };
  const c = cfg[section];
  const [rows, setRows] = useState<AnyRecord[]>([]); const [stats, setStats] = useState<AnyRecord>({}); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [search, setSearch] = useState(""); const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const q = new URLSearchParams({ action: c.action, user_id: String(userId) });
      if (search) q.set("search", search);
      if (section === "users" || section === "investors" || section === "requests" || section === "documents") { if (filter !== "all") q.set("statut", filter); }
      if (section === "messages" && filter !== "all") q.set("lu", filter === "read" ? "1" : "0");
      const r = await fetch(`${API}?${q}`); const j = await r.json();
      if (!j.success) throw new Error(j.message || "تعذر تحميل البيانات");
      setRows(Array.isArray(j[section]) ? j[section] : []); setStats(j.stats ?? {});
    } catch (e) { setError(e instanceof Error ? e.message : "حدث خطأ"); } finally { setLoading(false); }
  }, [c.action, filter, search, section, userId]);
  useEffect(() => { void load(); }, [load]);

  const update = async (row: AnyRecord, status: string) => {
    const body: AnyRecord = { user_id: userId, statut: status };
    if (section === "users") { body.action = "update_user_status"; body.target_user_id = row.id; }
    else if (section === "investors") { body.action = "update_investor_status"; body.target_user_id = row.id; }
    else if (section === "projects") { body.action = "update_project_status"; body.project_id = row.id; }
    else if (section === "investments") { body.action = "update_investment_status"; body.investment_id = row.id; }
    else if (section === "requests") { body.action = "update_request_status"; body.request_id = row.id; }
    else if (section === "documents") { body.action = "update_document_status"; body.document_id = row.id; }
    else if (section === "messages") { body.action = status === "1" ? "mark_message_read" : "mark_message_unread"; body.message_id = row.id; delete body.statut; }
    else return;
    try { const r = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); const j = await r.json(); if (!j.success) throw new Error(j.message || "فشل التحديث"); await load(); } catch (e) { setError(e instanceof Error ? e.message : "تعذر التحديث"); }
  };

  const columns = section === "users"
    ? ["المستخدم", "البريد الإلكتروني", "الدور", "الحالة"]
    : section === "investors"
      ? ["المستثمر", "الشركة", "الولاية", "النوع", "الحالة"]
      : section === "projects"
        ? ["المشروع", "المستثمر", "الولاية", "الحالة", "القيمة"]
        : section === "investments"
          ? ["المرجع", "المستثمر", "المشروع", "المبلغ", "الحالة"]
          : section === "requests"
            ? ["الطلب", "المستثمر", "الأولوية", "التاريخ", "الحالة"]
            : section === "messages"
              ? ["المرسل", "الموضوع", "المحتوى", "التاريخ", "الحالة"]
              : ["الوثيقة", "المستثمر", "النوع", "المشروع", "التاريخ", "الحالة"];

  const filterOptions = section === "users" || section === "investors" ? userStatuses
    : section === "requests" ? requestStatuses
      : section === "documents" ? documentStatuses : [];

  return <div className={`admin-${section}-page`}>
    <header className="admin-dashboard-header"><div><span className="admin-section-kicker">AAPI / ADMIN</span><h1>{c.title}</h1><p>{c.subtitle}</p></div><button className="admin-refresh-button" onClick={() => void load()} disabled={loading}><RefreshCw size={16} /> تحديث</button></header>
    <main className={`admin-${section}-content`}>
      <div className="admin-kpi-grid">
        <Stat icon={<Activity size={20} />} title="الإجمالي" value={stats.total ?? rows.length} />
        <Stat icon={<CheckCircle2 size={20} />} title={section === "messages" ? "مقروءة" : section === "documents" ? "مقبولة" : "النشطة / المقبولة"} value={section === "messages" ? (stats.read ?? 0) : section === "documents" ? (stats.valide ?? 0) : (stats.actifs ?? stats.approuve ?? stats.valide ?? stats.acceptee ?? 0)} />
        <Stat icon={<TrendingUp size={20} />} title={section === "messages" ? "غير مقروءة" : section === "documents" ? "في الانتظار" : "قيد المعالجة"} value={section === "messages" ? (stats.unread ?? 0) : section === "documents" ? (stats.en_attente ?? 0) : (stats.en_cours ?? stats.soumis ?? stats.nouvelle ?? 0)} />
        <Stat icon={<BarChart3 size={20} />} title={section === "documents" ? "مرفوضة" : section === "requests" ? "عاجلة" : "النسبة"} value={section === "documents" ? (stats.rejete ?? 0) : section === "requests" ? (stats.urgentes ?? 0) : `${stats.pourcentage_actifs ?? 0}%`} />
      </div>
      <div className="admin-project-filters">
        <div className="project-search"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." /></div>
        {section === "messages" && <select value={filter} onChange={e => setFilter(e.target.value)}><option value="all">كل الرسائل</option><option value="unread">غير مقروءة</option><option value="read">مقروءة</option></select>}
        {filterOptions.length > 0 && <select value={filter} onChange={e => setFilter(e.target.value)}><option value="all">كل الحالات</option>{filterOptions.map(s => <option key={s} value={s}>{text(s)}</option>)}</select>}
      </div>
      {error && <div className="admin-page-error"><span>{error}</span><button onClick={() => void load()}>إعادة المحاولة</button></div>}
      <section className="admin-project-table-card"><div className="table-card-header"><h2>{c.title}</h2><span>{rows.length} سجل</span></div><div className="admin-project-table-wrapper">
        {loading ? <div className="admin-empty-state"><RefreshCw className="spin" size={22} /> جارٍ التحميل...</div> : rows.length === 0 ? <div className="admin-empty-state">لا توجد بيانات مطابقة.</div> : <table className="admin-project-table"><thead><tr>{columns.map(col => <th key={col}>{col}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={r.id ?? i}>
          {section === "users" && <><td className="admin-project-name">{person(r)}</td><td>{r.email}</td><td>{r.role}</td><td><SelectStatus value={r.statut} options={userStatuses} disabled={r.role === "admin"} onChange={v => void update(r, v)} /></td></>}
          {section === "investors" && <><td className="admin-project-name">{person(r)}</td><td>{r.nom_entreprise ?? "—"}</td><td>{r.wilaya ?? "—"}</td><td>{text(r.type_investisseur)}</td><td><SelectStatus value={r.statut} options={userStatuses} onChange={v => void update(r, v)} /></td></>}
          {section === "projects" && <><td className="admin-project-name">{r.titre ?? r.nom ?? "مشروع"}</td><td>{r.investisseur ?? person(r)}</td><td>{r.wilaya ?? "—"}</td><td><SelectStatus value={r.statut} options={projectStatuses} onChange={v => void update(r, v)} /></td><td>{da(r.montant_investissement ?? r.montant ?? 0)}</td></>}
          {section === "investments" && <><td>{r.reference ?? `#${r.id}`}</td><td>{person(r)}</td><td>{r.titre_projet ?? "—"}</td><td>{da(r.montant)}</td><td><SelectStatus value={r.statut} options={investmentStatuses} onChange={v => void update(r, v)} /></td></>}
          {section === "requests" && <><td className="admin-project-name">{r.objet ?? r.type_demande ?? "طلب"}</td><td>{person(r)}</td><td><span className={`admin-status-badge priority-${r.priorite}`}>{text(r.priorite)}</span></td><td>{r.created_at ?? r.date_creation ?? "—"}</td><td><SelectStatus value={r.statut} options={requestStatuses} onChange={v => void update(r, v)} /></td></>}
          {section === "messages" && <><td className="admin-project-name">{r.sender_prenom || r.sender_nom ? `${r.sender_prenom ?? ""} ${r.sender_nom ?? ""}`.trim() : r.sender_email ?? "—"}</td><td>{r.sujet ?? "—"}</td><td className="admin-table-message-preview">{r.contenu ?? "—"}</td><td>{r.created_at ?? "—"}</td><td><button className={`admin-read-toggle ${Number(r.lu) === 1 ? "is-read" : "is-unread"}`} onClick={() => void update(r, Number(r.lu) === 1 ? "0" : "1")}>{Number(r.lu) === 1 ? "مقروء" : "غير مقروء"}</button></td></>}
          {section === "documents" && <><td className="admin-project-name">{r.titre ?? r.nom_original ?? "وثيقة"}</td><td>{person(r)}</td><td>{text(r.type_document)}</td><td>{r.titre_projet ?? "—"}</td><td>{r.uploaded_at ?? "—"}</td><td><SelectStatus value={r.statut} options={documentStatuses} onChange={v => void update(r, v)} /></td></>}
        </tr>)}</tbody></table>}
      </div></section>
    </main>
  </div>;
}

export default function Administrator() {
  const location = useLocation();
  const [mobile, setMobile] = useState(false);
  const user = getUser();
  if (!user || String(user.role).toLowerCase() !== "admin") return null;
  const id = Number(user.id ?? 0);
  const p = location.pathname;
  const section: Section = p.includes("/users") ? "users" : p.includes("/investors") ? "investors" : p.includes("/projects") ? "projects" : p.includes("/investments") ? "investments" : p.includes("/requests") ? "requests" : p.includes("/messages") ? "messages" : p.includes("/documents") ? "documents" : "dashboard";
  return <div dir="rtl" className={`administrator-shell ${mobile ? "admin-mobile-open" : ""}`}><AdminNavbar onToggle={() => setMobile(v => !v)} />{mobile && <button className="admin-navbar-overlay" onClick={() => setMobile(false)} aria-label="إغلاق القائمة" />}{section === "dashboard" ? <Dashboard userId={id} /> : <DataPage section={section} userId={id} />}</div>;
}
