import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { API_BASE_URL } from "../utils/investorDashboard";
import type { CreateRequestForm, DashboardProject } from "../types/investorDashboard";

const API_URL = `${API_BASE_URL}/auth/investor/submit-request.php`;

export const EMPTY_REQUEST_FORM: CreateRequestForm = {
  projet_id: "",
  type_demande: "autorisation",
  objet: "",
  description: "",
  montant_demande: "",
  wilaya: "",
  priorite: "normale",
  documents: [],
};

export function useCreateInvestorRequest(projects: DashboardProject[], reload: () => Promise<void>) {
  const [form, setForm] = useState<CreateRequestForm>(EMPTY_REQUEST_FORM);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const eligibleProjects = useMemo(() => projects.filter(p => ["approuve", "en_cours"].includes(p.statut)), [projects]);

  const setDocuments = (event: ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, documents: Array.from(event.target.files || []) }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(""); setSuccess("");
    const stored = localStorage.getItem("aapi_user");
    const userId = stored ? Number((JSON.parse(stored) as { id?: number }).id) : 0;
    if (!userId || !form.type_demande || !form.objet) { setError("يرجى إكمال نوع الطلب وموضوع الطلب."); return; }
    setCreating(true);
    try {
      const body = new FormData();
      body.append("user_id", String(userId));
      if (form.projet_id) body.append("projet_id", form.projet_id);
      body.append("type_demande", form.type_demande);
      body.append("objet", form.objet);
      body.append("description", form.description);
      body.append("montant_demande", form.montant_demande);
      body.append("wilaya", form.wilaya);
      body.append("priorite", form.priorite);
      form.documents.forEach(file => body.append("documents[]", file));
      const response = await fetch(API_URL, { method: "POST", body });
      const data = await response.json();
      if (!response.ok || !data?.success) throw new Error(data?.message || "تعذر إرسال الطلب.");
      setSuccess(data.message || "تم إرسال الطلب بنجاح.");
      setForm(EMPTY_REQUEST_FORM);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر الاتصال بالخادم.");
    } finally { setCreating(false); }
  };

  return { form, setForm, setDocuments, eligibleProjects, creating, error, success, submit, resetForm: () => { setForm(EMPTY_REQUEST_FORM); setError(""); setSuccess(""); } };
}

export default useCreateInvestorRequest;
