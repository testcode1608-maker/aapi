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

interface CurrentUser { id:number; role?:string; statut?:string; [key:string]:unknown; }
function getCurrentUser():CurrentUser|null{try{const raw=localStorage.getItem("aapi_user");if(!raw)return null;const user=JSON.parse(raw);return user&&typeof user==="object"?user as CurrentUser:null}catch{return null}}
function ScrollToTop(){const{pathname}=useLocation();void pathname;window.scrollTo({top:0,left:0,behavior:"auto"});return null}
function AdminRoute(){const user=getCurrentUser();if(!user)return <Navigate to="/login" replace/>;if(String(user.role).toLowerCase()!=="admin")return <Navigate to="/" replace/>;if(user.statut&&String(user.statut).toLowerCase()!=="actif")return <Navigate to="/login" replace/>;return <Administrator/>}
function AdminSettingsRoute(){const user=getCurrentUser();if(!user)return <Navigate to="/login" replace/>;if(String(user.role).toLowerCase()!=="admin")return <Navigate to="/" replace/>;if(user.statut&&String(user.statut).toLowerCase()!=="actif")return <Navigate to="/login" replace/>;return <AdminSettings/>}
function InvestorRoute(){const user=getCurrentUser();if(!user)return <Navigate to="/login" replace/>;if(user.role!=="investisseur"&&user.role!=="investor")return <Navigate to="/" replace/>;return <InvestorDashboard/>}
function AppContent(){const location=useLocation();const isAdminRoute=location.pathname.startsWith("/admin");const isInvestorDashboard=location.pathname.startsWith("/investor/dashboard");const hideGlobalLayout=isAdminRoute||isInvestorDashboard;return <>{!hideGlobalLayout&&<Header/>}<main style={{minHeight:hideGlobalLayout?"100vh":"calc(100vh - 200px)"}}><Routes><Route path="/" element={<Home/>}/><Route path="/agency" element={<Agency/>}/><Route path="/investor" element={<Investor/>}/><Route path="/opportunities" element={<OpportunitiesPage/>}/><Route path="/sectors" element={<SectorsPage/>}/><Route path="/news" element={<NewsPage/>}/><Route path="/events" element={<EventsPage/>}/><Route path="/announcements" element={<AnnouncementsPage/>}/><Route path="/contact" element={<Contact/>}/><Route path="/news/:id" element={<NewsDetails/>}/><Route path="/announcements/:id" element={<AnnouncementsDetails/>}/><Route path="/investor/register" element={<InvestorRegistration/>}/><Route path="/login" element={<Login/>}/><Route path="/investor/dashboard" element={<InvestorRoute/>}/><Route path="/investor/dashboard/*" element={<InvestorRoute/>}/><Route path="/admin" element={<Navigate to="/admin/dashboard" replace/>}/><Route path="/admin/settings" element={<AdminSettingsRoute/>}/><Route path="/admin/*" element={<AdminRoute/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes></main>{!hideGlobalLayout&&<Footer/>}</>}
export default function App(){return <BrowserRouter><ScrollToTop/><AppContent/></BrowserRouter>}
