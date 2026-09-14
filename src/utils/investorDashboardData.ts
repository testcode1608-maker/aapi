import type { DashboardActivity, DashboardDocument, DashboardInvestment, DashboardMessage, DashboardNotification, DashboardProject, DashboardRequest, DashboardResponse } from "../types/investorDashboard";
import type { Language } from "../i18n/translations";
import { formatAmount, toNumber } from "./investorDashboard";

export function normalizeProjects(value: unknown): DashboardProject[] {
  if (!Array.isArray(value)) return [];
  return value.map((project) => { const item = project as DashboardProject; return { ...item, id: toNumber(item.id), montant_investissement: toNumber(item.montant_investissement), nombre_emplois: toNumber(item.nombre_emplois) }; });
}
export function normalizeInvestments(value: unknown): DashboardInvestment[] {
  if (!Array.isArray(value)) return [];
  return value.map((investment) => { const item = investment as DashboardInvestment; return { ...item, id: toNumber(item.id), project_id: item.project_id != null ? toNumber(item.project_id) : null, montant: toNumber(item.montant) }; });
}
export function normalizeRequests(value: unknown): DashboardRequest[] {
  if (!Array.isArray(value)) return [];
  return value.map((request) => { const item = request as DashboardRequest; return { ...item, id: toNumber(item.id), montant_demande: item.montant_demande != null ? toNumber(item.montant_demande) : null }; });
}
export function normalizeDocuments(value: unknown): DashboardDocument[] {
  if (!Array.isArray(value)) return [];
  return value.map((document) => { const item = document as DashboardDocument; return { ...item, id: toNumber(item.id), taille: item.taille != null ? toNumber(item.taille) : null }; });
}
export function normalizeMessages(value: unknown): DashboardMessage[] {
  if (!Array.isArray(value)) return [];
  return value.map((message) => { const item = message as DashboardMessage; return { ...item, id: toNumber(item.id), sender_id: toNumber(item.sender_id), receiver_id: toNumber(item.receiver_id), lu: toNumber(item.lu) }; });
}
export function normalizeNotifications(value: unknown): DashboardNotification[] {
  if (!Array.isArray(value)) return [];
  return value.map((notification) => { const item = notification as DashboardNotification; return { ...item, id: toNumber(item.id), lu: toNumber(item.lu) }; });
}

const labels = {
  ar: { project: "مشروع: ", investment: "استثمار: ", request: "طلب جديد: ", message: "رسالة جديدة", document: "وثيقة جديدة", notification: "إشعار جديد", projectCreated: "تم تسجيل المشروع في فضاء المستثمر.", investmentAmount: "مبلغ الاستثمار: ", investmentRequest: "طلب استثمار", messageFrom: "رسالة من ", documentAdded: "تمت إضافة وثيقة جديدة." },
  fr: { project: "Projet : ", investment: "Investissement : ", request: "Nouvelle demande : ", message: "Nouveau message", document: "Nouveau document", notification: "Nouvelle notification", projectCreated: "Projet enregistré dans l’espace investisseur.", investmentAmount: "Montant de l’investissement : ", investmentRequest: "Demande d’investissement", messageFrom: "Message de ", documentAdded: "Nouveau document ajouté." },
  en: { project: "Project: ", investment: "Investment: ", request: "New request: ", message: "New message", document: "New document", notification: "New notification", projectCreated: "Project registered in the investor area.", investmentAmount: "Investment amount: ", investmentRequest: "Investment request", messageFrom: "Message from ", documentAdded: "New document added." },
} as const;

function stripPrefix(value: string, prefixes: string[]): string {
  for (const prefix of prefixes) if (value.startsWith(prefix)) return value.slice(prefix.length).trim();
  return value.trim();
}

function normalizeActivity(activity: DashboardActivity, language: Language): DashboardActivity {
  const l = labels[language];
  const type = activity.type || "";

  if (type === "project") {
    const entity = activity.entity_name || stripPrefix(activity.title || "", ["مشروع:", "مشروع :"]);
    return { ...activity, title: `${l.project}${entity}`, text: l.projectCreated, icon: "bi-kanban" };
  }

  if (type === "investment") {
    const entity = activity.entity_name || stripPrefix(activity.title || "", ["استثمار:", "استثمار :"]);
    let text = activity.text || "";
    if (activity.amount != null) text = `${l.investmentAmount}${formatAmount(activity.amount, language)}`;
    else text = text.replace(/^مبلغ الاستثمار:\s*/u, l.investmentAmount);
    return { ...activity, title: `${l.investment}${entity}`, text, icon: "bi-cash-stack" };
  }

  if (type === "request") {
    return { ...activity, title: activity.entity_name || activity.title || l.request, text: l.investmentRequest, icon: "bi-file-earmark-text" };
  }

  if (type === "message") {
    let text = activity.text || "";
    if (activity.sender_name) text = `${l.messageFrom}${activity.sender_name}`;
    else text = text.replace(/^رسالة من\s+/u, l.messageFrom);
    return { ...activity, title: activity.title || l.message, text, icon: "bi-chat-left-text" };
  }

  if (type === "document") return { ...activity, title: l.document, text: activity.entity_name || activity.text || l.documentAdded, icon: "bi-file-earmark-text" };
  if (type === "notification") return { ...activity, title: activity.title || l.notification, text: activity.text || "", icon: "bi-bell" };

  return { ...activity, title: activity.title || "", text: activity.text || "" };
}

export function getDashboardActivities(activities: DashboardActivity[], notifications: DashboardNotification[], documents: DashboardDocument[], messages: DashboardMessage[], language: Language = "ar"): DashboardActivity[] {
  const items: DashboardActivity[] = Array.isArray(activities) ? [...activities] : [];
  if (items.length === 0) {
    notifications.forEach((n) => items.push({ type: "notification", title: n.titre || "", text: n.message || "", date: n.created_at, icon: "bi-bell" }));
    documents.forEach((d) => items.push({ type: "document", title: "", text: d.titre || "", entity_name: d.titre, date: d.uploaded_at, icon: "bi-file-earmark-text" }));
    messages.forEach((m) => { const sender = `${m.sender_prenom || ""} ${m.sender_nom || ""}`.trim(); items.push({ type: "message", title: m.sujet || "", text: m.contenu || "", sender_name: sender, date: m.created_at, icon: "bi-chat-left-text" }); });
  }
  return items.filter((item) => item && (item.title || item.text || item.entity_name)).sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()).map((item) => normalizeActivity(item, language)).slice(0, 10);
}

export function getProjectCompletion(stats: DashboardResponse["stats"] | null): number {
  if (!stats || toNumber(stats.projects_total) <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((toNumber(stats.projects_completed) / toNumber(stats.projects_total)) * 100)));
}
export function getCompletedInvestments(investments: DashboardInvestment[], stats: DashboardResponse["stats"] | null): number {
  if (stats?.investments_completed !== undefined) return toNumber(stats.investments_completed);
  return investments.filter((investment) => investment.statut === "termine").length;
}
