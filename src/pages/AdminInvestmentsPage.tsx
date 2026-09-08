import { useCallback, useEffect, useState } from "react";
import AdminNavbar from "../components/AdminNavbar";
import "../styles/AdminInvestmentsPage.css";

const API_URL =
  "http://localhost/aapi-api/auth/admin/investments.php";

interface Investment {
  id: number;
  user_id: number;
  project_id: number;
  montant: number;
  date_investissement: string;
  statut: string;
  reference: string | null;
  notes: string | null;
  created_at: string;

  nom: string;
  prenom: string;
  email: string;

  titre_projet: string;
  wilaya: string | null;
  projet_statut: string;
}

interface Stats {
  total: number;
  en_attente: number;
  valide: number;
  en_cours: number;
  termine: number;
  annule: number;
  montant_total: number;
}

function adminId() {
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

function label(status: string) {
  const map: Record<string, string> = {
    en_attente: "En attente",
    valide: "Validé",
    en_cours: "En cours",
    termine: "Terminé",
    annule: "Annulé",
  };

  return map[status] || status;
}

function AdminInvestmentsPage() {
  const [items, setItems] = useState<Investment[]>([]);

  const [stats, setStats] = useState<Stats>({
    total: 0,
    en_attente: 0,
    valide: 0,
    en_cours: 0,
    termine: 0,
    annule: 0,
    montant_total: 0,
  });

  const [search, setSearch] = useState("");
  const [statut, setStatut] = useState("tous");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const id = adminId();

    if (!id) {
      setError("Session administrateur introuvable.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      params.set("user_id", String(id));

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
            "Impossible de charger les investissements."
        );
      }

      setItems(
        Array.isArray(data.investments)
          ? data.investments
          : []
      );

      setStats({
        total: Number(data.stats?.total || 0),
        en_attente: Number(
          data.stats?.en_attente || 0
        ),
        valide: Number(data.stats?.valide || 0),
        en_cours: Number(
          data.stats?.en_cours || 0
        ),
        termine: Number(
          data.stats?.termine || 0
        ),
        annule: Number(
          data.stats?.annule || 0
        ),
        montant_total: Number(
          data.stats?.montant_total || 0
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
    const timer = setTimeout(load, 300);

    return () => clearTimeout(timer);
  }, [load]);

  const updateStatus = async (
    investmentId: number,
    newStatus: string
  ) => {
    const id = adminId();

    if (!id) return;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: id,
          action: "update_investment_status",
          investment_id: investmentId,
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

      await load();
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
      className="admin-investments-page"
      dir="rtl"
    >
      <AdminNavbar currentPage="investments" />

      <main className="admin-investments-content">

        <header className="admin-investments-header">

          <div>
            <span>إدارة الاستثمارات</span>

            <h1>الاستثمارات</h1>

            <p>
              متابعة الاستثمارات المسجلة وحالتها
              وقيمتها المالية.
            </p>
          </div>

          <button
            onClick={load}
            disabled={loading}
            className="investment-refresh"
          >
            ↻ تحديث
          </button>

        </header>

        <section className="investment-stats">

          <div>
            <small>إجمالي العمليات</small>
            <strong>{stats.total}</strong>
          </div>

          <div>
            <small>في الانتظار</small>
            <strong>{stats.en_attente}</strong>
          </div>

          <div>
            <small>معتمدة</small>
            <strong>{stats.valide}</strong>
          </div>

          <div>
            <small>قيد التنفيذ</small>
            <strong>{stats.en_cours}</strong>
          </div>

          <div>
            <small>مكتملة</small>
            <strong>{stats.termine}</strong>
          </div>

          <div className="investment-total">
            <small>قيمة الاستثمارات</small>
            <strong>
              {money(stats.montant_total)}
              <em> DA</em>
            </strong>
          </div>

        </section>

        <section className="investment-filters">

          <div>
            <span>⌕</span>

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="ابحث عن مستثمر أو مشروع أو مرجع..."
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
            <option value="en_attente">
              En attente
            </option>
            <option value="valide">
              Validé
            </option>
            <option value="en_cours">
              En cours
            </option>
            <option value="termine">
              Terminé
            </option>
            <option value="annule">
              Annulé
            </option>
          </select>

        </section>

        {error && (
          <div className="investment-error">
            <strong>خطأ</strong>
            <span>{error}</span>
            <button onClick={load}>
              إعادة المحاولة
            </button>
          </div>
        )}

        <section className="investment-table-card">

          <div className="investment-table-heading">
            <h2>قائمة الاستثمارات</h2>
            <span>
              {items.length} نتيجة
            </span>
          </div>

          {loading ? (
            <div className="investment-loading">
              <div />
              <p>جاري التحميل...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="investment-empty">
              <div>₳</div>
              <h3>لا توجد استثمارات</h3>
              <p>
                لم يتم العثور على بيانات.
              </p>
            </div>
          ) : (
            <div className="investment-table-wrapper">

              <table>

                <thead>
                  <tr>
                    <th>المرجع</th>
                    <th>المستثمر</th>
                    <th>المشروع</th>
                    <th>المبلغ</th>
                    <th>التاريخ</th>
                    <th>الحالة</th>
                    <th>تعديل</th>
                  </tr>
                </thead>

                <tbody>

                  {items.map((item) => (
                    <tr key={item.id}>

                      <td>
                        <strong>
                          {item.reference ||
                            `INV-${item.id}`}
                        </strong>
                      </td>

                      <td>
                        <div>
                          <strong>
                            {item.prenom}{" "}
                            {item.nom}
                          </strong>
                          <small>
                            {item.email}
                          </small>
                        </div>
                      </td>

                      <td>
                        <div>
                          <strong>
                            {item.titre_projet}
                          </strong>

                          {item.wilaya && (
                            <small>
                              {item.wilaya}
                            </small>
                          )}
                        </div>
                      </td>

                      <td>
                        <strong>
                          {money(item.montant)} DA
                        </strong>
                      </td>

                      <td>
                        {new Date(
                          item.date_investissement.replace(
                            " ",
                            "T"
                          )
                        ).toLocaleDateString(
                          "fr-FR"
                        )}
                      </td>

                      <td>
                        <span
                          className={`investment-status status-${item.statut}`}
                        >
                          {label(item.statut)}
                        </span>
                      </td>

                      <td>
                        <select
                          value={item.statut}
                          onChange={(e) =>
                            updateStatus(
                              item.id,
                              e.target.value
                            )
                          }
                        >
                          <option value="en_attente">
                            En attente
                          </option>
                          <option value="valide">
                            Validé
                          </option>
                          <option value="en_cours">
                            En cours
                          </option>
                          <option value="termine">
                            Terminé
                          </option>
                          <option value="annule">
                            Annulé
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

export default AdminInvestmentsPage;