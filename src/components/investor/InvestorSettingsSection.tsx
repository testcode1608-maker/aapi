import { useTranslation } from "../../i18n/I18nProvider";
import type { DashboardUser } from "../../types/investorDashboard";

interface Props { user: DashboardUser | null; }

export default function InvestorSettingsSection({ user }: Props) {
  const { t } = useTranslation();
  const items = [
    ["bi-envelope", t("investorDashboard.settings.email"), user?.email || "—"],
    ["bi-person-badge", t("investorDashboard.settings.accountType"), t("investorDashboard.settings.investor")],
    ["bi-shield-check", t("investorDashboard.settings.accountStatus"), user?.statut === "actif" ? t("investorDashboard.settings.active") : user?.statut || "—"],
    ["bi-phone", t("investorDashboard.settings.phone"), user?.telephone || t("investorDashboard.settings.notRegistered")],
  ];
  return <section className="investor-dashboard-section"><div className="investor-dashboard-page-header"><div><span className="investor-dashboard-overline">{t("investorDashboard.settings.account")}</span><h1>{t("investorDashboard.settings.title")}</h1><p>{t("investorDashboard.settings.description")}</p></div></div><div className="investor-dashboard-card"><div className="investor-dashboard-settings-list">{items.map(([icon,label,value])=><div className="investor-dashboard-setting-item" key={label}><div className="investor-dashboard-setting-icon"><i className={`bi ${icon}`} /></div><div><strong>{label}</strong><span>{value}</span></div></div>)}</div></div></section>;
}
