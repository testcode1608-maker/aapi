import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Pencil, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";
import { useTranslation } from "../../i18n/I18nProvider";
import "../../styles/admin-opportunities.css";

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState(empty);
  const [modalOpen, setModalOpen] = useState(false);

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

      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      if (photo) formData.append("image", photo);

      const response = await fetch(API, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!data.success) throw new Error(data.message);

      setEditing(null);
      setModalOpen(false);
      await load();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : t("admin.data.opportunity.saveError"),
      );
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
      setError(
        e instanceof Error
          ? e.message
          : t("admin.data.opportunity.deleteError"),
      );
    }
  };

  const statusLabel = (status: string) => {
    if (status === "publie") return t("admin.data.announcement.published");
    if (status === "brouillon") return t("admin.data.announcement.draft");
    return t("admin.data.announcement.archived");
  };

  return (
    <main
      className="admin-opportunities-page"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div className="admin-opportunities-head">
        <div>
          <span>AAPI • {t("admin.data.section.opportunities.title")}</span>
          <h1>{t("admin.data.section.opportunities.title")}</h1>
          <p>{t("admin.data.section.opportunities.subtitle")}</p>
        </div>

        <button type="button" onClick={() => open()}>
          <Plus size={17} />
          {t("admin.data.opportunity.add")}
        </button>
      </div>

      <div className="admin-opportunities-toolbar">
        <label>
          <Search size={16} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("admin.data.opportunity.search")}
            aria-label={t("admin.data.searchAria")}
          />
        </label>

        <button
          type="button"
          onClick={() => {
            setSearch("");
            void load();
          }}
        >
          <RefreshCw size={15} />
          {t("admin.data.reset")}
        </button>
      </div>

      {error && <div className="admin-opportunities-error">{error}</div>}

      {loading ? (
        <div className="admin-opportunities-empty">
          {t("admin.data.loading")}
        </div>
      ) : (
        <div className="admin-opportunities-table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t("admin.data.labels.image")}</th>
                <th>{t("admin.data.labels.secteur")}</th>
                <th>{t("admin.data.labels.titre")}</th>
                <th>{t("admin.data.labels.wilaya")}</th>
                <th>{t("admin.data.labels.montant")}</th>
                <th>{t("admin.data.opportunity.jobs")}</th>
                <th>{t("admin.data.labels.statut")}</th>
                <th>{t("admin.data.action")}</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <img src={row.image_url} alt={row.titre ?? ""} />
                  </td>
                  <td>{row.secteur}</td>
                  <td>{row.titre}</td>
                  <td>{row.wilaya}</td>
                  <td>{row.investissement}</td>
                  <td>{row.emplois}</td>
                  <td>
                    <span
                      className={"admin-opportunity-status " + row.statut}
                    >
                      {statusLabel(row.statut)}
                    </span>
                  </td>
                  <td>
                    <div className="admin-opportunity-actions">
                      <button type="button" onClick={() => open(row)}>
                        <Pencil size={15} />
                        {t("admin.data.opportunity.edit")}
                      </button>

                      <button
                        type="button"
                        className="danger"
                        onClick={() => void remove(Number(row.id))}
                      >
                        <Trash2 size={15} />
                        {t("admin.data.opportunity.delete")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div
          className="admin-opportunity-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModalOpen(false);
          }}
        >
          <form className="admin-opportunity-modal" onSubmit={save}>
            <header>
              <div>
                <span>
                  {editing
                    ? t("admin.data.opportunity.edit")
                    : t("admin.data.opportunity.new")}
                </span>
                <h2>
                  {editing
                    ? t("admin.data.opportunity.editTitle")
                    : t("admin.data.opportunity.addTitle")}
                </h2>
              </div>

              <button
                type="button"
                aria-label={t("admin.nav.closeMenu")}
                onClick={() => setModalOpen(false)}
              >
                <X size={19} />
              </button>
            </header>

            <div className="admin-opportunity-form-grid">
              {(
                [
                  ["secteur", t("admin.data.labels.secteur")],
                  ["titre", t("admin.data.labels.titre")],
                  ["wilaya", t("admin.data.labels.wilaya")],
                  ["investissement", t("admin.data.opportunity.investment")],
                  ["emplois", t("admin.data.opportunity.jobs")],
                  ["icone", t("admin.data.opportunity.icon")],
                ] as const
              ).map(([key, label]) => (
                <label key={key}>
                  <span>{label}</span>
                  <input
                    value={String(form[key])}
                    onChange={(event) =>
                      setForm((value) => ({
                        ...value,
                        [key]: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
              ))}

              <label>
                <span>{t("admin.data.labels.statut")}</span>
                <select
                  value={form.statut}
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      statut: event.target.value,
                    }))
                  }
                >
                  <option value="publie">
                    {t("admin.data.announcement.published")}
                  </option>
                  <option value="brouillon">
                    {t("admin.data.announcement.draft")}
                  </option>
                  <option value="archive">
                    {t("admin.data.announcement.archived")}
                  </option>
                </select>
              </label>

              <label className="full">
                <span>{t("admin.data.labels.image")}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={(event) =>
                    setPhoto(event.target.files?.[0] ?? null)
                  }
                />
              </label>

              <label className="full">
                <span>{t("admin.data.opportunity.imageUrl")}</span>
                <input
                  value={form.image}
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      image: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="full">
                <span>{t("admin.data.labels.description")}</span>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      description: event.target.value,
                    }))
                  }
                  required
                />
              </label>
            </div>

            <footer>
              <button type="button" onClick={() => setModalOpen(false)}>
                {t("admin.data.opportunity.cancel")}
              </button>

              <button className="primary" disabled={saving}>
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
            </footer>
          </form>
        </div>
      )}
    </main>
  );
}
