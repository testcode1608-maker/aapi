import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { CreateRequestForm, DashboardProject } from "../../types/investorDashboard";
import { useTranslation } from "../../i18n/I18nProvider";

interface Props { form: CreateRequestForm; setForm: Dispatch<SetStateAction<CreateRequestForm>>; setDocuments: (event: React.ChangeEvent<HTMLInputElement>) => void; projects: DashboardProject[]; creating: boolean; error: string; success: string; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onReset: () => void; }

export default function InvestorRequestCreateForm({ form, setForm, setDocuments, projects, creating, error, success, onSubmit, onReset }: Props) {
  const { t } = useTranslation();
  const tr = (key: string) => t(`investorForms.requestForm.${key}`);
  return <section className="investor-dashboard-card investor-request-create-card">
    <div className="investor-dashboard-card-header"><div><span className="investor-dashboard-card-overline">{tr("services")}</span><h2>{tr("addRequest")}</h2></div><i className="bi bi-file-earmark-plus investor-request-create-icon" /></div>
    <form onSubmit={onSubmit} className="investor-project-form-grid">
      <div className="investor-project-form-field"><label htmlFor="request-type">{tr("type")} <span>*</span></label><select id="request-type" value={form.type_demande} onChange={e => setForm(p => ({ ...p, type_demande: e.target.value }))}><option value="autorisation">{tr("authorization")}</option><option value="agrement">{tr("approval")}</option><option value="avantage">{tr("advantage")}</option><option value="foncier">{tr("land")}</option><option value="accompagnement">{tr("support")}</option><option value="information">{tr("information")}</option><option value="autre">{tr("other")}</option></select></div>
      <div className="investor-project-form-field"><label htmlFor="request-project">{tr("project")}</label><select id="request-project" value={form.projet_id} onChange={e => setForm(p => ({ ...p, projet_id: e.target.value }))}><option value="">{tr("noProject")}</option>{projects.map(project => <option key={project.id} value={project.id}>{project.titre}</option>)}</select></div>
      <div className="investor-project-form-field investor-project-form-field-full"><label htmlFor="request-subject">{tr("subject")} <span>*</span></label><input id="request-subject" value={form.objet} onChange={e => setForm(p => ({ ...p, objet: e.target.value }))} placeholder={tr("subjectPlaceholder")} required /></div>
      <div className="investor-project-form-field"><label htmlFor="request-amount">{tr("amount")}</label><input id="request-amount" type="number" min="0" value={form.montant_demande} onChange={e => setForm(p => ({ ...p, montant_demande: e.target.value }))} placeholder={tr("amountPlaceholder")} /></div>
      <div className="investor-project-form-field"><label htmlFor="request-wilaya">{tr("wilaya")}</label><input id="request-wilaya" value={form.wilaya} onChange={e => setForm(p => ({ ...p, wilaya: e.target.value }))} placeholder={tr("wilayaPlaceholder")} /></div>
      <div className="investor-project-form-field"><label htmlFor="request-priority">{tr("priority")}</label><select id="request-priority" value={form.priorite} onChange={e => setForm(p => ({ ...p, priorite: e.target.value }))}><option value="basse">{tr("low")}</option><option value="normale">{tr("normal")}</option><option value="haute">{tr("high")}</option><option value="urgente">{tr("urgent")}</option></select></div>
      <div className="investor-project-form-field investor-project-form-field-full"><label htmlFor="request-description">{tr("details")}</label><textarea id="request-description" rows={5} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder={tr("detailsPlaceholder")} /></div>
      <div className="investor-project-form-field investor-project-form-field-full"><label htmlFor="request-documents">{tr("documents")}</label><input id="request-documents" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx" onChange={setDocuments} /><small className="investor-request-files-help">{tr("filesHelp")}</small>{form.documents.length > 0 && <div className="investor-request-files-list">{form.documents.map((file, index) => <span key={`${file.name}-${index}`}><i className="bi bi-paperclip" />{file.name}</span>)}</div>}</div>
      {error && <div className="investor-project-form-field-full investor-investment-form-message error">{error}</div>}
      {success && <div className="investor-project-form-field-full investor-investment-form-message success">{success}</div>}
      <div className="investor-project-form-actions investor-project-form-field-full"><button className="investor-dashboard-primary-btn" type="submit" disabled={creating}>{creating ? tr("sending") : tr("send")}</button><button type="button" className="investor-dashboard-logout" onClick={onReset} disabled={creating}><i className="bi bi-arrow-counterclockwise" /> إعادة تعيين</button></div>
    </form>
  </section>;
}
