import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { FormEvent } from "react";
import { CREATE_PROJECT_API_URL, LOGIN_ROUTE } from "../utils/investorDashboard";
import type { CreateProjectForm } from "../types/investorDashboard";

const EMPTY_FORM: CreateProjectForm = { titre: "", description: "", wilaya: "", commune: "", adresse: "", montant_investissement: "", nombre_emplois: "", superficie: "", unite_superficie: "m²", sector_id: "", date_debut: "", date_fin: "" };

function getUserId(): number | null {
  const stored = localStorage.getItem("aapi_user");
  if (!stored) return null;
  try { const id = Number((JSON.parse(stored) as { id?: number | string }).id); return Number.isFinite(id) && id > 0 ? id : null; }
  catch { localStorage.removeItem("aapi_user"); return null; }
}

export function useCreateInvestorProject(onCreated?: () => void | Promise<void>) {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState<CreateProjectForm>(EMPTY_FORM);
  const updateField = (field: keyof CreateProjectForm, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const resetForm = () => { setForm({ ...EMPTY_FORM }); setError(""); setSuccess(""); };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (creating) return;
    setError(""); setSuccess("");
    const userId = getUserId();
    if (!userId) { navigate(LOGIN_ROUTE, { replace: true }); return; }
    const titre = form.titre.trim(), description = form.description.trim(), wilaya = form.wilaya.trim(), commune = form.commune.trim(), adresse = form.adresse.trim();
    const montant = Number(form.montant_investissement), emplois = Number(form.nombre_emplois);
    const superficie = form.superficie.trim() ? Number(form.superficie) : null;
    const sectorId = form.sector_id ? Number(form.sector_id) : null;
    if (!titre) return setError("يرجى إدخال عنوان المشروع.");
    if (titre.length < 3) return setError("عنوان المشروع قصير جداً.");
    if (!description) return setError("يرجى إدخال وصف المشروع.");
    if (description.length < 10) return setError("يرجى إدخال وصف أكثر تفصيلاً للمشروع.");
    if (!wilaya) return setError("يرجى إدخال الولاية.");
    if (!Number.isFinite(montant) || montant <= 0) return setError("يرجى إدخال مبلغ استثمار صحيح وأكبر من صفر.");
    if (!Number.isFinite(emplois) || emplois < 0) return setError("يرجى إدخال عدد مناصب عمل صحيح.");
    if (form.superficie.trim() && (!Number.isFinite(superficie) || Number(superficie) < 0)) return setError("يرجى إدخال مساحة صحيحة.");
    if (form.date_debut && form.date_fin) { const start = new Date(form.date_debut).getTime(), end = new Date(form.date_fin).getTime(); if (Number.isFinite(start) && Number.isFinite(end) && end < start) return setError("تاريخ نهاية المشروع يجب أن يكون بعد تاريخ البداية."); }
    if (sectorId !== null && (!Number.isFinite(sectorId) || sectorId <= 0)) return setError("القطاع الاستثماري غير صالح.");
    setCreating(true);
    try {
      const response = await fetch(CREATE_PROJECT_API_URL, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ user_id: userId, titre, description, wilaya, commune: commune || null, adresse: adresse || null, montant_investissement: montant, nombre_emplois: emplois, superficie: superficie !== null && Number.isFinite(superficie) ? superficie : null, unite_superficie: form.unite_superficie || "m²", sector_id: sectorId, date_debut: form.date_debut || null, date_fin: form.date_fin || null }) });
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.toLowerCase().includes("application/json")) throw new Error("Le serveur a retourné une réponse invalide. Vérifiez create-project.php.");
      const data = await response.json();
      if (!response.ok || !data?.success) throw new Error(data?.message || "تعذر إنشاء المشروع.");
      setSuccess("تم إرسال المشروع بنجاح. المشروع الآن قيد المراجعة من طرف الإدارة.");
      resetForm(); setSuccess("تم إرسال المشروع بنجاح. المشروع الآن قيد المراجعة من طرف الإدارة.");
      await onCreated?.();
    } catch (requestError) { setError(requestError instanceof Error && requestError.message ? requestError.message : "تعذر إنشاء المشروع."); }
    finally { setCreating(false); }
  };
  return { form, setForm, updateField, resetForm, submit, creating, error, success };
}

export default useCreateInvestorProject;
