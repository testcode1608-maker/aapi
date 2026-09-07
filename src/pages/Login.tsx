import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError(
        "يرجى إدخال البريد الإلكتروني وكلمة المرور."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost/aapi-api/auth/login.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      /* ======================================================
         قراءة الرد كنص أولاً
         ====================================================== */

      const responseText = await response.text();

      console.log(
        "Login HTTP status:",
        response.status
      );

      console.log(
        "Login response:",
        responseText
      );

      let data: {
        success?: boolean;
        message?: string;
        user?: Record<string, unknown>;
        error?: string;
      };

      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error(
          "Login JSON error:",
          jsonError
        );

        setError(
          "الخادم أرسل استجابة غير صحيحة. تحقق من ملف login.php."
        );

        return;
      }

      /* ======================================================
         ERREUR API
         ====================================================== */

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "البريد الإلكتروني أو كلمة المرور غير صحيحة."
        );

        return;
      }

      /* ======================================================
         VÉRIFIER USER
         ====================================================== */

      if (!data.user) {
        setError(
          "تم تسجيل الدخول ولكن بيانات المستخدم غير موجودة."
        );

        return;
      }

      /* ======================================================
         SAVE USER
         ====================================================== */

      localStorage.setItem(
        "aapi_user",
        JSON.stringify(data.user)
      );

      /* ======================================================
   REDIRECT حسب ROLE
   ====================================================== */

const userRole = String(data.user.role || "").toLowerCase();

if (userRole === "admin") {
  navigate("/admin/dashboard");
} else if (userRole === "agent") {
  navigate("/agent/dashboard");
} else if (userRole === "investisseur") {
  navigate("/investor/dashboard");
} else {
  setError("دور المستخدم غير معروف.");
  return;
}

    } catch (requestError) {
      console.error(
        "Login connection error:",
        requestError
      );

      if (
        requestError instanceof TypeError
      ) {
        setError(
          "تعذر الاتصال بخادم AAPI. تحقق من عنوان API و CORS."
        );
      } else {
        setError(
          "حدث خطأ أثناء تسجيل الدخول."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page" dir="rtl">

      <section className="login-section">

        <div className="container">

          <div className="login-card">

            <div className="login-header">

              <div className="login-icon">

                <i
                  className="bi bi-person-plus"
                  aria-hidden="true"
                ></i>

              </div>

              <span className="section-overline">
                فضاء المستثمر
              </span>

              <h1>
                تسجيل الدخول
              </h1>

              <p>
                قم بتسجيل الدخول للوصول إلى فضاء المستثمر الخاص بك.
              </p>

            </div>

            {error && (
              <div className="login-error">
                <i className="bi bi-exclamation-circle"></i>
                <span>{error}</span>
              </div>
            )}

            <form
              className="login-form"
              onSubmit={handleSubmit}
            >

              <div className="login-field">

                <label htmlFor="login-email">
                  البريد الإلكتروني
                </label>

                <div className="login-input">

                  <i className="bi bi-envelope"></i>

                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="أدخل بريدك الإلكتروني"
                    autoComplete="email"
                    disabled={loading}
                  />

                </div>

              </div>

              <div className="login-field">

                <div className="login-label-row">

                  <label htmlFor="login-password">
                    كلمة المرور
                  </label>

                  <Link to="/forgot-password">
                    نسيت كلمة المرور؟
                  </Link>

                </div>

                <div className="login-input">

                  <i className="bi bi-lock"></i>

                  <input
                    id="login-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="أدخل كلمة المرور"
                    autoComplete="current-password"
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label={
                      showPassword
                        ? "إخفاء كلمة المرور"
                        : "إظهار كلمة المرور"
                    }
                    disabled={loading}
                  >
                    <i
                      className={
                        showPassword
                          ? "bi bi-eye-slash"
                          : "bi bi-eye"
                      }
                    ></i>
                  </button>

                </div>

              </div>

              <div className="login-options">

                <label className="login-remember">

                  <input
                    type="checkbox"
                    name="remember"
                  />

                  <span>
                    تذكرني
                  </span>

                </label>

              </div>

              <button
                type="submit"
                className="login-submit"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="login-spinner"></span>
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  <>
                    تسجيل الدخول
                    <i className="bi bi-arrow-left"></i>
                  </>
                )}

              </button>

            </form>

            <div className="login-register">

              <span>
                ليس لديك حساب؟
              </span>

              <Link to="/inscription">
                التسجيل
              </Link>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

export default Login;