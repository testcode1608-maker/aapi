import { useCallback, useEffect, useState } from "react";
import AdminNavbar from "../components/AdminNavbar";
import "../styles/main.css";

const API_URL =
  "http://localhost/aapi-api/auth/admin/requests.php";

interface RequestItem {
  id: number;
  user_id: number;
  projet_id: number | null;
  type_demande: string;
  objet: string;
  description: string | null;
  montant_demande: number | null;
  wilaya: string | null;
  statut: string;
  priorite: string;
  reponse: string | null;
  traite_par: number | null;
  date_traitement: string | null;
  created_at: string;

  nom: string;
  prenom: string;
  email: string;

  titre_projet: string | null;
  admin_nom: string | null;
  admin_prenom: string | null;
}

interface Stats {
  total: number;
  nouvelle: number;
  en_cours: number;
  en_attente: number;
  acceptee: number;
  refusee: number;
  terminee: number;
  urgentes: number;
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

function statusLabel(value: string) {
  const labels: Record<string, string> = {
    nouvelle: "Nouvelle",
    en_cours: "En cours",
    en_attente: "En attente",
    acceptee: "Acceptée",
    refusee: "Refusée",
    terminee: "Terminée",
  };

  return labels[value] || value;
}

function typeLabel(value: string) {
  const labels: Record<string, string> = {
    nouveau_projet: "Nouveau projet",
    extension: "Extension",
    accompagnement: "Accompagnement",
    foncier: "Foncier",
    financement: "Financement",
    information: "Information",
    autre: "Autre",
  };

  return labels[value] || value;
}

function priorityLabel(value: string) {
  const labels: Record<string, string> = {
    basse: "Basse",
    normale: "Normale",
    haute: "Haute",
    urgente: "Urgente",
  };

  return labels[value] || value;
}

function AdminRequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>(
    []
  );

  const [stats, setStats] = useState<Stats>({
    total: 0,
    nouvelle: 0,
    en_cours: 0,
    en_attente: 0,
    acceptee: 0,
    refusee: 0,
    terminee: 0,
    urgentes: 0,
  });

  const [search, setSearch] = useState("");
  const [statut, setStatut] = useState("tous");
  const [priorite, setPriorite] = useState("tous");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRequests = useCallback(async () => {
    const id = getAdminId();

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

      if (priorite !== "tous") {
        params.set("priorite", priorite);
      }

      const response = await fetch(
        `${API_URL}?${params.toString()}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Impossible de charger les demandes."
        );
      }

      setRequests(
        Array.isArray(data.requests)
          ? data.requests
          : []
      );

      setStats({
        total: Number(data.stats?.total || 0),
        nouvelle: Number(
          data.stats?.nouvelle || 0
        ),
        en_cours: Number(
          data.stats?.en_cours || 0
        ),
        en_attente: Number(
          data.stats?.en_attente || 0
        ),
        acceptee: Number(
          data.stats?.acceptee || 0
        ),
        refusee: Number(
          data.stats?.refusee || 0
        ),
        terminee: Number(
          data.stats?.terminee || 0
        ),
        urgentes: Number(
          data.stats?.urgentes || 0
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
  }, [search, statut, priorite]);

  useEffect(() => {
    const timer = setTimeout(
      loadRequests,
      300
    );

    return () => clearTimeout(timer);
  }, [loadRequests]);

  const updateStatus = async (
    requestId: number,
    newStatus: string
  ) => {
    const id = getAdminId();

    if (!id) return;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: id,
          action: "update_request_status",
          request_id: requestId,
          statut: newStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Impossible de modifier la demande."
        );
      }

      await loadRequests();
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
      className="admin-requests-page"
      dir="rtl"
    >
      <AdminNavbar currentPage="requests" />

      <main className="admin-requests-content">

        <header className="admin-requests-header">

          <div>
            <span>إدارة الطلبات</span>

            <h1>طلبات المستثمرين</h1>

            <p>
              معالجة طلبات المستثمرين ومتابعة
              مراحلها.
            </p>
          </div>

          <button
            onClick={loadRequests}
            disabled={loading}
            className="requests-refresh"
          >
            ↻ تحديث
          </button>

        </header>

        <section className="requests-stats">

          <div>
            <small>إجمالي الطلبات</small>
            <strong>{stats.total}</strong>
          </div>

          <div className="new">
            <small>جديدة</small>
            <strong>{stats.nouvelle}</strong>
          </div>

          <div className="progress">
            <small>قيد المعالجة</small>
            <strong>{stats.en_cours}</strong>
          </div>

          <div className="waiting">
            <small>في الانتظار</small>
            <strong>{stats.en_attente}</strong>
          </div>

          <div className="accepted">
            <small>مقبولة</small>
            <strong>{stats.acceptee}</strong>
          </div>

          <div className="urgent">
            <small>عاجلة</small>
            <strong>{stats.urgentes}</strong>
          </div>

        </section>

        <section className="requests-filters">

          <div className="request-search">

            <span>⌕</span>

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="ابحث عن الطلب أو المستثمر..."
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
            <option value="nouvelle">
              Nouvelle
            </option>
            <option value="en_cours">
              En cours
            </option>
            <option value="en_attente">
              En attente
            </option>
            <option value="acceptee">
              Acceptée
            </option>
            <option value="refusee">
              Refusée
            </option>
            <option value="terminee">
              Terminée
            </option>
          </select>

          <select
            value={priorite}
            onChange={(e) =>
              setPriorite(e.target.value)
            }
          >
            <option value="tous">
              جميع الأولويات
            </option>
            <option value="basse">Basse</option>
            <option value="normale">Normale</option>
            <option value="haute">Haute</option>
            <option value="urgente">Urgente</option>
          </select>

        </section>

        {error && (
          <div className="request-error">
            <strong>خطأ</strong>
            <span>{error}</span>
            <button onClick={loadRequests}>
              إعادة المحاولة
            </button>
          </div>
        )}

        <section className="request-table-card">

          <div className="request-heading">
            <div>
              <h2>طلبات المستثمرين</h2>
              <span>
                {requests.length} نتيجة
              </span>
            </div>
          </div>

          {loading ? (
            <div className="request-loading">
              <div />
              <p>جاري تحميل الطلبات...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="request-empty">
              <div>▤</div>
              <h3>لا توجد طلبات</h3>
              <p>
                لا توجد طلبات مطابقة للبحث.
              </p>
            </div>
          ) : (
            <div className="request-table-wrapper">

              <table>

                <thead>
                  <tr>
                    <th>الطلب</th>
                    <th>المستثمر</th>
                    <th>النوع</th>
                    <th>الولاية</th>
                    <th>الأولوية</th>
                    <th>التاريخ</th>
                    <th>الحالة</th>
                    <th>تعديل</th>
                  </tr>
                </thead>

                <tbody>

                  {requests.map((request) => (
                    <tr key={request.id}>

                      <td>
                        <div className="request-object">
                          <strong>
                            {request.objet}
                          </strong>

                          {request.titre_projet && (
                            <small>
                              مشروع:{" "}
                              {request.titre_projet}
                            </small>
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="request-investor">
                          <strong>
                            {request.prenom}{" "}
                            {request.nom}
                          </strong>

                          <small>
                            {request.email}
                          </small>
                        </div>
                      </td>

                      <td>
                        {typeLabel(
                          request.type_demande
                        )}
                      </td>

                      <td>
                        {request.wilaya || "—"}
                      </td>

                      <td>
                        <span
                          className={`request-priority priority-${request.priorite}`}
                        >
                          {priorityLabel(
                            request.priorite
                          )}
                        </span>
                      </td>

                      <td>
                        {new Date(
                          request.created_at.replace(
                            " ",
                            "T"
                          )
                        ).toLocaleDateString(
                          "fr-FR"
                        )}
                      </td>

                      <td>
                        <span
                          className={`request-status request-${request.statut}`}
                        >
                          {statusLabel(
                            request.statut
                          )}
                        </span>
                      </td>

                      <td>
                        <select
                          value={request.statut}
                          onChange={(e) =>
                            updateStatus(
                              request.id,
                              e.target.value
                            )
                          }
                        >
                          <option value="nouvelle">
                            Nouvelle
                          </option>
                          <option value="en_cours">
                            En cours
                          </option>
                          <option value="en_attente">
                            En attente
                          </option>
                          <option value="acceptee">
                            Acceptée
                          </option>
                          <option value="refusee">
                            Refusée
                          </option>
                          <option value="terminee">
                            Terminée
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

export default AdminRequestsPage;