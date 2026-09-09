import { useCallback, useEffect, useState } from "react";
import AdminNavbar from "../components/AdminNavbar";
import "../styles/main.css";

const API_URL =
  "http://localhost/aapi-api/auth/admin/investors.php";

interface Investor {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  statut: string;
  photo: string | null;

  type_investisseur: string | null;
  nom_entreprise: string | null;
  registre_commerce: string | null;
  nif: string | null;
  nis: string | null;

  wilaya: string | null;
  commune: string | null;
  adresse: string | null;

  site_web: string | null;
  secteur_activite: string | null;

  created_at: string;
  last_login: string | null;
}

interface Stats {
  total: number;
  actifs: number;
  inactifs: number;
  suspendus: number;
  personnes_physiques: number;
  personnes_morales: number;
  investisseurs_etrangers: number;
  pourcentage_actifs: number;
}

function getAdminId(): number | null {
  try {
    const user = JSON.parse(
      localStorage.getItem("aapi_user") || "null"
    );

    if (!user?.id) return null;

    return Number(user.id);
  } catch {
    return null;
  }
}

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value.replace(" ", "T"));

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getTypeLabel(type: string | null) {
  switch (type) {
    case "personne_physique":
      return "Personne physique";

    case "personne_morale":
      return "Personne morale";

    case "investisseur_etranger":
      return "Investisseur étranger";

    default:
      return "Non renseigné";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "actif":
      return "Actif";

    case "inactif":
      return "Inactif";

    case "suspendu":
      return "Suspendu";

    default:
      return status;
  }
}

function AdminInvestorsPage() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    actifs: 0,
    inactifs: 0,
    suspendus: 0,
    personnes_physiques: 0,
    personnes_morales: 0,
    investisseurs_etrangers: 0,
    pourcentage_actifs: 0,
  });

  const [search, setSearch] = useState("");
  const [statut, setStatut] = useState("tous");
  const [type, setType] = useState("tous");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadInvestors = useCallback(async () => {
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

      if (type !== "tous") {
        params.set("type_investisseur", type);
      }

      const response = await fetch(
        `${API_URL}?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Impossible de charger les investisseurs."
        );
      }

      setInvestors(
        Array.isArray(data.investors)
          ? data.investors
          : []
      );

      setStats({
        total: Number(data.stats?.total || 0),
        actifs: Number(data.stats?.actifs || 0),
        inactifs: Number(data.stats?.inactifs || 0),
        suspendus: Number(data.stats?.suspendus || 0),
        personnes_physiques: Number(
          data.stats?.personnes_physiques || 0
        ),
        personnes_morales: Number(
          data.stats?.personnes_morales || 0
        ),
        investisseurs_etrangers: Number(
          data.stats?.investisseurs_etrangers || 0
        ),
        pourcentage_actifs: Number(
          data.stats?.pourcentage_actifs || 0
        ),
      });
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Erreur de connexion au serveur."
      );

      setInvestors([]);
    } finally {
      setLoading(false);
    }
  }, [search, statut, type]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadInvestors();
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadInvestors]);

  const updateStatus = async (
    investorId: number,
    newStatus: string
  ) => {
    const adminId = getAdminId();

    if (!adminId) return;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          user_id: adminId,
          target_user_id: investorId,
          action: "update_investor_status",
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

      await loadInvestors();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Erreur."
      );
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatut("tous");
    setType("tous");
  };

  return (
    <div
      className="admin-investors-page"
      dir="rtl"
    >
      <AdminNavbar currentPage="investors" />

      <main className="admin-investors-content">

        <section className="admin-investors-header">

          <div>
            <span className="admin-section-kicker">
              إدارة المستثمرين
            </span>

            <h1>
              المستثمرون
            </h1>

            <p>
              إدارة ومتابعة جميع المستثمرين المسجلين
              في منصة AAPI.
            </p>
          </div>

          <button
            type="button"
            className="admin-refresh-button"
            onClick={loadInvestors}
            disabled={loading}
          >
            ↻
            <span>
              {loading
                ? "جاري التحديث..."
                : "تحديث"}
            </span>
          </button>

        </section>

        {/* STATS */}

        <section className="admin-investors-stats">

          <div className="investor-stat-card">
            <span className="stat-icon">♙</span>

            <div>
              <small>
                إجمالي المستثمرين
              </small>

              <strong>
                {stats.total}
              </strong>
            </div>
          </div>

          <div className="investor-stat-card success">
            <span className="stat-icon">✓</span>

            <div>
              <small>
                المستثمرون النشطون
              </small>

              <strong>
                {stats.actifs}
              </strong>

              <em>
                {stats.pourcentage_actifs}%
              </em>
            </div>
          </div>

          <div className="investor-stat-card warning">
            <span className="stat-icon">◷</span>

            <div>
              <small>
                قيد التعليق
              </small>

              <strong>
                {stats.suspendus}
              </strong>
            </div>
          </div>

          <div className="investor-stat-card gold">
            <span className="stat-icon">▣</span>

            <div>
              <small>
                شركات
              </small>

              <strong>
                {stats.personnes_morales}
              </strong>
            </div>
          </div>

        </section>

        {/* FILTERS */}

        <section className="admin-investors-filters">

          <div className="investor-search">

            <span>⌕</span>

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="البحث بالاسم أو البريد أو الشركة..."
            />

          </div>

          <select
            value={statut}
            onChange={(event) =>
              setStatut(event.target.value)
            }
          >
            <option value="tous">
              جميع الحالات
            </option>

            <option value="actif">
              نشط
            </option>

            <option value="inactif">
              غير نشط
            </option>

            <option value="suspendu">
              موقوف
            </option>
          </select>

          <select
            value={type}
            onChange={(event) =>
              setType(event.target.value)
            }
          >
            <option value="tous">
              جميع الأنواع
            </option>

            <option value="personne_physique">
              شخص طبيعي
            </option>

            <option value="personne_morale">
              شخص معنوي
            </option>

            <option value="investisseur_etranger">
              مستثمر أجنبي
            </option>
          </select>

          {(search ||
            statut !== "tous" ||
            type !== "tous") && (
            <button
              type="button"
              className="clear-filters"
              onClick={clearFilters}
            >
              × مسح
            </button>
          )}

        </section>

        {/* ERROR */}

        {error && (
          <div className="admin-page-error">
            <strong>حدث خطأ</strong>
            <span>{error}</span>

            <button
              type="button"
              onClick={loadInvestors}
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* TABLE */}

        <section className="admin-investors-table-card">

          <div className="table-card-header">

            <div>
              <h2>
                قائمة المستثمرين
              </h2>

              <span>
                {investors.length} نتيجة
              </span>
            </div>

          </div>

          {loading ? (
            <div className="admin-table-loading">
              <div className="loading-spinner" />
              <p>
                جاري تحميل المستثمرين...
              </p>
            </div>
          ) : investors.length === 0 ? (
            <div className="admin-empty-state">
              <div>♙</div>

              <h3>
                لا يوجد مستثمرون
              </h3>

              <p>
                لم يتم العثور على مستثمرين
                حسب معايير البحث الحالية.
              </p>
            </div>
          ) : (
            <div className="admin-table-wrapper">

              <table>

                <thead>
                  <tr>
                    <th>المستثمر</th>
                    <th>الشركة</th>
                    <th>النوع</th>
                    <th>الموقع</th>
                    <th>القطاع</th>
                    <th>الحالة</th>
                    <th>التسجيل</th>
                    <th>إجراء</th>
                  </tr>
                </thead>

                <tbody>

                  {investors.map((investor) => {

                    const initials =
                      `${investor.prenom?.charAt(0) || ""}${investor.nom?.charAt(0) || ""}`
                        .toUpperCase();

                    return (
                      <tr key={investor.id}>

                        <td>
                          <div className="investor-person">

                            <div className="investor-avatar">

                              {investor.photo ? (
                                <img
                                  src={investor.photo}
                                  alt=""
                                  onError={(event) => {
                                    event.currentTarget.style.display =
                                      "none";
                                  }}
                                />
                              ) : (
                                initials || "I"
                              )}

                            </div>

                            <div>
                              <strong>
                                {investor.prenom}{" "}
                                {investor.nom}
                              </strong>

                              <span>
                                {investor.email}
                              </span>
                            </div>

                          </div>
                        </td>

                        <td>
                          <span className="company-name">
                            {investor.nom_entreprise ||
                              "—"}
                          </span>
                        </td>

                        <td>
                          {getTypeLabel(
                            investor.type_investisseur
                          )}
                        </td>

                        <td>
                          {[
                            investor.wilaya,
                            investor.commune,
                          ]
                            .filter(Boolean)
                            .join(" / ") || "—"}
                        </td>

                        <td>
                          {investor.secteur_activite ||
                            "—"}
                        </td>

                        <td>

                          <span
                            className={`status-badge status-${investor.statut}`}
                          >
                            <i />
                            {getStatusLabel(
                              investor.statut
                            )}
                          </span>

                        </td>

                        <td>
                          {formatDate(
                            investor.created_at
                          )}
                        </td>

                        <td>

                          <select
                            className="status-select"
                            value={investor.statut}
                            onChange={(event) =>
                              updateStatus(
                                investor.id,
                                event.target.value
                              )
                            }
                          >
                            <option value="actif">
                              Actif
                            </option>

                            <option value="inactif">
                              Inactif
                            </option>

                            <option value="suspendu">
                              Suspendu
                            </option>
                          </select>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </main>
    </div>
  );
}

export default AdminInvestorsPage;