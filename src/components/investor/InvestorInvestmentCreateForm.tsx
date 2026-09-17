import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { CreateInvestmentForm, DashboardProject } from "../../types/investorDashboard";
import { formatAmount } from "../../utils/investorDashboard";
import { useTranslation } from "../../i18n/I18nProvider";

interface Props {
  form: CreateInvestmentForm;
  setForm: Dispatch<SetStateAction<CreateInvestmentForm>>;
  projects: DashboardProject[];
  creating: boolean;
  error: string;
  success: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
}

export default function InvestorInvestmentCreateForm({ form, setForm, projects, creating, error, success, onSubmit, onReset }: Props) {
  const { t } = useTranslation();
  const field = (key: string) => `investorDashboard.investmentForm.${key}`;

  return (
    <div className="investor-dashboard-card investor-investment-create-card">
      <div className="investor-dashboard-card-header">
        <div><span className="investor-dashboard-card-overline">{t(field("newInvestment"))}</span><h2>{t(field("addInvestment"))}</h2></div>
        <i className="bi bi-cash-coin" />
      </div>

      {error && <div className="investor-dashboard-status danger investor-investment-form-message"><i className="bi bi-exclamation-circle" />{error}</div>}
      {success && <div className="investor-dashboard-status success investor-investment-form-message"><i className="bi bi-check-circle" />{success}</div>}

      {projects.length === 0 ? (
        <div className="investor-investment-empty-form"><i className="bi bi-info-circle" /><p>{t(field("noProjects"))}</p></div>
      ) : (
        <form onSubmit={onSubmit} className="investor-project-form-grid">
          <div className="investor-project-form-field">
            <label htmlFor="investment-project">{t(field("projectRequired"))} <span>*</span></label>
            <select id="investment-project" value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })} disabled={creating} required>
              <option value="">{t(field("selectProject"))}</option>
              {projects.map((project) => <option key={project.id} value={project.id}>{project.titre} — {project.statut === "approuve" ? t(field("approved")) : t(field("inProgress"))}</option>)}
            </select>
          </div>

          <div className="investor-project-form-field">
            <label htmlFor="investment-amount">{t(field("amount"))} <span>*</span></label>
            <input id="investment-amount" type="number" min="1" step="1" value={form.montant} onChange={(e) => setForm({ ...form, montant: e.target.value })} placeholder={t(field("exampleAmount"))} disabled={creating} required />
            <small>{t(field("amountHint"))}</small>
          </div>

          <div className="investor-project-form-field">
            <label htmlFor="investment-date">{t(field("date"))}</label>
            <input id="investment-date" type="date" value={form.date_investissement} onChange={(e) => setForm({ ...form, date_investissement: e.target.value })} disabled={creating} />
          </div>

          <div className="investor-project-form-field">
            <label htmlFor="investment-preview">{t(field("currentAmount"))}</label>
            <input id="investment-preview" value={form.montant ? formatAmount(Number(form.montant)) : t(field("zeroAmount"))} readOnly />
          </div>

          <div className="investor-project-form-field full">
            <label htmlFor="investment-notes">{t(field("notes"))}</label>
            <textarea id="investment-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder={t(field("notesPlaceholder"))} disabled={creating} />
          </div>

          <div className="investor-project-form-actions full">
            <button type="submit" className="investor-dashboard-primary-btn" disabled={creating}><i className={creating ? "bi bi-hourglass-split" : "bi bi-plus-circle"} />{creating ? t(field("register")) : t(field("add"))}</button>
            <button type="button" className="investor-dashboard-logout" onClick={onReset} disabled={creating}><i className="bi bi-arrow-counterclockwise" /> {t("investorForms.projectForm.reset")}</button>
          </div>
        </form>
      )}
    </div>
  );
}
