import { useCallback, useEffect, useMemo, useState } from "react";

import {
  CheckCircle2,
  Clock3,
  FolderKanban,
  Users,
  TrendingUp,
  BriefcaseBusiness,
  FileCheck2,
  MessageSquare,
  ArrowUpRight,
  RefreshCw,
  XCircle,
  Eye,
  Building2,
  Wallet,
  ClipboardList,
  Activity,
} from "lucide-react";

import AdminNavbar from "../components/AdminNavbar";
import "../styles/AdminDashboard.css";

/* ============================================================
   TYPES
   ============================================================ */

interface AdminUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  statut?: string;
  photo?: string | null;
  telephone?: string | null;
}

interface Investor {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  statut?: string;
  created_at?: string;
}

interface Project {
  id: number;
  titre?: string;
  nom?: string;
  description?: string;
  secteur?: string;
  wilaya?: string;
  commune?: string;
  statut: string;
  montant?: number | string;
  montant_investissement?: number | string;
  emplois?: number | string;
  created_at?: string;
  updated_at?: string;
  investor?: Investor | null;
  investisseur?: Investor | null;
}

interface ActivityItem {
  id?: number | string;
  type?: string;
  action?: string;
  message?: string;
  description?: string;
  created_at?: string;
  date?: string;
}

interface DashboardStats {
  projects_total: number;

  projects_brouillon: number;
  projects_soumis: number;
  projects_en_etude: number;
  projects_approuve: number;
  projects_en_cours: number;
  projects_realise: number;
  projects_rejete: number;
  projects_archive: number;

  investors_total: number;
  users_total: number;

  projects_value: number;
  total_jobs: number;

  investments_total: number;
  total_investment: number;
  investments_en_attente: number;
  investments_acceptee: number;
  investments_refusee: number;

  requests_total: number;
  requests_en_attente: number;
  requests_acceptee: number;
  requests_refusee: number;

  documents_total: number;
  documents_en_attente: number;
  documents_valides: number;
  documents_rejetes: number;

  messages_total: number;
  messages_unread: number;
}

interface DashboardResponse {
  success: boolean;
  message?: string;
  admin?: AdminUser;
  stats?: Partial<DashboardStats>;
  projects?: Project[];
  recent_projects?: Project[];
  activities?: ActivityItem[];
  error?: string;
}

/* ============================================================
   CONSTANTS
   ============================================================ */

const API_URL = "http://localhost/aapi-api/auth/admin/dashboard.php";

const emptyStats: DashboardStats = {
  projects_total: 0,

  projects_brouillon: 0,
  projects_soumis: 0,
  projects_en_etude: 0,
  projects_approuve: 0,
  projects_en_cours: 0,
  projects_realise: 0,
  projects_rejete: 0,
  projects_archive: 0,

  investors_total: 0,
  users_total: 0,

  projects_value: 0,
  total_jobs: 0,

  investments_total: 0,
  total_investment: 0,
  investments_en_attente: 0,
  investments_acceptee: 0,
  investments_refusee: 0,

  requests_total: 0,
  requests_en_attente: 0,
  requests_acceptee: 0,
  requests_refusee: 0,

  documents_total: 0,
  documents_en_attente: 0,
  documents_valides: 0,
  documents_rejetes: 0,

  messages_total: 0,
  messages_unread: 0,
};

/* ============================================================
   HELPERS
   ============================================================ */

const formatNumber = (value: number | string | null | undefined): string => {
  const number = Number(value || 0);

  return new Intl.NumberFormat("fr-DZ").format(number);
};

const formatMoney = (value: number | string | null | undefined): string => {
  const number = Number(value || 0);

  return new Intl.NumberFormat("fr-DZ", {
    maximumFractionDigits: 0,
  }).format(number);
};

const percentage = (value: number, total: number): number => {
  if (!total || total <= 0) return 0;

  return Math.min(100, Math.max(0, (value / total) * 100));
};

const getStatusLabel = (status: string | undefined): string => {
  switch (status) {
    case "brouillon":
      return "مسودة";

    case "soumis":
      return "مُرسل";

    case "en_etude":
      return "قيد الدراسة";

    case "approuve":
      return "مقبول";

    case "en_cours":
      return "قيد الإنجاز";

    case "realise":
      return "منجز";

    case "rejete":
      return "مرفوض";

    case "archive":
      return "مؤرشف";

    default:
      return status || "غير محدد";
  }
};

const getStatusClass = (status: string | undefined): string => {
  switch (status) {
    case "brouillon":
      return "status-draft";

    case "soumis":
      return "status-submitted";

    case "en_etude":
      return "status-review";

    case "approuve":
      return "status-approved";

    case "en_cours":
      return "status-progress";

    case "realise":
      return "status-completed";

    case "rejete":
      return "status-rejected";

    case "archive":
      return "status-archived";

    default:
      return "status-default";
  }
};

const formatDate = (date: string | undefined): string => {
  if (!date) return "—";

  try {
    return new Intl.DateTimeFormat("fr-DZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  } catch {
    return date;
  }
};

const getInitials = (user: AdminUser | Investor | null | undefined): string => {
  if (!user) return "A";

  const first = user.prenom?.charAt(0)?.toUpperCase() || "";

  const last = user.nom?.charAt(0)?.toUpperCase() || "";

  return `${first}${last}` || "A";
};

/* ============================================================
   COMPONENT
   ============================================================ */

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>(emptyStats);

  const [projects, setProjects] = useState<Project[]>([]);

  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const [admin, setAdmin] = useState<AdminUser | null>(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [updatingProject, setUpdatingProject] = useState(false);

  /* ============================================================
     LOAD DASHBOARD
     ============================================================ */

  const loadDashboard = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const storedUser = localStorage.getItem("aapi_user");

      if (!storedUser) {
        throw new Error("Session administrateur introuvable.");
      }

      const user = JSON.parse(storedUser) as AdminUser;

      if (!user?.id) {
        throw new Error("Utilisateur administrateur invalide.");
      }

      if (String(user.role).toLowerCase() !== "admin") {
        throw new Error("Accès réservé à l'administrateur.");
      }

      const response = await fetch(
        `${API_URL}?user_id=${encodeURIComponent(String(user.id))}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Erreur serveur HTTP ${response.status}`);
      }

      const data = (await response.json()) as DashboardResponse;

      if (!data.success) {
        throw new Error(
          data.message ||
            data.error ||
            "Impossible de charger le tableau de bord.",
        );
      }

      setAdmin(data.admin || user);

      setStats({
        ...emptyStats,
        ...(data.stats || {}),
      });

      setProjects(data.recent_projects || data.projects || []);

      setActivities(data.activities || []);
    } catch (err) {
      console.error("Erreur AdminDashboard:", err);

      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  /* ============================================================
     UPDATE PROJECT STATUS
     ============================================================ */

  const updateProjectStatus = async (projectId: number, statut: string) => {
    try {
      setUpdatingProject(true);
      setError("");

      const storedUser = localStorage.getItem("aapi_user");

      if (!storedUser) {
        throw new Error("Session administrateur introuvable.");
      }

      const user = JSON.parse(storedUser) as AdminUser;

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          action: "update_project_status",
          project_id: projectId,
          statut,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur serveur HTTP ${response.status}`);
      }

      const data = (await response.json()) as DashboardResponse;

      if (!data.success) {
        throw new Error(
          data.message || data.error || "Impossible de modifier le statut.",
        );
      }

      setSelectedProject((previous) =>
        previous
          ? {
              ...previous,
              statut,
            }
          : null,
      );

      await loadDashboard(true);
    } catch (err) {
      console.error("Erreur modification projet:", err);

      setError(
        err instanceof Error ? err.message : "Erreur lors de la modification.",
      );
    } finally {
      setUpdatingProject(false);
    }
  };

  /* ============================================================
     CALCULATED VALUES
     ============================================================ */

  const approvedPercentage = useMemo(
    () => percentage(stats.projects_approuve, stats.projects_total),
    [stats.projects_approuve, stats.projects_total],
  );

  const investorsPercentage = useMemo(
    () => percentage(stats.investors_total, stats.users_total),
    [stats.investors_total, stats.users_total],
  );

  const documentsPercentage = useMemo(
    () => percentage(stats.documents_valides, stats.documents_total),
    [stats.documents_valides, stats.documents_total],
  );

  const investmentsPercentage = useMemo(
    () => percentage(stats.investments_acceptee, stats.investments_total),
    [stats.investments_acceptee, stats.investments_total],
  );

  const requestsPercentage = useMemo(
    () => percentage(stats.requests_acceptee, stats.requests_total),
    [stats.requests_acceptee, stats.requests_total],
  );

  /* ============================================================
     LOADING
     ============================================================ */

  if (loading) {
    return (
      <div className="admin-dashboard" dir="rtl">
        <AdminNavbar currentPage="لوحة التحكم" />

        <main className="admin-dashboard-main">
          <div className="admin-loading">
            <div className="admin-loading-spinner">
              <RefreshCw size={32} className="admin-spin" />
            </div>

            <h3>جاري تحميل لوحة التحكم...</h3>

            <p>يرجى الانتظار قليلاً</p>
          </div>
        </main>
      </div>
    );
  }

  /* ============================================================
     MAIN RETURN
     ============================================================ */

  return (
    <div className="admin-dashboard" dir="rtl">
      {/* ======================================================
          ADMIN NAVBAR
         ====================================================== */}

      <AdminNavbar currentPage="لوحة التحكم" />

      {/* ======================================================
          HEADER
         ====================================================== */}

      <header className="admin-dashboard-header">
        <div className="admin-dashboard-header-content">
          <div className="admin-dashboard-welcome">
            <div className="admin-dashboard-eyebrow">AAPI ADMINISTRATION</div>

            <h1>
              مرحباً،{" "}
              <strong>
                {admin ? `${admin.prenom} ${admin.nom}` : "Administrateur"}
              </strong>
            </h1>

            <p>إليك نظرة شاملة على نشاط المنصة والمشاريع والاستثمارات.</p>
          </div>

          <button
            type="button"
            className="admin-refresh-button"
            onClick={() => void loadDashboard(true)}
            disabled={refreshing}
          >
            <RefreshCw size={18} className={refreshing ? "admin-spin" : ""} />

            <span>{refreshing ? "جاري التحديث..." : "تحديث البيانات"}</span>
          </button>
        </div>
      </header>

      {/* ======================================================
          ERROR
         ====================================================== */}

      {error && (
        <div className="admin-dashboard-error">
          <XCircle size={20} />

          <span>{error}</span>

          <button type="button" onClick={() => void loadDashboard(true)}>
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* ======================================================
          MAIN
         ====================================================== */}

      <main className="admin-dashboard-main">
        {/* ====================================================
            KPI GRID
           ==================================================== */}

        <section className="admin-kpi-grid">
          {/* Projects */}

          <article className="admin-kpi-card">
            <div className="admin-kpi-icon">
              <FolderKanban size={25} />
            </div>

            <div className="admin-kpi-content">
              <span>إجمالي المشاريع</span>

              <strong>{formatNumber(stats.projects_total)}</strong>

              <small>جميع المشاريع المسجلة</small>
            </div>

            <ArrowUpRight className="admin-kpi-arrow" size={20} />
          </article>

          {/* Investors */}

          <article className="admin-kpi-card">
            <div className="admin-kpi-icon">
              <Users size={25} />
            </div>

            <div className="admin-kpi-content">
              <span>المستثمرون</span>

              <strong>{formatNumber(stats.investors_total)}</strong>

              <small>المستثمرون المسجلون</small>
            </div>

            <ArrowUpRight className="admin-kpi-arrow" size={20} />
          </article>

          {/* Investments */}

          <article className="admin-kpi-card">
            <div className="admin-kpi-icon">
              <Wallet size={25} />
            </div>

            <div className="admin-kpi-content">
              <span>إجمالي الاستثمارات</span>

              <strong>{formatMoney(stats.total_investment)}</strong>

              <small>دج</small>
            </div>

            <ArrowUpRight className="admin-kpi-arrow" size={20} />
          </article>

          {/* Jobs */}

          <article className="admin-kpi-card">
            <div className="admin-kpi-icon">
              <BriefcaseBusiness size={25} />
            </div>

            <div className="admin-kpi-content">
              <span>مناصب العمل</span>

              <strong>{formatNumber(stats.total_jobs)}</strong>

              <small>من المشاريع</small>
            </div>

            <ArrowUpRight className="admin-kpi-arrow" size={20} />
          </article>

          {/* Requests */}

          <article className="admin-kpi-card">
            <div className="admin-kpi-icon">
              <ClipboardList size={25} />
            </div>

            <div className="admin-kpi-content">
              <span>الطلبات</span>

              <strong>{formatNumber(stats.requests_total)}</strong>

              <small>
                {formatNumber(stats.requests_en_attente)} قيد الانتظار
              </small>
            </div>

            <ArrowUpRight className="admin-kpi-arrow" size={20} />
          </article>

          {/* Messages */}

          <article className="admin-kpi-card">
            <div className="admin-kpi-icon">
              <MessageSquare size={25} />
            </div>

            <div className="admin-kpi-content">
              <span>الرسائل</span>

              <strong>{formatNumber(stats.messages_total)}</strong>

              <small>{formatNumber(stats.messages_unread)} غير مقروءة</small>
            </div>

            <ArrowUpRight className="admin-kpi-arrow" size={20} />
          </article>
        </section>

        {/* ====================================================
            ANALYTICS
           ==================================================== */}

        <section className="admin-analytics-grid">
          {/* Projects */}

          <article className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <span className="admin-panel-label">المشاريع</span>

                <h2>حالة المشاريع</h2>
              </div>

              <div className="admin-panel-header-icon">
                <Building2 size={21} />
              </div>
            </div>

            <div className="admin-circular-stats">
              <div
                className="admin-circular-progress"
                style={
                  {
                    "--percentage": `${approvedPercentage}%`,
                  } as React.CSSProperties
                }
              >
                <div className="admin-circular-inner">
                  <strong>{Math.round(approvedPercentage)}%</strong>

                  <span>مقبول</span>
                </div>
              </div>

              <div className="admin-circular-info">
                <div>
                  <CheckCircle2 size={17} />

                  <span>مشاريع مقبولة</span>

                  <strong>{formatNumber(stats.projects_approuve)}</strong>
                </div>

                <div>
                  <Clock3 size={17} />

                  <span>قيد الدراسة</span>

                  <strong>{formatNumber(stats.projects_en_etude)}</strong>
                </div>

                <div>
                  <TrendingUp size={17} />

                  <span>قيد الإنجاز</span>

                  <strong>{formatNumber(stats.projects_en_cours)}</strong>
                </div>
              </div>
            </div>
          </article>

          {/* Investors */}

          <article className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <span className="admin-panel-label">المستثمرون</span>

                <h2>المستخدمون</h2>
              </div>

              <div className="admin-panel-header-icon">
                <Users size={21} />
              </div>
            </div>

            <div className="admin-progress-list">
              <div className="admin-progress-item">
                <div className="admin-progress-top">
                  <span>المستثمرون</span>

                  <strong>{formatNumber(stats.investors_total)}</strong>
                </div>

                <div className="admin-progress-bar">
                  <span
                    style={{
                      width: `${investorsPercentage}%`,
                    }}
                  />
                </div>
              </div>

              <div className="admin-progress-item">
                <div className="admin-progress-top">
                  <span>جميع المستخدمين</span>

                  <strong>{formatNumber(stats.users_total)}</strong>
                </div>

                <div className="admin-progress-bar">
                  <span
                    style={{
                      width: "100%",
                    }}
                  />
                </div>
              </div>

              <div className="admin-mini-stat-grid">
                <div>
                  <small>قيمة المشاريع</small>

                  <strong>{formatMoney(stats.projects_value)} دج</strong>
                </div>

                <div>
                  <small>مناصب العمل</small>

                  <strong>{formatNumber(stats.total_jobs)}</strong>
                </div>
              </div>
            </div>
          </article>

          {/* Investments */}

          <article className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <span className="admin-panel-label">الاستثمارات</span>

                <h2>متابعة الاستثمارات</h2>
              </div>

              <div className="admin-panel-header-icon">
                <Wallet size={21} />
              </div>
            </div>

            <div className="admin-progress-list">
              <div className="admin-progress-item">
                <div className="admin-progress-top">
                  <span>مقبولة</span>

                  <strong>{formatNumber(stats.investments_acceptee)}</strong>
                </div>

                <div className="admin-progress-bar">
                  <span
                    style={{
                      width: `${investmentsPercentage}%`,
                    }}
                  />
                </div>
              </div>

              <div className="admin-progress-item">
                <div className="admin-progress-top">
                  <span>قيد الانتظار</span>

                  <strong>{formatNumber(stats.investments_en_attente)}</strong>
                </div>

                <div className="admin-progress-bar">
                  <span
                    style={{
                      width: `${percentage(
                        stats.investments_en_attente,
                        stats.investments_total,
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="admin-mini-stat-grid">
                <div>
                  <small>إجمالي العمليات</small>

                  <strong>{formatNumber(stats.investments_total)}</strong>
                </div>

                <div>
                  <small>القيمة الإجمالية</small>

                  <strong>{formatMoney(stats.total_investment)} دج</strong>
                </div>
              </div>
            </div>
          </article>

          {/* Documents */}

          <article className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <span className="admin-panel-label">الوثائق</span>

                <h2>حالة الوثائق</h2>
              </div>

              <div className="admin-panel-header-icon">
                <FileCheck2 size={21} />
              </div>
            </div>

            <div className="admin-progress-list">
              <div className="admin-progress-item">
                <div className="admin-progress-top">
                  <span>وثائق صالحة</span>

                  <strong>{formatNumber(stats.documents_valides)}</strong>
                </div>

                <div className="admin-progress-bar">
                  <span
                    style={{
                      width: `${documentsPercentage}%`,
                    }}
                  />
                </div>
              </div>

              <div className="admin-progress-item">
                <div className="admin-progress-top">
                  <span>قيد الانتظار</span>

                  <strong>{formatNumber(stats.documents_en_attente)}</strong>
                </div>

                <div className="admin-progress-bar">
                  <span
                    style={{
                      width: `${percentage(
                        stats.documents_en_attente,
                        stats.documents_total,
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="admin-mini-stat-grid">
                <div>
                  <small>جميع الوثائق</small>

                  <strong>{formatNumber(stats.documents_total)}</strong>
                </div>

                <div>
                  <small>مرفوضة</small>

                  <strong>{formatNumber(stats.documents_rejetes)}</strong>
                </div>
              </div>
            </div>
          </article>
        </section>

        {/* ====================================================
            PROJECT STATUS
           ==================================================== */}

        <section className="admin-panel admin-project-status-panel">
          <div className="admin-panel-header">
            <div>
              <span className="admin-panel-label">PROJECT PIPELINE</span>

              <h2>مراحل المشاريع</h2>
            </div>

            <FolderKanban size={22} />
          </div>

          <div className="admin-status-grid">
            <div className="admin-status-card status-draft">
              <span>مسودة</span>

              <strong>{formatNumber(stats.projects_brouillon)}</strong>
            </div>

            <div className="admin-status-card status-submitted">
              <span>مُرسل</span>

              <strong>{formatNumber(stats.projects_soumis)}</strong>
            </div>

            <div className="admin-status-card status-review">
              <span>قيد الدراسة</span>

              <strong>{formatNumber(stats.projects_en_etude)}</strong>
            </div>

            <div className="admin-status-card status-approved">
              <span>مقبول</span>

              <strong>{formatNumber(stats.projects_approuve)}</strong>
            </div>

            <div className="admin-status-card status-progress">
              <span>قيد الإنجاز</span>

              <strong>{formatNumber(stats.projects_en_cours)}</strong>
            </div>

            <div className="admin-status-card status-completed">
              <span>منجز</span>

              <strong>{formatNumber(stats.projects_realise)}</strong>
            </div>

            <div className="admin-status-card status-rejected">
              <span>مرفوض</span>

              <strong>{formatNumber(stats.projects_rejete)}</strong>
            </div>

            <div className="admin-status-card status-archived">
              <span>مؤرشف</span>

              <strong>{formatNumber(stats.projects_archive)}</strong>
            </div>
          </div>
        </section>

        {/* ====================================================
            SECONDARY STATS
           ==================================================== */}

        <section className="admin-secondary-grid">
          <article className="admin-secondary-card">
            <div className="admin-secondary-icon">
              <ClipboardList size={22} />
            </div>

            <div>
              <span>الطلبات المقبولة</span>

              <strong>{formatNumber(stats.requests_acceptee)}</strong>
            </div>

            <small>من أصل {formatNumber(stats.requests_total)}</small>
          </article>

          <article className="admin-secondary-card">
            <div className="admin-secondary-icon">
              <FileCheck2 size={22} />
            </div>

            <div>
              <span>الوثائق الصالحة</span>

              <strong>{formatNumber(stats.documents_valides)}</strong>
            </div>

            <small>نسبة {Math.round(documentsPercentage)}%</small>
          </article>

          <article className="admin-secondary-card">
            <div className="admin-secondary-icon">
              <MessageSquare size={22} />
            </div>

            <div>
              <span>الرسائل غير المقروءة</span>

              <strong>{formatNumber(stats.messages_unread)}</strong>
            </div>

            <small>من أصل {formatNumber(stats.messages_total)}</small>
          </article>

          <article className="admin-secondary-card">
            <div className="admin-secondary-icon">
              <TrendingUp size={22} />
            </div>

            <div>
              <span>نسبة الطلبات المقبولة</span>

              <strong>{Math.round(requestsPercentage)}%</strong>
            </div>

            <small>أداء الطلبات</small>
          </article>
        </section>

        {/* ====================================================
            RECENT PROJECTS
           ==================================================== */}

        <section className="admin-panel admin-recent-projects">
          <div className="admin-panel-header">
            <div>
              <span className="admin-panel-label">RECENT ACTIVITY</span>

              <h2>أحدث المشاريع</h2>
            </div>

            <button
              type="button"
              className="admin-panel-link"
              onClick={() => window.location.assign("/admin/projects")}
            >
              عرض الكل
              <ArrowUpRight size={17} />
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="admin-empty-state">
              <FolderKanban size={42} />

              <h3>لا توجد مشاريع</h3>

              <p>لم يتم تسجيل أي مشروع حتى الآن.</p>
            </div>
          ) : (
            <div className="admin-project-table-wrapper">
              <table className="admin-project-table">
                <thead>
                  <tr>
                    <th>المشروع</th>

                    <th>المستثمر</th>

                    <th>القطاع</th>

                    <th>المبلغ</th>

                    <th>الحالة</th>

                    <th>التاريخ</th>

                    <th>إجراء</th>
                  </tr>
                </thead>

                <tbody>
                  {projects.map((project) => {
                    const investor = project.investor || project.investisseur;

                    return (
                      <tr key={project.id}>
                        <td>
                          <div className="admin-project-name">
                            <div className="admin-project-avatar">
                              <Building2 size={18} />
                            </div>

                            <div>
                              <strong>
                                {project.titre ||
                                  project.nom ||
                                  "مشروع بدون اسم"}
                              </strong>

                              <small>#{project.id}</small>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="admin-investor-cell">
                            <div className="admin-investor-avatar">
                              {getInitials(investor)}
                            </div>

                            <span>
                              {investor
                                ? `${investor.prenom} ${investor.nom}`
                                : "غير محدد"}
                            </span>
                          </div>
                        </td>

                        <td>{project.secteur || "—"}</td>

                        <td>
                          {project.montant || project.montant_investissement
                            ? `${formatMoney(
                                project.montant ||
                                  project.montant_investissement,
                              )} دج`
                            : "—"}
                        </td>

                        <td>
                          <span
                            className={`admin-status-badge ${getStatusClass(
                              project.statut,
                            )}`}
                          >
                            {getStatusLabel(project.statut)}
                          </span>
                        </td>

                        <td>{formatDate(project.created_at)}</td>

                        <td>
                          <button
                            type="button"
                            className="admin-view-button"
                            onClick={() => setSelectedProject(project)}
                            title="عرض المشروع"
                          >
                            <Eye size={17} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ====================================================
            ACTIVITIES
           ==================================================== */}

        <section className="admin-panel admin-activities-panel">
          <div className="admin-panel-header">
            <div>
              <span className="admin-panel-label">ACTIVITY LOG</span>

              <h2>آخر النشاطات</h2>
            </div>

            <Activity size={22} />
          </div>

          {activities.length === 0 ? (
            <div className="admin-empty-state admin-empty-small">
              <Activity size={34} />

              <p>لا توجد نشاطات حديثة.</p>
            </div>
          ) : (
            <div className="admin-activities-list">
              {activities.slice(0, 8).map((activity, index) => (
                <div className="admin-activity-item" key={activity.id ?? index}>
                  <div className="admin-activity-icon">
                    <Activity size={17} />
                  </div>

                  <div className="admin-activity-content">
                    <strong>
                      {activity.message ||
                        activity.description ||
                        activity.action ||
                        "نشاط جديد"}
                    </strong>

                    <span>
                      {formatDate(activity.created_at || activity.date)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ======================================================
          PROJECT MODAL
         ====================================================== */}

      {selectedProject && (
        <div
          className="admin-modal-overlay"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="admin-project-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <span>PROJECT DETAILS</span>

                <h2>
                  {selectedProject.titre ||
                    selectedProject.nom ||
                    "تفاصيل المشروع"}
                </h2>
              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setSelectedProject(null)}
                aria-label="إغلاق"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="admin-modal-grid">
                <div>
                  <span>القطاع</span>

                  <strong>{selectedProject.secteur || "—"}</strong>
                </div>

                <div>
                  <span>الولاية</span>

                  <strong>{selectedProject.wilaya || "—"}</strong>
                </div>

                <div>
                  <span>البلدية</span>

                  <strong>{selectedProject.commune || "—"}</strong>
                </div>

                <div>
                  <span>المبلغ</span>

                  <strong>
                    {selectedProject.montant ||
                    selectedProject.montant_investissement
                      ? `${formatMoney(
                          selectedProject.montant ||
                            selectedProject.montant_investissement,
                        )} دج`
                      : "—"}
                  </strong>
                </div>

                <div>
                  <span>مناصب العمل</span>

                  <strong>{formatNumber(selectedProject.emplois)}</strong>
                </div>

                <div>
                  <span>التاريخ</span>

                  <strong>{formatDate(selectedProject.created_at)}</strong>
                </div>
              </div>

              {selectedProject.description && (
                <div className="admin-modal-description">
                  <span>الوصف</span>

                  <p>{selectedProject.description}</p>
                </div>
              )}

              <div className="admin-modal-current-status">
                <span>الحالة الحالية</span>

                <strong
                  className={`admin-status-badge ${getStatusClass(
                    selectedProject.statut,
                  )}`}
                >
                  {getStatusLabel(selectedProject.statut)}
                </strong>
              </div>

              <div className="admin-modal-actions">
                <span>تغيير حالة المشروع</span>

                <div className="admin-status-actions">
                  <button
                    type="button"
                    className="status-action-review"
                    disabled={updatingProject}
                    onClick={() =>
                      void updateProjectStatus(selectedProject.id, "en_etude")
                    }
                  >
                    قيد الدراسة
                  </button>

                  <button
                    type="button"
                    className="status-action-approved"
                    disabled={updatingProject}
                    onClick={() =>
                      void updateProjectStatus(selectedProject.id, "approuve")
                    }
                  >
                    قبول
                  </button>

                  <button
                    type="button"
                    className="status-action-progress"
                    disabled={updatingProject}
                    onClick={() =>
                      void updateProjectStatus(selectedProject.id, "en_cours")
                    }
                  >
                    قيد الإنجاز
                  </button>

                  <button
                    type="button"
                    className="status-action-completed"
                    disabled={updatingProject}
                    onClick={() =>
                      void updateProjectStatus(selectedProject.id, "realise")
                    }
                  >
                    منجز
                  </button>

                  <button
                    type="button"
                    className="status-action-rejected"
                    disabled={updatingProject}
                    onClick={() =>
                      void updateProjectStatus(selectedProject.id, "rejete")
                    }
                  >
                    رفض
                  </button>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="admin-modal-cancel"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
