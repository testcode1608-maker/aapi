import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { BarChart3, BriefcaseBusiness, FolderKanban, RefreshCw, TrendingUp, Users, Wallet, ArrowUpRight, Clock3, CheckCircle2 } from "lucide-react";

const API = "http://localhost/aapi-api/auth/admin/admin.php";
type R = Record<string, any>;

const labels: Record<string, string> = { brouillon: "مسودة", soumis: "مُرسل", en_etude: "قيد الدراسة", approuve: "مقبول", en_cours: "قيد التنفيذ", realise: "منجز", rejete: "مرفوض", archive: "مؤرشف" };
const text = (v: any) => labels[String(v ?? "")] ?? String(v ?? "—").replaceAll("_", " ");
const fmt = (v: any) => Number(v ?? 0).toLocaleString("fr-DZ");
const da = (v: any) => `${fmt(v)} DA`;
const userIdOf = (r: R) => r.user_id ?? r.investor_id ?? r.investisseur_id ?? r.utilisateur_id ?? "—";

function Stat({ icon, title, value, trend }: { icon: ReactNode; title: string; value: any; trend?: string }) {
  return <div className="admin-kpi-card soft-ui-kpi"><div className="admin-kpi-icon">{icon}</div><div className="admin-kpi-content"><span>{title}</span><strong>{typeof value === "number" ? fmt(value) : value}</strong>{trend && <small><ArrowUpRight size={12} /> {trend}</small>}</div><TrendingUp className="admin-kpi-arrow" size={17} /></div>;
}

function Progress({ title, value, total }: { title: string; value: any; total: any }) {
  const p = Number(total) ? Math.min(100, Math.round(Number(value) / Number(total) * 100)) : 0;
  return <div className="admin-progress-item"><div className="admin-progress-top"><span>{title}</span><strong>{p}%</strong></div><div className="admin-progress-bar"><span style={{ "--progress": `${p}%` } as CSSProperties} /></div></div>;
}

export default function AdminDashboardOverview({ userId }: { userId: number }) {
  const [data, setData] = useState<R>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}?action=dashboard&user_id=${userId}`);
      const j = await r.json();
      if (!j.success) throw Error(j.message || "تعذر تحميل لوحة التحكم");
      setData(j); setError("");
    } catch (e) { setError(e instanceof Error ? e.message : "حدث خطأ"); }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { void load(); }, [load]);

  const s = data.stats ?? {};
  const inv = {
    total: Number(s.investments_total ?? data.investments?.total ?? 0),
    en_attente: Number(s.investments_pending ?? data.investments?.en_attente ?? 0),
    valide: Number(s.investments_validated ?? data.investments?.valide ?? 0),
    en_cours: Number(s.investments_active ?? data.investments?.en_cours ?? 0),
    termine: Number(s.investments_completed ?? data.investments?.termine ?? 0),
    annule: Number(s.investments_cancelled ?? data.investments?.annule ?? 0),
    montant_effectif: Number(s.total_investment ?? data.investments?.montant_effectif ?? 0),
  };
  const projects = Array.isArray(data.projects) ? data.projects : Array.isArray(data.recent_projects) ? data.recent_projects : [];
  const projectCounts = projects.reduce((a: R, p: R) => { a.total++; if (p.statut === "approuve") a.approved++; if (p.statut === "en_cours") a.active++; return a; }, { total: 0, approved: 0, active: 0 });
  const total = Number(s.projects_total ?? s.total_projects ?? s.projects_count ?? projectCounts.total ?? 0);
  const approved = Number(s.projects_approuve ?? s.projects_approved ?? s.approuve ?? projectCounts.approved ?? 0);
  const active = Number(s.projects_en_cours ?? s.projects_active ?? s.en_cours ?? projectCounts.active ?? 0);
  const investors = Number(s.investors_total ?? s.investisseurs ?? s.investors_count ?? 0);
  const approval = Number(s.projects_approved_percent ?? (total ? approved / total * 100 : 0));
  const activePct = Number(s.projects_active_percent ?? (total ? active / total * 100 : 0));
  const documentsValid = Number(s.documents_valid ?? s.documents_valides ?? s.documents_valide ?? 0);
  const docPct = Number(s.documents_valid_percent ?? (documentsValid && Number(s.documents_total) ? documentsValid / Number(s.documents_total) * 100 : 0));
  const chart = useMemo(() => {
    const values = projects.slice(0, 7).map((p: R) => Number(p.montant_investissement ?? p.montant ?? 0));
    const max = Math.max(...values, 1);
    return values.map(v => Math.max(8, Math.round(v / max * 100)));
  }, [projects]);

  return <div className="admin-dashboard soft-ui-dashboard">
    <header className="admin-dashboard-header"><div className="admin-dashboard-header-content"><div className="admin-dashboard-welcome"><span className="admin-dashboard-eyebrow">AAPI / ADMINISTRATION</span><h1>لوحة التحكم</h1><p>نظرة شاملة وفورية على نشاط الوكالة والاستثمار.</p></div><button className="admin-refresh-button" onClick={() => void load()} disabled={loading}><RefreshCw size={16} /> {loading ? "جاري التحديث" : "تحديث البيانات"}</button></div></header>
    {error && <div className="admin-dashboard-error"><span>{error}</span><button onClick={() => void load()}>إعادة المحاولة</button></div>}
    <main className="admin-dashboard-main">
      <div className="admin-kpi-grid soft-ui-kpi-grid">
        <Stat icon={<FolderKanban size={20} />} title="إجمالي المشاريع" value={total} trend="نشاط المشاريع" />
        <Stat icon={<Users size={20} />} title="المستثمرون" value={investors} trend="المستخدمون المسجلون" />
        <Stat icon={<Wallet size={20} />} title="قيمة الاستثمارات" value={da(inv.montant_effectif)} trend="القيمة الإجمالية" />
        <Stat icon={<BriefcaseBusiness size={20} />} title="مناصب العمل" value={s.jobs_total ?? s.total_jobs ?? 0} trend="فرص العمل" />
      </div>

      <div className="soft-ui-summary-grid">
        <section className="admin-panel soft-ui-chart-card"><div className="admin-panel-header"><div><span className="soft-ui-card-label">ANALYTICS</span><h2>نشاط الاستثمارات</h2></div><span className="soft-ui-positive"><TrendingUp size={14} /> نمو النشاط</span></div><div className="soft-ui-chart"><div className="soft-ui-chart-grid"><span /><span /><span /><span /></div><div className="soft-ui-bars">{(chart.length ? chart : [28, 48, 38, 70, 52, 82, 62]).map((h, i) => <div className="soft-ui-bar-wrap" key={i}><div className="soft-ui-bar" style={{ height: `${h}%` }} /><small>{i + 1}</small></div>)}</div></div></section>
        <section className="admin-panel soft-ui-overview-card"><div className="admin-panel-header"><div><span className="soft-ui-card-label">OVERVIEW</span><h2>ملخص المشاريع</h2></div><BarChart3 size={18} /></div><div className="admin-circular-stats"><div><div className="admin-circular-progress" style={{ "--progress": Math.max(0, Math.min(100, approval)) } as CSSProperties}><div className="admin-circular-inner">{fmt(approved)}<small> / {fmt(total)}</small></div></div><div className="admin-circular-info">المشاريع المقبولة</div></div><div><div className="admin-circular-progress" style={{ "--progress": Math.max(0, Math.min(100, activePct)) } as CSSProperties}><div className="admin-circular-inner">{fmt(active)}<small> / {fmt(total)}</small></div></div><div className="admin-circular-info">المشاريع النشطة</div></div></div></section>
      </div>

      <div className="admin-analytics-grid">
        <section className="admin-panel"><div className="admin-panel-header"><div><span className="soft-ui-card-label">INVESTMENTS</span><h2>حالة الاستثمارات</h2></div><Wallet size={18} /></div><div className="admin-progress-list"><Progress title="في الانتظار" value={inv.en_attente} total={inv.total} /><Progress title="مقبولة" value={inv.valide} total={inv.total} /><Progress title="قيد التنفيذ" value={inv.en_cours} total={inv.total} /><Progress title="منتهية" value={inv.termine} total={inv.total} /><Progress title="ملغاة" value={inv.annule} total={inv.total} /></div></section>
        <section className="admin-panel soft-ui-health"><div className="admin-panel-header"><div><span className="soft-ui-card-label">SYSTEM STATUS</span><h2>حالة الوكالة</h2></div><CheckCircle2 size={18} /></div><div className="soft-ui-health-item"><span>الوثائق السليمة</span><strong>{fmt(documentsValid)}</strong><b>{Math.round(docPct)}%</b></div><div className="soft-ui-health-item"><span>المشاريع المقبولة</span><strong>{fmt(approved)}</strong><b>{Math.round(approval)}%</b></div><div className="soft-ui-health-item"><span>المشاريع النشطة</span><strong>{fmt(active)}</strong><b>{Math.round(activePct)}%</b></div></section>
      </div>

      <section className="admin-recent-projects soft-ui-table-card"><header><div><span className="soft-ui-card-label">RECENT ACTIVITY</span><h2>آخر المشاريع</h2></div><span className="soft-ui-table-count">{fmt(projects.length)} مشاريع</span></header><div className="admin-project-table-wrapper"><table className="admin-project-table"><thead><tr><th>المشروع</th><th>المستثمر</th><th>الولاية</th><th>الحالة</th><th>القيمة</th></tr></thead><tbody>{projects.slice(0, 8).map((p: R, i: number) => <tr key={p.id ?? i}><td className="admin-project-name">{p.titre ?? p.nom ?? "مشروع"}</td><td>{userIdOf(p)}</td><td>{p.wilaya ?? "—"}</td><td><span className={`admin-status-badge status-${p.statut}`}>{text(p.statut)}</span></td><td>{da(p.montant_investissement ?? p.montant ?? 0)}</td></tr>)}</tbody></table>{projects.length === 0 && <div className="admin-empty-state">لا توجد مشاريع حالياً.</div>}</div></section>

      <section className="soft-ui-orders"><div className="soft-ui-orders-head"><div><span className="soft-ui-card-label">ACTIVITY</span><h2>آخر العمليات</h2></div><Clock3 size={18} /></div>{projects.slice(0, 5).map((p: R, i: number) => <div className="soft-ui-order" key={p.id ?? i}><div className="soft-ui-order-icon"><CheckCircle2 size={15} /></div><div><strong>{p.titre ?? p.nom ?? "مشروع جديد"}</strong><span>{text(p.statut)} · {p.wilaya ?? "الجزائر"}</span></div><time>{i === 0 ? "الآن" : `${i} يوم`}</time></div>)}{projects.length === 0 && <div className="admin-empty-state">لا توجد عمليات حديثة.</div>}</section>
    </main>
  </div>;
}
