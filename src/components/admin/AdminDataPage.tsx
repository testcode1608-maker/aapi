import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Search, RefreshCw, Database, CheckCircle2, Clock3, AlertCircle, ChevronDown, Trash2, MessageSquare } from "lucide-react";
import { useTranslation } from "../../i18n/I18nProvider";
import "../../styles/admin-status-dropdown.css";

const API = "http://localhost/aapi-api/auth/admin/admin.php";
type R = Record<string, any>;
type Section = "users" | "investors" | "projects" | "investments" | "requests" | "messages" | "documents" | "announcements";

const projectStatuses = ["brouillon", "soumis", "en_etude", "approuve", "en_cours", "realise", "rejete", "archive"];
const userStatuses = ["actif", "inactif", "suspendu"];
const investmentStatuses = ["en_attente", "valide", "en_cours", "termine", "annule"];
const requestStatuses = ["nouvelle", "en_cours", "en_attente", "acceptee", "refusee", "terminee"];
const documentStatuses = ["en_attente", "valide", "rejete"];

const fmt = (v: any, language: "ar" | "fr" | "en") => Number(v ?? 0).toLocaleString(language === "ar" ? "ar-DZ" : language === "fr" ? "fr-DZ" : "en-DZ");
const da = (v: any, language: "ar" | "fr" | "en") => `${fmt(v, language)} DA`;
const userIdOf = (r: R) => r.user_id ?? r.investor_id ?? r.investisseur_id ?? r.utilisateur_id ?? "—";
const isRead = (r: R) => r.lu === 1 || r.lu === true || r.statut === "lu";

export default function AdminDataPage({ section, userId }: { section: Section; userId: number }) {
  const { language, t } = useTranslation();
  const c = { title: t(`admin.data.section.${section}.title`), subtitle: t(`admin.data.section.${section}.subtitle`), action: section };
  const text = (v: any) => t(`admin.data.labels.${String(v ?? "")}`) !== `admin.data.labels.${String(v ?? "")}` ? t(`admin.data.labels.${String(v ?? "")}`) : String(v ?? "—").replaceAll("_", " ");
  const [rows, setRows] = useState<R[]>([]);
  const [stats, setStats] = useState<R>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [saving, setSaving] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [announcementForm, setAnnouncementForm] = useState({ titre: "", contenu: "", image: "", statut: "publie", date_publication: "" });
  const [creatingAnnouncement, setCreatingAnnouncement] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ action: c.action, user_id: String(userId) });
      if (search.trim()) q.set("search", search.trim());
      if (filter !== "all") q.set("statut", filter);
      const r = await fetch(`${API}?${q}`);
      const j = await r.json();
      if (!j.success) throw Error(j.message || t("admin.data.loadError"));
      setRows(Array.isArray(j[section]) ? j[section] : []);
      setStats(j.stats ?? {});
      setError("");
    } catch (e) { setError(e instanceof Error ? e.message : t("admin.data.unknownError")); }
    finally { setLoading(false); }
  }, [c.action, filter, search, section, userId, t]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const close = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".soft-data-filter")) setFilterOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const options = section === "users" || section === "investors" ? userStatuses : section === "projects" ? projectStatuses : section === "investments" ? investmentStatuses : section === "requests" ? requestStatuses : section === "documents" ? documentStatuses : section === "announcements" ? [] : [];
  const total = Number(stats.total ?? rows.length);
  const active = Number(stats.actif ?? stats.active ?? stats.approuve ?? stats.valide ?? 0);
  const pending = Number(stats.en_attente ?? stats.soumis ?? stats.nouvelle ?? stats.pending ?? 0);
  const rejected = Number(stats.rejete ?? stats.refusee ?? stats.rejected ?? 0);

  const summary = useMemo(() => [
    { label: t("admin.data.totalRecords"), value: fmt(total, language), icon: <Database size={18} />, tone: "green" },
    { label: t("admin.data.activeAccepted"), value: fmt(active, language), icon: <CheckCircle2 size={18} />, tone: "gold" },
    { label: t("admin.data.pending"), value: fmt(pending, language), icon: <Clock3 size={18} />, tone: "blue" },
    { label: t("admin.data.rejectedStopped"), value: fmt(rejected, language), icon: <AlertCircle size={18} />, tone: "red" }
  ], [total, active, pending, rejected, language, t]);

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
      if (!j.success) throw Error(j.message || t("admin.data.updateError"));
      setRows(prev => prev.map(x => x.id === row.id ? { ...x, statut: status } : x));
      setError("");
    } catch (e) { setError(e instanceof Error ? e.message : t("admin.data.updateError")); }
    finally { setSaving(null); }
  };

  const translateError = (message: string) => {
    const normalized = message.trim();
    if (normalized === "لا يمكنك حذف حساب المسؤول الذي تستخدمه حالياً.") {
      return language === "fr"
        ? "Vous ne pouvez pas supprimer le compte administrateur que vous utilisez actuellement."
        : language === "en"
          ? "You cannot delete the administrator account you are currently using."
          : normalized;
    }
    return normalized;
  };

  const remove = async (row: R) => {
    const id = Number(row.id);
    if (!id || deleting === id) return;

    const label = String(row.titre ?? row.nom ?? row.sujet ?? row.objet ?? row.id);
    const confirmText = language === "ar"
      ? "هل أنت متأكد من حذف هذا السجل؟"
      : language === "en"
        ? "Are you sure you want to delete this record?"
        : "Êtes-vous sûr de vouloir supprimer cet enregistrement ?";

    if (!window.confirm(confirmText + "\n\n" + label)) return;

    const deleteActions: Record<Section, string> = {
      users: "delete_users",
      investors: "delete_investors",
      projects: "delete_projects",
      investments: "delete_investments",
      requests: "delete_requests",
      messages: "delete_messages",
      documents: "delete_documents",
      announcements: "delete_announcements",
    };
    const action = deleteActions[section];
    setDeleting(id);

    try {
      const r = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, action, record_id: id }),
      });
      const j = await r.json();
      if (!j.success) {
        throw Error(
          j.message ||
          (language === "ar"
            ? "تعذر حذف السجل."
            : language === "en"
              ? "Unable to delete the record."
              : "Impossible de supprimer l’enregistrement.")
        );
      }
      setRows(prev => prev.filter(x => Number(x.id) !== id));
      setStats(prev => ({ ...prev, total: Math.max(0, Number(prev.total ?? rows.length) - 1) }));
      setError("");
    } catch (e) {
      setError(
        translateError(
          e instanceof Error
            ? e.message
            : language === "ar"
              ? "تعذر حذف السجل."
              : language === "en"
                ? "Unable to delete the record."
                : "Impossible de supprimer l’enregistrement."
        )
      );
    } finally {
      setDeleting(null);
    }
  };

  const createAnnouncement = async (event: FormEvent) => {
    event.preventDefault();
    if (!announcementForm.titre.trim() || !announcementForm.contenu.trim() || creatingAnnouncement) return;

    setCreatingAnnouncement(true);
    try {
      const r = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_announcement",
          user_id: userId,
          ...announcementForm,
        }),
      });
      const j = await r.json();
      if (!j.success) throw Error(j.message || "Impossible de créer l'annonce.");
      setAnnouncementForm({ titre: "", contenu: "", image: "", statut: "publie", date_publication: "" });
      await load();
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de créer l'annonce.");
    } finally {
      setCreatingAnnouncement(false);
    }
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
      if (!j.success) throw Error(j.message || t("admin.data.messageError"));
      setRows(prev => prev.map(x => x.id === row.id ? { ...x, lu: read ? 0 : 1, statut: read ? "non_lu" : "lu" } : x));
      setError("");
    } catch (e) { setError(e instanceof Error ? e.message : t("admin.data.messageError")); }
    finally { setSaving(null); }
  };

  const keys = section === "projects" ? ["id", "user_id", "titre", "wilaya", "statut", "montant_investissement"] : section === "announcements" ? ["id", "titre", "statut", "date_publication", "auteur_id"] : (rows[0] ? Object.keys(rows[0]).filter(k => !["created_at", "updated_at"].includes(k)).slice(0, 6) : []);

  return <div className="admin-dashboard admin-soft-data-page">
    {error && <div className="admin-dashboard-error"><AlertCircle size={16} /><span>{error}</span></div>}
    <main className="admin-dashboard-main soft-data-main">
      <header className="admin-dashboard-main">
        <div className="admin-dashboard-header-content">
          <div className="admin-dashboard-welcome">
            <span className="admin-dashboard-eyebrow">{t("admin.dashboard.eyebrow")}</span>
            <h1>{c.title}</h1>
            <p>{c.subtitle}</p>
          </div>
          <button className="admin-refresh-button soft-data-refresh" onClick={() => void load()} disabled={loading}>
            <RefreshCw size={15} className={loading ? "spin" : ""} /> {t("admin.data.refresh")}
          </button>
        </div>
      </header>
      <section className="soft-data-stat-grid">{summary.map(item => <article className={`soft-data-stat ${item.tone}`} key={item.label}><div className="soft-data-stat-icon">{item.icon}</div><div><span>{item.label}</span><strong>{item.value}</strong><small>{t("admin.data.liveUpdate")}</small></div></article>)}</section>
      <section className="admin-panel soft-data-panel">
        <div className="admin-panel-header soft-data-panel-head"><div><span className="soft-ui-card-label">{t("admin.data.dataManagement")}</span><h2>{c.title}</h2><p>{c.subtitle}</p></div><span className="soft-data-count">{fmt(total, language)} {t("admin.data.items")}</span></div>
        {section === "announcements" && <form className="admin-announcement-form" onSubmit={createAnnouncement}>
          <div className="admin-announcement-form-head">
            <div className="admin-announcement-form-copy">
              <span className="admin-announcement-eyebrow">{t("admin.data.announcement.eyebrow")}</span>
              <h2>{t("admin.data.announcement.new")}</h2>
              <p>{t("admin.data.announcement.description")}</p>
            </div>
            <div className="admin-announcement-form-mark" aria-hidden="true"><MessageSquare size={22} /></div>
          </div>
          <div className="admin-announcement-form-grid">
            <label className="admin-announcement-field"><span>{t("admin.data.announcement.title")}</span><input value={announcementForm.titre} onChange={e => setAnnouncementForm(v => ({ ...v, titre: e.target.value }))} placeholder={t("admin.data.announcement.titlePlaceholder")} required /></label>
            <label className="admin-announcement-field"><span>{t("admin.data.announcement.status")}</span><select value={announcementForm.statut} onChange={e => setAnnouncementForm(v => ({ ...v, statut: e.target.value }))}><option value="publie">{t("admin.data.announcement.published")}</option><option value="brouillon">{t("admin.data.announcement.draft")}</option><option value="archive">{t("admin.data.announcement.archived")}</option></select></label>
            <label className="admin-announcement-field admin-announcement-field-full"><span>{t("admin.data.announcement.content")}</span><textarea value={announcementForm.contenu} onChange={e => setAnnouncementForm(v => ({ ...v, contenu: e.target.value }))} placeholder={t("admin.data.announcement.contentPlaceholder")} required /></label>
            <label className="admin-announcement-field"><span>{t("admin.data.announcement.image")}</span><input value={announcementForm.image} onChange={e => setAnnouncementForm(v => ({ ...v, image: e.target.value }))} placeholder={t("admin.data.announcement.imagePlaceholder")} /></label>
            <label className="admin-announcement-field"><span>{t("admin.data.announcement.publicationDate")}</span><input type="datetime-local" value={announcementForm.date_publication} onChange={e => setAnnouncementForm(v => ({ ...v, date_publication: e.target.value }))} /></label>
          </div>
          <div className="admin-announcement-form-actions"><button type="submit" className="admin-announcement-submit" disabled={creatingAnnouncement}>{creatingAnnouncement ? <><RefreshCw size={15} className="spin" /> {t("admin.data.announcement.publishing")}</> : <><MessageSquare size={15} /> {t("admin.data.announcement.publish")}</>}</button></div>
        </form>}}
        <div className="admin-toolbar soft-data-toolbar">
          <div className="soft-data-search"><Search size={16} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("admin.data.search")} aria-label={t("admin.data.searchAria")} /></div>
          <div className={`soft-data-filter${filterOpen ? " is-open" : ""}`}>
            <button type="button" className="soft-data-filter-trigger" aria-haspopup="listbox" aria-expanded={filterOpen} onClick={() => setFilterOpen(v => !v)}><span>{filter === "all" ? t("admin.data.allStatuses") : text(filter)}</span><ChevronDown size={15} /></button>
            {filterOpen && <div className="soft-data-filter-menu" role="listbox" aria-label={t("admin.data.allStatuses")}><button type="button" className={filter === "all" ? "is-selected" : ""} onClick={() => { setFilter("all"); setFilterOpen(false); }}>{t("admin.data.allStatuses")}</button>{options.map(o => <button type="button" key={o} role="option" aria-selected={filter === o} className={filter === o ? "is-selected" : ""} onClick={() => { setFilter(o); setFilterOpen(false); }}>{text(o)}</button>)}</div>}
          </div>
          <button className="soft-data-filter-button" onClick={() => { setSearch(""); setFilter("all"); setFilterOpen(false); }}><RefreshCw size={14} /> {t("admin.data.reset")}</button>
        </div>
        {loading ? <div className="admin-empty-state soft-data-empty">{t("admin.data.loading")}</div> : rows.length === 0 ? <div className="admin-empty-state soft-data-empty">{t("admin.data.noData")}</div> : <div className="admin-data-table-wrapper soft-data-table-wrap"><table className="admin-data-table soft-data-table"><thead><tr>{keys.map(k => <th key={k}>{text(k)}</th>)}{(options.length > 0 || section === "messages" || section === "announcements") && <th>{language === "ar" ? "الإجراء" : "Action"}</th>}</tr></thead><tbody>{rows.map((r, i) => <tr key={r.id ?? i}>
  {keys.map(k => <td key={k}>{k === "user_id" ? userIdOf(r) : k === "statut" ? <span className={`admin-status-badge status-${r[k]}`}>{text(r[k])}</span> : k === "lu" ? (isRead(r) ? t("admin.data.read") : t("admin.data.unread")) : k === "date_publication" ? (r[k] ? new Date(String(r[k]).replace(" ", "T")).toLocaleString(language === "ar" ? "ar-DZ" : language === "fr" ? "fr-DZ" : "en-DZ", { dateStyle: "medium", timeStyle: "short" }) : "—") : k.includes("montant") || k.includes("investissement") ? da(r[k], language) : String(r[k] ?? "—")}</td>)}
  {(options.length > 0 || section === "messages" || section === "announcements") && <td>
    <div className="soft-data-actions">
      {options.length > 0 && <select className="status-select soft-status-select" value={String(r.statut ?? "")} disabled={saving === Number(r.id) || deleting === Number(r.id)} onChange={e => void update(r, e.target.value)} aria-label={t("admin.data.updateStatus") + " " + text(r.titre ?? r.nom ?? r.id)}>
        <option value="">—</option>
        {options.map(o => <option key={o} value={o}>{text(o)}</option>)}
      </select>}
      {section === "messages" && <button className={`admin-read-toggle soft-read-toggle ${isRead(r) ? "is-read" : "is-unread"}`} disabled={saving === Number(r.id) || deleting === Number(r.id)} onClick={() => void toggleMessage(r)}>
        {isRead(r) ? t("admin.data.markUnread") : t("admin.data.markRead")}
      </button>}
      <button type="button" className="soft-delete-button" disabled={deleting === Number(r.id) || saving === Number(r.id)} onClick={() => void remove(r)} aria-label={(language === "ar" ? "حذف" : language === "en" ? "Delete" : "Supprimer") + " " + text(r.titre ?? r.nom ?? r.sujet ?? r.objet ?? r.id)} title={language === "ar" ? "حذف" : language === "en" ? "Delete" : "Supprimer"}>
        <Trash2 size={15} />
        {language === "ar" ? "حذف" : language === "en" ? "Delete" : "Supprimer"}
      </button>
    </div>
  </td>}
</tr>)}</tbody></table></div>}
      </section>
    </main>
  </div>;
}
