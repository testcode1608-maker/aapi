import { useCallback, useEffect, useState } from "react";
import AdminNavbar from "../components/AdminNavbar";
import "../styles/main.css";

const API_URL =
  "http://localhost/aapi-api/auth/admin/projects.php";

interface Project {
  id: number;
  user_id: number;
  titre: string;
  slug: string | null;
  description: string | null;
  wilaya: string | null;
  commune: string | null;
  adresse: string | null;
  montant_investissement: number;
  nombre_emplois: number;
  superficie: number | null;
  unite_superficie: string | null;
  statut: string;
  image: string | null;
  date_debut: string | null;
  date_fin: string | null;
  created_at: string;
  updated_at: string;

  nom: string;
  prenom: string;
  email: string;

  secteurs: string | null;
}

interface Stats {
  total: number;
  brouillon: number;
  soumis: number;
  en_etude: number;
  approuve: number;
  en_cours: number;
  realise: number;
  rejete: number;
  archive: number;
  montant_total: number;
  emplois_total: number;
}

function getAdminId() {
  try {
    const user = JSON.parse(
      localStorage.getItem("aapi_user") || "null"
    );

    return user?.id ? Number(user.id) : null;
  } catch {
    return null;
  }
}

function money(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function date(value: string | null) {
  if (!value) return "—";

  return new Date(
    value.replace(" ", "T")
  ).toLocaleDateString("fr-FR");
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    brouillon: "Brouillon",
    soumis: "Soumis",
    en_etude: "En étude",
    approuve: "Approuvé",
    en_cours: "En cours",
    realise: "Réalisé",
    rejete: "Rejeté",
    archive: "Archivé",
  };

  return labels[status] || status;
}

function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    brouillon: 0,
    soumis: 0,
    en_etude: 0,
    approuve: 0,
    en_cours: 0,
    realise: 0,
    rejete: 0,
    archive: 0,
    montant_total: 0,
    emplois_total: 0,
  });

  const [search, setSearch] = useState("");
  const [statut, setStatut] = useState("tous");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProjects = useCallback(async () => {
    const adminId = getAdminId();

    if (!adminId) {
      setError("Session administrateur introuvable.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      params.set("user_id", String(adminId));

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (statut !== "tous") {
        params.set("statut", statut);
      }

      const response = await fetch(
        `${API_URL}?${params.toString()}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Impossible de charger les projets."
        );
      }

      setProjects(
        Array.isArray(data.projects)
          ? data.projects
          : []
      );

      setStats({
        total: Number(data.stats?.total || 0),
        brouillon: Number(data.stats?.brouillon || 0),
        soumis: Number(data.stats?.soumis || 0),
        en_etude: Number(data.stats?.en_etude || 0),
        approuve: Number(data.stats?.approuve || 0),
        en_cours: Number(data.stats?.en_cours || 0),
        realise: Number(data.stats?.realise || 0),
        rejete: Number(data.stats?.rejete || 0),
        archive: Number(data.stats?.archive || 0),
        montant_total: Number(
          data.stats?.montant_total || 0
        ),
        emplois_total: Number(
          data.stats?.emplois_total || 0
        ),
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur de connexion."
      );
    } finally {
      setLoading(false);
    }
  }, [search, statut]);

  useEffect(() => {
    const timer = setTimeout(
      loadProjects,
      300
    );

    return () => clearTimeout(timer);
  }, [loadProjects]);

  const updateStatus = async (
    projectId: number,
    newStatus: string
  ) => {
    const adminId = getAdminId();

    if (!adminId) return;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: adminId,
          action: "update_project_status",
          project_id: projectId,
          statut: newStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Impossible de modifier le statut."
        );
      }

      await loadProjects();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Erreur."
      );
    }
  };

  return (
    <div
      className="admin-projects-page"
      dir="rtl"
    >
      <AdminNavbar currentPage="projects" />

      <main className="admin-projects-content">

        <header className="admin-projects-header">

          <div>
            <span>إدارة المشاريع</span>

            <h1>المشاريع الاستثمارية</h1>

            <p>
              متابعة المشاريع وتحديث حالتها
              مباشرة من قاعدة البيانات.
            </p>
          </div>

          <button
            className="admin-project-refresh"
            onClick={loadProjects}
            disabled={loading}
          >
            ↻ تحديث
          </button>

        </header>

        <section className="projects-stat-grid">

          <div className="project-stat">
            <small>إجمالي المشاريع</small>
            <strong>{stats.total}</strong>
          </div>

          <div className="project-stat submitted">
            <small>المشاريع المرسلة</small>
            <strong>{stats.soumis}</strong>
          </div>

          <div className="project-stat approved">
            <small>المشاريع المعتمدة</small>
            <strong>{stats.approuve}</strong>
          </div>

          <div className="project-stat running">
            <small>قيد الإنجاز</small>
            <strong>{stats.en_cours}</strong>
          </div>

          <div className="project-stat finished">
            <small>المشاريع المنجزة</small>
            <strong>{stats.realise}</strong>
          </div>

          <div className="project-stat money">
            <small>إجمالي الاستثمار</small>
            <strong>
              {money(stats.montant_total)}
              <em> DA</em>
            </strong>
          </div>

        </section>

        <section className="admin-project-filters">

          <div className="project-search">
            <span>⌕</span>

            <input
              type="search"
              placeholder="البحث عن مشروع أو مستثمر أو ولاية..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          <select
            value={statut}
            onChange={(e) =>
              setStatut(e.target.value)
            }
          >
            <option value="tous">
              جميع الحالات
            </option>
            <option value="brouillon">
              Brouillon
            </option>
            <option value="soumis">
              Soumis
            </option>
            <option value="en_etude">
              En étude
            </option>
            <option value="approuve">
              Approuvé
            </option>
            <option value="en_cours">
              En cours
            </option>
            <option value="realise">
              Réalisé
            </option>
            <option value="rejete">
              Rejeté
            </option>
            <option value="archive">
              Archivé
            </option>
          </select>

        </section>

        {error && (
          <div className="admin-project-error">
            <strong>خطأ</strong>
            <span>{error}</span>
            <button onClick={loadProjects}>
              إعادة المحاولة
            </button>
          </div>
        )}

        <section className="admin-project-table-card">

          <div className="project-table-title">
            <div>
              <h2>قائمة المشاريع</h2>
              <span>
                {projects.length} مشروع
              </span>
            </div>
          </div>

          {loading ? (
            <div className="project-loading">
              <div />
              <p>جاري تحميل المشاريع...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="project-empty">
              <div>⌂</div>
              <h3>لا توجد مشاريع</h3>
              <p>
                لا توجد نتائج مطابقة للبحث الحالي.
              </p>
            </div>
          ) : (
            <div className="project-table-wrapper">

              <table>

                <thead>
                  <tr>
                    <th>المشروع</th>
                    <th>المستثمر</th>
                    <th>الموقع</th>
                    <th>الاستثمار</th>
                    <th>الوظائف</th>
                    <th>التاريخ</th>
                    <th>الحالة</th>
                    <th>تعديل</th>
                  </tr>
                </thead>

                <tbody>

                  {projects.map((project) => (
                    <tr key={project.id}>

                      <td>
                        <div className="project-title">
                          <strong>
                            {project.titre}
                          </strong>

                          {project.secteurs && (
                            <span>
                              {project.secteurs}
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="project-investor">
                          <strong>
                            {project.prenom}{" "}
                            {project.nom}
                          </strong>
                          <span>
                            {project.email}
                          </span>
                        </div>
                      </td>

                      <td>
                        {[
                          project.wilaya,
                          project.commune,
                        ]
                          .filter(Boolean)
                          .join(" / ") || "—"}
                      </td>

                      <td>
                        <strong>
                          {money(
                            project.montant_investissement
                          )}{" "}
                          DA
                        </strong>
                      </td>

                      <td>
                        {project.nombre_emplois || 0}
                      </td>

                      <td>
                        {date(project.created_at)}
                      </td>

                      <td>
                        <span
                          className={`project-status status-${project.statut}`}
                        >
                          {statusLabel(
                            project.statut
                          )}
                        </span>
                      </td>

                      <td>
                        <select
                          className="project-status-select"
                          value={project.statut}
                          onChange={(e) =>
                            updateStatus(
                              project.id,
                              e.target.value
                            )
                          }
                        >
                          <option value="brouillon">
                            Brouillon
                          </option>
                          <option value="soumis">
                            Soumis
                          </option>
                          <option value="en_etude">
                            En étude
                          </option>
                          <option value="approuve">
                            Approuvé
                          </option>
                          <option value="en_cours">
                            En cours
                          </option>
                          <option value="realise">
                            Réalisé
                          </option>
                          <option value="rejete">
                            Rejeté
                          </option>
                          <option value="archive">
                            Archivé
                          </option>
                        </select>
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </main>
    </div>
  );
}

export default AdminProjectsPage;