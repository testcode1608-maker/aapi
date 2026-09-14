import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Agency from "./pages/Agency";
import Investor from "./pages/Investor";
import OpportunitiesPage from "./pages/OpportunitiesPage";
import SectorsPage from "./pages/SectorsPage";
import NewsPage from "./pages/NewsPage";
import EventsPage from "./pages/EventsPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import Contact from "./pages/Contact";
import NewsDetails from "./pages/NewsDetails";
import AnnouncementsDetails from "./pages/AnnouncementsDetails";
import InvestorRegistration from "./pages/InvestorRegistration";
import Login from "./pages/Login";
import InvestorDashboard from "./pages/InvestorDashboard";
import Administrator from "./pages/Administrator";
import AdminSettings from "./pages/AdminSettings";
import Header from "./components/Header";
import Footer from "./components/Footer";
import SiteThemeToggle from "./components/SiteThemeToggle";
import LanguageSwitcher from "./components/LanguageSwitcher";
import { I18nProvider } from "./i18n/I18nProvider";
import "./styles/site-theme.css";
import "./styles/aapi-all-pages-theme.css";
import "./styles/inscription-dark.css";
import "./styles/inscription-textarea-dark.css";
import "./styles/language-switcher.css";
import "./styles/global-direction.css";
import "./styles/registration-direction.css";
import "./styles/home/index.css";

interface CurrentUser {
  id: number;
  role?: string;
  statut?: string;
  [key: string]: unknown;
}

function getCurrentUser(): CurrentUser | null {
  try {
    const raw = localStorage.getItem("aapi_user");
    if (!raw) return null;
    const user: unknown = JSON.parse(raw);
    return user && typeof user === "object" ? (user as CurrentUser) : null;
  } catch {
    return null;
  }
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: "auto" }); }, [pathname]);
  return null;
}

function isActiveAdmin(user: CurrentUser | null) {
  return !!user && String(user.role).toLowerCase() === "admin" && (!user.statut || String(user.statut).toLowerCase() === "actif");
}

function AdminRoute() {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (!isActiveAdmin(user)) return <Navigate to="/" replace />;
  return <Administrator />;
}

function AdminSettingsRoute() {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (!isActiveAdmin(user)) return <Navigate to="/" replace />;
  return <AdminSettings />;
}

function InvestorRoute() {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "investisseur" && user.role !== "investor") return <Navigate to="/" replace />;
  return <InvestorDashboard />;
}
