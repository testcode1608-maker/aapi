import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { CreateRequestForm, DashboardProject } from "../../types/investorDashboard";

interface Props {
  form: CreateRequestForm;
  setForm: Dispatch<SetStateAction<CreateRequestForm>>;
  setDocuments: (event: React.ChangeEvent<HTMLInputElement>) => void;
  projects: DashboardProject[];
  creating: boolean;
  error: string;
  success: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
}

export default function InvestorRequestCreateForm({ form, setForm, setDocuments, projects, creating, error, success, onSubmit, onReset }: Props) {
  return (
    <section className="investor-dashboard-card investor-request-create-card">
      <div className="investor-dashboard-card-header">
        <div><span className="investor-dashboard-card-overline">الخدمات</span><h2>إضافة طلب استثماري</h2></div>
        <i className="bi bi-file-earmark-plus investor-request-create-icon" />
      </div>
      <form onSubmit={onSubmit} className="investor-project-form-grid">
        <div className="investor-project-form-field">
          <label htmlFor="request-type">نوع الطلب <span>*</span></label>
          <select id="request-type" value={form.type_demande} onChange={e => setForm(p => ({ ...p, type_demande: e.target.value }))}>
            <option value="autorisation">طلب ترخيص</option>
            <option value="agrement">طلب اعتماد</option>
            <option value="avantage">طلب امتياز</option>
            <option value="foncier">طلب عقار استثماري</option>
            <option value="accompagnement">طلب مرافقة</option>
            <option value="information">طلب معلومات</option>
            <option value="autre">طلب آخر</option>
          </select>
        </div>
        <div className="investor-project-form-field">
          <label htmlFor="request-project">المشروع المرتبط</label>
          <select id="request-project" value={form.projet_id} onChange={e => setForm(p => ({ ...p, projet_id: e.target.value }))}>
            <option value="">بدون مشروع مرتبط</option>
            {projects.map(project => <option key={project.id} value={project.id}>{project.titre}</option>)}
          </select>
        </div>
        <div className="investor-project-form-field investor-project-form-field-full">
          <label htmlFor="request-subject">موضوع الطلب <span>*</span></label>
          <input id="request-subject" value={form.objet} onChange={e => setForm(p => ({ ...p, objet: e.target.value }))} placeholder="مثال: طلب اعتماد مشروع استثماري" required />
        </div>
        <div className="investor-project-form-field">
          <label htmlFor="request-amount">المبلغ المطلوب (دج)</label>
          <input id="request-amount" type="number" min="0" value={form.montant_demande} onChange={e => setForm(p => ({ ...p, montant_demande: e.target.value }))} placeholder="0" />
        </div>
        <div className="investor-project-form-field">
          <label htmlFor="request-wilaya">الولاية</label>
          <input id="request-wilaya" value={form.wilaya} onChange={e => setForm(p => ({ ...p, wilaya: e.target.value }))} placeholder="مثال: باتنة" />
        </div>
        <div className="investor-project-form-field">
          <label htmlFor="request-priority">الأولوية</label>
          <select id="request-priority" value={form.priorite} onChange={e => setForm(p => ({ ...p, priorite: e.target.value }))}>
            <option value="basse">منخفضة</option><option value="normale">عادية</option><option value="haute">مرتفعة</option><option value="urgente">عاجلة</option>
          </select>
        </div>
        <div className="investor-project-form-field investor-project-form-field-full">
          <label htmlFor="request-description">تفاصيل الطلب</label>
          <textarea id="request-description" rows={5} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="اشرح طلبك بالتفصيل..." />
        </div>
        <div className="investor-project-form-field investor-project-form-field-full">
          <label htmlFor="request-documents">الوثائق المرفقة</label>
          <input id="request-documents" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx" onChange={setDocuments} />
          <small className="investor-request-files-help">يمكن إرفاق عدة وثائق، بحد أقصى 10 ميغابايت لكل وثيقة.</small>
          {form.documents.length > 0 && <div className="investor-request-files-list">{form.documents.map((file, index) => <span key={`${file.name}-${index}`}><i className="bi bi-paperclip" />{file.name}</span>)}</div>}
        </div>
        {error && <div className="investor-project-form-field-full investor-investment-form-message error">{error}</div>}
        {success && <div className="investor-project-form-field-full investor-investment-form-message success">{success}</div>}
        <div className="investor-project-form-actions investor-project-form-field-full">
          <button className="investor-dashboard-primary-btn" type="submit" disabled={creating}>{creating ? "جاري الإرسال..." : "إرسال الطلب"}</button>
          <button className="investor-dashboard-secondary-btn" type="button" onClick={onReset} disabled={creating}>مسح</button>
        </div>
      </form>
    </section>
  );
}
