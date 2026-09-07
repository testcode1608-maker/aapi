import {
  useState,
  type FormEvent,
} from "react";

import { Link } from "react-router-dom";

/* ============================================================
   TYPES
   ============================================================ */

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

/* ============================================================
   COMPONENT
   ============================================================ */

function InvestorRegistration() {
  const [submitted, setSubmitted] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /* ============================================================
     SUBMIT
     ============================================================ */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    const form =
      event.currentTarget;

    const formData =
      new FormData(form);

    /* ==========================================================
       FORM DATA
       ========================================================== */

    const firstName =
      String(
        formData.get("firstName") || ""
      ).trim();

    const lastName =
      String(
        formData.get("lastName") || ""
      ).trim();

    const email =
      String(
        formData.get("email") || ""
      ).trim();

    const phone =
      String(
        formData.get("phone") || ""
      ).trim();

    const investorType =
      String(
        formData.get("investorType") || ""
      ).trim();

    const activity =
      String(
        formData.get("activity") || ""
      ).trim();

    const wilaya =
      String(
        formData.get("wilaya") || ""
      ).trim();

    const projectName =
      String(
        formData.get("projectName") || ""
      ).trim();

    const projectDescription =
      String(
        formData.get("projectDescription") || ""
      ).trim();

    const password =
      String(
        formData.get("password") || ""
      );

    const confirmPassword =
      String(
        formData.get("confirmPassword") || ""
      );

    /* ==========================================================
       VALIDATION
       ========================================================== */

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !investorType ||
      !activity ||
      !wilaya ||
      !password ||
      !confirmPassword
    ) {
      setError(
        "يرجى ملء جميع الحقول الإلزامية."
      );

      return;
    }

    if (password.length < 8) {
      setError(
        "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل."
      );

      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "كلمتا المرور غير متطابقتين."
      );

      return;
    }

    /* ==========================================================
       START LOADING
       ========================================================== */

    setLoading(true);

    try {
      /* ========================================================
         REQUEST
         ======================================================== */

      const response =
        await fetch(
  "http://127.0.0.1/aapi-api/auth/register.php",
          {
            method: "POST",

            headers: {
  "Content-Type": "application/json",
},

            body: JSON.stringify({
              nom: lastName,

              prenom: firstName,

              email,

              telephone: phone,

              type_investisseur:
                investorType,

              secteur_activite:
                activity,

              wilaya,

              nom_entreprise:
                projectName || null,

              description:
                projectDescription ||
                null,

              password,

              confirm_password:
                confirmPassword,
            }),
          }
        );

      /* ========================================================
         READ RESPONSE
         ======================================================== */

      const responseText =
        await response.text();

      let data:
        RegistrationResponse;

      try {
        data =
          JSON.parse(
            responseText
          );
      } catch {
        throw new Error(
          "Le serveur a retourné une réponse invalide."
        );
      }

      /* ========================================================
         API ERROR
         ======================================================== */

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "حدث خطأ أثناء إنشاء الحساب."
        );
      }

      /* ========================================================
         SUCCESS
         ======================================================== */

      setSubmitted(true);

      form.reset();

    } catch (requestError) {

      /* ========================================================
         FETCH ERROR
         ======================================================== */

      if (
        requestError instanceof TypeError &&
        requestError.message ===
          "Failed to fetch"
      ) {
        setError(
          "تعذر الاتصال بخادم AAPI. تأكد من تشغيل Apache في WAMP وأن عنوان API صحيح."
        );
      } else if (
        requestError instanceof Error
      ) {
        setError(
          requestError.message
        );
      } else {
        setError(
          "تعذر الاتصال بالخادم."
        );
      }

    } finally {

      setLoading(false);
    }
  };

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <>
      {/* =========================================================
          HERO
      ========================================================= */}

      {/* =========================================================
          REGISTRATION
      ========================================================= */}

      <section className="investor-registration-section">

        <div className="container">

          <div className="row justify-content-center">

            <div className="col-xl-9 col-lg-10">

              <div className="investor-registration-card">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="investor-registration-header">

                  <div className="investor-registration-icon">

                    <i
                      className="bi bi-person-plus"
                      aria-hidden="true"
                    ></i>

                  </div>

                  <div>

                    <span className="section-overline">
                      إنشاء حساب جديد
                    </span>

                    <h2>
                      سجل كمستثمر
                      <strong>
                        {" "}
                        وابدأ رحلتك
                      </strong>
                    </h2>

                    <p>
                      أدخل معلوماتك الأساسية لإنشاء حساب المستثمر.
                    </p>

                  </div>

                </div>

                {/* =================================================
                    SUCCESS
                ================================================= */}

                {submitted ? (

                  <div className="investor-registration-success">

                    <div className="investor-registration-success-icon">

                      <i
                        className="bi bi-check-lg"
                        aria-hidden="true"
                      ></i>

                    </div>

                    <h3>
                      تم إنشاء الحساب بنجاح
                    </h3>

                    <p>
                      شكرًا لك. تم إنشاء حساب المستثمر
                      وتسجيل معلوماتك بنجاح في منصة AAPI.
                      يمكنك الآن تسجيل الدخول إلى فضاء المستثمر.
                    </p>

                    <div className="investor-registration-success-actions">

                      <Link
                        to="/login"
                        className="aapi-primary-button"
                      >
                        تسجيل الدخول

                        <i
                          className="bi bi-arrow-left"
                          aria-hidden="true"
                        ></i>

                      </Link>

                      <Link
                        to="/investor"
                        className="aapi-secondary-button"
                      >
                        العودة إلى فضاء المستثمر

                        <i
                          className="bi bi-arrow-left"
                          aria-hidden="true"
                        ></i>

                      </Link>

                    </div>

                  </div>

                ) : (

                  <form
                    className="investor-registration-form"
                    onSubmit={
                      handleSubmit
                    }
                  >

                    {/* =================================================
                        ERROR
                    ================================================= */}

                    {error && (

                      <div
                        role="alert"
                        style={{
                          marginBottom:
                            "24px",

                          padding:
                            "14px 18px",

                          borderRadius:
                            "10px",

                          background:
                            "#fff1f2",

                          color:
                            "#b42318",

                          border:
                            "1px solid #fecdca",
                        }}
                      >

                        <i
                          className="bi bi-exclamation-circle"
                          style={{
                            marginLeft:
                              "8px",
                          }}
                        ></i>

                        {error}

                      </div>

                    )}

                    {/* =================================================
                        PERSONAL INFORMATION
                    ================================================= */}

                    <div className="investor-registration-block">

                      <div className="investor-registration-block-title">

                        <span>
                          01
                        </span>

                        <div>

                          <h3>
                            المعلومات الشخصية
                          </h3>

                          <p>
                            أدخل معلومات صاحب الحساب.
                          </p>

                        </div>

                      </div>

                      <div className="row g-4">

                        {/* FIRST NAME */}

                        <div className="col-md-6">

                          <label htmlFor="firstName">
                            الاسم{" "}
                            <span>*</span>
                          </label>

                          <div className="investor-registration-input">

                            <i
                              className="bi bi-person"
                              aria-hidden="true"
                            ></i>

                            <input
                              id="firstName"
                              name="firstName"
                              type="text"
                              placeholder="أدخل الاسم"
                              autoComplete="given-name"
                              required
                            />

                          </div>

                        </div>

                        {/* LAST NAME */}

                        <div className="col-md-6">

                          <label htmlFor="lastName">
                            اللقب{" "}
                            <span>*</span>
                          </label>

                          <div className="investor-registration-input">

                            <i
                              className="bi bi-person"
                              aria-hidden="true"
                            ></i>

                            <input
                              id="lastName"
                              name="lastName"
                              type="text"
                              placeholder="أدخل اللقب"
                              autoComplete="family-name"
                              required
                            />

                          </div>

                        </div>

                        {/* EMAIL */}

                        <div className="col-md-6">

                          <label htmlFor="email">
                            البريد الإلكتروني{" "}
                            <span>*</span>
                          </label>

                          <div className="investor-registration-input">

                            <i
                              className="bi bi-envelope"
                              aria-hidden="true"
                            ></i>

                            <input
                              id="email"
                              name="email"
                              type="email"
                              placeholder="example@email.com"
                              autoComplete="email"
                              required
                            />

                          </div>

                        </div>

                        {/* PHONE */}

                        <div className="col-md-6">

                          <label htmlFor="phone">
                            رقم الهاتف{" "}
                            <span>*</span>
                          </label>

                          <div className="investor-registration-input">

                            <i
                              className="bi bi-telephone"
                              aria-hidden="true"
                            ></i>

                            <input
                              id="phone"
                              name="phone"
                              type="tel"
                              placeholder="05 XX XX XX XX"
                              autoComplete="tel"
                              required
                            />

                          </div>

                        </div>

                      </div>

                    </div>

                    {/* =================================================
                        INVESTOR INFORMATION
                    ================================================= */}

                    <div className="investor-registration-block">

                      <div className="investor-registration-block-title">

                        <span>
                          02
                        </span>

                        <div>

                          <h3>
                            معلومات المستثمر
                          </h3>

                          <p>
                            معلومات مرتبطة بطبيعة نشاطك ومشروعك.
                          </p>

                        </div>

                      </div>

                      <div className="row g-4">

                        {/* INVESTOR TYPE */}

                        <div className="col-md-6">

                          <label htmlFor="investorType">
                            نوع المستثمر{" "}
                            <span>*</span>
                          </label>

                          <div className="investor-registration-input">

                            <i
                              className="bi bi-briefcase"
                              aria-hidden="true"
                            ></i>

                            <select
                              id="investorType"
                              name="investorType"
                              required
                              defaultValue=""
                            >

                              <option
                                value=""
                                disabled
                              >
                                اختر نوع المستثمر
                              </option>

                              <option value="personne_physique">
                                شخص طبيعي
                              </option>

                              <option value="personne_morale">
                                شركة / مؤسسة
                              </option>

                              <option value="institution">
                                مؤسسة / هيئة
                              </option>

                              <option value="investisseur_etranger">
                                مستثمر أجنبي
                              </option>

                            </select>

                          </div>

                        </div>

                        {/* ACTIVITY */}

                        <div className="col-md-6">

                          <label htmlFor="activity">
                            مجال النشاط{" "}
                            <span>*</span>
                          </label>

                          <div className="investor-registration-input">

                            <i
                              className="bi bi-diagram-3"
                              aria-hidden="true"
                            ></i>

                            <select
                              id="activity"
                              name="activity"
                              required
                              defaultValue=""
                            >

                              <option
                                value=""
                                disabled
                              >
                                اختر مجال النشاط
                              </option>

                              <option value="الصناعة">
                                الصناعة
                              </option>

                              <option value="الفلاحة">
                                الفلاحة
                              </option>

                              <option value="الطاقة">
                                الطاقة
                              </option>

                              <option value="التكنولوجيا">
                                التكنولوجيا
                              </option>

                              <option value="السياحة">
                                السياحة
                              </option>

                              <option value="النقل واللوجستيك">
                                النقل واللوجستيك
                              </option>

                              <option value="قطاع آخر">
                                قطاع آخر
                              </option>

                            </select>

                          </div>

                        </div>

                        {/* WILAYA */}

                        <div className="col-md-6">

                          <label htmlFor="wilaya">
                            الولاية{" "}
                            <span>*</span>
                          </label>

                          <div className="investor-registration-input">

                            <i
                              className="bi bi-geo-alt"
                              aria-hidden="true"
                            ></i>

                            <select
                              id="wilaya"
                              name="wilaya"
                              required
                              defaultValue=""
                            >

                              <option
                                value=""
                                disabled
                              >
                                اختر الولاية
                              </option>

                              <option value="الجزائر">
                                الجزائر
                              </option>

                              <option value="وهران">
                                وهران
                              </option>

                              <option value="قسنطينة">
                                قسنطينة
                              </option>

                              <option value="البليدة">
                                البليدة
                              </option>

                              <option value="سطيف">
                                سطيف
                              </option>

                              <option value="بسكرة">
                                بسكرة
                              </option>

                              <option value="ولاية أخرى">
                                ولاية أخرى
                              </option>

                            </select>

                          </div>

                        </div>

                        {/* PROJECT NAME */}

                        <div className="col-md-6">

                          <label htmlFor="projectName">
                            اسم المشروع
                          </label>

                          <div className="investor-registration-input">

                            <i
                              className="bi bi-building"
                              aria-hidden="true"
                            ></i>

                            <input
                              id="projectName"
                              name="projectName"
                              type="text"
                              placeholder="اسم المشروع إن وجد"
                            />

                          </div>

                        </div>

                        {/* PROJECT DESCRIPTION */}

                        <div className="col-12">

                          <label htmlFor="projectDescription">
                            نبذة عن المشروع
                          </label>

                          <div className="investor-registration-textarea">

                            <textarea
                              id="projectDescription"
                              name="projectDescription"
                              rows={5}
                              placeholder="اكتب نبذة مختصرة عن مشروعك..."
                            ></textarea>

                          </div>

                        </div>

                      </div>

                    </div>

                    {/* =================================================
                        ACCOUNT INFORMATION
                    ================================================= */}

                    <div className="investor-registration-block">

                      <div className="investor-registration-block-title">

                        <span>
                          03
                        </span>

                        <div>

                          <h3>
                            بيانات الدخول
                          </h3>

                          <p>
                            استخدم هذه المعلومات للدخول إلى حسابك.
                          </p>

                        </div>

                      </div>

                      <div className="row g-4">

                        {/* PASSWORD */}

                        <div className="col-md-6">

                          <label htmlFor="password">
                            كلمة المرور{" "}
                            <span>*</span>
                          </label>

                          <div className="investor-registration-input">

                            <i
                              className="bi bi-lock"
                              aria-hidden="true"
                            ></i>

                            <input
                              id="password"
                              name="password"
                              type="password"
                              placeholder="أدخل كلمة المرور"
                              minLength={8}
                              autoComplete="new-password"
                              required
                            />

                          </div>

                        </div>

                        {/* CONFIRM PASSWORD */}

                        <div className="col-md-6">

                          <label htmlFor="confirmPassword">
                            تأكيد كلمة المرور{" "}
                            <span>*</span>
                          </label>

                          <div className="investor-registration-input">

                            <i
                              className="bi bi-shield-check"
                              aria-hidden="true"
                            ></i>

                            <input
                              id="confirmPassword"
                              name="confirmPassword"
                              type="password"
                              placeholder="أعد إدخال كلمة المرور"
                              minLength={8}
                              autoComplete="new-password"
                              required
                            />

                          </div>

                        </div>

                      </div>

                    </div>

                    {/* =================================================
                        CONSENT
                    ================================================= */}

                    <div className="investor-registration-consent">

                      <label>

                        <input
                          type="checkbox"
                          name="consent"
                          required
                        />

                        <span>
                          أوافق على معالجة المعلومات المقدمة من أجل
                          إنشاء حساب المستثمر والاستفادة من الخدمات
                          المتاحة.
                        </span>

                      </label>

                    </div>

                    {/* =================================================
                        ACTIONS
                    ================================================= */}

                    <div className="investor-registration-actions">

                      <button
                        type="submit"
                        className="aapi-primary-button investor-registration-submit"
                        disabled={loading}
                      >

                        {loading ? (

                          <>
                            <i
                              className="bi bi-arrow-repeat"
                            />

                            جاري إنشاء الحساب...
                          </>

                        ) : (

                          <>
                            إنشاء حساب المستثمر

                            <i
                              className="bi bi-arrow-left"
                            />
                          </>

                        )}

                      </button>

                      <Link
                        to="/login"
                        className="aapi-secondary-button"
                      >
                        تسجيل الدخول
                      </Link>

                    </div>

                  </form>

                )}

              </div>

            </div>

          </div>

        </div>

      </section>
    </>
  );
}

export default InvestorRegistration;