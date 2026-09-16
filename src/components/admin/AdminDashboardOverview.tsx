import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Bell, BarChart3, BriefcaseBusiness, CheckCircle2, Clock3, FolderKanban, RefreshCw, Search, TrendingUp, Users, Wallet } from "lucide-react";
import { useTranslation } from "../../i18n/I18nProvider";

const API = "http://localhost/aapi-api/auth/admin/admin.php";
type R = Record<string, any>;

function Stat({ icon, title, value, trend }: { icon: ReactNode; title: string; value: any; trend?: string }) {
  return <div className="admin-kpi-card soft-ui-kpi"><div className="admin-kpi-icon">{icon}</div><div className="admin-kpi-content"><span>{title}</span><strong>{typeof value === "number" ? value.toLocaleString("fr-DZ") : value}</strong>{trend && <small><TrendingUp size={12} /> {trend}</small>}</div><TrendingUp className="admin-kpi-arrow" size={17} /></div>;
}

function Progress({ title, value, total }: { title: string; value: any; total: any }) {
  const p = Number(total) ? Math.min(100, Math.round(Number(value) / Number(total) * 100)) : 0;
  return <div className="admin-progress-item"><div className="admin-progress-top"><span>{title}</span><strong>{p}%</strong></div><div className="admin-progress-bar"><span style={{ "--progress": `${p}%` } as CSSProperties} /></div></div>;
}

function InvestmentLineChart({ values, ariaLabel }: { values: number[]; ariaLabel: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const draw = () => {
      const dpr = Math.max(1, window.devicePixelRatio || 1), width = Math.max(320, parent.clientWidth), height = 300;
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
      const ctx = canvas.getContext("2d"); if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
      const pad = { top: 18, right: 18, bottom: 38, left: 42 }, w = width - pad.left - pad.right, h = height - pad.top - pad.bottom;
      const max = Math.max(...values, 1), min = 0;
      ctx.strokeStyle = "rgba(255,255,255,.07)"; ctx.lineWidth = 1; ctx.font = "10px Segoe UI, Arial"; ctx.fillStyle = "#707982"; ctx.textAlign = "right";
      for (let i = 0; i <= 4; i++) { const y = pad.top + h * i / 4; ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(width - pad.right, y); ctx.stroke(); ctx.fillText(`${Math.round(max * (1 - i / 4)).toLocaleString("fr-DZ")}`, pad.left - 8, y + 3); }
      const points = values.map((v, i) => ({ x: values.length === 1 ? pad.left + w / 2 : pad.left + w * i / (values.length - 1), y: pad.top + h - (Math.max(min, v) / max) * h }));
      if (!points.length) return;
      const gradient = ctx.createLinearGradient(0, pad.top, 0, pad.top + h); gradient.addColorStop(0, "rgba(8,116,67,.30)"); gradient.addColorStop(1, "rgba(8,116,67,0)");
      ctx.beginPath(); points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.lineTo(points.at(-1)!.x, pad.top + h); ctx.lineTo(points[0].x, pad.top + h); ctx.closePath(); ctx.fillStyle = gradient; ctx.fill();
      ctx.beginPath(); points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.strokeStyle = "#087443"; ctx.lineWidth = 3; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.stroke();
      points.forEach((p, i) => { ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fillStyle = "#c9a227"; ctx.fill(); ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fillStyle = "#fff"; ctx.fill(); ctx.fillStyle = "#707982"; ctx.textAlign = "center"; ctx.fillText(`${i + 1}`, p.x, height - 14); });
    };
    draw(); const ro = new ResizeObserver(draw); ro.observe(parent); window.addEventListener("resize", draw); return () => { ro.disconnect(); window.removeEventListener("resize", draw); };
  }, [values]);
  return <canvas ref={canvasRef} id="chart-line" className="chart-canvas" aria-label={ariaLabel} role="img" />;
}

export default function AdminDashboardOverview({ userId }: { userId: number }) {
  const { t, language } = useTranslation();
  const [data, setData] = useState<R>({}), [loading, setLoading] = useState(true), [error, setError] = useState(""), [query, setQuery] = useState("");
  const locale = language === "ar" ? "ar-DZ" : language === "fr" ? "fr-DZ" : "en-DZ";
  const fmt = useCallback((v: any) => Number(v ?? 0).toLocaleString(locale), [locale]);
  const da = useCallback((v: any) => `${fmt(v)} DA`, [fmt]);
  const userIdOf = useCallback((r: R) => r.user_id ?? r.investor_id ?? r.investisseur_id ?? r.utilisateur_id ?? "—", []);
  const text = useCallback((v: any) => {
    const key = String(v ?? "");
    const translated = t(`admin.dashboard.projectStatuses.${key}`);
    return translated.startsWith("admin.dashboard.") ? key.replaceAll("_", " ") : translated;
  }, [t]);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await fetch(`${API}?action=dashboard&user_id=${userId}`); const j = await r.json(); if (!j.success) throw Error(j.message || "تعذر تحميل لوحة التحكم"); setData(j); setError(""); }
    catch (e) { setError(e instanceof Error ? e.message : "حدث خطأ"); }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { void load(); }, [load]);
  const s = data.stats ?? {};
  const inv = { total: Number(s.investments_total ?? data.investments?.total ?? 0), en_attente: Number(s.investments_pending ?? data.investments?.en_attente ?? 0), valide: Number(s.investments_validated ?? data.investments?.valide ?? 0), en_cours: Number(s.investments_active ?? data.investments?.en_cours ?? 0), termine: Number(s.investments_completed ?? data.investments?.termine ?? 0), annule: Number(s.investments_cancelled ?? data.investments?.annule ?? 0), montant_effectif: Number(s.total_investment ?? data.investments?.montant_effectif ?? 0) };
  const projects = Array.isArray(data.projects) ? data.projects : Array.isArray(data.recent_projects) ? data.recent_projects : [];
  const total = Number(s.projects_total ?? s.total_projects ?? s.projects_count ?? projects.length), approved = Number(s.projects_approuve ?? s.projects_approved ?? s.approuve ?? 0), active = Number(s.projects_en_cours ?? s.projects_active ?? s.en_cours ?? 0), investors = Number(s.investors_total ?? s.investisseurs ?? s.investors_count ?? 0), approval = Number(s.projects_approved_percent ?? (total ? approved / total * 100 : 0)), activePct = Number(s.projects_active_percent ?? (total ? active / total * 100 : 0)), documentsValid = Number(s.documents_valid ?? s.documents_valides ?? s.documents_valide ?? 0), docPct = Number(s.documents_valid_percent ?? (documentsValid && Number(s.documents_total) ? documentsValid / Number(s.documents_total) * 100 : 0));
  const chart = useMemo(() => { const values = projects.slice(0, 8).map((p: R) => Number(p.montant_investissement ?? p.montant ?? 0)); return values.length ? values : [28, 48, 38, 70, 52, 82, 62]; }, [projects]);
  const filtered = projects.filter((p: R) => !query.trim() || `${p.titre ?? p.nom ?? ""} ${p.wilaya ?? ""} ${userIdOf(p)}`.toLowerCase().includes(query.toLowerCase()));
  const user = getUser();
  const searchPlaceholder = t("admin.topbar.search");

  return <div className="admin-dashboard soft-ui-dashboard">
    <div className="soft-admin-topbar"><div className="soft-admin-breadcrumb"><span>{t("admin.topbar.agency")}</span><b>/</b><strong>{t("admin.dashboard.title")}</strong></div><div className="soft-admin-topbar-actions"><label className="soft-admin-search"><Search size={15} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder={searchPlaceholder} aria-label={t("admin.topbar.searchAria")} /></label><button className="soft-admin-icon-button" title={t("admin.topbar.notifications")} aria-label={t("admin.topbar.notifications")}><Bell size={16} /></button><div className="soft-admin-profile"><span>{String(user?.prenom ?? user?.nom ?? "A").slice(0, 2).toUpperCase()}</span><div><strong>{`${user?.prenom ?? ""} ${user?.nom ?? ""}`.trim() || "Administrateur"}</strong><small>{t("admin.brand.systemAdmin")}</small></div></div></div></div>
    <header className="admin-dashboard-main"><div className="admin-dashboard-header-content"><div className="admin-dashboard-welcome"><span className="admin-dashboard-eyebrow">{t("admin.dashboard.eyebrow")}</span><h1>{t("admin.dashboard.title")}</h1><p>{t("admin.dashboard.subtitle")}</p></div><button className="admin-refresh-button" onClick={() => void load()} disabled={loading}><RefreshCw size={16} /> {loading ? t("admin.dashboard.refreshing") : t("admin.dashboard.refresh")}</button></div></header>
    {error && <div className="admin-dashboard-error"><span>{error}</span><button onClick={() => void load()}>{t("admin.dashboard.retry")}</button></div>}
    <main className="admin-dashboard-main">
      <div className="admin-kpi-grid soft-ui-kpi-grid"><Stat icon={<FolderKanban size={20} />} title={t("admin.dashboard.projectsTotal")} value={total} trend={t("admin.dashboard.projectActivity")} /><Stat icon={<Users size={20} />} title={t("admin.dashboard.investors")} value={investors} trend={t("admin.dashboard.registeredUsers")} /><Stat icon={<Wallet size={20} />} title={t("admin.dashboard.investmentValue")} value={da(inv.montant_effectif)} trend={t("admin.dashboard.totalValue")} /><Stat icon={<BriefcaseBusiness size={20} />} title={t("admin.dashboard.jobs")} value={s.jobs_total ?? s.total_jobs ?? 0} trend={t("admin.dashboard.jobOpportunities")} /></div>
      <div className="soft-ui-summary-grid"><section className="admin-panel soft-ui-chart-card"><div className="admin-panel-header"><div><span className="soft-ui-card-label">{t("admin.dashboard.analytics")}</span><h2>{t("admin.dashboard.investmentActivity")}</h2></div><span className="soft-ui-positive"><TrendingUp size={14} /> {t("admin.dashboard.activityGrowth")}</span></div><div className="soft-ui-chart"><InvestmentLineChart values={chart} ariaLabel={t("admin.dashboard.investmentActivity")} /></div></section><section className="admin-panel soft-ui-overview-card"><div className="admin-panel-header"><div><span className="soft-ui-card-label">{t("admin.dashboard.overview")}</span><h2>{t("admin.dashboard.projectSummary")}</h2></div><BarChart3 size={18} /></div><div className="admin-circular-stats"><div><div className="admin-circular-progress" style={{ "--progress": Math.max(0, Math.min(100, approval)) } as CSSProperties}><div className="admin-circular-inner">{fmt(approved)}<small> / {fmt(total)}</small></div></div><div className="admin-circular-info">{t("admin.dashboard.approvedProjects")}</div></div><div><div className="admin-circular-progress" style={{ "--progress": Math.max(0, Math.min(100, activePct)) } as CSSProperties}><div className="admin-circular-inner">{fmt(active)}<small> / {fmt(total)}</small></div></div><div className="admin-circular-info">{t("admin.dashboard.activeProjects")}</div></div></div></section></div>
      <div className="admin-analytics-grid"><section className="admin-panel"><div className="admin-panel-header"><div><span className="soft-ui-card-label">{t("admin.dashboard.investmentStatus")}</span><h2>{t("admin.dashboard.investmentStatus")}</h2></div><Wallet size={18} /></div><div className="admin-progress-list"><Progress title={t("admin.dashboard.pending")} value={inv.en_attente} total={inv.total} /><Progress title={t("admin.dashboard.approved")} value={inv.valide} total={inv.total} /><Progress title={t("admin.dashboard.active")} value={inv.en_cours} total={inv.total} /><Progress title={t("admin.dashboard.completed")} value={inv.termine} total={inv.total} /><Progress title={t("admin.dashboard.cancelled")} value={inv.annule} total={inv.total} /></div></section><section className="admin-panel soft-ui-health"><div className="admin-panel-header"><div><span className="soft-ui-card-label">{t("admin.dashboard.systemStatus")}</span><h2>{t("admin.dashboard.systemStatus")}</h2></div><CheckCircle2 size={18} /></div><div className="soft-ui-health-item"><span>{t("admin.dashboard.validDocuments")}</span><strong>{fmt(documentsValid)}</strong><b>{Math.round(docPct)}%</b></div><div className="soft-ui-health-item"><span>{t("admin.dashboard.approvedProjects")}</span><strong>{fmt(approved)}</strong><b>{Math.round(approval)}%</b></div><div className="soft-ui-health-item"><span>{t("admin.dashboard.activeProjects")}</span><strong>{fmt(active)}</strong><b>{Math.round(activePct)}%</b></div></section></div>
      <section className="admin-recent-projects soft-ui-table-card"><header><div><span className="soft-ui-card-label">{t("admin.dashboard.recentActivity")}</span><h2>{t("admin.dashboard.recentProjects")}</h2></div><span className="soft-ui-table-count">{fmt(filtered.length)} {t("admin.dashboard.projectsCount")}</span></header><div className="admin-project-table-wrapper"><table className="admin-project-table"><thead><tr><th>{t("admin.dashboard.project")}</th><th>{t("admin.dashboard.investor")}</th><th>{t("admin.dashboard.wilaya")}</th><th>{t("admin.dashboard.status")}</th><th>{t("admin.dashboard.value")}</th></tr></thead><tbody>{filtered.slice(0, 8).map((p: R, i: number) => <tr key={p.id ?? i}><td className="admin-project-name">{p.titre ?? p.nom ?? t("admin.dashboard.newProject")}</td><td>{userIdOf(p)}</td><td>{p.wilaya ?? "—"}</td><td><span className={`admin-status-badge status-${p.statut}`}>{text(p.statut)}</span></td><td>{da(p.montant_investissement ?? p.montant ?? 0)}</td></tr>)}</tbody></table>{filtered.length === 0 && <div className="admin-empty-state">{t("admin.dashboard.noMatchingProjects")}</div>}</div></section>
      <section className="soft-ui-orders"><div className="soft-ui-orders-head"><div><span className="soft-ui-card-label">{t("admin.dashboard.activity")}</span><h2>{t("admin.dashboard.recentOperations")}</h2></div><Clock3 size={18} /></div>{projects.slice(0, 5).map((p: R, i: number) => <div className="soft-ui-order" key={p.id ?? i}><div className="soft-ui-order-icon"><CheckCircle2 size={15} /></div><div><strong>{p.titre ?? p.nom ?? t("admin.dashboard.newProject")}</strong><span>{text(p.statut)} · {p.wilaya ?? t("admin.dashboard.defaultWilaya")}</span></div><time>{i === 0 ? t("admin.dashboard.now") : `${i} ${t("admin.dashboard.days")}`}</time></div>)}{projects.length === 0 && <div className="admin-empty-state">{t("admin.dashboard.noMatchingProjects")}</div>}</section>
    </main>
  </div>;
}

function getUser(): R | null { try { const x = localStorage.getItem("aapi_user"), u = x ? JSON.parse(x) : null; return u && typeof u === "object" ? u : null; } catch { return null; } }
