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

/* ============================================================
   PUBLIC PAGES
   ============================================================ */

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

/* ============================================================
   INVESTOR
   ============================================================ */

import InvestorDashboard from "./pages/InvestorDashboard";

/* ============================================================
   ADMIN
   ============================================================ */

import AdminDashboard from "./pages/AdminDashboard";
import AdminUsersPage from "./pages/AdminUsersPage";

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
    const storedUser =
      localStorage.getItem("aapi_user");

    if (!storedUser) {
      return null;
    }

    const user = JSON.parse(storedUser);

    if (!user || typeof user !== "object") {
      localStorage.removeItem("aapi_user");
      return null;
    }

    return user;
  } catch (error) {
    console.error(
      "Erreur lecture aapi_user:",
      error
    );

    localStorage.removeItem("aapi_user");

    return null;
  }
}

/* ============================================================
   CHECK ADMIN
   ============================================================ */

function isAdminUser(user: any) {
  if (!user) {
    return false;
  }

  return (
    String(user.role || "")
      .trim()
      .toLowerCase() === "admin"
  );
}

/* ============================================================
   CHECK INVESTOR
   ============================================================ */

function isInvestorUser(user: any) {
  if (!user) {
    return false;
  }

  const role = String(user.role || "")
    .trim()
    .toLowerCase();

  return (
    role === "investisseur" ||
    role === "investor"
  );
}

/* ============================================================
   ADMIN DASHBOARD ROUTE
   فقط Admin
   ============================================================ */

function AdminDashboardRoute() {
  const user = getCurrentUser();

  /* ----------------------------------------------------------
     المستخدم غير مسجل
     ---------------------------------------------------------- */

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /* ----------------------------------------------------------
     المستخدم ليس Admin
     ---------------------------------------------------------- */

  if (!isAdminUser(user)) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /* ----------------------------------------------------------
     Admin
     ---------------------------------------------------------- */

  return <AdminDashboard />;
}

/* ============================================================
   ADMIN USERS ROUTE
   ============================================================ */

function AdminUsersRoute() {
  const user = getCurrentUser();

  /* ----------------------------------------------------------
     المستخدم غير مسجل
     ---------------------------------------------------------- */

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /* ----------------------------------------------------------
     حماية Admin
     ---------------------------------------------------------- */

  if (!isAdminUser(user)) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /* ----------------------------------------------------------
     Admin Users Page
     ---------------------------------------------------------- */

  return <AdminUsersPage />;
}

/* ============================================================
   ADMIN GENERIC ROUTE
   للصفحات الإدارية المستقبلية
   ============================================================ */

function AdminProtectedRoute() {
  const user = getCurrentUser();

  /* ----------------------------------------------------------
     المستخدم غير مسجل
     ---------------------------------------------------------- */

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /* ----------------------------------------------------------
     ليس Admin
     ---------------------------------------------------------- */

  if (!isAdminUser(user)) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /*
   * في الوقت الحالي نعيد إلى Dashboard.
   *
   * عندما ننشئ صفحات:
   *
   * /admin/projects
   * /admin/investments
   * /admin/messages
   * /admin/documents
   * /admin/settings
   *
   * سنستبدل هذا الـ Route بالصفحة الخاصة بها.
   */

  return (
    <Navigate
      to="/admin/dashboard"
      replace
    />
  );
}

/* ============================================================
   INVESTOR ROUTE
   فقط المستثمر يستطيع الدخول
   ============================================================ */

function InvestorRoute() {
  const user = getCurrentUser();

  /* ----------------------------------------------------------
     المستخدم غير مسجل
     ---------------------------------------------------------- */

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /* ----------------------------------------------------------
     ليس مستثمر
     ---------------------------------------------------------- */

  if (!isInvestorUser(user)) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /* ----------------------------------------------------------
     Investor
     ---------------------------------------------------------- */

  return <InvestorDashboard />;
}

/* ============================================================
   APP CONTENT
   ============================================================ */

function AppContent() {
  const { pathname } = useLocation();

  /* ----------------------------------------------------------
     INVESTOR DASHBOARD
     ---------------------------------------------------------- */

  const isInvestorDashboard =
    pathname.startsWith(
      "/investor/dashboard"
    );

  /* ----------------------------------------------------------
     ADMIN AREA
     ---------------------------------------------------------- */

  const isAdminDashboard =
    pathname.startsWith(
      "/admin/"
    );

  /* ----------------------------------------------------------
     DASHBOARD AREA
     ---------------------------------------------------------- */

  const isDashboard =
    isInvestorDashboard ||
    isAdminDashboard;

  return (
    <div className="aapi-site">

      {/* ======================================================
          HEADER PUBLIC
          لا يظهر داخل Dashboard
          ====================================================== */}

      {!isDashboard && (
        <Header />
      )}

      {/* ======================================================
          MAIN
          ====================================================== */}

      <main>

        <Routes>

          {/* ==================================================
              PUBLIC PAGES
              ================================================== */}

          <Route
            path="/"
            element={
              <Home />
            }
          />

          <Route
            path="/agency"
            element={
              <Agency />
            }
          />

          <Route
            path="/investor"
            element={
              <Investor />
            }
          />

          <Route
            path="/inscription"
            element={
              <InvestorRegistration />
            }
          />

          <Route
            path="/login"
            element={
              <Login />
            }
          />

          <Route
            path="/opportunities"
            element={
              <OpportunitiesPage />
            }
          />

          <Route
            path="/sectors"
            element={
              <SectorsPage />
            }
          />

          <Route
            path="/news"
            element={
              <NewsPage />
            }
          />

          <Route
            path="/news/:id"
            element={
              <NewsDetails />
            }
          />

          <Route
            path="/events"
            element={
              <EventsPage />
            }
          />

          <Route
            path="/announcements"
            element={
              <AnnouncementsPage />
            }
          />

          <Route
            path="/announcements/:id"
            element={
              <AnnouncementsDetails />
            }
          />

          <Route
            path="/contact"
            element={
              <Contact />
            }
          />

          {/* ==================================================
              ADMIN DASHBOARD
              ================================================== */}

          <Route
            path="/admin/dashboard"
            element={
              <AdminDashboardRoute />
            }
          />

          {/* ==================================================
              ADMIN USERS
              ================================================== */}

          <Route
            path="/admin/users"
            element={
              <AdminUsersRoute />
            }
          />

          {/* ==================================================
              ADMIN FUTURE PAGES
              ================================================== */}

          <Route
            path="/admin/projects"
            element={
              <AdminProtectedRoute />
            }
          />

          <Route
            path="/admin/investments"
            element={
              <AdminProtectedRoute />
            }
          />

          <Route
            path="/admin/requests"
            element={
              <AdminProtectedRoute />
            }
          />

          <Route
            path="/admin/messages"
            element={
              <AdminProtectedRoute />
            }
          />

          <Route
            path="/admin/documents"
            element={
              <AdminProtectedRoute />
            }
          />

          <Route
            path="/admin/settings"
            element={
              <AdminProtectedRoute />
            }
          />

          <Route
            path="/admin/profile"
            element={
              <AdminProtectedRoute />
            }
          />

          {/* ==================================================
              ADMIN ROOT
              ================================================== */}

          <Route
            path="/admin"
            element={
              <Navigate
                to="/admin/dashboard"
                replace
              />
            }
          />

          {/* ==================================================
              INVESTOR DASHBOARD
              ================================================== */}

          <Route
            path="/investor/dashboard/*"
            element={
              <InvestorRoute />
            }
          />

          <Route
            path="/investor/dashboard/project"
            element={
              <InvestorRoute />
            }
          />

          <Route
            path="/investor/dashboard/investments"
            element={
              <InvestorRoute />
            }
          />

          <Route
            path="/investor/dashboard/requests"
            element={
              <InvestorRoute />
            }
          />

          <Route
            path="/investor/dashboard/documents"
            element={
              <InvestorRoute />
            }
          />

          <Route
            path="/investor/dashboard/messages"
            element={
              <InvestorRoute />
            }
          />

          <Route
            path="/investor/dashboard/notifications"
            element={
              <InvestorRoute />
            }
          />

          <Route
            path="/investor/dashboard/profile"
            element={
              <InvestorRoute />
            }
          />

          <Route
            path="/investor/dashboard/settings"
            element={
              <InvestorRoute />
            }
          />

          {/* ==================================================
              404
              ================================================== */}

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />

        </Routes>

      </main>

      {/* ======================================================
          FOOTER PUBLIC
          ====================================================== */}

      {!isDashboard && (
        <Footer />
      )}

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
