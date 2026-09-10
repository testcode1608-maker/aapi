import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  API_URL,
  LOGIN_ROUTE,
} from "../utils/investorDashboard";
import {
  normalizeDocuments,
  normalizeInvestments,
  normalizeMessages,
  normalizeNotifications,
  normalizeProjects,
  normalizeRequests,
} from "../utils/investorDashboardData";
import type {
  DashboardDocument,
  DashboardInvestment,
  DashboardMessage,
  DashboardNotification,
  DashboardProfile,
  DashboardProject,
  DashboardRequest,
  DashboardResponse,
  DashboardStats,
  DashboardUser,
} from "../types/investorDashboard";

interface UseInvestorDashboardResult {
  user: DashboardUser | null;
  profile: DashboardProfile | null;
  stats: DashboardStats | null;
  projects: DashboardProject[];
  investments: DashboardInvestment[];
  requests: DashboardRequest[];
  documents: DashboardDocument[];
  messages: DashboardMessage[];
  notifications: DashboardNotification[];
  activities: DashboardResponse["activities"];
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
}

function getStoredUserId(): number | null {
  const stored = localStorage.getItem("aapi_user");
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as { id?: number | string };
    const id = Number(parsed.id);
    return Number.isFinite(id) && id > 0 ? id : null;
  } catch {
    localStorage.removeItem("aapi_user");
    return null;
  }
}

export function useInvestorDashboard(): UseInvestorDashboardResult {
  const navigate = useNavigate();

  const [user, setUser] = useState<DashboardUser | null>(null);
  const [profile, setProfile] = useState<DashboardProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [investments, setInvestments] = useState<DashboardInvestment[]>([]);
  const [requests, setRequests] = useState<DashboardRequest[]>([]);
  const [documents, setDocuments] = useState<DashboardDocument[]>([]);
  const [messages, setMessages] = useState<DashboardMessage[]>([]);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [activities, setActivities] = useState<DashboardResponse["activities"]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");

    const userId = getStoredUserId();

    if (!userId) {
      navigate(LOGIN_ROUTE, { replace: true });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ user_id: userId }),
      });

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.toLowerCase().includes("application/json")) {
        throw new Error(
          "Le serveur a retourné une réponse invalide. Vérifiez l'API PHP.",
        );
      }

      const data: DashboardResponse = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
            "Impossible de charger les données du tableau de bord.",
        );
      }

      setUser(data.user || null);
      setProfile(data.profile || null);
      setStats(data.stats || null);
      setProjects(normalizeProjects(data.projects));
      setInvestments(normalizeInvestments(data.investments));
      setRequests(normalizeRequests(data.requests));
      setDocuments(normalizeDocuments(data.documents));
      setMessages(normalizeMessages(data.messages));
      setNotifications(normalizeNotifications(data.notifications));
      setActivities(Array.isArray(data.activities) ? data.activities : []);

      if (data.user) {
        localStorage.setItem("aapi_user", JSON.stringify(data.user));
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error && requestError.message
          ? requestError.message
          : "تعذر الاتصال بالخادم.",
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    user,
    profile,
    stats,
    projects,
    investments,
    requests,
    documents,
    messages,
    notifications,
    activities,
    loading,
    error,
    reload,
  };
}

export default useInvestorDashboard;
