import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Search, RefreshCw, Database, CheckCircle2, Clock3, AlertCircle, ChevronDown, Trash2, MessageSquare, Pencil, Plus } from "lucide-react";
import { useTranslation } from "../../i18n/I18nProvider";
import "../../styles/admin-status-dropdown.css";

const API = "http://localhost/aapi-api/auth/admin/admin.php";
type R = Record<string, any>;
type Section = "users" | "investors" | "projects" | "investments" | "requests" | "messages" | "documents" | "sectors" | "announcements" | "news";

const projectStatuses = ["brouillon", "soumis", "en_etude", "approuve", "en_cours", "realise", "rejete", "archive"];
const userStatuses = ["actif", "inactif", "suspendu"];
const investmentStatuses = ["en_attente", "valide", "en_cours", "termine", "annule"];
const requestStatuses = ["nouvelle", "en_cours", "en_attente", "acceptee", "refusee", "terminee"];
const documentStatuses = ["en_attente", "valide", "rejete"];

const fmt = (v: any, language: "ar" | "fr" | "en") => Number(v ?? 0).toLocaleString(language === "ar" ? "ar-DZ" : language === "fr" ? "fr-DZ" : "en-DZ");
const da = (v: any, language: "ar" | "fr" | "en") => `${fmt(v, language)} DA`;
const imageUrl = (value: any, id: number, section: Section) => {
  const v = String(value ?? "").trim();
  const fallback = section === "announcements"
    ? `http://localhost/aapi-api/announcement-image.php?id=${id}`
    : `http://localhost/aapi-api/news-image.php?id=${id}`;
  if (!v) return fallback;
  if (/^https?:\/\//i.test(v)) return v;
  if (v.startsWith("/")) return `http://localhost${v}`;
  return fallback;
};
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
  const [announcementPhoto, setAnnouncementPhoto] = useState<File | null>(null);
  const [creatingAnnouncement, setCreatingAnnouncement] = useState(false);
  const [newsForm, setNewsForm] = useState({ titre: "", resume: "", contenu: "", statut: "publie", date_publication: "" });
  const [newsPhoto, setNewsPhoto] = useState<File | null>(null);
  const [creatingNews, setCreatingNews] = useState(false);
  const [sectorForm, setSectorForm] = useState({ nom: "", description: "" });
  const [sectorPhoto, setSectorPhoto] = useState<File | null>(null);
  const [creatingSector, setCreatingSector] = useState(false);
  const [editingRow, setEditingRow] = useState<R | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ nom: "", titre: "", resume: "", contenu: "", statut: "publie", date_publication: "", description: "" });
  const [editPhoto, setEditPhoto] = useState<File | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

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

  const options = section === "users" || section === "investors" ? userStatuses : section === "projects" ? projectStatuses : section === "investments" ? investmentStatuses : section === "requests" ? requestStatuses : section === "documents" ? documentStatuses : [];
  const total = Number(stats.total ?? rows.length);
  const active = Number(stats.actif ?? stats.active ?? stats.approuve ?? stats.valide ?? stats.publie ?? 0);
  const pending = Number(stats.en_attente ?? stats.soumis ?? stats.nouvelle ?? stats.pending ?? stats.brouillon ?? 0);
  const rejected = Number(stats.rejete ?? stats.refusee ?? stats.rejected ?? stats.archive ?? 0);

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
      return language === "fr" ? "Vous ne pouvez pas supprimer le compte administrateur que vous utilisez actuellement." : language === "en" ? "You cannot delete the administrator account you are currently using." : normalized;
    }
    return normalized;
  };

  const remove = async (row: R) => {
    const id = Number(row.id);
    if (!id || deleting === id) return;
    const label = String(row.titre ?? row.nom ?? row.sujet ?? row.objet ?? row.id);
    const confirmText = language === "ar" ? "هل أنت متأكد من حذف هذا السجل؟" : language === "en" ? "Are you sure you want to delete this record?" : "Êtes-vous sûr de vouloir supprimer cet enregistrement ?";
    if (!window.confirm(confirmText + "\n\n" + label)) return;
    const deleteActions: Record<Section, string> = { users: "delete_users", investors: "delete_investors", projects: "delete_projects", investments: "delete_investments", requests: "delete_requests", messages: "delete_messages", documents: "delete_documents", sectors: "delete_sectors", announcements: "delete_announcements", news: "delete_news" };
    const action = deleteActions[section];
    setDeleting(id);
    try {
      const r = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: userId, action, record_id: id }) });
      const j = await r.json();
      if (!j.success) throw Error(j.message || (language === "ar" ? "تعذر حذف السجل." : language === "en" ? "Unable to delete the record." : "Impossible de supprimer l’enregistrement."));
      setRows(prev => prev.filter(x => Number(x.id) !== id));
      setStats(prev => ({ ...prev, total: Math.max(0, Number(prev.total ?? rows.length) - 1) }));
      setError("");
    } catch (e) {
      setError(translateError(e instanceof Error ? e.message : language === "ar" ? "تعذر حذف السجل." : language === "en" ? "Unable to delete the record." : "Impossible de supprimer l’enregistrement."));
    } finally { setDeleting(null); }
  };

  const createAnnouncement = async (event: FormEvent) => {
    event.preventDefault();
    if (!announcementForm.titre.trim() || !announcementForm.contenu.trim() || creatingAnnouncement) return;
    setCreatingAnnouncement(true);
    try {
      const formData = new FormData();
      formData.append("action", "create_announcement");
      formData.append("user_id", String(userId));
      formData.append("titre", announcementForm.titre.trim());
      formData.append("contenu", announcementForm.contenu.trim());
      formData.append("statut", announcementForm.statut);
      if (announcementForm.date_publication) formData.append("date_publication", announcementForm.date_publication);
      if (announcementPhoto) formData.append("image", announcementPhoto);
      const r = await fetch(API, { method: "POST", body: formData });
      const j = await r.json();
      if (!r.ok || !j.success) throw Error(j.message || "Impossible de créer l'annonce.");
      setAnnouncementForm({ titre: "", contenu: "", image: "", statut: "publie", date_publication: "" });
      setAnnouncementPhoto(null);
      await load();
      setError("");
    } catch (e) { setError(e instanceof Error ? e.message : "Impossible de créer l'annonce."); }
    finally { setCreatingAnnouncement(false); }
  };

  const createSector = async (event: FormEvent) => {
    event.preventDefault();
    if (!sectorForm.nom.trim() || creatingSector) return;
    setCreatingSector(true);
    try {
      const formData = new FormData();
      formData.append("action", "create_sector");
      formData.append("user_id", String(userId));
      formData.append("nom", sectorForm.nom.trim());
      formData.append("description", sectorForm.description.trim());
      if (sectorPhoto) formData.append("image", sectorPhoto);
      const r = await fetch(API, { method: "POST", body: formData });
      const raw = await r.text();
      let j: R;
      try { j = JSON.parse(raw); } catch { throw Error("Le serveur PHP a renvoyé une erreur au lieu d'un JSON. Vérifiez les logs PHP."); }
      if (!r.ok || !j.success) throw Error(j.message || "Impossible de créer le secteur.");
      setSectorForm({ nom: "", description: "" });
      setSectorPhoto(null);
      await load();
      setError("");
    } catch (e) { setError(e instanceof Error ? e.message : "Impossible de créer le secteur."); }
    finally { setCreatingSector(false); }
  };

  const createNews = async (event: FormEvent) => {
    event.preventDefault();
    if (!newsForm.titre.trim() || !newsForm.contenu.trim() || creatingNews) return;
    setCreatingNews(true);
    try {
      const formData = new FormData();
      formData.append("action", "create_news");
      formData.append("user_id", String(userId));
      formData.append("titre", newsForm.titre.trim());
      formData.append("resume", newsForm.resume.trim());
      formData.append("contenu", newsForm.contenu.trim());
      formData.append("statut", newsForm.statut);
      if (newsForm.date_publication) formData.append("date_publication", newsForm.date_publication);
      if (newsPhoto) formData.append("image", newsPhoto);
      const r = await fetch(API, { method: "POST", body: formData });
      const j = await r.json();
      if (!r.ok || !j.success) throw Error(j.message || "Impossible de créer l’actualité.");
      setNewsForm({ titre: "", resume: "", contenu: "", statut: "publie", date_publication: "" });
      setNewsPhoto(null);
      await load();
      setError("");
    } catch (e) { setError(e instanceof Error ? e.message : "Impossible de créer l’actualité."); }
    finally { setCreatingNews(false); }
  };

  const openEdit = (row: R) => {
    setEditingRow(row);
    setEditPhoto(null);
    const rawDate = row.date_publication ? String(row.date_publication).replace(" ", "T").slice(0,16) : "";
    setEditForm({
      nom: String(row.nom ?? ""),
      titre: String(row.titre ?? ""),
      resume: String(row.resume ?? ""),
      contenu: String(row.contenu ?? ""),
      statut: String(row.statut ?? "publie"),
      date_publication: rawDate,
      description: String(row.description ?? "")
    });
  };

  const saveEdit = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingRow || savingEdit) return;
    const id = Number(editingRow.id);
    if (!id) return;
    setSavingEdit(true);
    try {
      const formData = new FormData();
      const action = section === "sectors" ? "update_sector" : section === "announcements" ? "update_announcement" : "update_news";
      formData.append("action", action);
      formData.append("user_id", String(userId));
      formData.append("id", String(id));
      if (section === "sectors") {
        formData.append("nom", editForm.nom.trim());
        formData.append("description", editForm.description.trim());
      } else {
        formData.append("titre", editForm.titre.trim());
        formData.append("contenu", editForm.contenu.trim());
        formData.append("statut", editForm.statut);
        formData.append("date_publication", editForm.date_publication);
        if (section === "news") formData.append("resume", editForm.resume.trim());
      }
      if (editPhoto) formData.append("image", editPhoto);
      const r = await fetch(API, { method: "POST", body: formData });
      const raw = await r.text();
      let j: R;
      try { j = JSON.parse(raw); } catch { throw Error("Le serveur PHP a renvoyé une erreur au lieu d'un JSON."); }
      if (!r.ok || !j.success) throw Error(j.message || t("admin.data.updateError"));
      setEditingRow(null);
      setEditPhoto(null);
      await load();
      setError("");
    } catch (e) { setError(e instanceof Error ? e.message : t("admin.data.updateError")); }
    finally { setSavingEdit(false); }
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

  const keys = section === "projects"
    ? ["id", "user_id", "titre", "wilaya", "statut", "montant_investissement"]
    : section === "sectors"
      ? ["id", "nom", "description"]
      : section === "announcements" || section === "news"
      ? ["id", "titre", "image", "statut", "date_publication", "auteur_id"]
      : (rows[0] ? Object.keys(rows[0]).filter(k => !["created_at", "updated_at"].includes(k)).slice(0, 6) : []);

  return <div className="admin-dashboard admin-soft-data-page" dir={language === "ar" ? "rtl" : "ltr"}>
    {error && <div className="admin-dashboard-error"><AlertCircle size={16} /><span>{error}</span></div>}
    <main className="admin-dashboard-main soft-data-main">
      <header className="admin-dashboard-main">
        <div className="admin-dashboard-header-content">
          <div className="admin-dashboard-welcome">
            <span className="admin-dashboard-eyebrow">{t("admin.dashboard.eyebrow")}</span>
            <h1>{c.title}</h1>
            <p>{c.subtitle}</p>
          </div>
          <div className="soft-data-header-actions">
            {(section === "news" || section === "announcements" || section === "sectors") && (
              <button
                type="button"
                className="admin-add-button"
                onClick={() => setCreateModalOpen(true)}
              >
                <Plus size={17} />
                {section === "news"
                  ? t("admin.data.news.new")
                  : section === "announcements"
                    ? t("admin.data.announcement.new")
                    : language === "ar"
                      ? "إضافة قطاع استثماري"
                      : language === "en"
                        ? "Add investment sector"
                        : "Ajouter un secteur"}
              </button>
            )}
            <button className="admin-refresh-button soft-data-refresh" onClick={() => void load()} disabled={loading}>
              <RefreshCw size={15} className={loading ? "spin" : ""} /> {t("admin.data.refresh")}
            </button>
          </div>
        </div>
      </header>
      <section className="soft-data-stat-grid">{summary.map(item => <article className={`soft-data-stat ${item.tone}`} key={item.label}><div className="soft-data-stat-icon">{item.icon}</div><div><span>{item.label}</span><strong>{item.value}</strong><small>{t("admin.data.liveUpdate")}</small></div></article>)}</section>
      <section className="admin-panel soft-data-panel">
        <div className="admin-panel-header soft-data-panel-head"><div><span className="soft-ui-card-label">{t("admin.data.dataManagement")}</span><h2>{c.title}</h2><p>{c.subtitle}</p></div><span className="soft-data-count">{fmt(total, language)} {t("admin.data.items")}</span></div>

        {createModalOpen && section === "sectors" && <div className="admin-edit-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setCreateModalOpen(false); }}><form id="admin-create-form" className="admin-edit-modal admin-create-modal" onSubmit={async (e) => { await createSector(e); setCreateModalOpen(false); }}>
          <div className="admin-announcement-form-head"><div className="admin-announcement-form-copy"><span className="admin-announcement-eyebrow">{language === "ar" ? "إدارة القطاعات" : language === "en" ? "SECTOR MANAGEMENT" : "GESTION DES SECTEURS"}</span><h2>{language === "ar" ? "إضافة قطاع استثماري" : language === "en" ? "Add investment sector" : "Ajouter un secteur d’investissement"}</h2><p>{language === "ar" ? "أضف قطاعاً جديداً ليظهر في إدارة القطاعات." : language === "en" ? "Add a new sector to the sector management list." : "Ajoutez un nouveau secteur à la liste de gestion."}</p></div><div className="admin-announcement-form-mark" aria-hidden="true"><Database size={22} /></div></div>
          <div className="admin-announcement-form-grid">
            <label className="admin-announcement-field"><span>{language === "ar" ? "اسم القطاع" : language === "en" ? "Sector name" : "Nom du secteur"}</span><input value={sectorForm.nom} onChange={e => setSectorForm(v => ({ ...v, nom: e.target.value }))} placeholder={language === "ar" ? "مثال: الصناعات الدوائية" : language === "en" ? "e.g. Pharmaceutical industry" : "Ex. Industrie pharmaceutique"} required /></label>
            <label className="admin-announcement-field"><span>{language === "ar" ? "الصورة" : language === "en" ? "Photo" : "Photo"}</span><label className="admin-announcement-upload"><input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={e => setSectorPhoto(e.target.files?.[0] ?? null)} /><span>📷 {sectorPhoto ? sectorPhoto.name : (language === "ar" ? "اختر صورة القطاع" : language === "en" ? "Choose sector photo" : "Choisir une photo")}</span></label></label>
            <label className="admin-announcement-field admin-announcement-field-full"><span>{language === "ar" ? "الوصف" : language === "en" ? "Description" : "Description"}</span><textarea value={sectorForm.description} onChange={e => setSectorForm(v => ({ ...v, description: e.target.value }))} placeholder={language === "ar" ? "وصف مختصر للقطاع..." : language === "en" ? "Short sector description..." : "Description courte du secteur..."} /></label>
          </div>
          <div className="admin-announcement-form-actions"><button type="submit" className="admin-announcement-submit" disabled={creatingSector}>{creatingSector ? <><RefreshCw size={15} className="spin" /> {language === "ar" ? "إضافة..." : language === "en" ? "Adding..." : "Ajout..."}</> : <><Database size={15} /> {language === "ar" ? "إضافة القطاع" : language === "en" ? "Add sector" : "Ajouter le secteur"}</>}</button></div>
        </form></div>}

        {createModalOpen && section === "announcements" && <div className="admin-edit-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setCreateModalOpen(false); }}><form id="admin-create-form" className="admin-edit-modal admin-create-modal" onSubmit={async (e) => { await createAnnouncement(e); setCreateModalOpen(false); }}>
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
            <div className="admin-announcement-field"><span>{t("admin.data.announcement.image")}</span><label className="admin-announcement-upload"><input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={e => setAnnouncementPhoto(e.target.files?.[0] ?? null)} /><span>📷 {announcementPhoto ? announcementPhoto.name : t("admin.data.announcement.imagePlaceholder")}</span></label></div>
            <label className="admin-announcement-field"><span>{t("admin.data.announcement.publicationDate")}</span><input type="datetime-local" value={announcementForm.date_publication} onChange={e => setAnnouncementForm(v => ({ ...v, date_publication: e.target.value }))} /></label>
          </div>
          <div className="admin-announcement-form-actions"><button type="submit" className="admin-announcement-submit" disabled={creatingAnnouncement}>{creatingAnnouncement ? <><RefreshCw size={15} className="spin" /> {t("admin.data.announcement.publishing")}</> : <><MessageSquare size={15} /> {t("admin.data.announcement.publish")}</>}</button></div>
        </form></div>}

        {createModalOpen && section === "news" && <div className="admin-edit-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setCreateModalOpen(false); }}><form id="admin-create-form" className="admin-edit-modal admin-create-modal" onSubmit={async (e) => { await createNews(e); setCreateModalOpen(false); }}>
          <div className="admin-announcement-form-head">
            <div className="admin-announcement-form-copy">
              <span className="admin-announcement-eyebrow">{t("admin.data.news.eyebrow")}</span>
              <h2>{t("admin.data.news.new")}</h2>
              <p>{t("admin.data.news.description")}</p>
            </div>
            <div className="admin-announcement-form-mark" aria-hidden="true"><MessageSquare size={22} /></div>
          </div>
          <div className="admin-announcement-form-grid">
            <label className="admin-announcement-field"><span>{t("admin.data.news.title")}</span><input value={newsForm.titre} onChange={e => setNewsForm(v => ({ ...v, titre: e.target.value }))} placeholder={t("admin.data.news.titlePlaceholder")} required /></label>
            <label className="admin-announcement-field"><span>{t("admin.data.news.status")}</span><select value={newsForm.statut} onChange={e => setNewsForm(v => ({ ...v, statut: e.target.value }))}><option value="publie">{t("admin.data.news.published")}</option><option value="brouillon">{t("admin.data.news.draft")}</option><option value="archive">{t("admin.data.news.archived")}</option></select></label>
            <label className="admin-announcement-field admin-announcement-field-full"><span>{t("admin.data.news.summary")}</span><textarea value={newsForm.resume} onChange={e => setNewsForm(v => ({ ...v, resume: e.target.value }))} placeholder={t("admin.data.news.summaryPlaceholder")} /></label>
            <label className="admin-announcement-field admin-announcement-field-full"><span>{t("admin.data.news.content")}</span><textarea value={newsForm.contenu} onChange={e => setNewsForm(v => ({ ...v, contenu: e.target.value }))} placeholder={t("admin.data.news.contentPlaceholder")} required /></label>
            <div className="admin-announcement-field"><span>{t("admin.data.news.image")}</span><label className="admin-announcement-upload"><input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={e => setNewsPhoto(e.target.files?.[0] ?? null)} /><span>📷 {newsPhoto ? newsPhoto.name : t("admin.data.news.imagePlaceholder")}</span></label></div>
            <label className="admin-announcement-field"><span>{t("admin.data.news.publicationDate")}</span><input type="datetime-local" value={newsForm.date_publication} onChange={e => setNewsForm(v => ({ ...v, date_publication: e.target.value }))} /></label>
          </div>
          <div className="admin-announcement-form-actions"><button type="submit" className="admin-announcement-submit" disabled={creatingNews}>{creatingNews ? <><RefreshCw size={15} className="spin" /> {t("admin.data.news.publishing")}</> : <><MessageSquare size={15} /> {t("admin.data.news.publish")}</>}</button></div>
        </form></div>}

        {editingRow && (section === "sectors" || section === "announcements" || section === "news") && <div className="admin-edit-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setEditingRow(null); }}>
          <form className="admin-edit-modal" onSubmit={saveEdit}>
            <div className="admin-edit-modal-head">
              <div><span className="admin-announcement-eyebrow">{language === "ar" ? "تعديل" : language === "en" ? "EDIT" : "MODIFICATION"}</span><h2>{section === "sectors" ? (language === "ar" ? "تعديل القطاع" : language === "en" ? "Edit sector" : "Modifier le secteur") : section === "announcements" ? (language === "ar" ? "تعديل الإعلان" : language === "en" ? "Edit announcement" : "Modifier l’annonce") : (language === "ar" ? "تعديل الخبر" : language === "en" ? "Edit news" : "Modifier l’actualité")}</h2></div>
              <button type="button" className="admin-edit-modal-close" onClick={() => setEditingRow(null)} aria-label={language === "ar" ? "إغلاق" : "Fermer"}>×</button>
            </div>
            <div className="admin-announcement-form-grid">
              {section === "sectors" ? <>
                <label className="admin-announcement-field"><span>{language === "ar" ? "اسم القطاع" : language === "en" ? "Sector name" : "Nom du secteur"}</span><input value={editForm.nom} onChange={e => setEditForm(v => ({...v, nom:e.target.value}))} required /></label>
                <div className="admin-announcement-field"><span>{language === "ar" ? "الصورة" : language === "en" ? "Photo" : "Photo"}</span><label className="admin-announcement-upload"><input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={e => setEditPhoto(e.target.files?.[0] ?? null)} /><span>📷 {editPhoto ? editPhoto.name : (language === "ar" ? "تغيير الصورة" : language === "en" ? "Change photo" : "Changer la photo")}</span></label></div>
                <label className="admin-announcement-field admin-announcement-field-full"><span>{language === "ar" ? "الوصف" : "Description"}</span><textarea value={editForm.description} onChange={e => setEditForm(v => ({...v, description:e.target.value}))} /></label>
              </> : <>
                <label className="admin-announcement-field"><span>{language === "ar" ? "العنوان" : language === "en" ? "Title" : "Titre"}</span><input value={editForm.titre} onChange={e => setEditForm(v => ({...v, titre:e.target.value}))} required /></label>
                <label className="admin-announcement-field"><span>{language === "ar" ? "الحالة" : language === "en" ? "Status" : "Statut"}</span><select value={editForm.statut} onChange={e => setEditForm(v => ({...v, statut:e.target.value}))}><option value="publie">{language === "ar" ? "منشور" : language === "en" ? "Published" : "Publié"}</option><option value="brouillon">{language === "ar" ? "مسودة" : language === "en" ? "Draft" : "Brouillon"}</option><option value="archive">{language === "ar" ? "مؤرشف" : language === "en" ? "Archived" : "Archivé"}</option></select></label>
                {section === "news" && <label className="admin-announcement-field admin-announcement-field-full"><span>{language === "ar" ? "الملخص" : language === "en" ? "Summary" : "Résumé"}</span><textarea value={editForm.resume} onChange={e => setEditForm(v => ({...v, resume:e.target.value}))} /></label>}
                <label className="admin-announcement-field admin-announcement-field-full"><span>{language === "ar" ? "المحتوى" : language === "en" ? "Content" : "Contenu"}</span><textarea value={editForm.contenu} onChange={e => setEditForm(v => ({...v, contenu:e.target.value}))} required /></label>
                <div className="admin-announcement-field"><span>{language === "ar" ? "الصورة" : language === "en" ? "Photo" : "Photo"}</span><label className="admin-announcement-upload"><input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={e => setEditPhoto(e.target.files?.[0] ?? null)} /><span>📷 {editPhoto ? editPhoto.name : (language === "ar" ? "تغيير الصورة" : language === "en" ? "Change photo" : "Changer la photo")}</span></label></div>
                <label className="admin-announcement-field"><span>{language === "ar" ? "تاريخ النشر" : language === "en" ? "Publication date" : "Date de publication"}</span><input type="datetime-local" value={editForm.date_publication} onChange={e => setEditForm(v => ({...v, date_publication:e.target.value}))} /></label>
              </>}
            </div>
            <div className="admin-announcement-form-actions"><button type="button" className="soft-data-filter-button" onClick={() => setEditingRow(null)}>{language === "ar" ? "إلغاء" : language === "en" ? "Cancel" : "Annuler"}</button><button type="submit" className="admin-announcement-submit" disabled={savingEdit}>{savingEdit ? <><RefreshCw size={15} className="spin" /> {language === "ar" ? "جارٍ الحفظ..." : language === "en" ? "Saving..." : "Enregistrement..."}</> : <><Pencil size={15} /> {language === "ar" ? "حفظ التعديلات" : language === "en" ? "Save changes" : "Enregistrer"}</>}</button></div>
          </form>
        </div>}

        <div className="admin-toolbar soft-data-toolbar">
          <div className="soft-data-search"><Search size={16} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("admin.data.search")} aria-label={t("admin.data.searchAria")} /></div>
          <div className={`soft-data-filter${filterOpen ? " is-open" : ""}`}>
            <button type="button" className="soft-data-filter-trigger" aria-haspopup="listbox" aria-expanded={filterOpen} onClick={() => setFilterOpen(v => !v)}><span>{filter === "all" ? t("admin.data.allStatuses") : text(filter)}</span><ChevronDown size={15} /></button>
            {filterOpen && <div className="soft-data-filter-menu" role="listbox" aria-label={t("admin.data.allStatuses")}><button type="button" className={filter === "all" ? "is-selected" : ""} onClick={() => { setFilter("all"); setFilterOpen(false); }}>{t("admin.data.allStatuses")}</button>{options.map(o => <button type="button" key={o} role="option" aria-selected={filter === o} className={filter === o ? "is-selected" : ""} onClick={() => { setFilter(o); setFilterOpen(false); }}>{text(o)}</button>)}</div>}
          </div>
          <button className="soft-data-filter-button" onClick={() => { setSearch(""); setFilter("all"); setFilterOpen(false); }}><RefreshCw size={14} /> {t("admin.data.reset")}</button>
        </div>

        {loading ? <div className="admin-empty-state soft-data-empty">{t("admin.data.loading")}</div> : rows.length === 0 ? <div className="admin-empty-state soft-data-empty">{t("admin.data.noData")}</div> : <div className="admin-data-table-wrapper soft-data-table-wrap"><table className="admin-data-table soft-data-table"><thead><tr>{keys.map(k => <th key={k}>{text(k)}</th>)}{(options.length > 0 || section === "messages" || section === "sectors" || section === "announcements" || section === "news") && <th>{language === "ar" ? "الإجراء" : "Action"}</th>}</tr></thead><tbody>{rows.map((r, i) => <tr key={r.id ?? i}>
  {keys.map(k => <td key={k}>{k === "user_id" ? userIdOf(r) : (k === "image" && (section === "news" || section === "announcements")) ? <img src={imageUrl(r[k], Number(r.id), section)} alt="" className="soft-data-image-preview" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = imageUrl("", Number(r.id), section); }} /> : k === "image_url" && section === "sectors" ? <img src={String(r[k])} alt="" className="soft-data-image-preview" onError={(e) => { e.currentTarget.style.display = "none"; }} /> : k === "statut" ? <span className={`admin-status-badge status-${r[k]}`}>{text(r[k])}</span> : k === "lu" ? (isRead(r) ? t("admin.data.read") : t("admin.data.unread")) : k === "date_publication" ? (r[k] ? new Date(String(r[k]).replace(" ", "T")).toLocaleString(language === "ar" ? "ar-DZ" : language === "fr" ? "fr-DZ" : "en-DZ", { dateStyle: "medium", timeStyle: "short" }) : "—") : k.includes("montant") || k.includes("investissement") ? da(r[k], language) : String(r[k] ?? "—")}</td>)}
  {(options.length > 0 || section === "messages" || section === "sectors" || section === "announcements" || section === "news") && <td><div className="soft-data-actions">
      {(section === "sectors" || section === "announcements" || section === "news") && <button type="button" className="soft-edit-button" disabled={deleting === Number(r.id) || saving === Number(r.id)} onClick={() => openEdit(r)} aria-label={language === "ar" ? "تعديل" : language === "en" ? "Edit" : "Modifier"} title={language === "ar" ? "تعديل" : language === "en" ? "Edit" : "Modifier"}><Pencil size={15} />{language === "ar" ? "تعديل" : language === "en" ? "Edit" : "Modifier"}</button>}
      {options.length > 0 && <select className="status-select soft-status-select" value={String(r.statut ?? "")} disabled={saving === Number(r.id) || deleting === Number(r.id)} onChange={e => void update(r, e.target.value)} aria-label={t("admin.data.updateStatus") + " " + text(r.titre ?? r.nom ?? r.id)}><option value="">—</option>{options.map(o => <option key={o} value={o}>{text(o)}</option>)}</select>}
      {section === "messages" && <button className={`admin-read-toggle soft-read-toggle ${isRead(r) ? "is-read" : "is-unread"}`} disabled={saving === Number(r.id) || deleting === Number(r.id)} onClick={() => void toggleMessage(r)}>{isRead(r) ? t("admin.data.markUnread") : t("admin.data.markRead")}</button>}
      <button type="button" className="soft-delete-button" disabled={deleting === Number(r.id) || saving === Number(r.id)} onClick={() => void remove(r)} aria-label={(language === "ar" ? "حذف" : language === "en" ? "Delete" : "Supprimer") + " " + text(r.titre ?? r.nom ?? r.sujet ?? r.objet ?? r.id)} title={language === "ar" ? "حذف" : language === "en" ? "Delete" : "Supprimer"}><Trash2 size={15} />{language === "ar" ? "حذف" : language === "en" ? "Delete" : "Supprimer"}</button>
    </div></td>}
</tr>)}</tbody></table></div>}
      </section>
    </main>
  </div>;
}
