import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../i18n/I18nProvider";
import { API_URL, LOGIN_ROUTE } from "../utils/investorDashboard";
import {
  getCompletedInvestments,
  getDashboardActivities,
  getProjectCompletion,
  normalizeDocuments,
  normalizeInvestments,
  normalizeMessages,
  normalizeNotifications,
  normalizeProjects,
  normalizeRequests,
} from "../utils/investorDashboardData";
import type {
  DashboardActivity,
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

export interface UseInvestorDashboardResult {
  user: DashboardUser | null;
  profile: DashboardProfile | null;
  stats: DashboardStats | null;
  projects: DashboardProject[];
  investments: DashboardInvestment[];
  requests: DashboardRequest[];
  documents: DashboardDocument[];
  messages: DashboardMessage[];
  notifications: DashboardNotification[];
  activities: DashboardActivity[];
  projectCompletion: number;
  completedInvestments: number;
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
}

function getStoredUser(): { id: number; role: string } | null {
  const stored = localStorage.getItem("aapi_user");
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as { id?: number | string; role?: string };
    const id = Number(parsed.id);
    const role = String(parsed.role || "").trim().toLowerCase();

    if (!Number.isFinite(id) || id <= 0) {
      localStorage.removeItem("aapi_user");
      return null;
    }

    return { id, role };
  } catch {
    localStorage.removeItem("aapi_user");
    return null;
  }
}

export function useInvestorDashboard(): UseInvestorDashboardResult {
  const navigate = useNavigate();
  const { language } = useTranslation();
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [profile, setProfile] = useState<DashboardProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [investments, setInvestments] = useState<DashboardInvestment[]>([]);
  const [requests, setRequests] = useState<DashboardRequest[]>([]);
  const [documents, setDocuments] = useState<DashboardDocument[]>([]);
  const [messages, setMessages] = useState<DashboardMessage[]>([]);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [activities, setActivities] = useState<DashboardActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");

    const storedUser = getStoredUser();

    if (!storedUser) {
      navigate(LOGIN_ROUTE, { replace: true });
      setLoading(false);
      return;
    }

    if (storedUser.role === "admin") {
      navigate("/admin/dashboard", { replace: true });
      setLoading(false);
      return;
    }

    if (storedUser.role === "agent") {
      navigate("/agent/dashboard", { replace: true });
      setLoading(false);
      return;
    }

    if (storedUser.role && storedUser.role !== "investisseur" && storedUser.role !== "investor") {
      localStorage.removeItem("aapi_user");
      navigate(LOGIN_ROUTE, { replace: true });
      setLoading(false);
      return;
    }

    const userId = storedUser.id;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.toLowerCase().includes("application/json")) {
        throw new Error("INVALID_RESPONSE");
      }

      const data = await response.json() as DashboardResponse & {
        message?: string;
        error?: string;
      };

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
          data?.error ||
          `DASHBOARD_REQUEST_FAILED_${response.status}`
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
      console.error("Investor dashboard request failed:", requestError);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "DASHBOARD_REQUEST_FAILED"
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const projectCompletion = getProjectCompletion(stats);
  const completedInvestments = getCompletedInvestments(investments, stats);
  const dashboardActivities = getDashboardActivities(
    activities,
    notifications,
    documents,
    messages,
    language,
  );

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
    activities: dashboardActivities,
    projectCompletion,
    completedInvestments,
    loading,
    error,
    reload,
  };
}

export default useInvestorDashboard;
