import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";
import slugify from "slugify";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
const app = express();
const PORT = Number(process.env.PORT || 3001);
const uploadDir = path.join(__dirname, "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const pool = new Pool({
  host: process.env.POSTGRES_HOST || process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.POSTGRES_PORT || process.env.DB_PORT || 5432),
  database: process.env.POSTGRES_DB || process.env.DB_NAME || "aapi_db",
  user: process.env.POSTGRES_USER || process.env.DB_USER || "aapi",
  password: process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD || ""
});

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (_req, file, cb) => cb(null, Date.now() + "-" + Math.random().toString(36).slice(2, 10) + path.extname(file.originalname).toLowerCase())
  }),
  limits: { fileSize: 8 * 1024 * 1024 }
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadDir));

const q = async (sql, params = []) => (await pool.query(sql, params)).rows;
const one = async (sql, params = []) => (await pool.query(sql, params)).rows[0] || null;
const ok = (res, data = {}) => res.json({ success: true, ...data });
const fail = (res, status, message) => res.status(status).json({ success: false, message });
const asyncRoute = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function slug(value) {
  return slugify(String(value || ""), { lower: true, strict: true, locale: "fr" }) || "item-" + Date.now();
}
function imageUrl(value, id, type) {
  const v = String(value || "").trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v) || v.startsWith("/uploads/")) return v;
  return "/api/" + type + "-image?id=" + id;
}
async function admin(id) {
  const u = await one("SELECT id,role,statut FROM users WHERE id=$1", [Number(id)]);
  if (!u || u.role !== "admin" || u.statut !== "actif") throw Object.assign(new Error("Accès administrateur refusé."), { status: 403 });
  return u;
}
async function investor(id) {
  const u = await one("SELECT id,role,statut FROM users WHERE id=$1", [Number(id)]);
  if (!u || !["investisseur","investor"].includes(String(u.role).toLowerCase()) || u.statut !== "actif") throw Object.assign(new Error("Accès investisseur refusé."), { status: 403 });
  return u;
}

app.get("/health", asyncRoute(async (_req,res) => ok(res,{service:"AAPI Node.js API",database:"PostgreSQL"})));

app.get("/sectors", asyncRoute(async (_req,res) => {
  const rows = await q("SELECT id,nom,slug,description,icone,statut FROM sectors WHERE statut='actif' ORDER BY id");
  rows.forEach(r => r.image_url = imageUrl(r.image,r.id,"sector"));
  ok(res,{sectors:rows,total:rows.length});
}));

app.get("/wilayas", asyncRoute(async (_req,res) => {
  const rows = await q("SELECT id,code,nom_fr,nom_ar,statut FROM wilayas WHERE statut='actif' ORDER BY id");
  ok(res,{wilayas:rows,total:rows.length});
}));

app.get("/statistics", asyncRoute(async (_req,res) => {
  const p=await one("SELECT COUNT(*)::int total,COALESCE(SUM(montant_investissement),0) value,COALESCE(SUM(nombre_emplois),0)::int jobs FROM projects");
  const i=await one("SELECT COUNT(*)::int total,COALESCE(SUM(montant),0) value FROM investments");
  const s=await one("SELECT COUNT(*)::int total FROM sectors WHERE statut='actif'");
  const u=await one("SELECT COUNT(*)::int total FROM users WHERE role='investisseur' AND statut='actif'");
  ok(res,{statistics:{projects_total:p.total,projects_value:Number(p.value),total_jobs:p.jobs,investments_total:i.total,total_investment:Number(i.value),sectors_total:s.total,investors_total:u.total}});
}));

app.get("/announcements", asyncRoute(async (req,res) => {
  const base="SELECT a.id,a.titre,a.slug,a.contenu,a.image,a.auteur_id,a.statut,a.date_publication,a.created_at,a.updated_at,CONCAT(COALESCE(u.prenom,''),' ',COALESCE(u.nom,'')) auteur FROM announcements a LEFT JOIN users u ON u.id=a.auteur_id WHERE a.statut='publie' AND (a.date_publication IS NULL OR a.date_publication<=NOW())";
  const id=Number(req.query.id||0);
  if(id){const row=await one(base+" AND a.id=$1 LIMIT 1",[id]);if(!row)return fail(res,404,"Annonce introuvable.");row.image=imageUrl(row.image,row.id,"announcement");return ok(res,{announcement:row});}
  const rows=await q(base+" ORDER BY COALESCE(a.date_publication,a.created_at) DESC,a.id DESC");rows.forEach(r=>r.image=imageUrl(r.image,r.id,"announcement"));ok(res,{announcements:rows,total:rows.length});
}));

app.get("/news", asyncRoute(async (req,res) => {
  const base="SELECT n.id,n.titre,n.slug,n.resume,n.contenu,n.image,n.auteur_id,n.statut,n.date_publication,n.created_at,n.updated_at,CONCAT(COALESCE(u.prenom,''),' ',COALESCE(u.nom,'')) auteur FROM news n LEFT JOIN users u ON u.id=n.auteur_id WHERE n.statut='publie' AND (n.date_publication IS NULL OR n.date_publication<=NOW())";
  const id=Number(req.query.id||0);
  if(id){const row=await one(base+" AND n.id=$1 LIMIT 1",[id]);if(!row)return fail(res,404,"Actualité introuvable.");row.image=imageUrl(row.image,row.id,"news");return ok(res,{news:row,article:row});}
  const rows=await q(base+" ORDER BY COALESCE(n.date_publication,n.created_at) DESC,n.id DESC");rows.forEach(r=>r.image=imageUrl(r.image,r.id,"news"));ok(res,{news:rows,total:rows.length});
}));

app.get("/opportunities", asyncRoute(async (_req,res) => {
  const rows=await q("SELECT p.id,p.titre,p.description,p.wilaya,p.commune,p.montant_investissement investissement,p.nombre_emplois emplois,p.image,p.statut,COALESCE(STRING_AGG(DISTINCT s.nom,', ' ORDER BY s.nom),'') secteur FROM projects p LEFT JOIN project_sectors ps ON ps.project_id=p.id LEFT JOIN sectors s ON s.id=ps.sector_id WHERE p.statut IN ('soumis','en_etude','approuve','en_cours') GROUP BY p.id ORDER BY p.created_at DESC");
  rows.forEach(r=>{r.image_url=imageUrl(r.image,r.id,"opportunity");r.investissement=Number(r.investissement||0);r.emplois=Number(r.emplois||0);});
  ok(res,{opportunities:rows,total:rows.length});
}));

app.get("/faq", asyncRoute(async (_req,res) => {
  const rows=await q("SELECT id,question,answer,statut,ordre,created_at,updated_at FROM investor_faq WHERE statut='publie' ORDER BY ordre,id");
  ok(res,{faq:rows,faqs:rows,total:rows.length});
}));

function imageRoute(table){
  return asyncRoute(async(req,res)=>{
    const row=await one("SELECT image FROM "+table+" WHERE id=$1",[Number(req.query.id||0)]);
    if(!row?.image)return res.status(404).end();
    const v=String(row.image);
    if(/^https?:\/\//i.test(v))return res.redirect(v);
    const file=path.join(uploadDir,path.basename(v));
    if(fs.existsSync(file))return res.sendFile(file);
    res.status(404).end();
  });
}
app.get("/sector-image",imageRoute("sectors"));
app.get("/announcement-image",imageRoute("announcements"));
app.get("/news-image",imageRoute("news"));
app.get("/opportunity-image",imageRoute("projects"));

app.post("/auth/login",asyncRoute(async(req,res)=>{
  const email=String(req.body?.email||"").trim().toLowerCase(),password=String(req.body?.password||"");
  if(!email||!password)return fail(res,400,"يرجى إدخال البريد الإلكتروني وكلمة المرور.");
  const u=await one("SELECT id,nom,prenom,email,password,telephone,role,statut,photo FROM users WHERE LOWER(email)=LOWER($1) LIMIT 1",[email]);
  if(!u||u.statut!=="actif"||!(await bcrypt.compare(password,u.password)))return fail(res,401,"البريد الإلكتروني أو كلمة المرور غير صحيحة.");
  await q("UPDATE users SET last_login=NOW(),updated_at=NOW() WHERE id=$1",[u.id]);delete u.password;ok(res,{message:"تم تسجيل الدخول بنجاح.",user:u});
}));

app.post("/auth/register",asyncRoute(async(req,res)=>{
  const b=req.body||{},email=String(b.email||"").trim().toLowerCase();
  if(!b.nom||!b.prenom||!email||!b.password)return fail(res,400,"يرجى إدخال جميع المعلومات المطلوبة.");
  if(await one("SELECT id FROM users WHERE LOWER(email)=LOWER($1)",[email]))return fail(res,409,"البريد الإلكتروني مستخدم بالفعل.");
  const hash=await bcrypt.hash(String(b.password),12);
  const u=await one("INSERT INTO users(nom,prenom,email,password,telephone,role,statut) VALUES($1,$2,$3,$4,$5,'investisseur','actif') RETURNING id,nom,prenom,email,telephone,role,statut,photo",[b.nom,b.prenom,email,hash,b.telephone||null]);
  await q("INSERT INTO investor_profiles(user_id) VALUES($1) ON CONFLICT(user_id) DO NOTHING",[u.id]);ok(res,{message:"تم إنشاء الحساب بنجاح.",user:u});
}));

app.post("/auth/investor/dashboard",asyncRoute(async(req,res)=>{
  const uid=Number(req.body?.user_id||0);await investor(uid);
  const user=await one("SELECT id,nom,prenom,email,telephone,role,statut,photo,last_login,created_at,updated_at FROM users WHERE id=$1",[uid]);
  const profile=await one("SELECT * FROM investor_profiles WHERE user_id=$1",[uid]);
  const projects=await q("SELECT p.*,COALESCE(STRING_AGG(DISTINCT s.nom,', ' ORDER BY s.nom),'') secteurs FROM projects p LEFT JOIN project_sectors ps ON ps.project_id=p.id LEFT JOIN sectors s ON s.id=ps.sector_id WHERE p.user_id=$1 GROUP BY p.id ORDER BY p.created_at DESC",[uid]);
  const investments=await q("SELECT i.*,p.titre projet_titre,p.wilaya projet_wilaya,p.statut projet_statut,p.montant_investissement projet_montant FROM investments i LEFT JOIN projects p ON p.id=i.project_id WHERE i.user_id=$1 ORDER BY i.created_at DESC",[uid]);
  const requests=await q("SELECT r.*,p.titre projet_titre FROM investment_requests r LEFT JOIN projects p ON p.id=r.projet_id WHERE r.user_id=$1 ORDER BY r.created_at DESC",[uid]);
  const documents=await q("SELECT d.*,p.titre projet_titre FROM documents d LEFT JOIN projects p ON p.id=d.project_id WHERE d.user_id=$1 ORDER BY d.uploaded_at DESC",[uid]);
  const messages=await q("SELECT m.*,u.nom sender_nom,u.prenom sender_prenom,u.email sender_email FROM messages m LEFT JOIN users u ON u.id=m.sender_id WHERE m.receiver_id=$1 ORDER BY m.created_at DESC",[uid]);
  const notifications=await q("SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC",[uid]);
  projects.forEach(x=>{x.id=Number(x.id);x.user_id=Number(x.user_id);x.montant_investissement=Number(x.montant_investissement||0);x.nombre_emplois=Number(x.nombre_emplois||0);});
  investments.forEach(x=>{x.id=Number(x.id);x.user_id=Number(x.user_id);x.project_id=x.project_id==null?null:Number(x.project_id);x.montant=Number(x.montant||0);x.projet_montant=Number(x.projet_montant||0);});
  requests.forEach(x=>{x.id=Number(x.id);x.user_id=Number(x.user_id);x.projet_id=x.projet_id==null?null:Number(x.projet_id);});
  documents.forEach(x=>{x.id=Number(x.id);x.user_id=Number(x.user_id);});
  messages.forEach(x=>{x.id=Number(x.id);x.lu=Number(x.lu);});
  notifications.forEach(x=>{x.id=Number(x.id);x.lu=Number(x.lu);});
  const pv=projects.reduce((a,x)=>a+Number(x.montant_investissement||0),0),jobs=projects.reduce((a,x)=>a+Number(x.nombre_emplois||0),0),ti=investments.reduce((a,x)=>a+Number(x.montant||0),0);
  const stats={projects_total:projects.length,projects_active:projects.filter(x=>["soumis","en_etude","approuve","en_cours"].includes(x.statut)).length,projects_completed:projects.filter(x=>x.statut==="realise").length,projects_in_study:projects.filter(x=>x.statut==="en_etude").length,projects_submitted:projects.filter(x=>x.statut==="soumis").length,projects_approved:projects.filter(x=>x.statut==="approuve").length,projects_rejected:projects.filter(x=>x.statut==="rejete").length,projects_value:pv,total_jobs:jobs,investments_total:investments.length,investments_active:investments.filter(x=>["valide","en_cours"].includes(x.statut)).length,investments_completed:investments.filter(x=>x.statut==="termine").length,investments_pending:investments.filter(x=>x.statut==="en_attente").length,investments_cancelled:investments.filter(x=>x.statut==="annule").length,total_investment:ti,investment_ratio:pv?Math.min(100,Number((ti/pv*100).toFixed(2))):0,requests_total:requests.length,requests_pending:requests.filter(x=>["nouvelle","en_cours","en_attente"].includes(x.statut)).length,requests_accepted:requests.filter(x=>x.statut==="acceptee").length,requests_rejected:requests.filter(x=>x.statut==="refusee").length,documents_total:documents.length,documents_validated:documents.filter(x=>x.statut==="valide").length,documents_pending:documents.filter(x=>x.statut==="en_attente").length,documents_rejected:documents.filter(x=>x.statut==="rejete").length,messages_total:messages.length,messages_unread:messages.filter(x=>x.lu===0).length,notifications_total:notifications.length,notifications_unread:notifications.filter(x=>x.lu===0).length,profile_completion:profile?Math.round(["type_investisseur","nom_entreprise","wilaya","commune","adresse","secteur_activite","description"].filter(k=>String(profile[k]||"").trim()).length/7*100):0};
  ok(res,{message:"تم تحميل بيانات فضاء المستثمر بنجاح.",user,profile,stats,last:{project:projects[0]||null,investment:investments[0]||null,request:requests[0]||null,message:messages[0]||null,notification:notifications[0]||null},projects,investments,requests,documents,messages,notifications,activities:[]});
}));

app.post("/auth/investor/create-project",upload.single("image"),asyncRoute(async(req,res)=>{
  const b=req.body||{},uid=Number(b.user_id||0);await investor(uid);
  const title=String(b.titre||"").trim();if(!title)return fail(res,400,"عنوان المشروع مطلوب.");
  const p=await one("INSERT INTO projects(user_id,titre,slug,description,wilaya,commune,adresse,montant_investissement,nombre_emplois,superficie,unite_superficie,statut,image,date_debut,date_fin) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *",[uid,title,slug(title)+"-"+Date.now(),b.description||null,b.wilaya||null,b.commune||null,b.adresse||null,Number(b.montant_investissement||0),Number(b.nombre_emplois||0),b.superficie?Number(b.superficie):null,b.unite_superficie||"m²","soumis",req.file?"/uploads/"+req.file.filename:(b.image||null),b.date_debut||null,b.date_fin||null]);
  const ids=String(b.sector_ids||"").split(",").map(Number).filter(Boolean);for(const id of ids)await q("INSERT INTO project_sectors(project_id,sector_id) VALUES($1,$2) ON CONFLICT DO NOTHING",[p.id,id]);
  ok(res,{message:"تم إنشاء المشروع بنجاح.",project:p});
}));

app.post("/auth/investor/create-investment",asyncRoute(async(req,res)=>{
  const b=req.body||{},uid=Number(b.user_id||0);await investor(uid);
  const row=await one("INSERT INTO investments(user_id,project_id,montant,date_investissement,statut,reference,notes) VALUES($1,$2,$3,$4,'en_attente',$5,$6) RETURNING *",[uid,Number(b.project_id),Number(b.montant||0),b.date_investissement||null,"INV-"+Date.now(),b.notes||null]);
  ok(res,{message:"تم تسجيل الاستثمار بنجاح.",investment:row});
}));

app.post("/auth/investor/submit-request",asyncRoute(async(req,res)=>{
  const b=req.body||{},uid=Number(b.user_id||0);await investor(uid);
  const row=await one("INSERT INTO investment_requests(user_id,projet_id,type_demande,objet,description,montant_demande,wilaya,statut,priorite) VALUES($1,$2,$3,$4,$5,$6,$7,'nouvelle',$8) RETURNING *",[uid,b.projet_id||null,b.type_demande||"information",b.objet||"",b.description||"",b.montant_demande?Number(b.montant_demande):null,b.wilaya||null,b.priorite||"normale"]);
  ok(res,{message:"تم إرسال الطلب بنجاح.",request:row});
}));

app.post("/auth/investor/send-message",asyncRoute(async(req,res)=>{
  const b=req.body||{},uid=Number(b.user_id||b.sender_id||0);await investor(uid);
  const row=await one("INSERT INTO messages(sender_id,receiver_id,sujet,contenu,lu) VALUES($1,$2,$3,$4,0) RETURNING *",[uid,Number(b.receiver_id||1),b.sujet||"",b.contenu||""]);ok(res,{message:"تم إرسال الرسالة بنجاح.",data:row});
}));

app.post("/auth/investor/update-profile",upload.single("photo"),asyncRoute(async(req,res)=>{
  const b=req.body||{},uid=Number(b.user_id||0);await investor(uid);
  const photo=req.file?"/uploads/"+req.file.filename:null;
  await q("UPDATE users SET nom=COALESCE($1,nom),prenom=COALESCE($2,prenom),telephone=COALESCE($3,telephone),photo=COALESCE($4,photo),updated_at=NOW() WHERE id=$5",[b.nom||null,b.prenom||null,b.telephone||null,photo,uid]);
  await q("INSERT INTO investor_profiles(user_id,type_investisseur,nom_entreprise,registre_commerce,nif,nis,wilaya,commune,adresse,site_web,secteur_activite,description) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT(user_id) DO UPDATE SET type_investisseur=EXCLUDED.type_investisseur,nom_entreprise=EXCLUDED.nom_entreprise,registre_commerce=EXCLUDED.registre_commerce,nif=EXCLUDED.nif,nis=EXCLUDED.nis,wilaya=EXCLUDED.wilaya,commune=EXCLUDED.commune,adresse=EXCLUDED.adresse,site_web=EXCLUDED.site_web,secteur_activite=EXCLUDED.secteur_activite,description=EXCLUDED.description,updated_at=NOW()",[uid,b.type_investisseur||"personne_physique",b.nom_entreprise||null,b.registre_commerce||null,b.nif||null,b.nis||null,b.wilaya||null,b.commune||null,b.adresse||null,b.site_web||null,b.secteur_activite||null,b.description||null]);
  ok(res,{message:"تم تحديث الملف الشخصي بنجاح."});
}));

const adminQueries={
  users:"SELECT id,nom,prenom,email,telephone,role,statut,photo,last_login,created_at,updated_at FROM users ORDER BY id DESC",
  investors:"SELECT u.id,u.nom,u.prenom,u.email,u.telephone,u.statut,u.photo,u.created_at,p.nom_entreprise,p.wilaya,p.commune,p.secteur_activite FROM users u LEFT JOIN investor_profiles p ON p.user_id=u.id WHERE u.role IN ('investisseur','investor') ORDER BY u.id DESC",
  projects:"SELECT p.*,COALESCE(STRING_AGG(DISTINCT s.nom,', ' ORDER BY s.nom),'') secteurs FROM projects p LEFT JOIN project_sectors ps ON ps.project_id=p.id LEFT JOIN sectors s ON s.id=ps.sector_id GROUP BY p.id ORDER BY p.id DESC",
  investments:"SELECT i.*,p.titre projet_titre,u.nom investisseur_nom,u.prenom investisseur_prenom FROM investments i LEFT JOIN projects p ON p.id=i.project_id LEFT JOIN users u ON u.id=i.user_id ORDER BY i.id DESC",
  requests:"SELECT r.*,p.titre projet_titre,u.nom investisseur_nom,u.prenom investisseur_prenom FROM investment_requests r LEFT JOIN projects p ON p.id=r.projet_id LEFT JOIN users u ON u.id=r.user_id ORDER BY r.id DESC",
  messages:"SELECT m.*,s.nom sender_nom,s.prenom sender_prenom,r.nom receiver_nom,r.prenom receiver_prenom FROM messages m LEFT JOIN users s ON s.id=m.sender_id LEFT JOIN users r ON r.id=m.receiver_id ORDER BY m.id DESC",
  documents:"SELECT d.*,p.titre projet_titre,u.nom user_nom,u.prenom user_prenom FROM documents d LEFT JOIN projects p ON p.id=d.project_id LEFT JOIN users u ON u.id=d.user_id ORDER BY d.id DESC",
  sectors:"SELECT * FROM sectors ORDER BY id DESC",
  announcements:"SELECT a.*,CONCAT(COALESCE(u.prenom,''),' ',COALESCE(u.nom,'')) auteur FROM announcements a LEFT JOIN users u ON u.id=a.auteur_id ORDER BY a.id DESC",
  news:"SELECT n.*,CONCAT(COALESCE(u.prenom,''),' ',COALESCE(u.nom,'')) auteur FROM news n LEFT JOIN users u ON u.id=n.auteur_id ORDER BY n.id DESC",
  faq:"SELECT * FROM investor_faq ORDER BY ordre,id"
};


// Compatibility endpoint for the admin dashboard.
// The frontend historically requested /api/admin/dashboard-stats directly.
// Keep this endpoint aligned with the dashboard statistics returned by the
// existing /auth/admin/admin?action=dashboard endpoint.
const dashboardStats = async () => {
  const stats = {
    users_total: Number((await one("SELECT COUNT(*) n FROM users")).n),
    investors_total: Number((await one("SELECT COUNT(*) n FROM users WHERE role IN ('investisseur','investor') AND statut='actif'")).n),
    projects_total: Number((await one("SELECT COUNT(*) n FROM projects")).n),
    projects_approved: Number((await one("SELECT COUNT(*) n FROM projects WHERE LOWER(statut) IN ('approuve','approuvé','valide','validé','approved')")).n),
    projects_active: Number((await one("SELECT COUNT(*) n FROM projects WHERE LOWER(statut) IN ('en_cours','en cours','actif','active','approved','approuve','approuvé')")).n),
    investments_total: Number((await one("SELECT COUNT(*) n FROM investments")).n),
    investments_pending: Number((await one("SELECT COUNT(*) n FROM investments WHERE LOWER(statut) IN ('en_attente','en attente','pending')")).n),
    investments_validated: Number((await one("SELECT COUNT(*) n FROM investments WHERE LOWER(statut) IN ('valide','validé','validee','validée','approved','approuve','approuvé')")).n),
    investments_active: Number((await one("SELECT COUNT(*) n FROM investments WHERE LOWER(statut) IN ('en_cours','en cours','actif','active')")).n),
    investments_completed: Number((await one("SELECT COUNT(*) n FROM investments WHERE LOWER(statut) IN ('termine','terminé','complete','completed')")).n),
    investments_cancelled: Number((await one("SELECT COUNT(*) n FROM investments WHERE LOWER(statut) IN ('annule','annulé','cancelled')")).n),
    total_investment: Number((await one("SELECT COALESCE(SUM(montant),0) n FROM investments")).n),
    jobs_total: Number((await one("SELECT COALESCE(SUM(nombre_emplois),0) n FROM projects")).n),
    documents_total: Number((await one("SELECT COUNT(*) n FROM documents")).n),
    documents_valid: Number((await one("SELECT COUNT(*) n FROM documents WHERE LOWER(statut) IN ('valide','validé','validee','validée','approved','approuve','approuvé')")).n)
  };
  stats.projects_approved_percent = stats.projects_total ? stats.projects_approved / stats.projects_total * 100 : 0;
  stats.projects_active_percent = stats.projects_total ? stats.projects_active / stats.projects_total * 100 : 0;
  stats.documents_valid_percent = stats.documents_total ? stats.documents_valid / stats.documents_total * 100 : 0;
  const projects = await q("SELECT p.id,p.user_id,p.titre,p.wilaya,p.commune,p.montant_investissement,p.nombre_emplois,p.statut,p.created_at,CONCAT(COALESCE(u.prenom,''),' ',COALESCE(u.nom,'')) investor_name FROM projects p LEFT JOIN users u ON u.id=p.user_id ORDER BY p.created_at DESC NULLS LAST,p.id DESC LIMIT 8");
  return { stats, projects };
};

app.get("/admin/dashboard-stats", asyncRoute(async (_req, res) => {
  const data = await dashboardStats();
  return ok(res, data);
}));

app.get("/api/admin/dashboard-stats", asyncRoute(async (_req, res) => {
  const data = await dashboardStats();
  return ok(res, data);
}));

app.all("/auth/admin/admin",upload.any(),asyncRoute(async(req,res)=>{
  const b={...req.query,...(req.body||{})},action=String(b.action||""),uid=Number(b.user_id||0);if(!action)return fail(res,400,"Action administration inconnue.");await admin(uid);
  const sectionMap={update_user_status:"users",update_investor_status:"investors",update_project_status:"projects",update_investment_status:"investments",update_request_status:"requests",update_document_status:"documents",mark_message_read:"messages",mark_message_unread:"messages",create_sector:"sectors",update_sector:"sectors",create_news:"news",update_news:"news",create_faq:"faq",update_faq:"faq",create_announcement:"announcements",update_announcement:"announcements",opportunities:"opportunities",opportunity_options:"opportunities",create_opportunity:"opportunities",update_opportunity:"opportunities"};
  if(action==="dashboard"){
    const stats={
      users_total:Number((await one("SELECT COUNT(*) n FROM users")).n),
      investors_total:Number((await one("SELECT COUNT(*) n FROM users WHERE role IN ('investisseur','investor') AND statut='actif'")).n),
      projects_total:Number((await one("SELECT COUNT(*) n FROM projects")).n),
      projects_approved:Number((await one("SELECT COUNT(*) n FROM projects WHERE LOWER(statut) IN ('approuve','approuvé','valide','validé','approved')")).n),
      projects_active:Number((await one("SELECT COUNT(*) n FROM projects WHERE LOWER(statut) IN ('en_cours','en cours','actif','active','approved','approuve','approuvé')")).n),
      investments_total:Number((await one("SELECT COUNT(*) n FROM investments")).n),
      investments_pending:Number((await one("SELECT COUNT(*) n FROM investments WHERE LOWER(statut) IN ('en_attente','en attente','pending')")).n),
      investments_validated:Number((await one("SELECT COUNT(*) n FROM investments WHERE LOWER(statut) IN ('valide','validé','validee','validée','approved','approuve','approuvé')")).n),
      investments_active:Number((await one("SELECT COUNT(*) n FROM investments WHERE LOWER(statut) IN ('en_cours','en cours','actif','active')")).n),
      investments_completed:Number((await one("SELECT COUNT(*) n FROM investments WHERE LOWER(statut) IN ('termine','terminé','complete','completed')")).n),
      investments_cancelled:Number((await one("SELECT COUNT(*) n FROM investments WHERE LOWER(statut) IN ('annule','annulé','cancelled')")).n),
      total_investment:Number((await one("SELECT COALESCE(SUM(montant),0) n FROM investments")).n),
      jobs_total:Number((await one("SELECT COALESCE(SUM(nombre_emplois),0) n FROM projects")).n),
      documents_total:Number((await one("SELECT COUNT(*) n FROM documents")).n),
      documents_valid:Number((await one("SELECT COUNT(*) n FROM documents WHERE LOWER(statut) IN ('valide','validé','validee','validée','approved','approuve','approuvé')")).n)
    };
    stats.projects_approved_percent=stats.projects_total?stats.projects_approved/stats.projects_total*100:0;
    stats.projects_active_percent=stats.projects_total?stats.projects_active/stats.projects_total*100:0;
    stats.documents_valid_percent=stats.documents_total?stats.documents_valid/stats.documents_total*100:0;
    const projects=await q("SELECT p.id,p.user_id,p.titre,p.wilaya,p.commune,p.montant_investissement,p.nombre_emplois,p.statut,p.created_at,CONCAT(COALESCE(u.prenom,''),' ',COALESCE(u.nom,'')) investor_name FROM projects p LEFT JOIN users u ON u.id=p.user_id ORDER BY p.created_at DESC NULLS LAST,p.id DESC LIMIT 8");
    return ok(res,{stats,projects});
  }
  if(action==="opportunities"||action==="opportunity_options"){const rows=await q("SELECT p.id,p.titre,p.description,p.wilaya,p.montant_investissement investissement,p.nombre_emplois emplois,p.image,p.statut,COALESCE(STRING_AGG(DISTINCT s.nom,', ' ORDER BY s.nom),'') secteur FROM projects p LEFT JOIN project_sectors ps ON ps.project_id=p.id LEFT JOIN sectors s ON s.id=ps.sector_id GROUP BY p.id ORDER BY p.id DESC");rows.forEach(r=>r.image_url=imageUrl(r.image,r.id,"opportunity"));return ok(res,{opportunities:rows,sectors:await q("SELECT id,nom FROM sectors WHERE statut='actif' ORDER BY nom"),wilayas:await q("SELECT id,nom_fr,nom_ar FROM wilayas ORDER BY id"),projects:await q("SELECT id,titre,wilaya FROM projects ORDER BY id DESC")});}
  if(action.startsWith("delete_")){const section=action.slice(7),table={users:"users",investors:"users",projects:"projects",investments:"investments",requests:"investment_requests",messages:"messages",documents:"documents",sectors:"sectors",announcements:"announcements",news:"news",opportunities:"projects"}[section];const id=Number(b.record_id||b.id);if(section==="users"&&id===uid)return fail(res,400,"لا يمكنك حذف حساب المسؤول الذي تستخدمه حالياً.");if(table)await q("DELETE FROM "+table+" WHERE id=$1",[id]);return ok(res,{message:"تم حذف السجل بنجاح."});}
  if(sectionMap[action]&&action.startsWith("update_")&&["users","investors","projects","investments","requests","documents"].includes(sectionMap[action])){const section=sectionMap[action],id=Number(b.target_user_id||b.project_id||b.investment_id||b.request_id||b.document_id||b.id),table={users:"users",investors:"users",projects:"projects",investments:"investments",requests:"investment_requests",documents:"documents"}[section];if(section==="investors")await q("UPDATE users SET statut=$1,updated_at=NOW() WHERE id=$2 AND role IN ('investisseur','investor')",[b.statut,id]);else await q("UPDATE "+table+" SET statut=$1,updated_at=NOW() WHERE id=$2",[b.statut,id]);return ok(res,{message:"Statut mis à jour."});}
  if(action==="mark_message_read"||action==="mark_message_unread"){await q("UPDATE messages SET lu=$1,date_lecture="+(action==="mark_message_read"?"NOW()":"NULL")+" WHERE id=$2",[action==="mark_message_read"?1:0,Number(b.message_id||b.id)]);return ok(res);}
  const file=(req.files||[])[0],img=file?"/uploads/"+file.filename:null;
  if(action==="create_sector"){const row=await one("INSERT INTO sectors(nom,slug,description,icone) VALUES($1,$2,$3,$4) RETURNING *",[b.nom,slug(b.nom),b.description||null,b.icone||null]);return ok(res,{sector:row});}
  if(action==="update_sector"){const row=await one("UPDATE sectors SET nom=$1,slug=$2,description=$3,updated_at=NOW() WHERE id=$4 RETURNING *",[b.nom,slug(b.nom),b.description||null,Number(b.id)]);return ok(res,{sector:row});}
  if(action==="create_announcement"){const row=await one("INSERT INTO announcements(titre,slug,contenu,image,auteur_id,statut,date_publication) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *",[b.titre,slug(b.titre)+"-"+Date.now(),b.contenu,img,uid,b.statut||"publie",b.date_publication||null]);return ok(res,{announcement:row});}
  if(action==="update_announcement"){const row=await one("UPDATE announcements SET titre=$1,slug=$2,contenu=$3,image=COALESCE($4,image),statut=$5,date_publication=$6,updated_at=NOW() WHERE id=$7 RETURNING *",[b.titre,slug(b.titre)+"-"+b.id,b.contenu,img,b.statut,b.date_publication||null,Number(b.id)]);return ok(res,{announcement:row});}
  if(action==="create_news"){const row=await one("INSERT INTO news(titre,slug,resume,contenu,image,auteur_id,statut,date_publication) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",[b.titre,slug(b.titre)+"-"+Date.now(),b.resume||null,b.contenu,img,uid,b.statut||"publie",b.date_publication||null]);return ok(res,{news:row});}
  if(action==="update_news"){const row=await one("UPDATE news SET titre=$1,slug=$2,resume=$3,contenu=$4,image=COALESCE($5,image),statut=$6,date_publication=$7,updated_at=NOW() WHERE id=$8 RETURNING *",[b.titre,slug(b.titre)+"-"+b.id,b.resume||null,b.contenu,img,b.statut,b.date_publication||null,Number(b.id)]);return ok(res,{news:row});}
  if(action==="create_faq"){const row=await one("INSERT INTO investor_faq(question,answer,statut,ordre) VALUES($1,$2,$3,$4) RETURNING *",[b.question,b.answer,b.statut||"publie",Number(b.ordre||0)]);return ok(res,{faq:row});}
  if(action==="update_faq"){const row=await one("UPDATE investor_faq SET question=$1,answer=$2,statut=$3,ordre=$4,updated_at=NOW() WHERE id=$5 RETURNING *",[b.question,b.answer,b.statut,Number(b.ordre||0),Number(b.id)]);return ok(res,{faq:row});}
  if(adminQueries[sectionMap[action]||action]){const section=sectionMap[action]||action;let rows=await q(adminQueries[section]);const search=String(req.query.search||"").toLowerCase().trim(),status=String(req.query.statut||"");if(search)rows=rows.filter(r=>Object.values(r).some(v=>String(v??"").toLowerCase().includes(search)));if(status)rows=rows.filter(r=>String(r.statut)===status);const stats={total:rows.length};rows.forEach(r=>{if(r.statut)stats[r.statut]=(stats[r.statut]||0)+1;});return ok(res,{[section]:rows,stats});}
  return fail(res,400,"Action administration inconnue.");
}));

app.use((err,_req,res,_next)=>{console.error(err);fail(res,Number(err.status||500),Number(err.status||500)===500?"حدث خطأ في الخادم.":err.message);});
app.listen(PORT,"0.0.0.0",async()=>{try{await pool.query("SELECT 1");console.log("AAPI Node.js API running on port "+PORT);}catch(e){console.error("PostgreSQL connection failed:",e.message);}});
