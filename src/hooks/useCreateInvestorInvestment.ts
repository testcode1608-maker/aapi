import { useState } from "react";
import type { FormEvent } from "react";
import type { CreateInvestmentForm, DashboardInvestment, DashboardProject } from "../types/investorDashboard";
import { API_BASE_URL } from "../utils/investorDashboard";
import { useTranslation } from "../i18n/I18nProvider";

const API_URL = `${API_BASE_URL}/auth/investor/create-investment.php`;

export const EMPTY_INVESTMENT_FORM: CreateInvestmentForm = {
  project_id: "",
  montant: "",
  date_investissement: new Date().toISOString().slice(0, 10),
  notes: "",
};

export function useCreateInvestorInvestment(projects: DashboardProject[], reload: () => Promise<void>) {
  const { language } = useTranslation();
  const [form, setForm] = useState<CreateInvestmentForm>(EMPTY_INVESTMENT_FORM);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const eligibleProjects = projects.filter((project) => ["approuve", "en_cours"].includes(project.statut));

  const messages = language === "fr"
    ? { session: "Votre session a expiré. Veuillez vous reconnecter.", fields: "Sélectionnez un projet et saisissez un montant valide.", generic: "Impossible d'ajouter l'investissement.", success: "Investissement ajouté avec succès.", connection: "Impossible de contacter le serveur." }
    : language === "en"
      ? { session: "Your session has expired. Please sign in again.", fields: "Select a project and enter a valid investment amount.", generic: "Unable to add the investment.", success: "Investment added successfully.", connection: "Unable to contact the server." }
      : { session: "انتهت جلسة المستثمر. أعد تسجيل الدخول.", fields: "اختر المشروع وأدخل مبلغ استثمار صحيح.", generic: "تعذر إضافة الاستثمار.", success: "تمت إضافة الاستثمار بنجاح.", connection: "تعذر الاتصال بالخادم." };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(""); setSuccess("");
    const stored = localStorage.getItem("aapi_user");
    let userId = 0;
    try { userId = Number((JSON.parse(stored || "{}") as { id?: number }).id || 0); } catch { userId = 0; }
    if (!userId) return setError(messages.session);
    if (!form.project_id || Number(form.montant) <= 0) return setError(messages.fields);

    setCreating(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ user_id: userId, ...form, montant: Number(form.montant) }),
      });
      const data = (await response.json()) as { success?: boolean; message?: string; investment?: DashboardInvestment };
      if (!response.ok || !data.success) throw new Error(messages.generic);
      setSuccess(messages.success);
      setForm({ ...EMPTY_INVESTMENT_FORM, date_investissement: new Date().toISOString().slice(0, 10) });
      await reload();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : messages.connection);
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setForm({ ...EMPTY_INVESTMENT_FORM, date_investissement: new Date().toISOString().slice(0, 10) });
    setError(""); setSuccess("");
  };

  return { form, setForm, creating, error, success, eligibleProjects, submit, resetForm };
}
