import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, RefreshCw, Database, CheckCircle2, Clock3, AlertCircle, ChevronDown } from "lucide-react";
import "../../styles/admin-status-dropdown.css";

const API = "http://localhost/aapi-api/auth/admin/admin.php";
type R = Record<string, any>;
type Section = "users" | "investors" | "projects" | "investments" | "requests" | "messages" | "documents";

const labels: Record<string, string> = {
  id: "المعرف", user_id: "User ID", investor_id: "معرف المستثمر", investisseur_id: "معرف المستثمر", nom: "الاسم", prenom: "اللقب", email: "البريد الإلكتروني", telephone: "الهاتف", role: "الدور", titre: "المشروع", nom_projet: "المشروع", wilaya: "الولاية", secteur: "القطاع", statut: "الحالة", montant: "المبلغ", montant_investissement: "قيمة الاستثمار", montant_effectif: "المبلغ الفعلي", date_creation: "تاريخ الإنشاء", created_at: "تاريخ الإنشاء", updated_at: "آخر تحديث", message: "الرسالة", sujet: "الموضوع", lu: "القراءة", document: "الوثيقة", type: "النوع", description: "الوصف", brouillon: "مسودة", soumis: "مُرسل", en_etude: "قيد الدراسة", approuve: "مقبول", en_cours: "قيد التنفيذ", realise: "منجز", rejete: "مرفوض", archive: "مؤرشف", actif: "نشط", inactif: "غير نشط", suspendu: "موقوف", en_attente: "في الانتظار", valide: "مقبول", termine: "منتهي", annule: "ملغى", nouvelle: "جديد", acceptee: "مقبول", refusee: "مرفوض", terminee: "منتهٍ", lu_status: "مقروء", non_lu: "غير مقروء"
};

const projectStatuses = ["brouillon", "soumis", "en_etude", "approuve", "en_cours", "realise", "rejete", "archive"];
const userStatuses = ["actif", "inactif", "suspendu"];
const investmentStatuses = ["en_attente", "valide", "en_cours", "termine", "annule"];
const requestStatuses = ["nouvelle", "en_cours", "en_attente", "acceptee", "refusee", "terminee"];
const documentStatuses = ["en_attente", "valide", "rejete"];

const text = (v: any) => labels[String(v ?? "")] ?? String(v ?? "—").replaceAll("_", " ");
const fmt = (v: any) => Number(v ?? 0).toLocaleString("fr-DZ");
const da = (v: any) => `${fmt(v)} DA`;
const userIdOf = (r: R) => r.user_id ?? r.investor_id ?? r.investisseur_id ?? r.utilisateur_id ?? "—";
const isRead = (r: R) => r.lu === 1 || r.lu === true || r.statut === "lu";

const config: Record<Section, { title: string; subtitle: string; action: string }> = {
  users: { title: "المستخدمون", subtitle: "إدارة حسابات مستخدمي المنصة", action: "users" },
  investors: { title: "المستثمرون", subtitle: "إدارة ملفات المستثمرين", action: "investors" },
  projects: { title: "المشاريع", subtitle: "متابعة ومراجعة مشاريع الاستثمار", action: "projects" },
  investments: { title: "الاستثمارات", subtitle: "متابعة عمليات الاستثمار", action: "investments" },
  requests: { title: "الطلبات", subtitle: "متابعة طلبات المستثمرين وتحديث حالتها", action: "requests" },
  messages: { title: "الرسائل", subtitle: "إدارة رسائل المستثمرين ومتابعة المقروء وغير المقروء", action: "messages" },
  documents: { title: "الوثائق", subtitle: "مراجعة وثائق المستثمرين والتحقق من حالتها", action: "documents" }
};

export default function AdminDataPage({ section, userId }: { section: Section; userId: number }) {
  const c = config[section];
  const [rows, setRows] = useState<R[]>([]);
  const [stats, setStats] = useState<R>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [saving, setSaving] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ action: c.action, user_id: String(userId) });
      if (search.trim()) q.set("search", search.trim());
      if (filter !== "all") q.set("statut", filter);
      const r = await fetch(`${API}?${q}`);
      const j = await r.json();
      if (!j.success) throw Error(j.message || "تعذر تحميل البيانات");
      setRows(Array.isArray(j[section]) ? j[section] : []);
      setStats(j.stats ?? {});
      setError("");
    } catch (e) { setError(e instanceof Error ? e.message : "حدث خطأ"); }
    finally { setLoading(false); }
  }, [c.action, filter, search, section, userId]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const close = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".soft-data-filter")) setFilterOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const options = section === "users" || section === "investors" ? userStatuses : section === "projects" ? projectStatuses : section === "investments" ? investmentStatuses : section === "requests" ? requestStatuses : section === "documents" ? documentStatuses : [];
  const total = Number(stats.total ?? rows.length);
  const active = Number(stats.actif ?? stats.active ?? stats.approuve ?? stats.valide ?? 0);
  const pending = Number(stats.en_attente ?? stats.soumis ?? stats.nouvelle ?? stats.pending ?? 0);
  const rejected = Number(stats.rejete ?? stats.refusee ?? stats.rejected ?? 0);

  const summary = useMemo(() => [
    { label: "إجمالي السجلات", value: fmt(total), icon: <Database size={18} />, tone: "green" },
    { label: "نشطة / مقبولة", value: fmt(active), icon: <CheckCircle2 size={18} />, tone: "gold" },
    { label: "قيد المتابعة", value: fmt(pending), icon: <Clock3 size={18} />, tone: "blue" },
    { label: "مرفوضة / متوقفة", value: fmt(rejected), icon: <AlertCircle size={18} />, tone: "red" }
  ], [total, active, pending, rejected]);

  const update = async (row: R, status: string) => {
    const id = Number(row.id);
    if (!id) return;
    let action = "";
    const body: R = { user_id: userId };
    if (section === "users") { action = "update_user_status"; body.target_user_id = id; }
    else if (section === "investors") { action = "update_investor_status"; body.target_user_id = id; }
    else if (section === "projects") { action = "update_project_status"; body.project_id = id; }
    else if (section === "investments") { action = "update_investment_status"; body.investment_id = id; }
    else if (section === "requests") { action = "update_request_status"; body.request_id = id; }
    else if (section === "documents") { action = "update_document_status"; body.document_id = id; }
    else return;
    body.action = action;
    body.statut = status;
    setSaving(id);
    try {
      const r = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json();
      if (!j.success) throw Error(j.message || "تعذر تحديث الحالة");
      setRows(prev => prev.map(x => x.id === row.id ? { ...x, statut: status } : x));
      setError("");
    } catch (e) { setError(e instanceof Error ? e.message : "تعذر تحديث الحالة"); }
    finally { setSaving(null); }
  };

  const toggleMessage = async (row: R) => {
    const id = Number(row.id);
    if (!id) return;
    const read = isRead(row);
    const action = read ? "mark_message_unread" : "mark_message_read";
    setSaving(id);
    try {
      const r = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: userId, action, message_id: id }) });
      const j = await r.json();
      if (!j.success) throw Error(j.message || "تعذر تحديث الرسالة");
      setRows(prev => prev.map(x => x.id === row.id ? { ...x, lu: read ? 0 : 1, statut: read ? "non_lu" : "lu" } : x));
      setError("");
    } catch (e) { setError(e instanceof Error ? e.message : "تعذر تحديث الرسالة"); }
    finally { setSaving(null); }
  };

  const keys = section === "projects" ? ["id", "user_id", "titre", "wilaya", "statut", "montant_investissement"] : (rows[0] ? Object.keys(rows[0]).filter(k => !["created_at", "updated_at"].includes(k)).slice(0, 6) : []);

  return <div className="admin-dashboard admin-soft-data-page">
    <header className="admin-dashboard-header soft-data-header"><div className="admin-dashboard-header-content"><div className="admin-dashboard-welcome"><span className="admin-dashboard-eyebrow">AAPI / ADMINISTRATION</span><h1>{c.title}</h1><p>{c.subtitle}</p></div><button className="admin-refresh-button soft-data-refresh" onClick={() => void load()} disabled={loading}><RefreshCw size={15} className={loading ? "spin" : ""} /> تحديث البيانات</button></div></header>
    {error && <div className="admin-dashboard-error"><AlertCircle size={16} /><span>{error}</span></div>}
    <main className="admin-dashboard-main soft-data-main">
      <section className="soft-data-stat-grid">{summary.map(item => <article className={`soft-data-stat ${item.tone}`} key={item.label}><div className="soft-data-stat-icon">{item.icon}</div><div><span>{item.label}</span><strong>{item.value}</strong><small>AAPI • تحديث مباشر</small></div></article>)}</section>
      <section className="admin-panel soft-data-panel">
        <div className="admin-panel-header soft-data-panel-head"><div><span className="soft-ui-card-label">DATA MANAGEMENT</span><h2>{c.title}</h2><p>{c.subtitle}</p></div><span className="soft-data-count">{fmt(total)} عنصر</span></div>
        <div className="admin-toolbar soft-data-toolbar">
          <div className="soft-data-search"><Search size={16} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث في البيانات..." aria-label="بحث" /></div>
          <div className={`soft-data-filter${filterOpen ? " is-open" : ""}`}>
            <button type="button" className="soft-data-filter-trigger" aria-haspopup="listbox" aria-expanded={filterOpen} onClick={() => setFilterOpen(v => !v)}>
              <span>{filter === "all" ? "كل الحالات" : text(filter)}</span><ChevronDown size={15} />
            </button>
            {filterOpen && <div className="soft-data-filter-menu" role="listbox" aria-label="تصفية حسب الحالة">
              <button type="button" className={filter === "all" ? "is-selected" : ""} onClick={() => { setFilter("all"); setFilterOpen(false); }}>كل الحالات</button>
              {options.map(o => <button type="button" key={o} role="option" aria-selected={filter === o} className={filter === o ? "is-selected" : ""} onClick={() => { setFilter(o); setFilterOpen(false); }}>{text(o)}</button>)}
            </div>}
          </div>
          <button className="soft-data-filter-button" onClick={() => { setSearch(""); setFilter("all"); setFilterOpen(false); }}><RefreshCw size={14} /> إعادة ضبط</button>
        </div>
        {loading ? <div className="admin-empty-state soft-data-empty">جاري تحميل البيانات...</div> : rows.length === 0 ? <div className="admin-empty-state soft-data-empty">لا توجد بيانات مطابقة.</div> : <div className="admin-data-table-wrapper soft-data-table-wrap"><table className="admin-data-table soft-data-table"><thead><tr>{keys.map(k => <th key={k}>{text(k)}</th>)}{options.length > 0 && <th>الإجراء</th>}{section === "messages" && <th>القراءة</th>}</tr></thead><tbody>{rows.map((r, i) => <tr key={r.id ?? i}>{keys.map(k => <td key={k}>{k === "user_id" ? userIdOf(r) : k === "statut" ? <span className={`admin-status-badge status-${r[k]}`}>{text(r[k])}</span> : k === "lu" ? (isRead(r) ? "مقروء" : "غير مقروء") : k.includes("montant") || k.includes("investissement") ? da(r[k]) : String(r[k] ?? "—")}</td>)}{options.length > 0 && <td><select className="status-select soft-status-select" value={String(r.statut ?? "")} disabled={saving === Number(r.id)} onChange={e => void update(r, e.target.value)} aria-label={`تحديث حالة ${text(r.titre ?? r.nom ?? r.id)}`}><option value="">—</option>{options.map(o => <option key={o} value={o}>{text(o)}</option>)}</select></td>}{section === "messages" && <td><button className={`admin-read-toggle soft-read-toggle ${isRead(r) ? "is-read" : "is-unread"}`} disabled={saving === Number(r.id)} onClick={() => void toggleMessage(r)}>{isRead(r) ? "تعيين كغير مقروء" : "تعيين كمقروء"}</button></td>}</tr>)}</tbody></table></div>}
      </section>
    </main>
  </div>;
}
