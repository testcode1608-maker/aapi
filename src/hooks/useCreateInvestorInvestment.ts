import { useState } from "react";
import type { CreateInvestmentForm, DashboardInvestment, DashboardProject } from "../types/investorDashboard";
import { API_BASE_URL } from "../utils/investorDashboard";

const API_URL = `${API_BASE_URL}/auth/investor/create-investment.php`;

export const EMPTY_INVESTMENT_FORM: CreateInvestmentForm = {
  project_id: "",
  montant: "",
  date_investissement: new Date().toISOString().slice(0, 10),
  notes: "",
};

export function useCreateInvestorInvestment(
  projects: DashboardProject[],
  reload: () => Promise<void>,
) {
  const [form, setForm] = useState<CreateInvestmentForm>(EMPTY_INVESTMENT_FORM);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const eligibleProjects = projects.filter((project) =>
    ["approuve", "en_cours"].includes(project.statut),
  );

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const stored = localStorage.getItem("aapi_user");
    let userId = 0;
    try {
      userId = Number((JSON.parse(stored || "{}") as { id?: number }).id || 0);
    } catch {
      userId = 0;
    }

    if (!userId) {
      setError("انتهت جلسة المستثمر. أعد تسجيل الدخول.");
      return;
    }

    if (!form.project_id || Number(form.montant) <= 0) {
      setError("اختر المشروع وأدخل مبلغ استثمار صحيح.");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ user_id: userId, ...form, montant: Number(form.montant) }),
      });
      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
        investment?: DashboardInvestment;
      };

      if (!response.ok || !data.success) {
        throw new Error(data.message || "تعذر إضافة الاستثمار.");
      }

      setSuccess(data.message || "تمت إضافة الاستثمار بنجاح.");
      setForm({ ...EMPTY_INVESTMENT_FORM, date_investissement: new Date().toISOString().slice(0, 10) });
      await reload();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "تعذر الاتصال بالخادم.");
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setForm({ ...EMPTY_INVESTMENT_FORM, date_investissement: new Date().toISOString().slice(0, 10) });
    setError("");
    setSuccess("");
  };

  return { form, setForm, creating, error, success, eligibleProjects, submit, resetForm };
}
