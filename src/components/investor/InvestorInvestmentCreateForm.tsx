import type { CreateInvestmentForm, DashboardProject } from "../../types/investorDashboard";
import { formatAmount } from "../../utils/investorDashboard";

interface Props {
  form: CreateInvestmentForm;
  setForm: React.Dispatch<React.SetStateAction<CreateInvestmentForm>>;
  projects: DashboardProject[];
  creating: boolean;
  error: string;
  success: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
}

export default function InvestorInvestmentCreateForm({ form, setForm, projects, creating, error, success, onSubmit, onReset }: Props) {
  return (
    <div className="investor-dashboard-card investor-investment-create-card">
      <div className="investor-dashboard-card-header">
        <div>
          <span className="investor-dashboard-card-overline">استثمار جديد</span>
          <h2>إضافة استثمار</h2>
        </div>
        <i className="bi bi-cash-coin" />
      </div>

      {error && <div className="investor-dashboard-status danger investor-investment-form-message"><i className="bi bi-exclamation-circle" />{error}</div>}
      {success && <div className="investor-dashboard-status success investor-investment-form-message"><i className="bi bi-check-circle" />{success}</div>}

      {projects.length === 0 ? (
        <div className="investor-investment-empty-form">
          <i className="bi bi-info-circle" />
          <p>لا يمكنك إضافة استثمار حاليا. يجب أن يكون لديك مشروع معتمد أو قيد الإنجاز.</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="investor-project-form-grid">
          <div className="investor-project-form-field">
            <label htmlFor="investment-project">المشروع <span>*</span></label>
            <select id="investment-project" value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })} disabled={creating} required>
              <option value="">اختر المشروع</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.titre} — {project.statut === "approuve" ? "معتمد" : "قيد الإنجاز"}</option>
              ))}
            </select>
          </div>

          <div className="investor-project-form-field">
            <label htmlFor="investment-amount">مبلغ الاستثمار (DA) <span>*</span></label>
            <input id="investment-amount" type="number" min="1" step="1" value={form.montant} onChange={(e) => setForm({ ...form, montant: e.target.value })} placeholder="مثال: 5000000" disabled={creating} required />
            <small>المبلغ بالدينار الجزائري DA</small>
          </div>

          <div className="investor-project-form-field">
            <label htmlFor="investment-date">تاريخ الاستثمار</label>
            <input id="investment-date" type="date" value={form.date_investissement} onChange={(e) => setForm({ ...form, date_investissement: e.target.value })} disabled={creating} />
          </div>

          <div className="investor-project-form-field">
            <label htmlFor="investment-preview">المبلغ الحالي</label>
            <input id="investment-preview" value={form.montant ? formatAmount(Number(form.montant)) : "0 DA"} readOnly />
          </div>

          <div className="investor-project-form-field full">
            <label htmlFor="investment-notes">ملاحظات</label>
            <textarea id="investment-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="ملاحظات إضافية حول الاستثمار..." disabled={creating} />
          </div>

          <div className="investor-project-form-actions full">
            <button type="submit" className="investor-dashboard-primary-btn" disabled={creating}>
              <i className={creating ? "bi bi-hourglass-split" : "bi bi-plus-circle"} />
              {creating ? "جاري التسجيل..." : "إضافة الاستثمار"}
            </button>
            <button type="button" className="investor-dashboard-logout" onClick={onReset} disabled={creating}>مسح</button>
          </div>
        </form>
      )}
    </div>
  );
}
