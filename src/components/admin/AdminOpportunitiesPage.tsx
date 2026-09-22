import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { CheckCircle2, ChevronDown, CircleAlert, Clock3, Database, Pencil, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";
import { useTranslation } from "../../i18n/I18nProvider";
import "../../styles/admin-opportunities.css";
import "../../styles/admin-soft-ui.css";

const API = "http://localhost/aapi-api/auth/admin/admin.php";
type Row = Record<string, any>;

const empty = {
  secteur: "",
  icone: "bi-buildings",
  titre: "",
  wilaya: "",
  description: "",
  investissement: "",
  emplois: "",
  image: "",
  statut: "publie",
};

export default function AdminOpportunitiesPage({ userId }: { userId: number }) {
  const { t, language } = useTranslation();
  const [rows, setRows] = useState<Row[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState(empty);
  const [modalOpen, setModalOpen] = useState(false);
  const [optionSectors, setOptionSectors] = useState<Array<{ id: number; nom: string }>>([]);
  const [optionProjects, setOptionProjects] = useState<Array<{ id: number; titre: string; wilaya: string }>>([]);
  const [optionWilayas, setOptionWilayas] = useState<Array<{ id: number; code: string; nom_fr: string; nom_ar: string }>>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        action: "opportunities",
        user_id: String(userId),
      });
      if (search.trim()) q.set("search", search.trim());

      const response = await fetch(API + "?" + q);
      const data = await response.json();
      if (!data.success) throw new Error(data.message);

      setRows(data.opportunities ?? []);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("admin.data.loadError"));
    } finally {
      setLoading(false);
    }
  }, [search, userId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const loadOptions = useCallback(async () => {
    try {
      const response = await fetch(API + "?action=opportunity_options&user_id=" + encodeURIComponent(String(userId)));
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      setOptionSectors(data.sectors ?? []);
      setOptionProjects(data.projects ?? []);
      setOptionWilayas(data.wilayas ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("admin.data.loadError"));
    }
  }, [userId, t]);

  useEffect(() => {
    void loadOptions();
  }, [loadOptions]);

  const open = (row?: Row) => {
    setEditing(row ?? null);
    setModalOpen(true);
    setForm(
      row
        ? {
            secteur: row.secteur ?? "",
            icone: row.icone ?? "bi-buildings",
            titre: row.titre ?? "",
            wilaya: row.wilaya ?? "",
            description: row.description ?? "",
            investissement: row.investissement ?? "",
            emplois: row.emplois ?? "",
            image: row.image ?? "",
            statut: row.statut ?? "publie",
          }
        : { ...empty },
    );
    setPhoto(null);
    setError("");
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("action", editing ? "update_opportunity" : "create_opportunity");
      formData.append("user_id", String(userId));
      if (editing) formData.append("id", String(editing.id));

      Object.entries(form).forEach(([key, value]) => formData.append(key, String(value)));
      if (photo) formData.append("image", photo);

      const response = await fetch(API, { method: "POST", body: formData });
      const data = await response.json();
      if (!data.success) throw new Error(data.message);

      setEditing(null);
      setModalOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("admin.data.opportunity.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm(t("admin.data.opportunity.confirmDelete"))) return;

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_opportunities",
          user_id: userId,
          record_id: id,
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("admin.data.opportunity.deleteError"));
    }
  };

  const statusLabel = (status: string) => {
    if (status === "publie") return t("admin.data.announcement.published");
    if (status === "brouillon") return t("admin.data.announcement.draft");
    return t("admin.data.announcement.archived");
  };

  const filteredRows = useMemo(
    () => statusFilter === "all" ? rows : rows.filter((row) => row.statut === statusFilter),
    [rows, statusFilter],
  );

  const reset = () => {
    setSearch("");
    setStatusFilter("all");
    setFilterOpen(false);
    if (!search) void load();
  };

  return (
    <div className="admin-dashboard admin-soft-data-page" dir={language === "ar" ? "rtl" : "ltr"}>
      <main className="admin-dashboard-main soft-data-main admin-opportunities-page">
        <header className="admin-opportunities-head">
          <div>
            <span>AAPI • {t("admin.data.section.opportunities.title")}</span>
            <h1>{t("admin.data.section.opportunities.title")}</h1>
            <p>{t("admin.data.section.opportunities.subtitle")}</p>
          </div>
          <button type="button" onClick={() => open()}>
            <Plus size={17} />
            {t("admin.data.opportunity.add")}
          </button>
        </header>

        <section className="soft-data-stat-grid">
          <article className="soft-data-stat green">
            <div className="soft-data-stat-icon"><Database size={18} /></div>
            <div>
              <span>{language === "ar" ? "إجمالي السجلات" : language === "fr" ? "Total des enregistrements" : "Total records"}</span>
              <strong>{rows.length}</strong>
              <small>AAPI • {language === "ar" ? "تحديث مباشر" : language === "fr" ? "Mise à jour en direct" : "Live update"}</small>
            </div>
          </article>
          <article className="soft-data-stat gold">
            <div className="soft-data-stat-icon"><CheckCircle2 size={18} /></div>
            <div>
              <span>{language === "ar" ? "نشطة / مقبولة" : language === "fr" ? "Actives / acceptées" : "Active / accepted"}</span>
              <strong>{rows.filter(row => row.statut === "publie").length}</strong>
              <small>AAPI • {language === "ar" ? "تحديث مباشر" : language === "fr" ? "Mise à jour en direct" : "Live update"}</small>
            </div>
          </article>
          <article className="soft-data-stat blue">
            <div className="soft-data-stat-icon"><Clock3 size={18} /></div>
            <div>
              <span>{language === "ar" ? "قيد المتابعة" : language === "fr" ? "En suivi" : "Under review"}</span>
              <strong>{rows.filter(row => row.statut === "brouillon").length}</strong>
              <small>AAPI • {language === "ar" ? "تحديث مباشر" : language === "fr" ? "Mise à jour en direct" : "Live update"}</small>
            </div>
          </article>
          <article className="soft-data-stat red">
            <div className="soft-data-stat-icon"><CircleAlert size={18} /></div>
            <div>
              <span>{language === "ar" ? "مرفوضة / متوقفة" : language === "fr" ? "Refusées / arrêtées" : "Rejected / stopped"}</span>
              <strong>{rows.filter(row => row.statut === "archive").length}</strong>
              <small>AAPI • {language === "ar" ? "تحديث مباشر" : language === "fr" ? "Mise à jour en direct" : "Live update"}</small>
            </div>
          </article>
        </section>

        <section className="admin-panel soft-data-panel">
        <div className="admin-panel-header soft-data-panel-head admin-opportunities-panel-head">
          <div>
            <span className="soft-ui-card-label">{t("admin.data.dataManagement")}</span>
            <h2>{t("admin.data.section.opportunities.title")}</h2>
            <p>{t("admin.data.section.opportunities.subtitle")}</p>
          </div>

          <div className="admin-opportunities-head-actions">
            <span className="soft-data-count">
              {filteredRows.length} {language === "ar" ? "عنصر" : language === "fr" ? "éléments" : "items"}
            </span>
          </div>
        </div>

        <div className="admin-toolbar soft-data-toolbar">
          <label className="soft-data-search">
            <Search size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={language === "ar" ? "ابحث في البيانات..." : t("admin.data.opportunity.search")}
              aria-label={t("admin.data.searchAria")}
            />
          </label>

          <div className="soft-data-filter">
            <button
              type="button"
              className="soft-data-filter-trigger"
              aria-haspopup="listbox"
              aria-expanded={filterOpen}
              onClick={() => setFilterOpen((value) => !value)}
            >
              <span>
                {statusFilter === "all"
                  ? language === "ar" ? "كل الحالات" : language === "fr" ? "Tous les statuts" : "All statuses"
                  : statusLabel(statusFilter)}
              </span>
              <ChevronDown size={15} />
            </button>

            {filterOpen && (
              <div className="soft-data-filter-menu" role="listbox">
                {["all", "publie", "brouillon", "archive"].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={statusFilter === value ? "is-selected" : ""}
                    onClick={() => {
                      setStatusFilter(value);
                      setFilterOpen(false);
                    }}
                  >
                    {value === "all"
                      ? language === "ar" ? "كل الحالات" : language === "fr" ? "Tous les statuts" : "All statuses"
                      : statusLabel(value)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button type="button" className="soft-data-filter-button" onClick={reset}>
            <RefreshCw size={14} />
            {language === "ar" ? "إعادة ضبط" : t("admin.data.reset")}
          </button>
        </div>

        {error && <div className="admin-opportunities-error">{error}</div>}

        {loading ? (
          <div className="admin-opportunities-empty">{t("admin.data.loading")}</div>
        ) : (
          <div className="admin-data-table-wrapper soft-data-table-wrap">
            <table className="admin-data-table soft-data-table">
              <thead>
                <tr>
                  <th>{language === "ar" ? "المعرف" : t("admin.data.labels.id")}</th>
                  <th>{t("admin.data.labels.secteur")}</th>
                  <th>{t("admin.data.labels.titre")}</th>
                  <th>{t("admin.data.labels.image")}</th>
                  <th>{t("admin.data.labels.wilaya")}</th>
                  <th>{t("admin.data.labels.montant")}</th>
                  <th>{t("admin.data.opportunity.jobs")}</th>
                  <th>{t("admin.data.labels.statut")}</th>
                  <th>{t("admin.data.action")}</th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.secteur}</td>
                    <td>{row.titre}</td>
                    <td>
                      <img
                        src={row.image_url || row.image || ""}
                        alt={row.titre ?? ""}
                        className="soft-data-image-preview"
                        loading="lazy"
                      />
                    </td>
                    <td>{row.wilaya}</td>
                    <td>{row.investissement}</td>
                    <td>{row.emplois}</td>
                    <td>
                      <span className={"admin-status-badge status-" + row.statut}>
                        {statusLabel(row.statut)}
                      </span>
                    </td>
                    <td>
                      <div className="soft-data-actions">
                        <button type="button" className="soft-edit-button" onClick={() => open(row)} aria-label={t("admin.data.opportunity.edit")} title={t("admin.data.opportunity.edit")}>
                          <Pencil size={15} />
                          {t("admin.data.opportunity.edit")}
                        </button>
                        <button
                          type="button"
                          className="soft-delete-button"
                          onClick={() => void remove(Number(row.id))}
                          aria-label={t("admin.data.opportunity.delete")}
                          title={t("admin.data.opportunity.delete")}
                        >
                          <Trash2 size={15} />
                          {t("admin.data.opportunity.delete")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filteredRows.length && (
                  <tr>
                    <td colSpan={9} className="soft-data-empty">
                      {t("admin.data.noData")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        </section>

        {modalOpen && (
        <div
          className="admin-opportunity-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModalOpen(false);
          }}
        >
          <form id="admin-create-form" className="admin-edit-modal admin-create-modal" onSubmit={save}>
            <div className="admin-announcement-form-head">
              <div className="admin-announcement-form-copy">
                <span className="admin-announcement-eyebrow">{editing ? t("admin.data.opportunity.edit") : t("admin.data.opportunity.new")}</span>
                <h2>{editing ? t("admin.data.opportunity.editTitle") : t("admin.data.opportunity.addTitle")}</h2>
                <p>{language === "ar" ? "أدخل معلومات فرصة الاستثمار ثم احفظ التغييرات." : language === "en" ? "Enter the investment opportunity details, then save the changes." : "Saisissez les informations de l’opportunité d’investissement, puis enregistrez les modifications."}</p>
              </div>
              <div className="admin-announcement-form-mark" aria-hidden="true"><Plus size={22} /></div>
              <button type="button" className="admin-announcement-modal-close" aria-label={t("admin.nav.closeMenu")} onClick={() => setModalOpen(false)}>
                <X size={19} />
              </button>
            </div>

            <div className="admin-announcement-form-grid">
              <label className="admin-announcement-field">
                <span>{t("admin.data.labels.wilaya")}</span>
                <select value={form.wilaya} onChange={(event) => setForm((value) => ({ ...value, wilaya: event.target.value }))} required>
                  <option value="">Sélectionner une wilaya</option>
                  {optionWilayas.map((wilaya) => {
                    const label = language === "ar" ? wilaya.nom_ar : wilaya.nom_fr;
                    return <option key={wilaya.id} value={wilaya.nom_fr}>{label}</option>;
                  })}
                  {form.wilaya && !optionWilayas.some((wilaya) => wilaya.nom_fr === form.wilaya || wilaya.nom_ar === form.wilaya) && <option value={form.wilaya}>{form.wilaya}</option>}
                </select>
              </label>

              <label className="admin-announcement-field">
                <span>{t("admin.data.labels.secteur")}</span>
                <select value={form.secteur} onChange={(event) => setForm((value) => ({ ...value, secteur: event.target.value }))} required>
                  <option value="">Sélectionner un secteur</option>
                  {optionSectors.map((sector) => <option key={sector.id} value={sector.nom}>{sector.nom}</option>)}
                  {form.secteur && !optionSectors.some((sector) => sector.nom === form.secteur) && <option value={form.secteur}>{form.secteur}</option>}
                </select>
              </label>

              <label className="admin-announcement-field">
                <span>Projet</span>
                <select value={form.titre} onChange={(event) => {
                  const titre = event.target.value;
                  const project = optionProjects.find((item) => item.titre === titre);
                  setForm((value) => ({ ...value, titre, ...(project?.wilaya ? { wilaya: project.wilaya } : {}) }));
                }} required>
                  <option value="">Sélectionner un projet</option>
                  {optionProjects.map((project) => <option key={project.id} value={project.titre}>{project.titre}</option>)}
                  {form.titre && !optionProjects.some((project) => project.titre === form.titre) && <option value={form.titre}>{form.titre}</option>}
                </select>
              </label>

              {([
                ["investissement", t("admin.data.opportunity.investment")],
                ["emplois", t("admin.data.opportunity.jobs")],
                ["icone", t("admin.data.opportunity.icon")],
              ] as const).map(([key, label]) => (
                <label key={key} className="admin-announcement-field">
                  <span>{label}</span>
                  <input value={String(form[key])} onChange={(event) => setForm((value) => ({ ...value, [key]: event.target.value }))} required />
                </label>
              ))}

              <label className="admin-announcement-field">
                <span>{t("admin.data.labels.statut")}</span>
                <select value={form.statut} onChange={(event) => setForm((value) => ({ ...value, statut: event.target.value }))}>
                  <option value="publie">{t("admin.data.announcement.published")}</option>
                  <option value="brouillon">{t("admin.data.announcement.draft")}</option>
                  <option value="archive">{t("admin.data.announcement.archived")}</option>
                </select>
              </label>

              <div className="admin-announcement-field">
                <span>{t("admin.data.labels.image")}</span>
                <label className="admin-announcement-upload">
                  <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} />
                  <span>📷 https://...</span>
                </label>
              </div>

              <label className="admin-announcement-field">
                <span>{t("admin.data.opportunity.imageUrl")}</span>
                <input value={form.image} onChange={(event) => setForm((value) => ({ ...value, image: event.target.value }))} />
              </label>

              <label className="admin-announcement-field admin-announcement-field-full">
                <span>{t("admin.data.labels.description")}</span>
                <textarea value={form.description} onChange={(event) => setForm((value) => ({ ...value, description: event.target.value }))} required />
              </label>
            </div>

            <div className="admin-announcement-form-actions">
              <button type="submit" className="admin-announcement-submit" disabled={saving}>
                {saving ? (
                  <>
                    <RefreshCw size={15} className="spin" />
                    {t("admin.data.opportunity.saving")}
                  </>
                ) : (
                  <>
                    <Pencil size={15} />
                    {t("admin.data.opportunity.save")}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        )}
      </main>
    </div>
  );
}
