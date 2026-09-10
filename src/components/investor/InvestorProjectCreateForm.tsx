import type { ChangeEvent, FormEvent } from "react";
import type { CreateProjectForm } from "../../types/investorDashboard";
import { PROJECT_SECTORS } from "../../utils/investorDashboard";

interface Props {
  form: CreateProjectForm;
  setForm: React.Dispatch<React.SetStateAction<CreateProjectForm>>;
  creating: boolean;
  error: string;
  success: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
}

export default function InvestorProjectCreateForm({
  form,
  setForm,
  creating,
  error,
  success,
  onSubmit,
  onReset,
}: Props) {
  const update = (field: keyof CreateProjectForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  return (
    <div className="investor-dashboard-card investor-project-create-form">
      <div className="investor-dashboard-card-header">
        <div>
          <span className="investor-dashboard-card-overline">مشروع جديد</span>
          <h2>إضافة مشروع استثماري</h2>
        </div>
        <i className="bi bi-building-add" />
      </div>

      {error && <div className="investor-dashboard-status danger" role="alert"><i className="bi bi-exclamation-circle" /> {error}</div>}
      {success && <div className="investor-dashboard-status success" role="status"><i className="bi bi-check-circle" /> {success}</div>}

      <form onSubmit={onSubmit} noValidate>
        <div className="investor-project-form-grid">
          <Field full label="عنوان المشروع" id="project-titre" required>
            <input id="project-titre" type="text" value={form.titre} onChange={update("titre")} placeholder="مثال: إنشاء مركز تكنولوجي" required disabled={creating} />
          </Field>

          <Field full label="وصف المشروع" id="project-description" required>
            <textarea id="project-description" value={form.description} onChange={update("description")} placeholder="قدم وصفاً واضحاً ومفصلاً عن المشروع وأهدافه وطبيعته." rows={5} required disabled={creating} />
          </Field>

          <Field label="القطاع الاستثماري" id="project-sector">
            <select id="project-sector" value={form.sector_id} onChange={update("sector_id")} disabled={creating}>
              <option value="">اختر القطاع</option>
              {PROJECT_SECTORS.map((sector) => <option key={sector.id} value={sector.id}>{sector.nom}</option>)}
            </select>
          </Field>

          <Field label="الولاية" id="project-wilaya" required>
            <input id="project-wilaya" type="text" value={form.wilaya} onChange={update("wilaya")} placeholder="مثال: الجزائر" required disabled={creating} />
          </Field>

          <Field label="البلدية" id="project-commune">
            <input id="project-commune" type="text" value={form.commune} onChange={update("commune")} placeholder="مثال: الجزائر الوسطى" disabled={creating} />
          </Field>

          <Field label="العنوان" id="project-adresse">
            <input id="project-adresse" type="text" value={form.adresse} onChange={update("adresse")} placeholder="العنوان الكامل للمشروع" disabled={creating} />
          </Field>

          <Field label="مبلغ الاستثمار" id="project-montant" required>
            <input id="project-montant" type="number" min="0" step="0.01" value={form.montant_investissement} onChange={update("montant_investissement")} placeholder="مثال: 25000000" required disabled={creating} />
            <small>المبلغ بالدينار الجزائري DA</small>
          </Field>

          <Field label="عدد مناصب العمل" id="project-emplois" required>
            <input id="project-emplois" type="number" min="0" step="1" value={form.nombre_emplois} onChange={update("nombre_emplois")} placeholder="مثال: 50" required disabled={creating} />
          </Field>

          <Field label="المساحة" id="project-superficie">
            <input id="project-superficie" type="number" min="0" step="0.01" value={form.superficie} onChange={update("superficie")} placeholder="مثال: 2500" disabled={creating} />
          </Field>

          <Field label="وحدة المساحة" id="project-unite">
            <select id="project-unite" value={form.unite_superficie} onChange={update("unite_superficie")} disabled={creating}>
              <option value="m²">متر مربع (m²)</option>
              <option value="ha">هكتار (ha)</option>
            </select>
          </Field>

          <Field label="تاريخ بداية المشروع" id="project-date-debut">
            <input id="project-date-debut" type="date" value={form.date_debut} onChange={update("date_debut")} disabled={creating} />
          </Field>

          <Field label="تاريخ نهاية المشروع" id="project-date-fin">
            <input id="project-date-fin" type="date" value={form.date_fin} onChange={update("date_fin")} disabled={creating} />
          </Field>
        </div>

        <div className="investor-project-form-actions">
          <button type="submit" className="investor-dashboard-primary-btn" disabled={creating}>
            {creating ? <><i className="bi bi-arrow-repeat" /> جاري إرسال المشروع...</> : <><i className="bi bi-send" /> إرسال المشروع إلى الإدارة</>}
          </button>
          <button type="button" className="investor-dashboard-logout" disabled={creating} onClick={onReset}>
            <i className="bi bi-arrow-counterclockwise" /> إعادة تعيين
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, id, required, full, children }: { label: string; id: string; required?: boolean; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={`investor-project-form-field${full ? " full" : ""}`}>
      <label htmlFor={id}>{label}{required && <span> *</span>}</label>
      {children}
    </div>
  );
}
