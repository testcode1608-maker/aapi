import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

/* ============================================================
   TYPES
   ============================================================ */

interface DashboardUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  role: string;
  statut: string;
  photo?: string | null;
  last_login?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface DashboardProfile {
  type_investisseur?: string | null;
  nom_entreprise?: string | null;
  registre_commerce?: string | null;
  nif?: string | null;
  nis?: string | null;
  wilaya?: string | null;
  commune?: string | null;
  adresse?: string | null;
  site_web?: string | null;
  secteur_activite?: string | null;
  description?: string | null;
}

interface DashboardProject {
  id: number;
  titre: string;
  secteurs?: string | null;
  montant_investissement: number;
  nombre_emplois: number;
  statut: string;
  wilaya?: string | null;
  commune?: string | null;
  adresse?: string | null;
  superficie?: number | null;
  unite_superficie?: string | null;
  image?: string | null;
  date_debut?: string | null;
  date_fin?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface DashboardInvestment {
  id: number;
  user_id?: number;
  project_id?: number | null;
  montant: number;
  statut: string;
  reference?: string | null;
  date_investissement?: string | null;
  notes?: string | null;
  projet_titre?: string | null;
  projet_wilaya?: string | null;
  projet_statut?: string | null;
  projet_montant?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface DashboardRequest {
  id: number;
  user_id?: number;
  projet_id?: number | null;
  type_demande: string;
  objet: string;
  description?: string | null;
  montant_demande?: number | null;
  wilaya?: string | null;
  statut: string;
  priorite?: string | null;
  reponse?: string | null;
  traite_par?: number | null;
  date_traitement?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  projet_titre?: string | null;
}

interface DashboardDocument {
  id: number;
  user_id?: number;
  project_id?: number | null;
  request_id?: number | null;
  titre: string;
  type_document: string;
  fichier?: string | null;
  nom_original?: string | null;
  extension?: string | null;
  taille?: number | null;
  statut: string;
  commentaire?: string | null;
  uploaded_at?: string | null;
  projet_titre?: string | null;
}

interface DashboardMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  sujet?: string | null;
  contenu: string;
  lu: number;
  date_lecture?: string | null;
  created_at?: string | null;
  sender_nom?: string | null;
  sender_prenom?: string | null;
  sender_email?: string | null;
}

interface DashboardNotification {
  id: number;
  titre: string;
  message: string;
  type: string;
  lien?: string | null;
  lu: number;
  date_lecture?: string | null;
  created_at?: string | null;
}

interface DashboardStats {
  projects_total: number;
  projects_active: number;
  projects_completed: number;
  projects_in_study?: number;
  projects_submitted?: number;
  projects_approved?: number;
  projects_rejected?: number;
  projects_value?: number;
  total_jobs?: number;

  investments_total: number;
  investments_active: number;
  investments_completed?: number;
  investments_pending?: number;
  investments_cancelled?: number;
  total_investment: number;
  investment_ratio?: number;

  requests_total: number;
  requests_pending: number;
  requests_accepted?: number;
  requests_rejected?: number;

  documents_total: number;
  documents_validated?: number;
  documents_pending?: number;
  documents_rejected?: number;

  messages_total?: number;
  messages_unread: number;

  notifications_total?: number;
  notifications_unread: number;

  profile_completion?: number;
}

interface DashboardActivity {
  title: string;
  text: string;
  date?: string | null;
  icon: string;
}

interface DashboardLast {
  project?: DashboardProject | null;
  investment?: DashboardInvestment | null;
  request?: DashboardRequest | null;
  message?: DashboardMessage | null;
  notification?: DashboardNotification | null;
}

interface DashboardResponse {
  success: boolean;
  message: string;

  user: DashboardUser;
  profile: DashboardProfile | null;
  stats: DashboardStats;

  projects: DashboardProject[];
  investments: DashboardInvestment[];
  requests: DashboardRequest[];
  documents: DashboardDocument[];
  messages: DashboardMessage[];
  notifications: DashboardNotification[];

  activities?: DashboardActivity[];
  last?: DashboardLast;
}

interface CreateProjectForm {
  titre: string;
  description: string;
  wilaya: string;
  commune: string;
  adresse: string;
  montant_investissement: string;
  nombre_emplois: string;
  superficie: string;
  unite_superficie: string;
  sector_id: string;
  date_debut: string;
  date_fin: string;
}

/* ============================================================
   CONSTANTS
   ============================================================ */

const API_BASE_URL = "http://localhost/aapi-api";

const API_URL =
  `${API_BASE_URL}/auth/investor/dashboard.php`;

const CREATE_PROJECT_API_URL =
  `${API_BASE_URL}/auth/investor/create-project.php`;

const LOGIN_ROUTE = "/login";

/*
 * Les IDs correspondent aux secteurs présents
 * dans la table sectors de la base de données.
 */
const PROJECT_SECTORS = [
  {
    id: 1,
    nom: "الزراعة",
  },
  {
    id: 2,
    nom: "الصناعة",
  },
  {
    id: 3,
    nom: "التكنولوجيا",
  },
  {
    id: 4,
    nom: "السياحة",
  },
  {
    id: 5,
    nom: "الطاقات",
  },
  {
    id: 6,
    nom: "النقل",
  },
  {
    id: 7,
    nom: "الصحة",
  },
  {
    id: 8,
    nom: "الخدمات",
  },
];

/* ============================================================
   HELPERS
   ============================================================ */

function toNumber(value: unknown): number {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

function formatAmount(value?: number | null) {
  const amount = toNumber(value);

  return (
    new Intl.NumberFormat("fr-DZ", {
      maximumFractionDigits: 0,
    }).format(amount) + " DA"
  );
}

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("fr-DZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatRelativeTime(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const difference = Math.max(
    0,
    Date.now() - date.getTime()
  );

  const minutes = Math.floor(
    difference / (1000 * 60)
  );

  const hours = Math.floor(
    difference / (1000 * 60 * 60)
  );

  const days = Math.floor(
    difference / (1000 * 60 * 60 * 24)
  );

  if (minutes < 1) {
    return "الآن";
  }

  if (minutes < 60) {
    return `منذ ${minutes} دقيقة`;
  }

  if (hours < 24) {
    return `منذ ${hours} ساعة`;
  }

  if (days < 7) {
    return `منذ ${days} يوم`;
  }

  return formatDate(value);
}

/* ============================================================
   STATUS HELPERS
   ============================================================ */

function getProjectStatus(status?: string | null) {
  switch (status) {
    case "en_cours":
      return {
        className: "investor-dashboard-status success",
        label: "قيد الإنجاز",
      };

    case "approuve":
      return {
        className: "investor-dashboard-status success",
        label: "معتمد",
      };

    case "realise":
      return {
        className: "investor-dashboard-status success",
        label: "مكتمل",
      };

    case "en_etude":
      return {
        className: "investor-dashboard-status warning",
        label: "قيد الدراسة",
      };

    case "soumis":
      return {
        className: "investor-dashboard-status warning",
        label: "مقدم",
      };

    case "rejete":
      return {
        className: "investor-dashboard-status danger",
        label: "مرفوض",
      };

    case "brouillon":
      return {
        className: "investor-dashboard-status warning",
        label: "مسودة",
      };

    case "archive":
      return {
        className: "investor-dashboard-status warning",
        label: "مؤرشف",
      };

    default:
      return {
        className: "investor-dashboard-status warning",
        label: status || "غير محدد",
      };
  }
}

function getInvestmentStatus(status?: string | null) {
  switch (status) {
    case "valide":
      return {
        className: "investor-dashboard-status success",
        label: "معتمد",
      };

    case "en_cours":
      return {
        className: "investor-dashboard-status success",
        label: "قيد التنفيذ",
      };

    case "termine":
      return {
        className: "investor-dashboard-status success",
        label: "مكتمل",
      };

    case "en_attente":
      return {
        className: "investor-dashboard-status warning",
        label: "قيد الانتظار",
      };

    case "annule":
      return {
        className: "investor-dashboard-status danger",
        label: "ملغى",
      };

    default:
      return {
        className: "investor-dashboard-status warning",
        label: status || "غير محدد",
      };
  }
}

function getRequestStatus(status?: string | null) {
  switch (status) {
    case "acceptee":
      return {
        className: "investor-dashboard-status success",
        label: "مقبول",
      };

    case "terminee":
      return {
        className: "investor-dashboard-status success",
        label: "مكتمل",
      };

    case "refusee":
      return {
        className: "investor-dashboard-status danger",
        label: "مرفوض",
      };

    case "nouvelle":
      return {
        className: "investor-dashboard-status warning",
        label: "جديدة",
      };

    case "en_cours":
      return {
        className: "investor-dashboard-status warning",
        label: "قيد المعالجة",
      };

    case "en_attente":
      return {
        className: "investor-dashboard-status warning",
        label: "قيد الانتظار",
      };

    default:
      return {
        className: "investor-dashboard-status warning",
        label: status || "غير محدد",
      };
  }
}

function getDocumentStatus(status?: string | null) {
  switch (status) {
    case "valide":
      return {
        className: "investor-dashboard-status success",
        label: "صحيحة",
      };

    case "en_attente":
      return {
        className: "investor-dashboard-status warning",
        label: "قيد المراجعة",
      };

    case "rejete":
      return {
        className: "investor-dashboard-status danger",
        label: "مرفوضة",
      };

    default:
      return {
        className: "investor-dashboard-status warning",
        label: status || "غير محدد",
      };
  }
}

/* ============================================================
   URL HELPERS
   ============================================================ */

function getFileUrl(value?: string | null) {
  if (!value) {
    return "";
  }

  const file = value.trim();

  if (!file) {
    return "";
  }

  if (
    file.startsWith("http://") ||
    file.startsWith("https://")
  ) {
    return file;
  }

  return `${API_BASE_URL}/${file.replace(
    /^\/+/,
    ""
  )}`;
}

/* ============================================================
   COMPONENT
   ============================================================ */

function InvestorDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  /* ============================================================
     STATE
     ============================================================ */

  const [user, setUser] =
    useState<DashboardUser | null>(null);

  const [profile, setProfile] =
    useState<DashboardProfile | null>(null);

  const [stats, setStats] =
    useState<DashboardStats | null>(null);

  const [projects, setProjects] =
    useState<DashboardProject[]>([]);

  const [investments, setInvestments] =
    useState<DashboardInvestment[]>([]);

  const [requests, setRequests] =
    useState<DashboardRequest[]>([]);

  const [documents, setDocuments] =
    useState<DashboardDocument[]>([]);

  const [messages, setMessages] =
    useState<DashboardMessage[]>([]);

  const [notifications, setNotifications] =
    useState<DashboardNotification[]>([]);

  const [activities, setActivities] =
    useState<DashboardActivity[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* ============================================================
     CREATE PROJECT STATE
     ============================================================ */

  const [creatingProject, setCreatingProject] =
    useState(false);

  const [projectCreateError, setProjectCreateError] =
    useState("");

  const [projectCreateSuccess, setProjectCreateSuccess] =
    useState("");

  const [projectForm, setProjectForm] =
    useState<CreateProjectForm>({
      titre: "",
      description: "",
      wilaya: "",
      commune: "",
      adresse: "",
      montant_investissement: "",
      nombre_emplois: "",
      superficie: "",
      unite_superficie: "m²",
      sector_id: "",
      date_debut: "",
      date_fin: "",
    });

  /* ============================================================
     LOAD DASHBOARD
     ============================================================ */

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      const storedUser =
        localStorage.getItem("aapi_user");

      if (!storedUser) {
        navigate(LOGIN_ROUTE, {
          replace: true,
        });

        return;
      }

      let parsedUser: {
        id?: number | string;
        role?: string;
      };

      try {
        parsedUser = JSON.parse(
          storedUser
        );
      } catch {
        localStorage.removeItem(
          "aapi_user"
        );

        navigate(LOGIN_ROUTE, {
          replace: true,
        });

        return;
      }

      const userId = Number(
        parsedUser?.id
      );

      if (
        !Number.isFinite(userId) ||
        userId <= 0
      ) {
        localStorage.removeItem(
          "aapi_user"
        );

        navigate(LOGIN_ROUTE, {
          replace: true,
        });

        return;
      }

      try {
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
              user_id: userId,
            }),
          }
        );

        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        if (
          !contentType
            .toLowerCase()
            .includes("application/json")
        ) {
          throw new Error(
            "Le serveur a retourné une réponse invalide. Vérifiez l'API PHP."
          );
        }

        const data: DashboardResponse =
          await response.json();

        if (
          !response.ok ||
          !data?.success
        ) {
          throw new Error(
            data?.message ||
              "Impossible de charger les données du tableau de bord."
          );
        }

        if (cancelled) {
          return;
        }

        setUser(
          data.user || null
        );

        setProfile(
          data.profile || null
        );

        setStats(
          data.stats || null
        );

        setProjects(
          Array.isArray(data.projects)
            ? data.projects.map(
                (project) => ({
                  ...project,
                  id: toNumber(
                    project.id
                  ),
                  montant_investissement:
                    toNumber(
                      project.montant_investissement
                    ),
                  nombre_emplois:
                    toNumber(
                      project.nombre_emplois
                    ),
                })
              )
            : []
        );

        setInvestments(
          Array.isArray(
            data.investments
          )
            ? data.investments.map(
                (investment) => ({
                  ...investment,
                  id: toNumber(
                    investment.id
                  ),
                  project_id:
                    investment.project_id !==
                      null &&
                    investment.project_id !==
                      undefined
                      ? toNumber(
                          investment.project_id
                        )
                      : null,
                  montant:
                    toNumber(
                      investment.montant
                    ),
                })
              )
            : []
        );

        setRequests(
          Array.isArray(data.requests)
            ? data.requests.map(
                (request) => ({
                  ...request,
                  id: toNumber(
                    request.id
                  ),
                  montant_demande:
                    request.montant_demande !==
                      null &&
                    request.montant_demande !==
                      undefined
                      ? toNumber(
                          request.montant_demande
                        )
                      : null,
                })
              )
            : []
        );

        setDocuments(
          Array.isArray(
            data.documents
          )
            ? data.documents.map(
                (document) => ({
                  ...document,
                  id: toNumber(
                    document.id
                  ),
                  taille:
                    document.taille !==
                      null &&
                    document.taille !==
                      undefined
                      ? toNumber(
                          document.taille
                        )
                      : null,
                })
              )
            : []
        );

        setMessages(
          Array.isArray(data.messages)
            ? data.messages.map(
                (message) => ({
                  ...message,
                  id: toNumber(
                    message.id
                  ),
                  sender_id:
                    toNumber(
                      message.sender_id
                    ),
                  receiver_id:
                    toNumber(
                      message.receiver_id
                    ),
                  lu:
                    toNumber(
                      message.lu
                    ),
                })
              )
            : []
        );

        setNotifications(
          Array.isArray(
            data.notifications
          )
            ? data.notifications.map(
                (notification) => ({
                  ...notification,
                  id: toNumber(
                    notification.id
                  ),
                  lu:
                    toNumber(
                      notification.lu
                    ),
                })
              )
            : []
        );

        setActivities(
          Array.isArray(data.activities)
            ? data.activities
            : []
        );

        if (data.user) {
          localStorage.setItem(
            "aapi_user",
            JSON.stringify(data.user)
          );
        }
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        let message =
          "تعذر الاتصال بالخادم.";

        if (
          requestError instanceof Error
        ) {
          message =
            requestError.message ||
            message;
        }

        setError(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  /* ============================================================
     CREATE PROJECT
     ============================================================ */

  const handleCreateProject = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (creatingProject) {
      return;
    }

    setProjectCreateError("");
    setProjectCreateSuccess("");

    const storedUser =
      localStorage.getItem("aapi_user");

    if (!storedUser) {
      navigate(LOGIN_ROUTE, {
        replace: true,
      });

      return;
    }

    let parsedUser: {
      id?: number | string;
    };

    try {
      parsedUser = JSON.parse(
        storedUser
      );
    } catch {
      localStorage.removeItem(
        "aapi_user"
      );

      navigate(LOGIN_ROUTE, {
        replace: true,
      });

      return;
    }

    const userId = Number(
      parsedUser?.id
    );

    if (
      !Number.isFinite(userId) ||
      userId <= 0
    ) {
      setProjectCreateError(
        "تعذر تحديد حساب المستثمر."
      );

      return;
    }

    const titre =
      projectForm.titre.trim();

    const description =
      projectForm.description.trim();

    const wilaya =
      projectForm.wilaya.trim();

    const commune =
      projectForm.commune.trim();

    const adresse =
      projectForm.adresse.trim();

    const montant =
      Number(
        projectForm.montant_investissement
      );

    const emplois =
      Number(
        projectForm.nombre_emplois
      );

    const superficie =
      projectForm.superficie.trim()
        ? Number(
            projectForm.superficie
          )
        : null;

    const sectorId =
      projectForm.sector_id
        ? Number(
            projectForm.sector_id
          )
        : null;

    if (!titre) {
      setProjectCreateError(
        "يرجى إدخال عنوان المشروع."
      );

      return;
    }

    if (titre.length < 3) {
      setProjectCreateError(
        "عنوان المشروع قصير جداً."
      );

      return;
    }

    if (!description) {
      setProjectCreateError(
        "يرجى إدخال وصف المشروع."
      );

      return;
    }

    if (description.length < 10) {
      setProjectCreateError(
        "يرجى إدخال وصف أكثر تفصيلاً للمشروع."
      );

      return;
    }

    if (!wilaya) {
      setProjectCreateError(
        "يرجى إدخال الولاية."
      );

      return;
    }

    if (
      !Number.isFinite(montant) ||
      montant <= 0
    ) {
      setProjectCreateError(
        "يرجى إدخال مبلغ استثمار صحيح وأكبر من صفر."
      );

      return;
    }

    if (
      !Number.isFinite(emplois) ||
      emplois < 0
    ) {
      setProjectCreateError(
        "يرجى إدخال عدد مناصب عمل صحيح."
      );

      return;
    }

    if (
      projectForm.superficie.trim() &&
      (
        !Number.isFinite(
          superficie
        ) ||
        Number(superficie) < 0
      )
    ) {
      setProjectCreateError(
        "يرجى إدخال مساحة صحيحة."
      );

      return;
    }

    if (
      projectForm.date_debut &&
      projectForm.date_fin
    ) {
      const startDate =
        new Date(
          projectForm.date_debut
        ).getTime();

      const endDate =
        new Date(
          projectForm.date_fin
        ).getTime();

      if (
        Number.isFinite(startDate) &&
        Number.isFinite(endDate) &&
        endDate < startDate
      ) {
        setProjectCreateError(
          "تاريخ نهاية المشروع يجب أن يكون بعد تاريخ البداية."
        );

        return;
      }
    }

    if (
      sectorId !== null &&
      (
        !Number.isFinite(
          sectorId
        ) ||
        sectorId <= 0
      )
    ) {
      setProjectCreateError(
        "القطاع الاستثماري غير صالح."
      );

      return;
    }

    setCreatingProject(true);

    try {
      const response =
        await fetch(
          CREATE_PROJECT_API_URL,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            body: JSON.stringify({
              user_id: userId,

              titre,

              description,

              wilaya,

              commune:
                commune || null,

              adresse:
                adresse || null,

              montant_investissement:
                montant,

              nombre_emplois:
                emplois,

              superficie:
                superficie !== null &&
                Number.isFinite(
                  superficie
                )
                  ? superficie
                  : null,

              unite_superficie:
                projectForm.unite_superficie ||
                "m²",

              sector_id:
                sectorId,

              date_debut:
                projectForm.date_debut ||
                null,

              date_fin:
                projectForm.date_fin ||
                null,
            }),
          }
        );

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      if (
        !contentType
          .toLowerCase()
          .includes(
            "application/json"
          )
      ) {
        throw new Error(
          "Le serveur a retourné une réponse invalide. Vérifiez create-project.php."
        );
      }

      const data =
        await response.json();

      if (
        !response.ok ||
        !data?.success
      ) {
        throw new Error(
          data?.message ||
            "تعذر إنشاء المشروع."
        );
      }

      setProjectCreateError("");

      setProjectCreateSuccess(
        "تم إرسال المشروع بنجاح. المشروع الآن قيد المراجعة من طرف الإدارة."
      );

      setProjectForm({
        titre: "",
        description: "",
        wilaya: "",
        commune: "",
        adresse: "",
        montant_investissement: "",
        nombre_emplois: "",
        superficie: "",
        unite_superficie: "m²",
        sector_id: "",
        date_debut: "",
        date_fin: "",
      });

      window.setTimeout(() => {
        window.location.reload();
      }, 900);
    } catch (requestError) {
      let message =
        "تعذر إنشاء المشروع.";

      if (
        requestError instanceof Error
      ) {
        message =
          requestError.message ||
          message;
      }

      setProjectCreateError(
        message
      );
    } finally {
      setCreatingProject(false);
    }
  };

  /* ============================================================
     LOGOUT
     ============================================================ */

  const handleLogout = () => {
    localStorage.removeItem(
      "aapi_user"
    );

    navigate(LOGIN_ROUTE, {
      replace: true,
    });
  };

  /* ============================================================
     CURRENT SECTION
     ============================================================ */

  const dashboardSection = useMemo(() => {
    const pathname =
      location.pathname.replace(
        /\/+$/,
        ""
      );

    if (
      pathname ===
      "/investor/dashboard"
    ) {
      return "dashboard";
    }

    return (
      pathname
        .split("/")
        .filter(Boolean)
        .pop() || "dashboard"
    );
  }, [location.pathname]);

  const navClass = (
    section: string
  ) =>
    dashboardSection === section
      ? "investor-dashboard-nav-link active"
      : "investor-dashboard-nav-link";

  /* ============================================================
     USER DATA
     ============================================================ */

  const fullName = useMemo(() => {
    if (!user) {
      return "المستثمر";
    }

    const name =
      `${user.prenom || ""} ${user.nom || ""}`.trim();

    return name || "المستثمر";
  }, [user]);

  const initials = useMemo(() => {
    if (!user) {
      return "م";
    }

    const first =
      user.prenom?.trim().charAt(0) ||
      "";

    const last =
      user.nom?.trim().charAt(0) ||
      "";

    return (
      `${first}${last}`.trim() || "م"
    );
  }, [user]);

  /* ============================================================
     USER PHOTO URL
     ============================================================ */

  const userPhotoUrl = useMemo(
    () => getFileUrl(user?.photo),
    [user?.photo]
  );

  /* ============================================================
     PROJECT PROGRESS
     ============================================================ */

  const projectCompletion = useMemo(() => {
    if (
      !stats ||
      toNumber(stats.projects_total) <= 0
    ) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        Math.round(
          (
            toNumber(
              stats.projects_completed
            ) /
            toNumber(
              stats.projects_total
            )
          ) * 100
        )
      )
    );
  }, [stats]);

  /* ============================================================
     COMPLETED INVESTMENTS
     ============================================================ */

  const completedInvestments =
    useMemo(
      () => {
        if (
          stats &&
          stats.investments_completed !==
            undefined
        ) {
          return toNumber(
            stats.investments_completed
          );
        }

        return investments.filter(
          (investment) =>
            investment.statut ===
            "termine"
        ).length;
      },
      [investments, stats]
    );

  /* ============================================================
     ACTIVITIES
     ============================================================ */

  const dashboardActivities =
    useMemo(() => {
      if (
        Array.isArray(activities) &&
        activities.length > 0
      ) {
        return activities
          .filter(
            (activity) =>
              activity &&
              (
                activity.title ||
                activity.text
              )
          )
          .slice(0, 10);
      }

      const items: DashboardActivity[] =
        [];

      notifications.forEach(
        (notification) => {
          items.push({
            title:
              notification.titre ||
              "إشعار جديد",

            text:
              notification.message ||
              "",

            date:
              notification.created_at,

            icon:
              notification.type ===
              "document"
                ? "bi-file-earmark-text"
                : notification.type ===
                  "message"
                ? "bi-chat-left-text"
                : "bi-check-circle",
          });
        }
      );

      documents.forEach((document) => {
        items.push({
          title:
            "تمت إضافة وثيقة جديدة",

          text:
            document.titre ||
            "وثيقة",

          date:
            document.uploaded_at,

          icon:
            "bi-file-earmark-text",
        });
      });

      messages.forEach((message) => {
        const sender =
          `${message.sender_prenom || ""} ${message.sender_nom || ""}`.trim();

        items.push({
          title:
            sender ||
            "رسالة جديدة",

          text:
            message.sujet ||
            message.contenu ||
            "",

          date:
            message.created_at,

          icon:
            "bi-chat-left-text",
        });
      });

      projects.forEach((project) => {
        items.push({
          title:
            "مشروع استثماري",

          text:
            project.titre ||
            "مشروع",

          date:
            project.created_at,

          icon:
            "bi-building",
        });
      });

      investments.forEach(
        (investment) => {
          items.push({
            title:
              "عملية استثمار",

            text:
              investment.projet_titre ||
              "استثمار",

            date:
              investment.date_investissement ||
              investment.created_at,

            icon:
              "bi-cash-stack",
          });
        }
      );

      requests.forEach((request) => {
        items.push({
          title:
            "طلب استثماري",

          text:
            request.objet ||
            "طلب",

          date:
            request.created_at,

          icon:
            "bi-file-earmark-text",
        });
      });

      return items
        .sort((a, b) => {
          const dateA = a.date
            ? new Date(
                a.date
              ).getTime()
            : 0;

          const dateB = b.date
            ? new Date(
                b.date
              ).getTime()
            : 0;

          return dateB - dateA;
        })
        .slice(0, 10);
    }, [
      activities,
      notifications,
      documents,
      messages,
      projects,
      investments,
      requests,
    ]);

  if (loading) {
    return (
      <div
        className="investor-dashboard-page"
        dir="rtl"
      >
        <div className="investor-dashboard-content">
          <section className="investor-dashboard-section">
            <div className="investor-dashboard-page-header">
              <div>
                <span className="investor-dashboard-overline">
                  فضاء المستثمر
                </span>

                <h1>
                  جاري تحميل البيانات...
                </h1>

                <p>
                  يرجى الانتظار قليلاً.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="investor-dashboard-page"
        dir="rtl"
      >
        <div className="investor-dashboard-content">
          <section className="investor-dashboard-section">
            <div className="investor-dashboard-page-header">
              <div>
                <span className="investor-dashboard-overline">
                  فضاء المستثمر
                </span>

                <h1>
                  تعذر تحميل البيانات
                </h1>

                <p>
                  {error}
                </p>
              </div>

              <button
                type="button"
                className="investor-dashboard-primary-btn"
                onClick={() =>
                  window.location.reload()
                }
              >
                <i className="bi bi-arrow-clockwise" />
                إعادة المحاولة
              </button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div
      className="investor-dashboard-page"
      dir="rtl"
    >
      <header className="investor-dashboard-topbar">
        <div className="investor-dashboard-brand">
          <div className="investor-dashboard-brand-mark">
            <i className="bi bi-buildings" />
          </div>

          <div className="investor-dashboard-brand-text">
            <strong>
              AAPI
            </strong>

            <span>
              فضاء المستثمر
            </span>
          </div>
        </div>

        <div className="investor-dashboard-topbar-actions">
          <Link
            to="/investor/dashboard/notifications"
            className="investor-dashboard-notification"
            aria-label="الإشعارات"
          >
            <i className="bi bi-bell" />

            {(toNumber(
              stats?.notifications_unread
            ) > 0) && (
              <span className="investor-dashboard-notification-badge">
                {toNumber(
                  stats?.notifications_unread
                )}
              </span>
            )}
          </Link>

          <div className="investor-dashboard-user">
            <div className="investor-dashboard-user-avatar">
              {userPhotoUrl ? (
                <img
                  src={userPhotoUrl}
                  alt={fullName}
                />
              ) : (
                initials
              )}
            </div>

            <div className="investor-dashboard-user-info">
              <strong>
                {fullName}
              </strong>

              <span>
                {user?.email || "—"}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="investor-dashboard-layout">
        <aside className="investor-dashboard-sidebar">
          <div className="investor-dashboard-sidebar-header">
            <div className="investor-dashboard-sidebar-avatar">
              {userPhotoUrl ? (
                <img
                  src={userPhotoUrl}
                  alt={fullName}
                />
              ) : (
                initials
              )}
            </div>

            <div>
              <strong>
                {fullName}
              </strong>

              <span>
                مستثمر
              </span>
            </div>
          </div>

          <nav className="investor-dashboard-nav">
            <Link
              to="/investor/dashboard"
              className={navClass(
                "dashboard"
              )}
            >
              <i className="bi bi-grid-1x2" />

              <span>
                لوحة التحكم
              </span>
            </Link>

            <Link
              to="/investor/dashboard/projects"
              className={navClass(
                "projects"
              )}
            >
              <i className="bi bi-building" />

              <span>
                مشاريعي
              </span>

              {projects.length > 0 && (
                <span className="investor-dashboard-nav-badge">
                  {projects.length}
                </span>
              )}
            </Link>

            <Link
              to="/investor/dashboard/investments"
              className={navClass(
                "investments"
              )}
            >
              <i className="bi bi-cash-stack" />

              <span>
                استثماراتي
              </span>

              {toNumber(
                stats?.investments_active
              ) > 0 && (
                <span className="investor-dashboard-nav-badge">
                  {toNumber(
                    stats?.investments_active
                  )}
                </span>
              )}
            </Link>

            <Link
              to="/investor/dashboard/requests"
              className={navClass(
                "requests"
              )}
            >
              <i className="bi bi-file-earmark-text" />

              <span>
                طلباتي
              </span>

              {toNumber(
                stats?.requests_pending
              ) > 0 && (
                <span className="investor-dashboard-nav-badge">
                  {toNumber(
                    stats?.requests_pending
                  )}
                </span>
              )}
            </Link>

            <Link
              to="/investor/dashboard/documents"
              className={navClass(
                "documents"
              )}
            >
              <i className="bi bi-folder2-open" />

              <span>
                وثائقي
              </span>

              {toNumber(
                stats?.documents_total
              ) > 0 && (
                <span className="investor-dashboard-nav-badge">
                  {toNumber(
                    stats?.documents_total
                  )}
                </span>
              )}
            </Link>

            <div className="investor-dashboard-nav-divider" />

            <Link
              to="/investor/dashboard/messages"
              className={navClass(
                "messages"
              )}
            >
              <i className="bi bi-chat-left-text" />

              <span>
                الرسائل
              </span>

              {toNumber(
                stats?.messages_unread
              ) > 0 && (
                <span className="investor-dashboard-nav-badge">
                  {toNumber(
                    stats?.messages_unread
                  )}
                </span>
              )}
            </Link>

            <Link
              to="/investor/dashboard/notifications"
              className={navClass(
                "notifications"
              )}
            >
              <i className="bi bi-bell" />

              <span>
                الإشعارات
              </span>

              {toNumber(
                stats?.notifications_unread
              ) > 0 && (
                <span className="investor-dashboard-nav-badge">
                  {toNumber(
                    stats?.notifications_unread
                  )}
                </span>
              )}
            </Link>

            <Link
              to="/investor/dashboard/profile"
              className={navClass(
                "profile"
              )}
            >
              <i className="bi bi-person" />

              <span>
                ملفي الشخصي
              </span>
            </Link>

            <Link
              to="/investor/dashboard/settings"
              className={navClass(
                "settings"
              )}
            >
              <i className="bi bi-gear" />

              <span>
                الإعدادات
              </span>
            </Link>
          </nav>

          <div className="investor-dashboard-sidebar-footer">
            <button
              type="button"
              className="investor-dashboard-logout"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right" />

              <span>
                تسجيل الخروج
              </span>
            </button>
          </div>
        </aside>

        <main className="investor-dashboard-content">
          {dashboardSection ===
            "dashboard" && (
            <section className="investor-dashboard-section">
              <div className="investor-dashboard-page-header">
                <div>
                  <span className="investor-dashboard-overline">
                    فضاء المستثمر
                  </span>

                  <h1>
                    مرحباً، {user?.prenom || "بكم"}
                  </h1>

                  <p>
                    تابع مشاريعك واستثماراتك
                    وطلباتك من مكان واحد.
                  </p>
                </div>

                <Link
                  to="/investor/dashboard/projects"
                  className="investor-dashboard-primary-btn"
                >
                  <i className="bi bi-plus-lg" />
                  مشروع جديد
                </Link>
              </div>

              <div className="investor-dashboard-stats">
                <div className="investor-dashboard-stat-card">
                  <div className="investor-dashboard-stat-icon">
                    <i className="bi bi-building" />
                  </div>

                  <div className="investor-dashboard-stat-content">
                    <span>
                      إجمالي المشاريع
                    </span>

                    <strong>
                      {toNumber(
                        stats?.projects_total
                      )}
                    </strong>

                    <small>
                      {toNumber(
                        stats?.projects_active
                      )} مشروع نشط
                    </small>
                  </div>
                </div>

                <div className="investor-dashboard-stat-card">
                  <div className="investor-dashboard-stat-icon">
                    <i className="bi bi-cash-stack" />
                  </div>

                  <div className="investor-dashboard-stat-content">
                    <span>
                      الاستثمارات النشطة
                    </span>

                    <strong>
                      {toNumber(
                        stats?.investments_active
                      )}
                    </strong>

                    <small>
                      {formatAmount(
                        stats?.total_investment
                      )}
                    </small>
                  </div>
                </div>

                <div className="investor-dashboard-stat-card">
                  <div className="investor-dashboard-stat-icon">
                    <i className="bi bi-file-earmark-text" />
                  </div>

                  <div className="investor-dashboard-stat-content">
                    <span>
                      الطلبات قيد المعالجة
                    </span>

                    <strong>
                      {toNumber(
                        stats?.requests_pending
                      )}
                    </strong>

                    <small>
                      من أصل{" "}
                      {toNumber(
                        stats?.requests_total
                      )}
                    </small>
                  </div>
                </div>

                <div className="investor-dashboard-stat-card">
                  <div className="investor-dashboard-stat-icon">
                    <i className="bi bi-folder2-open" />
                  </div>

                  <div className="investor-dashboard-stat-content">
                    <span>
                      الوثائق
                    </span>

                    <strong>
                      {toNumber(
                        stats?.documents_total
                      )}
                    </strong>

                    <small>
                      وثيقة مسجلة
                    </small>
                  </div>
                </div>
              </div>

              <div className="investor-dashboard-grid">
                <div className="investor-dashboard-card investor-dashboard-projects-card">
                  <div className="investor-dashboard-card-header">
                    <div>
                      <span className="investor-dashboard-card-overline">
                        المشاريع
                      </span>

                      <h2>
                        آخر مشاريعي
                      </h2>
                    </div>

                    <Link
                      to="/investor/dashboard/projects"
                    >
                      عرض الكل
                    </Link>
                  </div>

                  <div className="investor-dashboard-project-list">
                    {projects
                      .slice(0, 3)
                      .map(
                        (project) => {
                          const status =
                            getProjectStatus(
                              project.statut
                            );

                          return (
                            <div
                              className="investor-dashboard-project-item"
                              key={
                                project.id
                              }
                            >
                              <div className="investor-dashboard-project-icon">
                                <i className="bi bi-building" />
                              </div>

                              <div className="investor-dashboard-project-info">
                                <strong>
                                  {
                                    project.titre
                                  }
                                </strong>

                                <span>
                                  {project.secteurs ||
                                    "قطاع استثماري"}
                                </span>

                                <small>
                                  {formatAmount(
                                    project.montant_investissement
                                  )}
                                  {" · "}
                                  {
                                    project.nombre_emplois
                                  } منصب
                                </small>
                              </div>

                              <span
                                className={
                                  status.className
                                }
                              >
                                {
                                  status.label
                                }
                              </span>
                            </div>
                          );
                        }
                      )}

                    {projects.length ===
                      0 && (
                      <div className="investor-dashboard-project-item">
                        <div className="investor-dashboard-project-icon">
                          <i className="bi bi-building" />
                        </div>

                        <div className="investor-dashboard-project-info">
                          <strong>
                            لا توجد مشاريع بعد
                          </strong>

                          <span>
                            يمكنك إضافة مشروع استثماري جديد.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="investor-dashboard-card investor-dashboard-investment-summary">
                  <div className="investor-dashboard-card-header">
                    <div>
                      <span className="investor-dashboard-card-overline">
                        الاستثمارات
                      </span>

                      <h2>
                        ملخص الاستثمارات
                      </h2>
                    </div>
                  </div>

                  <div className="investor-dashboard-investment-total">
                    <span>
                      إجمالي الاستثمارات
                    </span>

                    <strong>
                      {formatAmount(
                        stats?.total_investment
                      )}
                    </strong>
                  </div>

                  <div className="investor-dashboard-progress">
                    <div className="investor-dashboard-progress-header">
                      <span>
                        نسبة المشاريع المكتملة
                      </span>

                      <strong>
                        {projectCompletion}%
                      </strong>
                    </div>

                    <div className="investor-dashboard-progress-bar">
                      <span
                        style={{
                          width: `${projectCompletion}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="investor-dashboard-investment-items">
                    <div>
                      <span>
                        الاستثمارات النشطة
                      </span>

                      <strong>
                        {toNumber(
                          stats?.investments_active
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        الاستثمارات المكتملة
                      </span>

                      <strong>
                        {completedInvestments}
                      </strong>
                    </div>

                    <div>
                      <span>
                        إجمالي العمليات
                      </span>

                      <strong>
                        {toNumber(
                          stats?.investments_total
                        )}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="investor-dashboard-card investor-dashboard-activity-card">
                  <div className="investor-dashboard-card-header">
                    <div>
                      <span className="investor-dashboard-card-overline">
                        النشاط
                      </span>

                      <h2>
                        آخر النشاطات
                      </h2>
                    </div>
                  </div>

                  <div className="investor-dashboard-activity-list">
                    {dashboardActivities.map(
                      (
                        activity,
                        index
                      ) => (
                        <div
                          className="investor-dashboard-activity-item"
                          key={`${activity.title}-${activity.date || ""}-${index}`}
                        >
                          <div className="investor-dashboard-activity-icon">
                            <i
                              className={`bi ${
                                activity.icon ||
                                "bi-clock-history"
                              }`}
                            />
                          </div>

                          <div className="investor-dashboard-activity-content">
                            <strong>
                              {
                                activity.title
                              }
                            </strong>

                            <span>
                              {
                                activity.text
                              }
                            </span>

                            <small>
                              {formatRelativeTime(
                                activity.date
                              )}
                            </small>
                          </div>
                        </div>
                      )
                    )}

                    {dashboardActivities.length ===
                      0 && (
                      <div className="investor-dashboard-activity-item">
                        <div className="investor-dashboard-activity-icon">
                          <i className="bi bi-clock-history" />
                        </div>

                        <div className="investor-dashboard-activity-content">
                          <strong>
                            لا توجد نشاطات حديثة
                          </strong>

                          <span>
                            ستظهر هنا آخر التحديثات المتعلقة بحسابك.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {dashboardSection ===
            "projects" && (
            <section className="investor-dashboard-section">
              <div className="investor-dashboard-page-header">
                <div>
                  <span className="investor-dashboard-overline">
                    المشاريع
                  </span>

                  <h1>
                    مشاريعي الاستثمارية
                  </h1>

                  <p>
                    أضف مشروعاً جديداً أو تابع جميع مشاريعك المسجلة في حسابك.
                  </p>
                </div>
              </div>

              <div className="investor-dashboard-card investor-project-create-form">
                <div className="investor-dashboard-card-header">
                  <div>
                    <span className="investor-dashboard-card-overline">
                      مشروع جديد
                    </span>

                    <h2>
                      إضافة مشروع استثماري
                    </h2>
                  </div>

                  <i className="bi bi-building-add" />
                </div>

                {projectCreateError && (
                  <div
                    className="investor-dashboard-status danger"
                    role="alert"
                    style={{
                      display: "block",
                      width: "100%",
                      boxSizing: "border-box",
                      marginBottom: "18px",
                    }}
                  >
                    <i className="bi bi-exclamation-circle" />
                    {" "}
                    {projectCreateError}
                  </div>
                )}

                {projectCreateSuccess && (
                  <div
                    className="investor-dashboard-status success"
                    role="status"
                    style={{
                      display: "block",
                      width: "100%",
                      boxSizing: "border-box",
                      marginBottom: "18px",
                    }}
                  >
                    <i className="bi bi-check-circle" />
                    {" "}
                    {projectCreateSuccess}
                  </div>
                )}

                <form
                  onSubmit={
                    handleCreateProject
                  }
                  noValidate
                >
                  <div className="investor-project-form-grid">
                    <div className="investor-project-form-field full">
                      <label htmlFor="project-titre">
                        عنوان المشروع
                        <span> *</span>
                      </label>

                      <input
                        id="project-titre"
                        type="text"
                        value={
                          projectForm.titre
                        }
                        onChange={(event) =>
                          setProjectForm(
                            (current) => ({
                              ...current,
                              titre:
                                event.target.value,
                            })
                          )
                        }
                        placeholder="مثال: إنشاء مركز تكنولوجي"
                        required
                        disabled={
                          creatingProject
                        }
                      />
                    </div>

                    <div className="investor-project-form-field full">
                      <label htmlFor="project-description">
                        وصف المشروع
                        <span> *</span>
                      </label>

                      <textarea
                        id="project-description"
                        value={
                          projectForm.description
                        }
                        onChange={(event) =>
                          setProjectForm(
                            (current) => ({
                              ...current,
                              description:
                                event.target.value,
                            })
                          )
                        }
                        placeholder="قدم وصفاً واضحاً ومفصلاً عن المشروع وأهدافه وطبيعته."
                        rows={5}
                        required
                        disabled={
                          creatingProject
                        }
                      />
                    </div>

                    <div className="investor-project-form-field">
                      <label htmlFor="project-sector">
                        القطاع الاستثماري
                      </label>

                      <select
                        id="project-sector"
                        value={
                          projectForm.sector_id
                        }
                        onChange={(event) =>
                          setProjectForm(
                            (current) => ({
                              ...current,
                              sector_id:
                                event.target.value,
                            })
                          )
                        }
                        disabled={
                          creatingProject
                        }
                      >
                        <option value="">
                          اختر القطاع
                        </option>

                        {PROJECT_SECTORS.map(
                          (sector) => (
                            <option
                              key={
                                sector.id
                              }
                              value={
                                sector.id
                              }
                            >
                              {sector.nom}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div className="investor-project-form-field">
                      <label htmlFor="project-wilaya">
                        الولاية
                        <span> *</span>
                      </label>

                      <input
                        id="project-wilaya"
                        type="text"
                        value={
                          projectForm.wilaya
                        }
                        onChange={(event) =>
                          setProjectForm(
                            (current) => ({
                              ...current,
                              wilaya:
                                event.target.value,
                            })
                          )
                        }
                        placeholder="مثال: الجزائر"
                        required
                        disabled={
                          creatingProject
                        }
                      />
                    </div>

                    <div className="investor-project-form-field">
                      <label htmlFor="project-commune">
                        البلدية
                      </label>

                      <input
                        id="project-commune"
                        type="text"
                        value={
                          projectForm.commune
                        }
                        onChange={(event) =>
                          setProjectForm(
                            (current) => ({
                              ...current,
                              commune:
                                event.target.value,
                            })
                          )
                        }
                        placeholder="مثال: الجزائر الوسطى"
                        disabled={
                          creatingProject
                        }
                      />
                    </div>

                    <div className="investor-project-form-field">
                      <label htmlFor="project-adresse">
                        العنوان
                      </label>

                      <input
                        id="project-adresse"
                        type="text"
                        value={
                          projectForm.adresse
                        }
                        onChange={(event) =>
                          setProjectForm(
                            (current) => ({
                              ...current,
                              adresse:
                                event.target.value,
                            })
                          )
                        }
                        placeholder="العنوان الكامل للمشروع"
                        disabled={
                          creatingProject
                        }
                      />
                    </div>

                    <div className="investor-project-form-field">
                      <label htmlFor="project-montant">
                        مبلغ الاستثمار
                        <span> *</span>
                      </label>

                      <input
                        id="project-montant"
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          projectForm.montant_investissement
                        }
                        onChange={(event) =>
                          setProjectForm(
                            (current) => ({
                              ...current,
                              montant_investissement:
                                event.target.value,
                            })
                          )
                        }
                        placeholder="مثال: 25000000"
                        required
                        disabled={
                          creatingProject
                        }
                      />

                      <small>
                        المبلغ بالدينار الجزائري DA
                      </small>
                    </div>

                    <div className="investor-project-form-field">
                      <label htmlFor="project-emplois">
                        عدد مناصب العمل
                        <span> *</span>
                      </label>

                      <input
                        id="project-emplois"
                        type="number"
                        min="0"
                        step="1"
                        value={
                          projectForm.nombre_emplois
                        }
                        onChange={(event) =>
                          setProjectForm(
                            (current) => ({
                              ...current,
                              nombre_emplois:
                                event.target.value,
                            })
                          )
                        }
                        placeholder="مثال: 50"
                        required
                        disabled={
                          creatingProject
                        }
                      />
                    </div>

                    <div className="investor-project-form-field">
                      <label htmlFor="project-superficie">
                        المساحة
                      </label>

                      <input
                        id="project-superficie"
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          projectForm.superficie
                        }
                        onChange={(event) =>
                          setProjectForm(
                            (current) => ({
                              ...current,
                              superficie:
                                event.target.value,
                            })
                          )
                        }
                        placeholder="مثال: 2500"
                        disabled={
                          creatingProject
                        }
                      />
                    </div>

                    <div className="investor-project-form-field">
                      <label htmlFor="project-unite">
                        وحدة المساحة
                      </label>

                      <select
                        id="project-unite"
                        value={
                          projectForm.unite_superficie
                        }
                        onChange={(event) =>
                          setProjectForm(
                            (current) => ({
                              ...current,
                              unite_superficie:
                                event.target.value,
                            })
                          )
                        }
                        disabled={
                          creatingProject
                        }
                      >
                        <option value="m²">
                          متر مربع (m²)
                        </option>

                        <option value="ha">
                          هكتار (ha)
                        </option>
                      </select>
                    </div>

                    <div className="investor-project-form-field">
                      <label htmlFor="project-date-debut">
                        تاريخ بداية المشروع
                      </label>

                      <input
                        id="project-date-debut"
                        type="date"
                        value={
                          projectForm.date_debut
                        }
                        onChange={(event) =>
                          setProjectForm(
                            (current) => ({
                              ...current,
                              date_debut:
                                event.target.value,
                            })
                          )
                        }
                        disabled={
                          creatingProject
                        }
                      />
                    </div>

                    <div className="investor-project-form-field">
                      <label htmlFor="project-date-fin">
                        تاريخ نهاية المشروع
                      </label>

                      <input
                        id="project-date-fin"
                        type="date"
                        value={
                          projectForm.date_fin
                        }
                        onChange={(event) =>
                          setProjectForm(
                            (current) => ({
                              ...current,
                              date_fin:
                                event.target.value,
                            })
                          )
                        }
                        disabled={
                          creatingProject
                        }
                      />
                    </div>
                  </div>

                  <div className="investor-project-form-actions">
                    <button
                      type="submit"
                      className="investor-dashboard-primary-btn"
                      disabled={
                        creatingProject
                      }
                    >
                      {creatingProject ? (
                        <>
                          <i className="bi bi-arrow-repeat" />
                          جاري إرسال المشروع...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-send" />
                          إرسال المشروع إلى الإدارة
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className="investor-dashboard-logout"
                      disabled={
                        creatingProject
                      }
                      onClick={() => {
                        setProjectCreateError("");
                        setProjectCreateSuccess("");

                        setProjectForm({
                          titre: "",
                          description: "",
                          wilaya: "",
                          commune: "",
                          adresse: "",
                          montant_investissement: "",
                          nombre_emplois: "",
                          superficie: "",
                          unite_superficie: "m²",
                          sector_id: "",
                          date_debut: "",
                          date_fin: "",
                        });
                      }}
                    >
                      <i className="bi bi-arrow-counterclockwise" />
                      إعادة تعيين
                    </button>
                  </div>
                </form>
              </div>

              <div className="investor-dashboard-grid">
                {projects.map(
                  (project) => {
                    const status =
                      getProjectStatus(
                        project.statut
                      );

                    return (
                      <div
                        className="investor-dashboard-card investor-dashboard-projects-card"
                        key={
                          project.id
                        }
                      >
                        <div className="investor-dashboard-card-header">
                          <div>
                            <span className="investor-dashboard-card-overline">
                              مشروع استثماري
                            </span>

                            <h2>
                              {
                                project.titre
                              }
                            </h2>
                          </div>

                          <span
                            className={
                              status.className
                            }
                          >
                            {
                              status.label
                            }
                          </span>
                        </div>

                        <div className="investor-dashboard-project-list">
                          <div className="investor-dashboard-project-item">
                            <div className="investor-dashboard-project-icon">
                              <i className="bi bi-building" />
                            </div>

                            <div className="investor-dashboard-project-info">
                              <strong>
                                {
                                  project.secteurs ||
                                  "قطاع استثماري"
                                }
                              </strong>

                              <span>
                                {project.wilaya ||
                                  "—"}

                                {project.commune
                                  ? ` · ${project.commune}`
                                  : ""}
                              </span>

                              <small>
                                الاستثمار:{" "}
                                {formatAmount(
                                  project.montant_investissement
                                )}
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}

                {projects.length ===
                  0 && (
                  <div className="investor-dashboard-card investor-dashboard-projects-card">
                    <div className="investor-dashboard-card-header">
                      <div>
                        <span className="investor-dashboard-card-overline">
                          المشاريع
                        </span>

                        <h2>
                          لا توجد مشاريع
                        </h2>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {dashboardSection ===
            "investments" && (
            <section className="investor-dashboard-section">
              <div className="investor-dashboard-page-header">
                <div>
                  <span className="investor-dashboard-overline">
                    الاستثمارات
                  </span>

                  <h1>
                    استثماراتي
                  </h1>

                  <p>
                    جميع عمليات الاستثمار المرتبطة بحسابك.
                  </p>
                </div>
              </div>

              <div className="investor-dashboard-grid">
                {investments.map(
                  (investment) => {
                    const status =
                      getInvestmentStatus(
                        investment.statut
                      );

                    return (
                      <div
                        className="investor-dashboard-card investor-dashboard-projects-card"
                        key={
                          investment.id
                        }
                      >
                        <div className="investor-dashboard-card-header">
                          <div>
                            <span className="investor-dashboard-card-overline">
                              استثمار
                            </span>

                            <h2>
                              {
                                investment.projet_titre ||
                                "استثمار"
                              }
                            </h2>
                          </div>

                          <span
                            className={
                              status.className
                            }
                          >
                            {
                              status.label
                            }
                          </span>
                        </div>

                        <div className="investor-dashboard-investment-total">
                          <span>
                            مبلغ الاستثمار
                          </span>

                          <strong>
                            {formatAmount(
                              investment.montant
                            )}
                          </strong>
                        </div>

                        <div className="investor-dashboard-investment-items">
                          <div>
                            <span>
                              المرجع
                            </span>

                            <strong>
                              {
                                investment.reference ||
                                "—"
                              }
                            </strong>
                          </div>

                          <div>
                            <span>
                              التاريخ
                            </span>

                            <strong>
                              {formatDate(
                                investment.date_investissement
                              )}
                            </strong>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}

                {investments.length ===
                  0 && (
                  <div className="investor-dashboard-card investor-dashboard-projects-card">
                    <div className="investor-dashboard-card-header">
                      <div>
                        <span className="investor-dashboard-card-overline">
                          الاستثمارات
                        </span>

                        <h2>
                          لا توجد استثمارات
                        </h2>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {dashboardSection ===
            "requests" && (
            <section className="investor-dashboard-section">
              <div className="investor-dashboard-page-header">
                <div>
                  <span className="investor-dashboard-overline">
                    الطلبات
                  </span>

                  <h1>
                    طلباتي
                  </h1>

                  <p>
                    متابعة جميع طلباتك الاستثمارية.
                  </p>
                </div>
              </div>

              <div className="investor-dashboard-grid">
                {requests.map(
                  (request) => {
                    const status =
                      getRequestStatus(
                        request.statut
                      );

                    return (
                      <div
                        className="investor-dashboard-card investor-dashboard-projects-card"
                        key={
                          request.id
                        }
                      >
                        <div className="investor-dashboard-card-header">
                          <div>
                            <span className="investor-dashboard-card-overline">
                              طلب استثماري
                            </span>

                            <h2>
                              {
                                request.objet
                              }
                            </h2>
                          </div>

                          <span
                            className={
                              status.className
                            }
                          >
                            {
                              status.label
                            }
                          </span>
                        </div>

                        <div className="investor-dashboard-project-list">
                          <div className="investor-dashboard-project-item">
                            <div className="investor-dashboard-project-icon">
                              <i className="bi bi-file-earmark-text" />
                            </div>

                            <div className="investor-dashboard-project-info">
                              <strong>
                                {
                                  request.type_demande
                                }
                              </strong>

                              <span>
                                {
                                  request.projet_titre ||
                                  "بدون مشروع مرتبط"
                                }
                              </span>

                              <small>
                                {request.created_at
                                  ? formatDate(
                                      request.created_at
                                    )
                                  : "—"}
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}

                {requests.length ===
                  0 && (
                  <div className="investor-dashboard-card investor-dashboard-projects-card">
                    <div className="investor-dashboard-card-header">
                      <div>
                        <span className="investor-dashboard-card-overline">
                          الطلبات
                        </span>

                        <h2>
                          لا توجد طلبات
                        </h2>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {dashboardSection ===
            "documents" && (
            <section className="investor-dashboard-section">
              <div className="investor-dashboard-page-header">
                <div>
                  <span className="investor-dashboard-overline">
                    الوثائق
                  </span>

                  <h1>
                    وثائقي
                  </h1>

                  <p>
                    جميع الوثائق المرتبطة بحسابك ومشاريعك.
                  </p>
                </div>
              </div>

              <div className="investor-dashboard-grid">
                {documents.map(
                  (document) => {
                    const status =
                      getDocumentStatus(
                        document.statut
                      );

                    const documentUrl =
                      getFileUrl(
                        document.fichier
                      );

                    return (
                      <div
                        className="investor-dashboard-card investor-dashboard-projects-card"
                        key={
                          document.id
                        }
                      >
                        <div className="investor-dashboard-card-header">
                          <div>
                            <span className="investor-dashboard-card-overline">
                              وثيقة
                            </span>

                            <h2>
                              {
                                document.titre
                              }
                            </h2>
                          </div>

                          <span
                            className={
                              status.className
                            }
                          >
                            {
                              status.label
                            }
                          </span>
                        </div>

                        <div className="investor-dashboard-project-list">
                          <div className="investor-dashboard-project-item">
                            <div className="investor-dashboard-project-icon">
                              <i className="bi bi-file-earmark-text" />
                            </div>

                            <div className="investor-dashboard-project-info">
                              <strong>
                                {
                                  document.nom_original ||
                                  document.titre
                                }
                              </strong>

                              <span>
                                {
                                  document.type_document
                                }
                              </span>

                              <small>
                                {document.uploaded_at
                                  ? formatDate(
                                      document.uploaded_at
                                    )
                                  : "—"}
                              </small>
                            </div>

                            {documentUrl && (
                              <a
                                href={
                                  documentUrl
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="investor-dashboard-status success"
                              >
                                تحميل
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}

                {documents.length ===
                  0 && (
                  <div className="investor-dashboard-card investor-dashboard-projects-card">
                    <div className="investor-dashboard-card-header">
                      <div>
                        <span className="investor-dashboard-card-overline">
                          الوثائق
                        </span>

                        <h2>
                          لا توجد وثائق
                        </h2>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {dashboardSection ===
            "messages" && (
            <section className="investor-dashboard-section">
              <div className="investor-dashboard-page-header">
                <div>
                  <span className="investor-dashboard-overline">
                    التواصل
                  </span>

                  <h1>
                    الرسائل
                  </h1>

                  <p>
                    الرسائل الواردة إلى حسابك.
                  </p>
                </div>
              </div>

              <div className="investor-dashboard-card investor-dashboard-activity-card">
                <div className="investor-dashboard-activity-list">
                  {messages.map(
                    (message) => {
                      const sender =
                        `${message.sender_prenom || ""} ${message.sender_nom || ""}`.trim();

                      return (
                        <div
                          className="investor-dashboard-activity-item"
                          key={
                            message.id
                          }
                        >
                          <div className="investor-dashboard-activity-icon">
                            <i className="bi bi-chat-left-text" />
                          </div>

                          <div className="investor-dashboard-activity-content">
                            <strong>
                              {
                                message.sujet ||
                                "رسالة جديدة"
                              }
                            </strong>

                            <span>
                              {sender ||
                                message.sender_email ||
                                "مرسل غير معروف"}
                            </span>

                            <small>
                              {formatRelativeTime(
                                message.created_at
                              )}
                            </small>
                          </div>

                          {!toNumber(
                            message.lu
                          ) && (
                            <span className="investor-dashboard-status warning">
                              جديدة
                            </span>
                          )}
                        </div>
                      );
                    }
                  )}

                  {messages.length ===
                    0 && (
                    <div className="investor-dashboard-activity-item">
                      <div className="investor-dashboard-activity-icon">
                        <i className="bi bi-chat-left-text" />
                      </div>

                      <div className="investor-dashboard-activity-content">
                        <strong>
                          لا توجد رسائل
                        </strong>

                        <span>
                          لا توجد رسائل واردة حالياً.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {dashboardSection ===
            "notifications" && (
            <section className="investor-dashboard-section">
              <div className="investor-dashboard-page-header">
                <div>
                  <span className="investor-dashboard-overline">
                    التنبيهات
                  </span>

                  <h1>
                    الإشعارات
                  </h1>

                  <p>
                    آخر الإشعارات والتحديثات المتعلقة بحسابك.
                  </p>
                </div>
              </div>

              <div className="investor-dashboard-card investor-dashboard-activity-card">
                <div className="investor-dashboard-activity-list">
                  {notifications.map(
                    (
                      notification
                    ) => (
                      <div
                        className="investor-dashboard-activity-item"
                        key={
                          notification.id
                        }
                      >
                        <div className="investor-dashboard-activity-icon">
                          <i
                            className={`bi ${
                              notification.type ===
                              "document"
                                ? "bi-file-earmark-text"
                                : notification.type ===
                                  "message"
                                ? "bi-chat-left-text"
                                : "bi-bell"
                            }`}
                          />
                        </div>

                        <div className="investor-dashboard-activity-content">
                          <strong>
                            {
                              notification.titre
                            }
                          </strong>

                          <span>
                            {
                              notification.message
                            }
                          </span>

                          <small>
                            {formatRelativeTime(
                              notification.created_at
                            )}
                          </small>
                        </div>

                        {!toNumber(
                          notification.lu
                        ) && (
                          <span className="investor-dashboard-status warning">
                            جديدة
                          </span>
                        )}
                      </div>
                    )
                  )}

                  {notifications.length ===
                    0 && (
                    <div className="investor-dashboard-activity-item">
                      <div className="investor-dashboard-activity-icon">
                        <i className="bi bi-bell" />
                      </div>

                      <div className="investor-dashboard-activity-content">
                        <strong>
                          لا توجد إشعارات
                        </strong>

                        <span>
                          لا توجد إشعارات جديدة حالياً.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {dashboardSection ===
            "profile" && (
            <section className="investor-dashboard-section">
              <div className="investor-dashboard-page-header">
                <div>
                  <span className="investor-dashboard-overline">
                    الحساب
                  </span>

                  <h1>
                    ملفي الشخصي
                  </h1>

                  <p>
                    معلومات حساب المستثمر الخاصة بك.
                  </p>
                </div>
              </div>

              <div className="investor-dashboard-card">
                <div className="investor-dashboard-profile-header">
                  <div className="investor-dashboard-profile-avatar">
                    {userPhotoUrl ? (
                      <img
                        src={userPhotoUrl}
                        alt={fullName}
                      />
                    ) : (
                      initials
                    )}
                  </div>

                  <div>
                    <h2>
                      {fullName}
                    </h2>

                    <p>
                      {user?.email || "—"}
                    </p>
                  </div>
                </div>

                <div className="investor-dashboard-profile-grid">
                  <div>
                    <strong>
                      الاسم
                    </strong>

                    <span>
                      {user?.prenom || "—"}
                    </span>
                  </div>

                  <div>
                    <strong>
                      اللقب
                    </strong>

                    <span>
                      {user?.nom || "—"}
                    </span>
                  </div>

                  <div>
                    <strong>
                      البريد الإلكتروني
                    </strong>

                    <span>
                      {user?.email || "—"}
                    </span>
                  </div>

                  <div>
                    <strong>
                      رقم الهاتف
                    </strong>

                    <span>
                      {user?.telephone ||
                        "غير مسجل"}
                    </span>
                  </div>

                  <div>
                    <strong>
                      نوع المستثمر
                    </strong>

                    <span>
                      {profile?.type_investisseur ||
                        "—"}
                    </span>
                  </div>

                  <div>
                    <strong>
                      المؤسسة
                    </strong>

                    <span>
                      {profile?.nom_entreprise ||
                        "—"}
                    </span>
                  </div>

                  <div>
                    <strong>
                      النشاط
                    </strong>

                    <span>
                      {profile?.secteur_activite ||
                        "—"}
                    </span>
                  </div>

                  <div>
                    <strong>
                      الولاية
                    </strong>

                    <span>
                      {profile?.wilaya ||
                        "—"}
                    </span>
                  </div>

                  <div>
                    <strong>
                      البلدية
                    </strong>

                    <span>
                      {profile?.commune ||
                        "—"}
                    </span>
                  </div>

                  <div>
                    <strong>
                      العنوان
                    </strong>

                    <span>
                      {profile?.adresse ||
                        "—"}
                    </span>
                  </div>

                  <div>
                    <strong>
                      السجل التجاري
                    </strong>

                    <span>
                      {profile?.registre_commerce ||
                        "—"}
                    </span>
                  </div>

                  <div>
                    <strong>
                      الموقع الإلكتروني
                    </strong>

                    <span>
                      {profile?.site_web ||
                        "—"}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {dashboardSection ===
            "settings" && (
            <section className="investor-dashboard-section">
              <div className="investor-dashboard-page-header">
                <div>
                  <span className="investor-dashboard-overline">
                    الحساب
                  </span>

                  <h1>
                    الإعدادات
                  </h1>

                  <p>
                    إعدادات حساب المستثمر.
                  </p>
                </div>
              </div>

              <div className="investor-dashboard-card">
                <div className="investor-dashboard-card-header">
                  <div>
                    <span className="investor-dashboard-card-overline">
                      الحساب
                    </span>

                    <h2>
                      معلومات الحساب
                    </h2>
                  </div>
                </div>

                <p>
                  يمكنك إدارة بيانات حسابك من خلال ملفك الشخصي.
                </p>

                <Link
                  to="/investor/dashboard/profile"
                  className="investor-dashboard-primary-btn"
                >
                  <i className="bi bi-person" />
                  فتح الملف الشخصي
                </Link>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default InvestorDashboard;
