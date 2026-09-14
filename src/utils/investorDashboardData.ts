import type {
  DashboardActivity,
  DashboardDocument,
  DashboardInvestment,
  DashboardMessage,
  DashboardNotification,
  DashboardProject,
  DashboardRequest,
  DashboardResponse,
} from "../types/investorDashboard";
import type { Language } from "../i18n/translations";
import { toNumber } from "./investorDashboard";

export function normalizeProjects(value: unknown): DashboardProject[] {
  if (!Array.isArray(value)) return [];
  return value.map((project) => {
    const item = project as DashboardProject;
    return {
      ...item,
      id: toNumber(item.id),
      montant_investissement: toNumber(item.montant_investissement),
      nombre_emplois: toNumber(item.nombre_emplois),
    };
  });
}

export function normalizeInvestments(value: unknown): DashboardInvestment[] {
  if (!Array.isArray(value)) return [];
  return value.map((investment) => {
    const item = investment as DashboardInvestment;
    return {
      ...item,
      id: toNumber(item.id),
      project_id:
        item.project_id !== null && item.project_id !== undefined
          ? toNumber(item.project_id)
          : null,
      montant: toNumber(item.montant),
    };
  });
}

export function normalizeRequests(value: unknown): DashboardRequest[] {
  if (!Array.isArray(value)) return [];
  return value.map((request) => {
    const item = request as DashboardRequest;
    return {
      ...item,
      id: toNumber(item.id),
      montant_demande:
        item.montant_demande !== null && item.montant_demande !== undefined
          ? toNumber(item.montant_demande)
          : null,
    };
  });
}

export function normalizeDocuments(value: unknown): DashboardDocument[] {
  if (!Array.isArray(value)) return [];
  return value.map((document) => {
    const item = document as DashboardDocument;
    return {
      ...item,
      id: toNumber(item.id),
      taille:
        item.taille !== null && item.taille !== undefined
          ? toNumber(item.taille)
          : null,
    };
  });
}

export function normalizeMessages(value: unknown): DashboardMessage[] {
  if (!Array.isArray(value)) return [];
  return value.map((message) => {
    const item = message as DashboardMessage;
    return {
      ...item,
      id: toNumber(item.id),
      sender_id: toNumber(item.sender_id),
      receiver_id: toNumber(item.receiver_id),
      lu: toNumber(item.lu),
    };
  });
}

export function normalizeNotifications(value: unknown): DashboardNotification[] {
  if (!Array.isArray(value)) return [];
  return value.map((notification) => {
    const item = notification as DashboardNotification;
    return {
      ...item,
      id: toNumber(item.id),
      lu: toNumber(item.lu),
    };
  });
}

function translateActivityText(value: string, language: Language): string {
  if (language === "ar") return value;

  const replacements: Array<[string, string, string]> = [
    ["طلب استثمار جديد", "Nouvelle demande d’investissement", "New investment request"],
    ["تحديث حالة المشروع", "Mise à jour du statut du projet", "Project status updated"],
    ["طلب جديد", "Nouvelle demande", "New request"],
    ["رسالة جديدة", "Nouveau message", "New message"],
    ["تمت إضافة وثيقة جديدة", "Nouveau document ajouté", "New document added"],
    ["إشعار جديد", "Nouvelle notification", "New notification"],
  ];

  let result = value;
  for (const [arabic, french, english] of replacements) {
    result = result.replaceAll(arabic, language === "fr" ? french : english);
  }

  result = result.replace(/^استثمار:\s*/u, language === "fr" ? "Investissement : " : "Investment: ");
  result = result.replace(/^مشروع:\s*/u, language === "fr" ? "Projet : " : "Project: ");
  result = result.replace(/^من\s+/u, language === "fr" ? "De " : "From ");

  return result;
}

function normalizeActivity(activity: DashboardActivity, language: Language): DashboardActivity {
  return {
    ...activity,
    title: translateActivityText(activity.title || "", language),
    text: translateActivityText(activity.text || "", language),
  };
}

export function getDashboardActivities(
  activities: DashboardActivity[],
  notifications: DashboardNotification[],
  documents: DashboardDocument[],
  messages: DashboardMessage[],
  language: Language = "ar",
): DashboardActivity[] {
  if (activities.length > 0) {
    return activities
      .filter((activity) => activity && (activity.title || activity.text))
      .map((activity) => normalizeActivity(activity, language))
      .slice(0, 10);
  }

  const items: DashboardActivity[] = [];

  notifications.forEach((notification) => {
    items.push({
      title: notification.titre || "إشعار جديد",
      text: notification.message || "",
      date: notification.created_at,
      icon:
        notification.type === "document"
          ? "bi-file-earmark-text"
          : notification.type === "message"
            ? "bi-chat-left-text"
            : "bi-check-circle",
    });
  });

  documents.forEach((document) => {
    items.push({
      title: "تمت إضافة وثيقة جديدة",
      text: document.titre || "وثيقة",
      date: document.uploaded_at,
      icon: "bi-file-earmark-text",
    });
  });

  messages.forEach((message) => {
    const sender = `${message.sender_prenom || ""} ${message.sender_nom || ""}`.trim();
    items.push({
      title: "رسالة جديدة",
      text: sender
        ? `من ${sender}: ${message.sujet || message.contenu || ""}`
        : message.sujet || message.contenu || "",
      date: message.created_at,
      icon: "bi-chat-left-text",
    });
  });

  return items
    .filter((item) => item.title || item.text)
    .sort((a, b) => {
      const first = a.date ? new Date(a.date).getTime() : 0;
      const second = b.date ? new Date(b.date).getTime() : 0;
      return second - first;
    })
    .map((item) => normalizeActivity(item, language))
    .slice(0, 10);
}

export function getProjectCompletion(
  stats: DashboardResponse["stats"] | null,
): number {
  if (!stats || toNumber(stats.projects_total) <= 0) return 0;
  return Math.min(
    100,
    Math.max(
      0,
      Math.round(
        (toNumber(stats.projects_completed) / toNumber(stats.projects_total)) * 100,
      ),
    ),
  );
}

export function getCompletedInvestments(
  investments: DashboardInvestment[],
  stats: DashboardResponse["stats"] | null,
): number {
  if (stats?.investments_completed !== undefined) {
    return toNumber(stats.investments_completed);
  }
  return investments.filter((investment) => investment.statut === "termine").length;
}
