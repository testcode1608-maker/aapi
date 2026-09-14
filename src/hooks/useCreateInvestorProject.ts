import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { FormEvent } from "react";
import { CREATE_PROJECT_API_URL, LOGIN_ROUTE } from "../utils/investorDashboard";
import type { CreateProjectForm } from "../types/investorDashboard";
import { useTranslation } from "../i18n/I18nProvider";

const EMPTY_FORM: CreateProjectForm = { titre: "", description: "", wilaya: "", commune: "", adresse: "", montant_investissement: "", nombre_emplois: "", superficie: "", unite_superficie: "m²", sector_id: "", date_debut: "", date_fin: "" };

function getUserId(): number | null {
  const stored = localStorage.getItem("aapi_user");
  if (!stored) return null;
  try {
    const id = Number((JSON.parse(stored) as { id?: number | string }).id);
    return Number.isFinite(id) && id > 0 ? id : null;
  } catch {
    localStorage.removeItem("aapi_user");
    return null;
  }
}

export function useCreateInvestorProject(onCreated?: () => void | Promise<void>) {
  const navigate = useNavigate();
  const { language } = useTranslation();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState<CreateProjectForm>(EMPTY_FORM);

  const messages = language === "fr"
    ? { login: "Votre session a expiré. Veuillez vous reconnecter.", title: "Veuillez saisir le titre du projet.", shortTitle: "Le titre du projet est trop court.", description: "Veuillez saisir la description du projet.", shortDescription: "Veuillez saisir une description plus détaillée.", wilaya: "Veuillez saisir la wilaya.", amount: "Veuillez saisir un montant d'investissement valide supérieur à zéro.", jobs: "Veuillez saisir un nombre d'emplois valide.", area: "Veuillez saisir une superficie valide.", dates: "La date de fin doit être postérieure à la date de début.", sector: "Le secteur d'investissement est invalide.", generic: "Impossible de créer le projet.", invalidResponse: "Réponse invalide du serveur.", success: "Projet envoyé avec succès. Il est maintenant en cours d'examen par l'administration." }
    : language === "en"
      ? { login: "Your session has expired. Please sign in again.", title: "Please enter the project title.", shortTitle: "The project title is too short.", description: "Please enter the project description.", shortDescription: "Please enter a more detailed description.", wilaya: "Please enter the wilaya.", amount: "Please enter a valid investment amount greater than zero.", jobs: "Please enter a valid number of jobs.", area: "Please enter a valid area.", dates: "The end date must be after the start date.", sector: "The investment sector is invalid.", generic: "Unable to create the project.", invalidResponse: "Invalid server response.", success: "Project submitted successfully. It is now under administrative review." }
      : { login: "انتهت جلسة المستثمر. أعد تسجيل الدخول.", title: "يرجى إدخال عنوان المشروع.", shortTitle: "عنوان المشروع قصير جداً.", description: "يرجى إدخال وصف المشروع.", shortDescription: "يرجى إدخال وصف أكثر تفصيلاً للمشروع.", wilaya: "يرجى إدخال الولاية.", amount: "يرجى إدخال مبلغ استثمار صحيح وأكبر من صفر.", jobs: "يرجى إدخال عدد مناصب عمل صحيح.", area: "يرجى إدخال مساحة صحيحة.", dates: "تاريخ نهاية المشروع يجب أن يكون بعد تاريخ البداية.", sector: "القطاع الاستثماري غير صالح.", generic: "تعذر إنشاء المشروع.", invalidResponse: "استجابة غير صالحة من الخادم.", success: "تم إرسال المشروع بنجاح. المشروع الآن قيد المراجعة من طرف الإدارة." };

  const updateField = (field: keyof CreateProjectForm, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const resetForm = () => { setForm({ ...EMPTY_FORM }); setError(""); setSuccess(""); };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (creating) return;
    setError(""); setSuccess("");
    const userId = getUserId();
    if (!userId) { setError(messages.login); navigate(LOGIN_ROUTE, { replace: true }); return; }

    const titre = form.titre.trim();
    const description = form.description.trim();
    const wilaya = form.wilaya.trim();
    const commune = form.commune.trim();
    const adresse = form.adresse.trim();
    const montant = Number(form.montant_investissement);
    const emplois = Number(form.nombre_emplois);
    const superficie = form.superficie.trim() ? Number(form.superficie) : null;
    const sectorId = form.sector_id ? Number(form.sector_id) : null;

    if (!titre) return setError(messages.title);
    if (titre.length < 3) return setError(messages.shortTitle);
    if (!description) return setError(messages.description);
    if (description.length < 10) return setError(messages.shortDescription);
    if (!wilaya) return setError(messages.wilaya);
    if (!Number.isFinite(montant) || montant <= 0) return setError(messages.amount);
    if (!Number.isFinite(emplois) || emplois < 0) return setError(messages.jobs);
    if (form.superficie.trim() && (!Number.isFinite(superficie) || Number(superficie) < 0)) return setError(messages.area);
    if (form.date_debut && form.date_fin) {
      const start = new Date(form.date_debut).getTime();
      const end = new Date(form.date_fin).getTime();
      if (Number.isFinite(start) && Number.isFinite(end) && end < start) return setError(messages.dates);
    }
    if (sectorId !== null && (!Number.isFinite(sectorId) || sectorId <= 0)) return setError(messages.sector);

    setCreating(true);
    try {
      const response = await fetch(CREATE_PROJECT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ user_id: userId, titre, description, wilaya, commune: commune || null, adresse: adresse || null, montant_investissement: montant, nombre_emplois: emplois, superficie: superficie !== null && Number.isFinite(superficie) ? superficie : null, unite_superficie: form.unite_superficie || "m²", sector_id: sectorId, date_debut: form.date_debut || null, date_fin: form.date_fin || null }),
      });
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.toLowerCase().includes("application/json")) throw new Error(messages.invalidResponse);
      const data = await response.json();
      if (!response.ok || !data?.success) throw new Error(messages.generic);
      setForm({ ...EMPTY_FORM });
      setSuccess(messages.success);
      await onCreated?.();
    } catch (requestError) {
      setError(requestError instanceof Error && requestError.message ? requestError.message : messages.generic);
    } finally {
      setCreating(false);
    }
  };

  return { form, setForm, updateField, resetForm, submit, creating, error, success };
}

export default useCreateInvestorProject;
