import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";

function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubmitted(true);

    window.setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  };

  return (
    <>
      {/* ============================================================
          HERO
          ============================================================ */}
      <section className="contact-inner-hero">
        <div className="container">
          <div className="contact-hero-content">
            <span>التواصل</span>

            <h1>اتصل بنا</h1>

            <div className="contact-breadcrumb">
              <Link to="/">الرئيسية</Link>

              <i
                className="bi bi-chevron-left"
                aria-hidden="true"
              ></i>

              <strong>اتصل بنا</strong>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          INTRO
          ============================================================ */}
      <section className="contact-intro">
        <div className="container">
          <div className="contact-intro-content">
            <span className="section-overline">
              نحن هنا لمساعدتك
            </span>

            <h2>
              تواصل معنا
              <strong> بكل سهولة</strong>
            </h2>

            <p>
              إذا كنت بحاجة إلى معلومات أو استفسارات حول الاستثمار
              والفرص الاستثمارية والخدمات المتاحة، يمكنك التواصل
              معنا من خلال النموذج أو معلومات الاتصال.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          CONTACT MAIN
          ============================================================ */}
      <section className="contact-main-section">
        <div className="container">
          <div className="row g-4 g-lg-5">
            {/* ======================================================
                CONTACT INFORMATION
                ====================================================== */}
            <div className="col-lg-5">
              <div className="contact-information">
                <div className="contact-info-header">
                  <span>معلومات الاتصال</span>

                  <h2>
                    نحن في
                    <strong> خدمتك</strong>
                  </h2>

                  <p>
                    يمكنك التواصل معنا عبر مختلف القنوات المتاحة
                    للحصول على المعلومات والتوجيه المناسب.
                  </p>
                </div>

                {/* ADDRESS */}
                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <i
                      className="bi bi-geo-alt"
                      aria-hidden="true"
                    ></i>
                  </div>

                  <div className="contact-info-text">
                    <span>العنوان</span>

                    <strong>
                      الجزائر العاصمة، الجزائر
                    </strong>

                    <p>
                      مقر الوكالة الجزائرية لترقية الاستثمار
                    </p>
                  </div>
                </div>

                {/* PHONE */}
                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <i
                      className="bi bi-telephone"
                      aria-hidden="true"
                    ></i>
                  </div>

                  <div className="contact-info-text">
                    <span>الهاتف</span>

                    <strong dir="ltr">
                      +213 21 00 00 00
                    </strong>

                    <p>
                      من الأحد إلى الخميس
                    </p>
                  </div>
                </div>

                {/* EMAIL */}
                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <i
                      className="bi bi-envelope"
                      aria-hidden="true"
                    ></i>
                  </div>

                  <div className="contact-info-text">
                    <span>البريد الإلكتروني</span>

                    <strong>
                      contact@example.dz
                    </strong>

                    <p>
                      نحرص على الرد على استفساراتكم
                    </p>
                  </div>
                </div>

                {/* HOURS */}
                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <i
                      className="bi bi-clock"
                      aria-hidden="true"
                    ></i>
                  </div>

                  <div className="contact-info-text">
                    <span>أوقات العمل</span>

                    <strong>
                      الأحد - الخميس
                    </strong>

                    <p>
                      08:00 - 16:30
                    </p>
                  </div>
                </div>

                {/* SOCIAL */}
                <div className="contact-social">
                  <span>تابعنا على</span>

                  <div className="contact-social-links">
                    <a
                      href="#"
                      aria-label="Facebook"
                    >
                      <i
                        className="bi bi-facebook"
                        aria-hidden="true"
                      ></i>
                    </a>

                    <a
                      href="#"
                      aria-label="LinkedIn"
                    >
                      <i
                        className="bi bi-linkedin"
                        aria-hidden="true"
                      ></i>
                    </a>

                    <a
                      href="#"
                      aria-label="YouTube"
                    >
                      <i
                        className="bi bi-youtube"
                        aria-hidden="true"
                      ></i>
                    </a>

                    <a
                      href="#"
                      aria-label="X"
                    >
                      <i
                        className="bi bi-twitter-x"
                        aria-hidden="true"
                      ></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* ======================================================
                FORM
                ====================================================== */}
            <div className="col-lg-7">
              <div className="contact-form-card">
                <div className="contact-form-header">
                  <div>
                    <span>أرسل لنا رسالة</span>

                    <h2>
                      كيف يمكننا
                      <strong> مساعدتك؟</strong>
                    </h2>
                  </div>

                  <div className="contact-form-header-icon">
                    <i
                      className="bi bi-send"
                      aria-hidden="true"
                    ></i>
                  </div>
                </div>

                {/* SUCCESS MESSAGE */}
                {submitted && (
                  <div
                    className="contact-success-message"
                    role="alert"
                    aria-live="polite"
                  >
                    <i
                      className="bi bi-check-circle-fill"
                      aria-hidden="true"
                    ></i>

                    <div>
                      <strong>
                        تم إرسال رسالتك بنجاح
                      </strong>

                      <span>
                        شكرًا لتواصلك معنا، سنقوم بمعالجة طلبك.
                      </span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    {/* NAME */}
                    <div className="col-md-6">
                      <label htmlFor="contact-name">
                        الاسم واللقب
                        <span>*</span>
                      </label>

                      <div className="contact-input-wrapper">
                        <i
                          className="bi bi-person"
                          aria-hidden="true"
                        ></i>

                        <input
                          id="contact-name"
                          name="name"
                          type="text"
                          className="form-control"
                          placeholder="أدخل الاسم واللقب"
                          autoComplete="name"
                          required
                        />
                      </div>
                    </div>

                    {/* EMAIL */}
                    <div className="col-md-6">
                      <label htmlFor="contact-email">
                        البريد الإلكتروني
                        <span>*</span>
                      </label>

                      <div className="contact-input-wrapper">
                        <i
                          className="bi bi-envelope"
                          aria-hidden="true"
                        ></i>

                        <input
                          id="contact-email"
                          name="email"
                          type="email"
                          className="form-control"
                          placeholder="example@email.com"
                          autoComplete="email"
                          required
                        />
                      </div>
                    </div>

                    {/* PHONE */}
                    <div className="col-md-6">
                      <label htmlFor="contact-phone">
                        رقم الهاتف
                      </label>

                      <div className="contact-input-wrapper">
                        <i
                          className="bi bi-telephone"
                          aria-hidden="true"
                        ></i>

                        <input
                          id="contact-phone"
                          name="phone"
                          type="tel"
                          className="form-control"
                          placeholder="+213"
                          autoComplete="tel"
                        />
                      </div>
                    </div>

                    {/* SUBJECT */}
                    <div className="col-md-6">
                      <label htmlFor="contact-subject">
                        موضوع الرسالة
                        <span>*</span>
                      </label>

                      <div className="contact-input-wrapper">
                        <i
                          className="bi bi-chat-left-text"
                          aria-hidden="true"
                        ></i>

                        <select
                          id="contact-subject"
                          name="subject"
                          className="form-select"
                          defaultValue=""
                          required
                        >
                          <option
                            value=""
                            disabled
                          >
                            اختر موضوع الرسالة
                          </option>

                          <option value="investment">
                            فرص الاستثمار
                          </option>

                          <option value="investor">
                            استفسار المستثمر
                          </option>

                          <option value="project">
                            مشروع استثماري
                          </option>

                          <option value="information">
                            طلب معلومات
                          </option>

                          <option value="other">
                            موضوع آخر
                          </option>
                        </select>
                      </div>
                    </div>

                    {/* MESSAGE */}
                    <div className="col-12">
                      <label htmlFor="contact-message">
                        الرسالة
                        <span>*</span>
                      </label>

                      <div className="contact-input-wrapper contact-textarea-wrapper">
                        <i
                          className="bi bi-pencil-square"
                          aria-hidden="true"
                        ></i>

                        <textarea
                          id="contact-message"
                          name="message"
                          className="form-control"
                          rows={7}
                          placeholder="اكتب رسالتك هنا..."
                          required
                        ></textarea>
                      </div>
                    </div>

                    {/* CHECKBOX */}
                    <div className="col-12">
                      <div className="contact-consent">
                        <input
                          id="contact-consent"
                          name="consent"
                          type="checkbox"
                          required
                        />

                        <label htmlFor="contact-consent">
                          أوافق على معالجة المعلومات المقدمة
                          من أجل الرد على طلبي.
                        </label>
                      </div>
                    </div>

                    {/* BUTTON */}
                    <div className="col-12">
                      <button
                        type="submit"
                        className="contact-submit-button"
                      >
                        إرسال الرسالة

                        <i
                          className="bi bi-arrow-left"
                          aria-hidden="true"
                        ></i>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          MAP / LOCATION
          ============================================================ */}
      <section className="contact-location-section">
        <div className="container">
          <div className="contact-section-heading">
            <span className="section-overline">
              موقعنا
            </span>

            <h2>
              أين
              <strong> تجدنا؟</strong>
            </h2>

            <p>
              يمكنك زيارة مقر الوكالة أو التواصل معنا عبر
              قنوات الاتصال المتاحة.
            </p>
          </div>

          <div className="contact-map-wrapper">
            <div className="contact-map-placeholder">
              <div className="contact-map-pattern"></div>

              <div className="contact-map-content">
                <div className="contact-map-pin">
                  <i
                    className="bi bi-geo-alt-fill"
                    aria-hidden="true"
                  ></i>
                </div>

                <h3>
                  الوكالة الجزائرية لترقية الاستثمار
                </h3>

                <p>
                  الجزائر العاصمة، الجزائر
                </p>

                <a
                  href="https://www.google.com/maps"
                  target="_blank"
                  rel="noreferrer"
                  className="contact-map-button"
                >
                  فتح الخريطة

                  <i
                    className="bi bi-arrow-left"
                    aria-hidden="true"
                  ></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          CTA
          ============================================================ */}
      <section className="contact-cta">
        <div className="container">
          <div className="contact-cta-content">
            <div>
              <span>
                ابدأ مشروعك الاستثماري
              </span>

              <h2>
                اكتشف فرص الاستثمار المتاحة
              </h2>

              <p>
                اطلع على مختلف الفرص والمشاريع الاستثمارية
                واختر المجال المناسب لمشروعك.
              </p>
            </div>

            <Link
              to="/opportunities"
              className="contact-cta-button"
            >
              استكشف فرص الاستثمار

              <i
                className="bi bi-arrow-left"
                aria-hidden="true"
              ></i>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default Contact;