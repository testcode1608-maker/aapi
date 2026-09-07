import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import { useEffect } from "react";

import Header from "./components/Header";
import Footer from "./components/Footer";

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
import AdminDashboard from "./pages/AdminDashboard";

/* ============================================================
   SCROLL TO TOP
   ============================================================ */

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
}

/* ============================================================
   GET CURRENT USER
   ============================================================ */

function getCurrentUser() {
  try {
    const storedUser = localStorage.getItem("aapi_user");

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("aapi_user");
    return null;
  }
}

/* ============================================================
   ADMIN ROUTE
   فقط admin يستطيع الدخول
   ============================================================ */

function AdminRoute() {
  const user = getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = String(user.role || "").toLowerCase();

  if (role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return <AdminDashboard />;
}

/* ============================================================
   INVESTOR ROUTE
   فقط المستثمر يستطيع الدخول
   ============================================================ */

function InvestorRoute() {
  const user = getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = String(user.role || "").toLowerCase();

  if (role !== "investisseur" && role !== "investor") {
    return <Navigate to="/login" replace />;
  }

  return <InvestorDashboard />;
}

/* ============================================================
   APP CONTENT
   ============================================================ */

function AppContent() {
  const { pathname } = useLocation();

  const isInvestorDashboard =
    pathname.startsWith("/investor/dashboard");

  const isAdminDashboard =
    pathname.startsWith("/admin/dashboard");

  const isDashboard =
    isInvestorDashboard || isAdminDashboard;

  return (
    <div className="aapi-site">

      {/* HEADER */}
      {!isDashboard && <Header />}

      <main>
        <Routes>

          {/* ==================================================
              PUBLIC PAGES
              ================================================== */}

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/agency"
            element={<Agency />}
          />

          <Route
            path="/investor"
            element={<Investor />}
          />

          <Route
            path="/inscription"
            element={<InvestorRegistration />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/opportunities"
            element={<OpportunitiesPage />}
          />

          <Route
            path="/sectors"
            element={<SectorsPage />}
          />

          <Route
            path="/news"
            element={<NewsPage />}
          />

          <Route
            path="/news/:id"
            element={<NewsDetails />}
          />

          <Route
            path="/events"
            element={<EventsPage />}
          />

          <Route
            path="/announcements"
            element={<AnnouncementsPage />}
          />

          <Route
            path="/announcements/:id"
            element={<AnnouncementsDetails />}
          />

          <Route
            path="/contact"
            element={<Contact />}
          />

          {/* ==================================================
              ADMIN DASHBOARD
              ================================================== */}

          <Route
            path="/admin/dashboard"
            element={<AdminRoute />}
          />

          {/* ==================================================
              INVESTOR DASHBOARD
              ================================================== */}

          <Route
            path="/investor/dashboard/*"
            element={<InvestorRoute />}
          />

          <Route
            path="/investor/dashboard/project"
            element={<InvestorRoute />}
          />

          <Route
            path="/investor/dashboard/investments"
            element={<InvestorRoute />}
          />

          <Route
            path="/investor/dashboard/requests"
            element={<InvestorRoute />}
          />

          <Route
            path="/investor/dashboard/documents"
            element={<InvestorRoute />}
          />

          <Route
            path="/investor/dashboard/messages"
            element={<InvestorRoute />}
          />

          <Route
            path="/investor/dashboard/notifications"
            element={<InvestorRoute />}
          />

          <Route
            path="/investor/dashboard/profile"
            element={<InvestorRoute />}
          />

          <Route
            path="/investor/dashboard/settings"
            element={<InvestorRoute />}
          />

        </Routes>
      </main>

      {/* FOOTER */}
      {!isDashboard && <Footer />}

    </div>
  );
}

/* ============================================================
   APP
   ============================================================ */

function App() {
  return (
    <BrowserRouter>

      <ScrollToTop />

      <AppContent />

    </BrowserRouter>
  );
}

export default App;
