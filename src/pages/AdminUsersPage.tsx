import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import AdminNavbar from "../components/AdminNavbar";
import "../styles/main.css";

interface AdminUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  role: string;
  statut: string;
  photo?: string | null;
  last_login?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface UserStats {
  total: number;
  investisseurs: number;
  admins: number;
  agents: number;
  actifs: number;
  inactifs: number;
  suspendus: number;
  pourcentage_actifs: number;
  pourcentage_investisseurs: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  stats?: UserStats;
  users?: AdminUser[];
}

const API_URL =
  "http://localhost/aapi-api/auth/admin/users.php";

function getCurrentAdmin() {
  try {
    const stored = localStorage.getItem("aapi_user");

    if (!stored) {
      return null;
    }

    const user = JSON.parse(stored);

    if (
      !user ||
      !user.id ||
      String(user.role || "").toLowerCase() !== "admin"
    ) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

function getInitials(user: AdminUser) {
  const first =
    user.prenom?.trim().charAt(0) || "";

  const last =
    user.nom?.trim().charAt(0) || "";

  return `${first}${last}`.toUpperCase() || "U";
}

function roleLabel(role: string) {
  switch (role) {
    case "admin":
      return "مسؤول";

    case "agent":
      return "وكيل";

    case "investisseur":
      return "مستثمر";

    default:
      return role;
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "actif":
      return "نشط";

    case "inactif":
      return "غير نشط";

    case "suspendu":
      return "موقوف";

    default:
      return status;
  }
}

function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    investisseurs: 0,
    admins: 0,
    agents: 0,
    actifs: 0,
    inactifs: 0,
    suspendus: 0,
    pourcentage_actifs: 0,
    pourcentage_investisseurs: 0,
  });

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(
    null
  );

  const [error, setError] = useState("");

  const currentAdmin = useMemo(
    () => getCurrentAdmin(),
    []
  );

  const loadUsers = useCallback(async () => {
    if (!currentAdmin?.id) {
      setError(
        "جلسة المسؤول غير موجودة. يرجى تسجيل الدخول من جديد."
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      params.set(
        "user_id",
        String(currentAdmin.id)
      );

      if (search.trim()) {
        params.set(
          "search",
          search.trim()
        );
      }

      if (roleFilter) {
        params.set(
          "role",
          roleFilter
        );
      }

      if (statusFilter) {
        params.set(
          "statut",
          statusFilter
        );
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

      const data: ApiResponse =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "تعذر تحميل المستخدمين."
        );
      }

      setUsers(data.users || []);

      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error(
        "AdminUsersPage:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "تعذر الاتصال بالخادم."
      );
    } finally {
      setLoading(false);
    }
  }, [
    currentAdmin?.id,
    search,
    roleFilter,
    statusFilter,
  ]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadUsers();
    }, 250);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadUsers]);

  const updateStatus = async (
    targetUser: AdminUser,
    newStatus: string
  ) => {
    if (!currentAdmin?.id) {
      return;
    }

    if (targetUser.id === currentAdmin.id) {
      window.alert(
        "لا يمكنك تغيير حالة حساب المسؤول الحالي."
      );
      return;
    }

    if (targetUser.role === "admin") {
      window.alert(
        "لا يمكن تعديل حالة حساب مسؤول."
      );
      return;
    }

    if (targetUser.statut === newStatus) {
      return;
    }

    try {
      setUpdatingId(targetUser.id);

      const response = await fetch(
        API_URL,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Accept:
              "application/json",
          },
          body: JSON.stringify({
            action:
              "update_user_status",

            user_id:
              currentAdmin.id,

            target_user_id:
              targetUser.id,

            statut:
              newStatus,
          }),
        }
      );

      const data: ApiResponse =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "تعذر تحديث حالة المستخدم."
        );
      }

      setUsers((current) =>
        current.map((user) =>
          user.id === targetUser.id
            ? {
                ...user,
                statut: newStatus,
              }
            : user
        )
      );

      await loadUsers();
    } catch (err) {
      console.error(
        "update user status:",
        err
      );

      window.alert(
        err instanceof Error
          ? err.message
          : "حدث خطأ أثناء التحديث."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div
      className="admin-users-page"
      dir="rtl"
    >
      <AdminNavbar currentPage="users" />

      <main className="admin-users-content">
        <div className="admin-users-container">

          {/* HEADER */}
          <section className="admin-users-header">
            <div>
              <span className="admin-users-eyebrow">
                إدارة النظام
              </span>

              <h1>
                إدارة المستخدمين
              </h1>

              <p>
                عرض وإدارة جميع حسابات المنصة
                وصلاحياتها وحالاتها.
              </p>
            </div>

            <button
              type="button"
              className="admin-users-refresh"
              onClick={loadUsers}
              disabled={loading}
            >
              <span>
                ↻
              </span>

              {loading
                ? "جاري التحديث..."
                : "تحديث البيانات"}
            </button>
          </section>

          {/* ERROR */}
          {error && (
            <div className="admin-users-error">
              <strong>
                حدث خطأ
              </strong>

              <span>
                {error}
              </span>

              <button
                type="button"
                onClick={loadUsers}
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          {/* STATS */}
          <section className="admin-users-stats">

            <article className="admin-user-stat-card">
              <div className="admin-user-stat-icon">
                ◉
              </div>

              <div>
                <span>
                  إجمالي المستخدمين
                </span>

                <strong>
                  {stats.total}
                </strong>
              </div>
            </article>

            <article className="admin-user-stat-card">
              <div className="admin-user-stat-icon">
                ♙
              </div>

              <div>
                <span>
                  المستثمرون
                </span>

                <strong>
                  {stats.investisseurs}
                </strong>

                <small>
                  {stats.pourcentage_investisseurs}%
                  من المستخدمين
                </small>
              </div>
            </article>

            <article className="admin-user-stat-card">
              <div className="admin-user-stat-icon">
                ✓
              </div>

              <div>
                <span>
                  الحسابات النشطة
                </span>

                <strong>
                  {stats.actifs}
                </strong>

                <small>
                  {stats.pourcentage_actifs}%
                  نشطة
                </small>
              </div>
            </article>

            <article className="admin-user-stat-card">
              <div className="admin-user-stat-icon">
                !
              </div>

              <div>
                <span>
                  الحسابات الموقوفة
                </span>

                <strong>
                  {stats.suspendus}
                </strong>
              </div>
            </article>

          </section>

          {/* FILTERS */}
          <section className="admin-users-filters">

            <div className="admin-users-search">
              <span>
                ⌕
              </span>

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="البحث بالاسم أو البريد أو الهاتف..."
              />
            </div>

            <select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(
                  event.target.value
                )
              }
            >
              <option value="">
                جميع الأدوار
              </option>

              <option value="investisseur">
                المستثمرون
              </option>

              <option value="agent">
                الوكلاء
              </option>

              <option value="admin">
                المسؤولون
              </option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >
              <option value="">
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

            <button
              type="button"
              className="admin-users-clear"
              onClick={() => {
                setSearch("");
                setRoleFilter("");
                setStatusFilter("");
              }}
            >
              مسح الفلاتر
            </button>

          </section>

          {/* TABLE */}
          <section className="admin-users-table-card">

            <div className="admin-users-table-header">
              <div>
                <h2>
                  المستخدمون
                </h2>

                <span>
                  {users.length} مستخدم
                  {users.length !== 1
                    ? "ون"
                    : ""}
                </span>
              </div>
            </div>

            {loading ? (
              <div className="admin-users-loading">
                <div className="admin-users-spinner" />

                <p>
                  جاري تحميل المستخدمين...
                </p>
              </div>
            ) : users.length === 0 ? (
              <div className="admin-users-empty">
                <div>
                  ⌕
                </div>

                <h3>
                  لا توجد نتائج
                </h3>

                <p>
                  لم يتم العثور على مستخدمين
                  مطابقين للبحث الحالي.
                </p>
              </div>
            ) : (
              <div className="admin-users-table-wrapper">

                <table className="admin-users-table">

                  <thead>
                    <tr>
                      <th>
                        المستخدم
                      </th>

                      <th>
                        البريد الإلكتروني
                      </th>

                      <th>
                        الهاتف
                      </th>

                      <th>
                        الدور
                      </th>

                      <th>
                        الحالة
                      </th>

                      <th>
                        آخر دخول
                      </th>

                      <th>
                        الإجراءات
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user) => {
                      const isCurrentAdmin =
                        user.id ===
                        currentAdmin?.id;

                      const isAdmin =
                        user.role === "admin";

                      return (
                        <tr
                          key={user.id}
                        >

                          <td>
                            <div className="admin-user-person">

                              <div className="admin-user-avatar">
                                {user.photo ? (
                                  <img
                                    src={user.photo}
                                    alt={`${user.prenom} ${user.nom}`}
                                    onError={(
                                      event
                                    ) => {
                                      event.currentTarget.style.display =
                                        "none";
                                    }}
                                  />
                                ) : (
                                  getInitials(
                                    user
                                  )
                                )}
                              </div>

                              <div>
                                <strong>
                                  {user.prenom}{" "}
                                  {user.nom}
                                </strong>

                                <small>
                                  ID #{user.id}
                                </small>

                                {isCurrentAdmin && (
                                  <em>
                                    حسابك الحالي
                                  </em>
                                )}
                              </div>

                            </div>
                          </td>

                          <td>
                            <span className="admin-user-email">
                              {user.email}
                            </span>
                          </td>

                          <td>
                            {user.telephone ||
                              "—"}
                          </td>

                          <td>
                            <span
                              className={`admin-role-badge role-${user.role}`}
                            >
                              {roleLabel(
                                user.role
                              )}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`admin-status-badge status-${user.statut}`}
                            >
                              <i />
                              {statusLabel(
                                user.statut
                              )}
                            </span>
                          </td>

                          <td>
                            {user.last_login
                              ? new Date(
                                  user.last_login
                                ).toLocaleDateString(
                                  "fr-FR"
                                )
                              : "لم يدخل بعد"}
                          </td>

                          <td>
                            <select
                              className="admin-user-status-select"
                              value={
                                user.statut
                              }
                              disabled={
                                isCurrentAdmin ||
                                isAdmin ||
                                updatingId ===
                                  user.id
                              }
                              onChange={(
                                event
                              ) =>
                                updateStatus(
                                  user,
                                  event
                                    .target
                                    .value
                                )
                              }
                              title={
                                isCurrentAdmin ||
                                isAdmin
                                  ? "هذا الحساب محمي"
                                  : "تغيير الحالة"
                              }
                            >
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
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>

                </table>

              </div>
            )}

          </section>

        </div>
      </main>
    </div>
  );
}

export default AdminUsersPage;