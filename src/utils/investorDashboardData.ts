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
import { formatAmount, toNumber } from "./investorDashboard";

export function normalizeProjects(value: unknown): DashboardProject[] {
  if (!Array.isArray(value)) return [];
  return value.map((project) => {
    const item = project as DashboardProject;
    return { ...item, id: toNumber(item.id), montant_investissement: toNumber(item.montant_investissement), nombre_emplois: toNumber(item.nombre_emplois) };
  });
}

export function normalizeInvestments(value: unknown): DashboardInvestment[] {
  if (!Array.isArray(value)) return [];
  return value.map((investment) => {
    const item = investment as DashboardInvestment;
    return { ...item, id: toNumber(item.id), project_id: item.project_id != null ? toNumber(item.project_id) : null, montant: toNumber(item.montant) };
  });
}

export function normalizeRequests(value: unknown): DashboardRequest[] {
  if (!Array.isArray(value)) return [];
  return value.map((request) => {
    const item = request as DashboardRequest;
    return { ...item, id: toNumber(item.id), montant_demande: item.montant_demande != null ? toNumber(item.montant_demande) : null };
  });
}

export function normalizeDocuments(value: unknown): DashboardDocument[] {
  if (!Array.isArray(value)) return [];
  return value.map((document) => {
    const item = document as DashboardDocument;
    return { ...item, id: toNumber(item.id), taille: item.taille != null ? toNumber(item.taille) : null };
  });
}

export function normalizeMessages(value: unknown): DashboardMessage[] {
  if (!Array.isArray(value)) return [];
  return value.map((message) => {
    const item = message as DashboardMessage;
    return { ...item, id: toNumber(item.id), sender_id: toNumber(item.sender_id), receiver_id: toNumber(item.receiver_id), lu: toNumber(item.lu) };
  });
}

export function normalizeNotifications(value: unknown): DashboardNotification[] {
  if (!Array.isArray(value)) return [];
  return value.map((notification) => {
    const item = notification as DashboardNotification;
    return { ...item, id: toNumber(item.id), lu: toNumber(item.lu) };
  });
}

const activityLabels = {
  ar: {
    project: "مشروع: ", investment: "استثمار: ", request: "طلب جديد: ", message: "رسالة جديدة", document: "وثيقة جديدة", notification: "إشعار جديد",
    projectCreated: "تم تسجيل المشروع في فضاء المستثمر.", investmentCreated: "مبلغ الاستثمار: ", investmentRequest: "طلب استثمار", messageReceived: "رسالة من ", documentAdded: "تمت إضافة وثيقة جديدة.",
  },
  fr: {
    project: "Projet : ", investment: "Investissement : ", request: "Nouvelle demande : ", message: "Nouveau message", document: "Nouveau document", notification: "Nouvelle notification",
    projectCreated: "Projet enregistré dans l’espace investisseur.", investmentCreated: "Montant de l’investissement : ", investmentRequest: "Demande d’investissement", messageReceived: "Message de ", documentAdded: "Nouveau document ajouté.",
  },
  en: {
    project: "Project: ", investment: "Investment: ", request: "New request: ", message: "New message", document: "New document", notification: "New notification",
    projectCreated: "Project registered in the investor area.", investmentCreated: "Investment amount: ", investmentRequest: "Investment request", messageReceived: "Message from ", documentAdded: "New document added.",
  },
} as const;

function normalizeActivity(activity: DashboardActivity, language: Language): DashboardActivity {
  const labels = activityLabels[language];
  const type = activity.type || "";
  const entity = activity.entity_name || "";
  const sender = activity.sender_name || "";

  if (type === "project") {
    return { ...activity, title: `${labels.project}${entity || activity.title || ""}`, text: labels.projectCreated, icon: "bi-kanban" };
  }
  if (type === "investment") {
    const amount = activity.amount != null ? `${labels.investmentCreated}${formatAmount(activity.amount, language)}` : activity.text || "";
    return { ...activity, title: `${labels.investment}${entity || activity.title || ""}`, text: amount, icon: "bi-cash-stack" };
  }
  if (type === "request") {
    return { ...activity, title: entity || activity.title || labels.request, text: labels.investmentRequest, icon: "bi-file-earmark-text" };
  }
  if (type === "message") {
    return { ...activity, title: activity.title || labels.message, text: sender ? `${labels.messageReceived}${sender}` : activity.text || "", icon: "bi-chat-left-text" };
  }
  if (type === "document") {
    return { ...activity, title: labels.document, text: entity || activity.text || labels.documentAdded, icon: "bi-file-earmark-text" };
  }
  if (type === "notification") {
    return { ...activity, title: activity.title || labels.notification, text: activity.text || "", icon: "bi-bell" };
  }

  return { ...activity, title: activity.title || "", text: activity.text || "" };
}

export function getDashboardActivities(
  activities: DashboardActivity[],
  notifications: DashboardNotification[],
  documents: DashboardDocument[],
  messages: DashboardMessage[],
  language: Language = "ar",
): DashboardActivity[] {
  const items: DashboardActivity[] = Array.isArray(activities) ? [...activities] : [];

  if (items.length === 0) {
    notifications.forEach((notification) => items.push({ type: "notification", title: notification.titre || "", text: notification.message || "", date: notification.created_at, icon: "bi-bell" }));
    documents.forEach((document) => items.push({ type: "document", title: "", text: document.titre || "", entity_name: document.titre, date: document.uploaded_at, icon: "bi-file-earmark-text" }));
    messages.forEach((message) => {
      const sender = `${message.sender_prenom || ""} ${message.sender_nom || ""}`.trim();
      items.push({ type: "message", title: message.sujet || "", text: message.contenu || "", sender_name: sender, date: message.created_at, icon: "bi-chat-left-text" });
    });
  }

  return items
    .filter((item) => item && (item.title || item.text || item.entity_name))
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .map((item) => normalizeActivity(item, language))
    .slice(0, 10);
}

export function getProjectCompletion(stats: DashboardResponse["stats"] | null): number {
  if (!stats || toNumber(stats.projects_total) <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((toNumber(stats.projects_completed) / toNumber(stats.projects_total)) * 100)));
}

export function getCompletedInvestments(investments: DashboardInvestment[], stats: DashboardResponse["stats"] | null): number {
  if (stats?.investments_completed !== undefined) return toNumber(stats.investments_completed);
  return investments.filter((investment) => investment.statut === "termine").length;
}
