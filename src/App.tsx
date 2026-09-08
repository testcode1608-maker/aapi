import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

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
import AdminInvestorsPage from "./pages/AdminInvestorsPage";

/* ============================================================
   GLOBAL COMPONENTS
   ============================================================ */

import Header from "./components/Header";
import Footer from "./components/Footer";

/* ============================================================
   USER TYPE
   ============================================================ */

interface CurrentUser {
  id: number;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string | null;
  role?: string;
  statut?: string;
  photo?: string | null;
}

/* ============================================================
   GET CURRENT USER
   ============================================================ */

function getCurrentUser(): CurrentUser | null {
  try {
    const rawUser = localStorage.getItem("aapi_user");

    if (!rawUser) {
      return null;
    }

    const user = JSON.parse(rawUser);

    if (!user || typeof user !== "object") {
      return null;
    }

    return user as CurrentUser;
  } catch (error) {
    console.error(
      "Erreur lecture utilisateur:",
      error
    );

    return null;
  }
}

/* ============================================================
   SCROLL TO TOP
   ============================================================ */

function ScrollToTop() {
  const { pathname } = useLocation();

  /*
   * pathname est volontairement lu afin que
   * le composant soit recalculé à chaque navigation.
   */
  void pathname;

  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "auto",
  });

  return null;
}

/* ============================================================
   ADMIN DASHBOARD ROUTE
   ============================================================ */

function AdminDashboardRoute() {
  const user = getCurrentUser();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (user.role !== "admin") {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <AdminDashboard />;
}

/* ============================================================
   ADMIN USERS ROUTE
   ============================================================ */

function AdminUsersRoute() {
  const user = getCurrentUser();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (user.role !== "admin") {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <AdminUsersPage />;
}

/* ============================================================
   ADMIN INVESTORS ROUTE
   ============================================================ */

function AdminInvestorsRoute() {
  const user = getCurrentUser();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (user.role !== "admin") {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <AdminInvestorsPage />;
}

/* ============================================================
   GENERIC ADMIN PROTECTED ROUTE
   ============================================================ */

function AdminProtectedRoute() {
  const user = getCurrentUser();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (user.role !== "admin") {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <AdminPlaceholder />;
}

/* ============================================================
   ADMIN PLACEHOLDER
   ============================================================ */

function AdminPlaceholder() {
  const location = useLocation();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f8f6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px",
        fontFamily:
          "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "650px",
          background: "#ffffff",
          borderRadius: "20px",
          padding: "40px",
          textAlign: "center",
          boxShadow:
            "0 10px 40px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            width: "70px",
            height: "70px",
            margin: "0 auto 20px",
            borderRadius: "50%",
            background: "#eaf6f0",
            color: "#087443",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "30px",
            fontWeight: 700,
          }}
        >
          A
        </div>

        <h1
          style={{
            margin: "0 0 12px",
            color: "#14221b",
            fontSize: "28px",
          }}
        >
          صفحة الإدارة
        </h1>

        <p
          style={{
            margin: "0 0 10px",
            color: "#66736d",
            fontSize: "16px",
          }}
        >
          هذه الصفحة سيتم ربطها بالواجهة
          الإدارية قريبًا.
        </p>

        <p
          style={{
            margin: 0,
            color: "#087443",
            fontWeight: 700,
          }}
        >
          {location.pathname}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   INVESTOR PROTECTED ROUTE
   ============================================================ */

function InvestorRoute() {
  const user = getCurrentUser();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    user.role !== "investisseur" &&
    user.role !== "investor"
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <InvestorDashboard />;
}

/* ============================================================
   ADMIN LAYOUT DETECTION
   ============================================================ */

function AppContent() {
  const location = useLocation();

  const isAdminRoute =
    location.pathname.startsWith(
      "/admin"
    );

  const isInvestorDashboard =
    location.pathname.startsWith(
      "/investor/dashboard"
    );

  const hideGlobalLayout =
    isAdminRoute ||
    isInvestorDashboard;

  return (
    <>
      {!hideGlobalLayout && (
        <Header />
      )}

      <main
        style={{
          minHeight: hideGlobalLayout
            ? "100vh"
            : "calc(100vh - 200px)",
        }}
      >
        <Routes>

          {/* ==================================================
              PUBLIC ROUTES
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
            path="/events"
            element={<EventsPage />}
          />

          <Route
            path="/announcements"
            element={<AnnouncementsPage />}
          />

          <Route
            path="/contact"
            element={<Contact />}
          />

          <Route
            path="/news/:id"
            element={<NewsDetails />}
          />

          <Route
            path="/announcements/:id"
            element={
              <AnnouncementsDetails />
            }
          />

          <Route
            path="/investor/register"
            element={
              <InvestorRegistration />
            }
          />

          <Route
            path="/login"
            element={<Login />}
          />

          {/* ==================================================
              INVESTOR DASHBOARD
             ================================================== */}

          <Route
            path="/investor/dashboard"
            element={
              <InvestorRoute />
            }
          />

          <Route
            path="/investor/dashboard/*"
            element={
              <InvestorRoute />
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
              ADMIN INVESTORS
             ================================================== */}

          <Route
            path="/admin/investors"
            element={
              <AdminInvestorsRoute />
            }
          />

          {/* ==================================================
              ADMIN PROJECTS
             ================================================== */}

          <Route
            path="/admin/projects"
            element={
              <AdminProtectedRoute />
            }
          />

          {/* ==================================================
              ADMIN INVESTMENTS
             ================================================== */}

          <Route
            path="/admin/investments"
            element={
              <AdminProtectedRoute />
            }
          />

          {/* ==================================================
              ADMIN REQUESTS
             ================================================== */}

          <Route
            path="/admin/requests"
            element={
              <AdminProtectedRoute />
            }
          />

          {/* ==================================================
              ADMIN MESSAGES
             ================================================== */}

          <Route
            path="/admin/messages"
            element={
              <AdminProtectedRoute />
            }
          />

          {/* ==================================================
              ADMIN DOCUMENTS
             ================================================== */}

          <Route
            path="/admin/documents"
            element={
              <AdminProtectedRoute />
            }
          />

          {/* ==================================================
              ADMIN SETTINGS
             ================================================== */}

          <Route
            path="/admin/settings"
            element={
              <AdminProtectedRoute />
            }
          />

          {/* ==================================================
              ADMIN PROFILE
             ================================================== */}

          <Route
            path="/admin/profile"
            element={
              <AdminProtectedRoute />
            }
          />

          {/* ==================================================
              /ADMIN
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

      {!hideGlobalLayout && (
        <Footer />
      )}
    </>
  );
}

/* ============================================================
   MAIN APP
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