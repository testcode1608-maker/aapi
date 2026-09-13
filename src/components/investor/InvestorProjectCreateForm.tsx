import type { ChangeEvent, Dispatch, FormEvent, ReactNode, SetStateAction } from "react";
import type { CreateProjectForm } from "../../types/investorDashboard";
import { PROJECT_SECTORS } from "../../utils/investorDashboard";
import { useTranslation } from "../../i18n/I18nProvider";

interface Props { form: CreateProjectForm; setForm: Dispatch<SetStateAction<CreateProjectForm>>; creating: boolean; error: string; success: string; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onReset: () => void; }

export default function InvestorProjectCreateForm({ form, setForm, creating, error, success, onSubmit, onReset }: Props) {
  const { t } = useTranslation();
  const tr = (key: string) => t(`investorForms.projectForm.${key}`);
  const update = (field: keyof CreateProjectForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(current => ({ ...current, [field]: event.target.value }));
  return <div className="investor-dashboard-card investor-project-create-form">
    <div className="investor-dashboard-card-header"><div><span className="investor-dashboard-card-overline">{tr("newProject")}</span><h2>{tr("addProject")}</h2></div><i className="bi bi-building-add" /></div>
    {error && <div className="investor-dashboard-status danger" role="alert"><i className="bi bi-exclamation-circle" /> {error}</div>}
    {success && <div className="investor-dashboard-status success" role="status"><i className="bi bi-check-circle" /> {success}</div>}
    <form onSubmit={onSubmit} noValidate><div className="investor-project-form-grid">
      <Field full label={tr("title")} id="project-titre" required><input id="project-titre" type="text" value={form.titre} onChange={update("titre")} placeholder={tr("titlePlaceholder")} required disabled={creating} /></Field>
      <Field full label={tr("description")} id="project-description" required><textarea id="project-description" value={form.description} onChange={update("description")} placeholder={tr("descriptionPlaceholder")} rows={5} required disabled={creating} /></Field>
      <Field label={tr("sector")} id="project-sector"><select id="project-sector" value={form.sector_id} onChange={update("sector_id")} disabled={creating}><option value="">{tr("selectSector")}</option>{PROJECT_SECTORS.map(sector => <option key={sector.id} value={sector.id}>{sector.nom}</option>)}</select></Field>
      <Field label={tr("wilaya")} id="project-wilaya" required><input id="project-wilaya" type="text" value={form.wilaya} onChange={update("wilaya")} placeholder={tr("wilayaPlaceholder")} required disabled={creating} /></Field>
      <Field label={tr("commune")} id="project-commune"><input id="project-commune" type="text" value={form.commune} onChange={update("commune")} placeholder={tr("communePlaceholder")} disabled={creating} /></Field>
      <Field label={tr("address")} id="project-adresse"><input id="project-adresse" type="text" value={form.adresse} onChange={update("adresse")} placeholder={tr("addressPlaceholder")} disabled={creating} /></Field>
      <Field label={tr("investmentAmount")} id="project-montant" required><input id="project-montant" type="number" min="0" step="0.01" value={form.montant_investissement} onChange={update("montant_investissement")} placeholder={tr("investmentPlaceholder")} required disabled={creating} /><small>{tr("amountHint")}</small></Field>
      <Field label={tr("jobs")} id="project-emplois" required><input id="project-emplois" type="number" min="0" step="1" value={form.nombre_emplois} onChange={update("nombre_emplois")} placeholder={tr("jobsPlaceholder")} required disabled={creating} /></Field>
      <Field label={tr("area")} id="project-superficie"><input id="project-superficie" type="number" min="0" step="0.01" value={form.superficie} onChange={update("superficie")} placeholder={tr("areaPlaceholder")} disabled={creating} /></Field>
      <Field label={tr("areaUnit")} id="project-unite"><select id="project-unite" value={form.unite_superficie} onChange={update("unite_superficie")} disabled={creating}><option value="m²">{tr("squareMeter")}</option><option value="ha">{tr("hectare")}</option></select></Field>
      <Field label={tr("startDate")} id="project-date-debut"><input id="project-date-debut" type="date" value={form.date_debut} onChange={update("date_debut")} disabled={creating} /></Field>
      <Field label={tr("endDate")} id="project-date-fin"><input id="project-date-fin" type="date" value={form.date_fin} onChange={update("date_fin")} disabled={creating} /></Field>
    </div><div className="investor-project-form-actions">
      <button type="submit" className="investor-dashboard-primary-btn" disabled={creating}>{creating ? <><i className="bi bi-arrow-repeat" /> {tr("sending")}</> : <><i className="bi bi-send" /> {tr("send")}</>}</button>
      <button type="button" className="investor-dashboard-logout" disabled={creating} onClick={onReset}><i className="bi bi-arrow-counterclockwise" /> {tr("reset")}</button>
    </div></form>
  </div>;
}

function Field({ label, id, required, full, children }: { label: string; id: string; required?: boolean; full?: boolean; children: ReactNode }) {
  return <div className={`investor-project-form-field${full ? " full" : ""}`}><label htmlFor={id}>{label}{required && <span> *</span>}</label>{children}</div>;
}
