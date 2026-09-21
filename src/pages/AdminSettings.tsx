import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, UserRound, Save } from "lucide-react";
import { useTranslation } from "../i18n/I18nProvider";
import "../styles/main.css";
import "../styles/admin-quick-theme.css";
import "../styles/admin-theme.css";
import "../styles/admin-toolbar.css";
import "../styles/admin-soft-ui.css";
import "../styles/admin-layout-fix.css";
import "../styles/admin-soft-ui-overrides.css";
import "../styles/admin-navbar-overrides.css";
import "../styles/admin-language-switcher.css";
import AdminNavbar from "../components/admin/AdminNavbar";

type Account = {
  id?: number;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  role?: string;
  statut?: string;
  photo?: string | null;
};

function readAccount(): Account {
  try {
    return JSON.parse(localStorage.getItem("aapi_user") || "{}") as Account;
  } catch {
    return {};
  }
}

export default function AdminSettings() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [account, setAccount] = useState<Account>(() => readAccount());
  const [saved, setSaved] = useState(false);

  const user = readAccount();
  const direction = language === "ar" ? "rtl" : "ltr";

  const change = (key: keyof Account, value: string) => {
    setAccount(prev => ({ ...prev, [key]: value }));
  };

  const saveAccount = () => {
    const current = readAccount();
    const next = { ...current, ...account };
    localStorage.setItem("aapi_user", JSON.stringify(next));
    setAccount(next);
    setSaved(true);
    window.dispatchEvent(new CustomEvent("aapi-account-change"));
    window.setTimeout(() => setSaved(false), 2200);
  };

  const currentPage = t("admin.nav.settings");

  return (
    <div className={`administrator-shell ${open ? "admin-sidebar-open" : ""}`} dir={direction} lang={language}>
      <AdminNavbar onToggle={() => setOpen(v => !v)} />

      {open && (
        <button
          className="admin-navbar-overlay"
          aria-label={t("admin.nav.closeMenu")}
          onClick={() => setOpen(false)}
        />
      )}

      <div className="admin-main-content" dir={direction}>
        <header className="soft-admin-topbar" dir={direction}>
          <div className="soft-admin-breadcrumb">
            <span>{t("admin.topbar.agency")}</span>
            <b>/</b>
            <strong>{currentPage}</strong>
          </div>

          <div className="soft-admin-topbar-actions">
            <label className="soft-admin-search">
              <Search size={15} />
              <input
                placeholder={t("admin.topbar.search")}
                aria-label={t("admin.topbar.searchAria")}
              />
            </label>

            <button
              className="soft-admin-icon-button"
              aria-label={t("admin.topbar.notifications")}
              title={t("admin.topbar.notifications")}
            >
              <Bell size={17} />
            </button>

            <label
              className="admin-language-switcher"
              aria-label={t("common.language")}
              title={t("common.language")}
            >
              <span>{language.toUpperCase()}</span>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as "ar" | "fr" | "en")}
                aria-label={t("common.language")}
              >
                <option value="ar">العربية</option>
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </label>

            <div className="soft-admin-profile">
              <span>{String(user?.prenom ?? user?.nom ?? "A").slice(0, 1).toUpperCase()}</span>
              <div>
                <strong>
                  {`${user?.prenom ?? ""} ${user?.nom ?? ""}`.trim() || "Administrateur"}
                </strong>
                <small>{t("admin.brand.systemAdmin")}</small>
              </div>
            </div>
          </div>
        </header>

        <main className="admin-settings-main">
          <header className="admin-settings-header">
            <div>
              <span>{t("admin.settings.eyebrow")}</span>
              <h1>{t("admin.settings.title")}</h1>
              <p>{t("admin.settings.subtitle")}</p>
            </div>
          </header>

          <section className="admin-settings-card">
            <div className="admin-settings-title">
              <div className="admin-settings-title-icon">
                <UserRound size={22} />
              </div>
              <div>
                <h2>{t("admin.settings.account")}</h2>
                <p>{t("admin.settings.accountSubtitle")}</p>
              </div>
            </div>

            <div className="admin-account-form">
              <label>
                <span>{t("admin.settings.firstName")}</span>
                <input
                  placeholder={t("admin.settings.firstName")}
                  value={account.nom ?? ""}
                  onChange={e => change("nom", e.target.value)}
                />
              </label>

              <label>
                <span>{t("admin.settings.lastName")}</span>
                <input
                  placeholder={t("admin.settings.lastName")}
                  value={account.prenom ?? ""}
                  onChange={e => change("prenom", e.target.value)}
                />
              </label>

              <label>
                <span>{t("admin.settings.email")}</span>
                <input
                  placeholder="admin@aapi.dz"
                  type="email"
                  value={account.email ?? ""}
                  onChange={e => change("email", e.target.value)}
                />
              </label>

              <label>
                <span>{t("admin.settings.phone")}</span>
                <input
                  placeholder={t("admin.settings.phone")}
                  value={account.telephone ?? ""}
                  onChange={e => change("telephone", e.target.value)}
                />
              </label>

              <label>
                <span>{t("admin.settings.role")}</span>
                <input
                  readOnly
                  value={account.role === "admin" ? t("admin.settings.admin") : account.role ?? "—"}
                />
              </label>

              <label>
                <span>{t("admin.settings.accountStatus")}</span>
                <input
                  readOnly
                  value={account.statut === "actif" ? t("admin.settings.active") : account.statut ?? "—"}
                />
              </label>
            </div>

            <div className="admin-account-actions">
              <button type="button" onClick={saveAccount}>
                <Save size={16} />
                {saved ? t("admin.settings.saved") : t("admin.settings.save")}
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
