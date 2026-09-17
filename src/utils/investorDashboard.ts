export const API_BASE_URL = "http://localhost/aapi-api";
export const API_URL = `${API_BASE_URL}/auth/investor/dashboard.php`;
export const CREATE_PROJECT_API_URL = `${API_BASE_URL}/auth/investor/create-project.php`;
export const LOGIN_ROUTE = "/login";

export type DashboardLanguage = "ar" | "fr" | "en";

const projectSectors = {
  ar: ["الزراعة", "الصناعة", "التكنولوجيا", "السياحة", "الطاقات", "النقل", "الصحة", "الخدمات"],
  fr: ["Agriculture", "Industrie", "Technologie", "Tourisme", "Énergie", "Transport", "Santé", "Services"],
  en: ["Agriculture", "Industry", "Technology", "Tourism", "Energy", "Transport", "Health", "Services"],
} as const;

export const PROJECT_SECTORS = projectSectors.ar.map((nom, index) => ({ id: index + 1, nom })) as ReadonlyArray<{ id: number; nom: string }>;

export function getProjectSectors(language: DashboardLanguage = getLanguage()) {
  return projectSectors[language].map((nom, index) => ({ id: index + 1, nom }));
}

export function toNumber(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function formatAmount(value?: number | null, language: DashboardLanguage = getLanguage()): string {
  const locale = language === "ar" ? "ar-DZ" : language === "en" ? "en-DZ" : "fr-DZ";
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(toNumber(value))} DA`;
}

export function formatDate(value?: string | null, language: DashboardLanguage = getLanguage()): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const locale = language === "ar" ? "ar-DZ" : language === "en" ? "en-DZ" : "fr-DZ";
  return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function getLanguage(): DashboardLanguage {
  if (typeof document === "undefined") return "ar";
  const language = document.documentElement.lang.toLowerCase();
  if (language.startsWith("fr")) return "fr";
  if (language.startsWith("en")) return "en";
  return "ar";
}

const relativeTimeLabels = {
  ar: { now: "الآن", minute: "منذ دقيقة", minutes: "منذ {n} دقيقة", hour: "منذ ساعة", hours: "منذ {n} ساعة", day: "منذ يوم", days: "منذ {n} يوم" },
  fr: { now: "À l'instant", minute: "Il y a une minute", minutes: "Il y a {n} minutes", hour: "Il y a une heure", hours: "Il y a {n} heures", day: "Il y a un jour", days: "Il y a {n} jours" },
  en: { now: "Just now", minute: "1 minute ago", minutes: "{n} minutes ago", hour: "1 hour ago", hours: "{n} hours ago", day: "1 day ago", days: "{n} days ago" },
} as const;

export function formatRelativeTime(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const difference = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(difference / 60000);
  const hours = Math.floor(difference / 3600000);
  const days = Math.floor(difference / 86400000);
  const labels = relativeTimeLabels[getLanguage()];
  if (minutes < 1) return labels.now;
  if (minutes === 1) return labels.minute;
  if (minutes < 60) return labels.minutes.replace("{n}", String(minutes));
  if (hours === 1) return labels.hour;
  if (hours < 24) return labels.hours.replace("{n}", String(hours));
  if (days === 1) return labels.day;
  if (days < 7) return labels.days.replace("{n}", String(days));
  return formatDate(value);
}

export interface StatusInfo { className: string; label: string; }
const status = (tone: "success" | "warning" | "danger", label: string): StatusInfo => ({ className: `investor-dashboard-status ${tone}`, label });

const statusLabels = {
  ar: { approved: "معتمد", inProgress: "قيد الإنجاز", completed: "مكتمل", underReview: "قيد الدراسة", submitted: "مقدم", draft: "مسودة", archived: "مؤرشف", rejected: "مرفوض", undefined: "غير محدد", pending: "قيد الانتظار", cancelled: "ملغى", accepted: "مقبول", processing: "قيد المعالجة", new: "جديدة", valid: "صحيحة", reviewing: "قيد المراجعة", invalid: "مرفوضة" },
  fr: { approved: "Approuvé", inProgress: "En cours", completed: "Terminé", underReview: "À l'étude", submitted: "Soumis", draft: "Brouillon", archived: "Archivé", rejected: "Rejeté", undefined: "Non défini", pending: "En attente", cancelled: "Annulé", accepted: "Acceptée", processing: "En traitement", new: "Nouvelle", valid: "Valide", reviewing: "En révision", invalid: "Rejeté" },
  en: { approved: "Approved", inProgress: "In progress", completed: "Completed", underReview: "Under review", submitted: "Submitted", draft: "Draft", archived: "Archived", rejected: "Rejected", undefined: "Not specified", pending: "Pending", cancelled: "Cancelled", accepted: "Accepted", processing: "Processing", new: "New", valid: "Valid", reviewing: "Under review", invalid: "Rejected" },
} as const;

export function getProjectStatus(value?: string | null): StatusInfo {
  const labels = statusLabels[getLanguage()];
  switch (value) {
    case "en_cours": return status("success", labels.inProgress);
    case "approuve": return status("success", labels.approved);
    case "realise": return status("success", labels.completed);
    case "en_etude": return status("warning", labels.underReview);
    case "soumis": return status("warning", labels.submitted);
    case "brouillon": return status("warning", labels.draft);
    case "archive": return status("warning", labels.archived);
    case "rejete": return status("danger", labels.rejected);
    default: return status("warning", value || labels.undefined);
  }
}

export function getInvestmentStatus(value?: string | null): StatusInfo {
  const labels = statusLabels[getLanguage()];
  switch (value) {
    case "valide": return status("success", labels.approved);
    case "en_cours": return status("success", labels.inProgress);
    case "termine": return status("success", labels.completed);
    case "en_attente": return status("warning", labels.pending);
    case "annule": return status("danger", labels.cancelled);
    default: return status("warning", value || labels.undefined);
  }
}

export function getRequestStatus(value?: string | null): StatusInfo {
  const labels = statusLabels[getLanguage()];
  switch (value) {
    case "acceptee": return status("success", labels.accepted);
    case "terminee": return status("success", labels.completed);
    case "refusee": return status("danger", labels.rejected);
    case "nouvelle": return status("warning", labels.new);
    case "en_cours": return status("warning", labels.processing);
    case "en_attente": return status("warning", labels.pending);
    default: return status("warning", value || labels.undefined);
  }
}

export function getDocumentStatus(value?: string | null): StatusInfo {
  const labels = statusLabels[getLanguage()];
  switch (value) {
    case "valide": return status("success", labels.valid);
    case "en_attente": return status("warning", labels.reviewing);
    case "rejete": return status("danger", labels.invalid);
    default: return status("warning", value || labels.undefined);
  }
}

export function getFileUrl(value?: string | null): string {
  const file = value?.trim() || "";
  if (!file) return "";
  if (file.startsWith("data:image/")) return file;
  if (/^https?:\/\//i.test(file)) return file;
  return `${API_BASE_URL}/${file.replace(/^\/+/, "")}`;
}

export function getUserInitials(prenom?: string | null, nom?: string | null): string {
  const first = prenom?.trim().charAt(0) || "";
  const last = nom?.trim().charAt(0) || "";
  return `${first}${last}`.trim() || "A";
}

export function getUserFullName(user?: { prenom?: string | null; nom?: string | null } | string | null, nom?: string | null): string {
  if (typeof user === "string" || user == null) return `${user || ""} ${nom || ""}`.trim() || getLanguageAwareInvestorLabel();
  return `${user.prenom || ""} ${user.nom || ""}`.trim() || getLanguageAwareInvestorLabel();
}

function getLanguageAwareInvestorLabel(): string {
  const language = getLanguage();
  return language === "fr" ? "Investisseur" : language === "en" ? "Investor" : "المستثمر";
}

export function getUserPhotoUrl(user?: { photo?: string | null; photo_url?: string | null; avatar?: string | null } | null): string {
  return getFileUrl(user?.photo_url || user?.photo || user?.avatar || "");
}
