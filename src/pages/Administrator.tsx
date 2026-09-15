import {useState} from "react";
import {useLocation} from "react-router-dom";
import "../styles/main.css";
import "../styles/admin-quick-theme.css";
import "../styles/admin-theme.css";
import "../styles/admin-toolbar.css";
import AdminNavbar from "../components/admin/AdminNavbar";
import AdminDashboardOverview from "../components/admin/AdminDashboardOverview";
import AdminDataPage from "../components/admin/AdminDataPage";

type R=Record<string,any>;
type Section="dashboard"|"users"|"investors"|"projects"|"investments"|"requests"|"messages"|"documents";

const getUser=():R|null=>{try{const x=localStorage.getItem("aapi_user"),u=x?JSON.parse(x):null;return u&&typeof u==="object"?u:null}catch{return null}};

export default function Administrator(){
 const loc=useLocation();
 const[open,setOpen]=useState(false);
 const user=getUser();
 const userId=Number(user?.id??0);
 const name=loc.pathname.split("/")[2] as Section|undefined;
 const section:Section=name&&["users","investors","projects","investments","requests","messages","documents"].includes(name)?name:"dashboard";
 return <div className={`administrator-shell ${open?"admin-sidebar-open":""}`} dir="rtl">
  <AdminNavbar onToggle={()=>setOpen(v=>!v)}/>
  {open&&<button className="admin-navbar-overlay" aria-label="إغلاق القائمة" onClick={()=>setOpen(false)}/>} 
  <div className="admin-main-content">
   {section==="dashboard"?<AdminDashboardOverview userId={userId}/>:<AdminDataPage section={section} userId={userId}/>} 
  </div>
 </div>;
}
