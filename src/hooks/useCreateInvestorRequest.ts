import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { API_BASE_URL } from "../utils/investorDashboard";
import type { CreateRequestForm, DashboardProject } from "../types/investorDashboard";
import { useTranslation } from "../i18n/I18nProvider";

const API_URL = `${API_BASE_URL}/auth/investor/submit-request.php`;

export const EMPTY_REQUEST_FORM: CreateRequestForm = {
  projet_id: "", type_demande: "autorisation", objet: "", description: "", montant_demande: "", wilaya: "", priorite: "normale", documents: [],
};

export function useCreateInvestorRequest(projects: DashboardProject[], reload: () => Promise<void>) {
  const { language } = useTranslation();
  const [form, setForm] = useState<CreateRequestForm>(EMPTY_REQUEST_FORM);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const eligibleProjects = useMemo(() => projects.filter((p) => ["approuve", "en_cours"].includes(p.statut)), [projects]);

  const messages = language === "fr"
    ? { fields: "Veuillez compléter le type et l'objet de la demande.", generic: "Impossible d'envoyer la demande.", success: "Demande envoyée avec succès.", connection: "Impossible de contacter le serveur." }
    : language === "en"
      ? { fields: "Please complete the request type and subject.", generic: "Unable to submit the request.", success: "Request submitted successfully.", connection: "Unable to contact the server." }
      : { fields: "يرجى إكمال نوع الطلب وموضوع الطلب.", generic: "تعذر إرسال الطلب.", success: "تم إرسال الطلب بنجاح.", connection: "تعذر الاتصال بالخادم." };

  const setDocuments = (event: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, documents: Array.from(event.target.files || []) }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(""); setSuccess("");
    const stored = localStorage.getItem("aapi_user");
    let userId = 0;
    try { userId = Number((JSON.parse(stored || "{}") as { id?: number }).id || 0); } catch { userId = 0; }
    if (!userId || !form.type_demande || !form.objet.trim()) { setError(messages.fields); return; }

    setCreating(true);
    try {
      const body = new FormData();
      body.append("user_id", String(userId));
      if (form.projet_id) body.append("projet_id", form.projet_id);
      body.append("type_demande", form.type_demande);
      body.append("objet", form.objet.trim());
      body.append("description", form.description);
      body.append("montant_demande", form.montant_demande);
      body.append("wilaya", form.wilaya);
      body.append("priorite", form.priorite);
      form.documents.forEach((file) => body.append("documents[]", file));

      const response = await fetch(API_URL, { method: "POST", body });
      const data = await response.json();
      if (!response.ok || !data?.success) throw new Error(messages.generic);
      setSuccess(messages.success);
      setForm({ ...EMPTY_REQUEST_FORM });
      await reload();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : messages.connection);
    } finally {
      setCreating(false);
    }
  };

  return {
    form,
    setForm,
    setDocuments,
    eligibleProjects,
    creating,
    error,
    success,
    submit,
    resetForm: () => { setForm({ ...EMPTY_REQUEST_FORM }); setError(""); setSuccess(""); },
  };
}

export default useCreateInvestorRequest;
