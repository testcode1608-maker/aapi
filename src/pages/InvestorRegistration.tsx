import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../i18n/I18nProvider";
import { registrationTranslations } from "../i18n/registrationTranslations";

interface RegistrationResponse {
  success: boolean;
  message: string;
  user?: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone?: string | null;
    role: string;
    statut: string;
  };
}

function InvestorRegistration() {
  const { language, t: translate } = useTranslation();
  const t = registrationTranslations[language];
  const direction = language === "ar" ? "rtl" : "ltr";

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const fd = new FormData(form);
    const firstName = String(fd.get("firstName") || "").trim();
    const lastName = String(fd.get("lastName") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const investorType = String(fd.get("investorType") || "").trim();
    const activity = String(fd.get("activity") || "").trim();
    const wilaya = String(fd.get("wilaya") || "").trim();
    const projectName = String(fd.get("projectName") || "").trim();
    const projectDescription = String(fd.get("projectDescription") || "").trim();
    const password = String(fd.get("password") || "");
    const confirmPassword = String(fd.get("confirmPassword") || "");

    if (!firstName || !lastName || !email || !phone || !investorType || !activity || !wilaya || !password || !confirmPassword) {
      setError(t.required);
      return;
    }
    if (password.length < 8) {
      setError(t.passwordMin);
      return;
    }
    if (password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1/aapi-api/auth/register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: lastName,
          prenom: firstName,
          email,
          telephone: phone,
          type_investisseur: investorType,
          secteur_activite: activity,
          wilaya,
          nom_entreprise: projectName || null,
          description: projectDescription || null,
          password,
          confirm_password: confirmPassword,
        }),
      });

      const text = await response.text();
      let data: RegistrationResponse;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(t.invalidResponse);
      }
      if (!response.ok || !data.success) throw new Error(data.message || t.registerError);
      setSubmitted(true);
      form.reset();
    } catch (err) {
      if (err instanceof TypeError && err.message === "Failed to fetch") setError(t.connection);
      else if (err instanceof Error) setError(err.message);
      else setError(t.server);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { n: "01", title: t.personal, text: t.personalText },
    { n: "02", title: t.investor, text: t.investorText },
    { n: "03", title: t.account, text: t.accountText },
  ];

  return (
    <section
      className={`investor-registration-section investor-registration-${language}`}
      dir={direction}
      data-language={language}
      data-direction={direction}
      style={{ direction }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-9 col-lg-10">
            <div className="investor-registration-card">
              <div className="investor-registration-header">
                <div className="investor-registration-icon">
                  <i className="bi bi-person-plus" aria-hidden="true" />
                </div>
                <div className="investor-registration-header-content">
                  <span className="section-overline">{t.create}</span>
                  <h2>{t.title}<strong>{t.strong}</strong></h2>
                  <p>{t.intro}</p>
                </div>
              </div>

              {submitted ? (
                <div className="investor-registration-success">
                  <div className="investor-registration-success-icon">
                    <i className="bi bi-check-lg" aria-hidden="true" />
                  </div>
                  <h3>{t.success}</h3>
                  <p>{t.successText}</p>
                  <div className="investor-registration-success-actions">
                    <Link to="/login" className="aapi-primary-button">{t.login}<i className="bi bi-arrow-left" aria-hidden="true" /></Link>
                    <Link to="/investor" className="aapi-secondary-button">{t.backInvestor}<i className="bi bi-arrow-left" aria-hidden="true" /></Link>
                  </div>
                </div>
              ) : (
                <form className="investor-registration-form" onSubmit={handleSubmit} dir={direction}>
                  {error && (
                    <div role="alert" className="investor-registration-error">
                      <i className="bi bi-exclamation-circle" aria-hidden="true" />
                      {error}
                    </div>
                  )}

                  <div className="investor-registration-block">
                    <div className="investor-registration-block-title">
                      <span>{sections[0].n}</span>
                      <div><h3>{sections[0].title}</h3><p>{sections[0].text}</p></div>
                    </div>
                    <div className="row g-4">
                      <div className="col-md-6"><label htmlFor="firstName">{t.firstName} <span>*</span></label><div className="investor-registration-input"><i className="bi bi-person" aria-hidden="true" /><input id="firstName" name="firstName" type="text" placeholder={t.firstNamePlaceholder} autoComplete="given-name" required /></div></div>
                      <div className="col-md-6"><label htmlFor="lastName">{t.lastName} <span>*</span></label><div className="investor-registration-input"><i className="bi bi-person" aria-hidden="true" /><input id="lastName" name="lastName" type="text" placeholder={t.lastNamePlaceholder} autoComplete="family-name" required /></div></div>
                      <div className="col-md-6"><label htmlFor="email">{t.email} <span>*</span></label><div className="investor-registration-input"><i className="bi bi-envelope" aria-hidden="true" /><input id="email" name="email" type="email" placeholder="example@email.com" autoComplete="email" required /></div></div>
                      <div className="col-md-6"><label htmlFor="phone">{t.phone} <span>*</span></label><div className="investor-registration-input"><i className="bi bi-telephone" aria-hidden="true" /><input id="phone" name="phone" type="tel" placeholder={t.phonePlaceholder} autoComplete="tel" required /></div></div>
                    </div>
                  </div>

                  <div className="investor-registration-block">
                    <div className="investor-registration-block-title">
                      <span>{sections[1].n}</span>
                      <div><h3>{sections[1].title}</h3><p>{sections[1].text}</p></div>
                    </div>
                    <div className="row g-4">
                      <div className="col-md-6"><label htmlFor="investorType">{t.investorType} <span>*</span></label><div className="investor-registration-input"><i className="bi bi-briefcase" aria-hidden="true" /><select id="investorType" name="investorType" required defaultValue=""><option value="" disabled>{t.chooseInvestor}</option><option value="personne_physique">{t.person}</option><option value="personne_morale">{t.company}</option><option value="institution">{t.institution}</option><option value="investisseur_etranger">{t.foreign}</option></select></div></div>
                      <div className="col-md-6"><label htmlFor="activity">{t.activity} <span>*</span></label><div className="investor-registration-input"><i className="bi bi-diagram-3" aria-hidden="true" /><select id="activity" name="activity" required defaultValue=""><option value="" disabled>{t.chooseActivity}</option><option value="industrie">{t.industry}</option><option value="agriculture">{t.agriculture}</option><option value="energie">{t.energy}</option><option value="technologie">{t.technology}</option><option value="tourisme">{t.tourism}</option><option value="transport_logistique">{t.logistics}</option><option value="autre">{t.otherSector}</option></select></div></div>
                      <div className="col-md-6"><label htmlFor="wilaya">{t.wilaya} <span>*</span></label><div className="investor-registration-input"><i className="bi bi-geo-alt" aria-hidden="true" /><select id="wilaya" name="wilaya" required defaultValue=""><option value="" disabled>{t.chooseWilaya}</option><option value="alger">{t.algiers}</option><option value="oran">{t.oran}</option><option value="constantine">{t.constantine}</option><option value="blida">{t.blida}</option><option value="setif">{t.setif}</option><option value="biskra">{t.biskra}</option><option value="autre">{t.otherWilaya}</option></select></div></div>
                      <div className="col-md-6"><label htmlFor="projectName">{t.projectName}</label><div className="investor-registration-input"><i className="bi bi-building" aria-hidden="true" /><input id="projectName" name="projectName" type="text" placeholder={t.projectPlaceholder} /></div></div>
                      <div className="col-12"><label htmlFor="projectDescription">{t.description}</label><div className="investor-registration-textarea"><textarea id="projectDescription" name="projectDescription" rows={5} placeholder={t.descriptionPlaceholder} /></div></div>
                    </div>
                  </div>

                  <div className="investor-registration-block">
                    <div className="investor-registration-block-title">
                      <span>{sections[2].n}</span>
                      <div><h3>{sections[2].title}</h3><p>{sections[2].text}</p></div>
                    </div>
                    <div className="row g-4">
                      <div className="col-md-6"><label htmlFor="password">{t.password} <span>*</span></label><div className="investor-registration-input"><i className="bi bi-lock" aria-hidden="true" /><input id="password" name="password" type="password" placeholder={t.passwordPlaceholder} minLength={8} autoComplete="new-password" required /></div></div>
                      <div className="col-md-6"><label htmlFor="confirmPassword">{t.confirmPassword} <span>*</span></label><div className="investor-registration-input"><i className="bi bi-shield-check" aria-hidden="true" /><input id="confirmPassword" name="confirmPassword" type="password" placeholder={t.confirmPlaceholder} minLength={8} autoComplete="new-password" required /></div></div>
                    </div>
                  </div>

                  <div className="investor-registration-consent"><label><input type="checkbox" name="consent" required /><span>{t.consent}</span></label></div>
                  <div className="investor-registration-actions">
                    <button type="submit" className="aapi-primary-button investor-registration-submit" disabled={loading}>
                      {loading ? <><i className="bi bi-arrow-repeat" />{t.loading}</> : <>{t.submit}<i className="bi bi-arrow-left" /></>}
                    </button>
                    <Link to="/login" className="aapi-secondary-button">{t.login}</Link>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default InvestorRegistration;
