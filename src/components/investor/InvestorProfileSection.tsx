import { useEffect, useState, type FormEvent } from "react";
import type { DashboardProfile, DashboardUser } from "../../types/investorDashboard";
import { API_BASE_URL, getUserPhotoUrl } from "../../utils/investorDashboard";
import { useTranslation } from "../../i18n/I18nProvider";
import "../../styles/investor-dashboard.css";
import "../../styles/investor-profile.css";

interface Props {
  user: DashboardUser | null;
  profile: DashboardProfile | null;
  fullName: string;
  userPhotoUrl: string;
}

export default function InvestorProfileSection({ user, profile, fullName, userPhotoUrl }: Props) {
  const { t } = useTranslation();
  const [email, setEmail] = useState(user?.email || "");
  const [telephone, setTelephone] = useState(user?.telephone || "");
  const [photo, setPhoto] = useState(userPhotoUrl);
  const [photoData, setPhotoData] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setEmail(user?.email || "");
    setTelephone(user?.telephone || "");
    setPhoto(getUserPhotoUrl(user) || userPhotoUrl);
  }, [user, userPhotoUrl]);

  const value = (text?: string | null) => text?.trim() || "—";
  const location = [profile?.wilaya, profile?.commune].filter(Boolean).join(" · ");

  const choosePhoto = (file?: File) => {
    if (!file) return;

    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setError(t("investorDashboard.profile.photoType"));
      return;
    }

    if (file.size > 5242880) {
      setError(t("investorDashboard.profile.photoSize"));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const nextPhoto = String(reader.result || "");
      setPhoto(nextPhoto);
      setPhotoData(nextPhoto);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    const raw = localStorage.getItem("aapi_user");
    const id = raw ? Number((JSON.parse(raw) as { id?: number }).id) : 0;

    if (!id) {
      setError(t("investorDashboard.profile.sessionExpired"));
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/investor/update-profile.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: id, email, telephone, photo: photoData }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || t("investorDashboard.profile.updateFailed"));
      }

      if (data.user) {
        localStorage.setItem("aapi_user", JSON.stringify(data.user));
        const updatedPhoto = getUserPhotoUrl(data.user);
        if (updatedPhoto) setPhoto(updatedPhoto);
      }

      setMessage(data.message || t("investorDashboard.profile.updated"));
      setPhotoData("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("investorDashboard.profile.updateFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="investor-dashboard-section investor-profile-page">
      <div className="investor-dashboard-page-header investor-profile-page-header">
        <div>
          <span className="investor-dashboard-overline">{t("investorProfile.account")}</span>
          <h1>{t("investorProfile.title")}</h1>
          <p>{t("investorProfile.description")}</p>
        </div>
      </div>

      <div className="investor-profile-cover">
        <div className="investor-profile-cover-pattern" />
        <div className="investor-profile-cover-content">
          <div className="investor-profile-avatar-wrap">
            <div className="investor-profile-avatar">
              {photo ? <img src={photo} alt={fullName} /> : fullName.charAt(0)}
            </div>
            <label className="investor-profile-avatar-edit" title={t("investorProfile.changePhotoTitle")}>
              <i className="bi bi-camera-fill" />
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => choosePhoto(event.target.files?.[0])}
              />
            </label>
          </div>

          <div className="investor-profile-identity">
            <h2>{fullName}</h2>
            <p>{email || "—"}</p>
            <div className="investor-profile-tags">
              <span>{profile?.type_investisseur || t("investorProfile.investor")}</span>
              {profile?.nom_entreprise && <span>{profile.nom_entreprise}</span>}
              {location && <span>{location}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="investor-profile-grid">
        <form className="investor-dashboard-card investor-profile-card investor-profile-edit-card" onSubmit={save}>
          <div className="investor-profile-card-heading">
            <div>
              <span>{t("investorProfile.editProfile")}</span>
              <h2>{t("investorProfile.accountInfo")}</h2>
            </div>
            <div className="investor-profile-heading-icon"><i className="bi bi-person-gear" /></div>
          </div>

          <div className="investor-profile-form-grid">
            <label>
              <span>{t("investorProfile.email")}</span>
              <div className="investor-profile-input-wrap">
                <i className="bi bi-envelope" />
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </div>
            </label>

            <label>
              <span>{t("investorProfile.phone")}</span>
              <div className="investor-profile-input-wrap">
                <i className="bi bi-telephone" />
                <input type="tel" value={telephone} onChange={(event) => setTelephone(event.target.value)} />
              </div>
            </label>
          </div>

          {error && <div className="investor-profile-alert error">{error}</div>}
          {message && <div className="investor-profile-alert success">{message}</div>}

          <div className="investor-profile-form-footer">
<button className="investor-profile-save" type="submit" disabled={saving}>
              <i className="bi bi-check2" />
              {saving ? t("investorProfile.saving") : t("investorProfile.save")}
            </button>
          </div>
        </form>

        <div className="investor-dashboard-card investor-profile-card">
          <div className="investor-profile-card-heading">
            <div>
              <span>{t("investorProfile.personalData")}</span>
              <h2>{t("investorProfile.userInfo")}</h2>
            </div>
            <div className="investor-profile-heading-icon"><i className="bi bi-person-vcard" /></div>
          </div>

          <div className="investor-profile-details">
            <div><span>{t("investorProfile.firstName")}</span><strong>{value(user?.prenom)}</strong></div>
            <div><span>{t("investorProfile.lastName")}</span><strong>{value(user?.nom)}</strong></div>
            <div><span>{t("investorProfile.email")}</span><strong dir="ltr">{value(user?.email)}</strong></div>
            <div><span>{t("investorProfile.phone")}</span><strong dir="ltr">{value(user?.telephone)}</strong></div>
            <div><span>{t("investorProfile.investorType")}</span><strong>{value(profile?.type_investisseur)}</strong></div>
            <div><span>{t("investorProfile.company")}</span><strong>{value(profile?.nom_entreprise)}</strong></div>
          </div>
        </div>

        <div className="investor-dashboard-card investor-profile-card">
          <div className="investor-profile-card-heading">
            <div>
              <span>{t("investorProfile.contactInfo")}</span>
              <h2>{t("investorProfile.addressData")}</h2>
            </div>
            <div className="investor-profile-heading-icon"><i className="bi bi-geo-alt" /></div>
          </div>

          <div className="investor-profile-details">
            <div><span>{t("investorProfile.wilaya")}</span><strong>{value(profile?.wilaya)}</strong></div>
            <div><span>{t("investorProfile.commune")}</span><strong>{value(profile?.commune)}</strong></div>
            <div className="is-wide"><span>{t("investorProfile.address")}</span><strong>{value(profile?.adresse)}</strong></div>
            <div className="is-wide"><span>{t("investorProfile.website")}</span><strong dir="ltr">{value(profile?.site_web)}</strong></div>
          </div>
        </div>

        <div className="investor-dashboard-card investor-profile-card">
          <div className="investor-profile-card-heading">
            <div>
              <span>{t("investorProfile.investmentData")}</span>
              <h2>{t("investorProfile.legalActivity")}</h2>
            </div>
            <div className="investor-profile-heading-icon"><i className="bi bi-building" /></div>
          </div>

          <div className="investor-profile-details">
            <div><span>{t("investorProfile.commercialRegister")}</span><strong>{value(profile?.registre_commerce)}</strong></div>
            <div><span>NIF</span><strong dir="ltr">{value(profile?.nif)}</strong></div>
            <div><span>NIS</span><strong dir="ltr">{value(profile?.nis)}</strong></div>
            <div><span>{t("investorProfile.activitySector")}</span><strong>{value(profile?.secteur_activite)}</strong></div>
            <div className="is-wide investor-profile-description"><span>{t("investorProfile.descriptionLabel")}</span><strong>{value(profile?.description)}</strong></div>
          </div>
        </div>
      </div>
    </section>
  );
}
