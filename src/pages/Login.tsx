import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "../i18n/I18nProvider";

function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError(t("loginPage.required"));
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/auth/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const responseText = await response.text();
      let data: { success?: boolean; message?: string; user?: Record<string, unknown> };
      try {
        data = JSON.parse(responseText) as typeof data;
      } catch {
        setError(t("loginPage.badResponse"));
        return;
      }

      if (!response.ok || !data.success) {
        setError(data.message || t("loginPage.invalid"));
        return;
      }
      if (!data.user) {
        setError(t("loginPage.noUser"));
        return;
      }

      localStorage.setItem("aapi_user", JSON.stringify(data.user));
      const role = String(data.user.role || "").trim().toLowerCase();

      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "agent") navigate("/agent/dashboard");
      else if (role === "investisseur" || role === "investor") navigate("/investor/dashboard");
      else setError(t("loginPage.unknownRole"));
    } catch (error) {
      console.error("Login connection error:", error);
      setError(error instanceof TypeError ? t("loginPage.connection") : t("loginPage.generic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-section">
        <div className="container">
          <div className="login-card">
            <div className="login-header">
              <div className="login-icon"><i className="bi bi-person-plus" aria-hidden="true" /></div>
              <span className="section-overline">{t("loginPage.space")}</span>
              <h1>{t("loginPage.title")}</h1>
              <p>{t("loginPage.intro")}</p>
            </div>

            {error && <div className="login-error"><i className="bi bi-exclamation-circle" /><span>{error}</span></div>}

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="login-field">
                <label htmlFor="login-email">{t("loginPage.email")}</label>
                <div className="login-input">
                  <i className="bi bi-envelope" />
                  <input id="login-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t("loginPage.emailPlaceholder")} autoComplete="email" disabled={loading} />
                </div>
              </div>

              <div className="login-field">
                <div className="login-label-row">
                  <label htmlFor="login-password">{t("loginPage.password")}</label>
                  <span className="login-forgot-placeholder">{t("loginPage.forgot")}</span>
                </div>
                <div className="login-input">
                  <i className="bi bi-lock" />
                  <input id="login-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t("loginPage.passwordPlaceholder")} autoComplete="current-password" disabled={loading} />
                  <button type="button" className="login-password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? t("loginPage.hide") : t("loginPage.show")} disabled={loading}>
                    <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"} />
                  </button>
                </div>
              </div>

              <div className="login-options">
                <label className="login-remember"><input type="checkbox" name="remember" /><span>{t("loginPage.remember")}</span></label>
              </div>

              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? <><span className="login-spinner" />{t("loginPage.loading")}</> : <>{t("loginPage.submit")}<i className="bi bi-arrow-left" /></>}
              </button>
            </form>

            <div className="login-register">
              <span>{t("loginPage.noAccount")}</span>
              <Link to="/inscription">{t("loginPage.register")}</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Login;
