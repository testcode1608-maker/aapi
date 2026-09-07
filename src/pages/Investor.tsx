import { Link } from "react-router-dom";

interface InvestorService {
  icon: string;
  number: string;
  title: string;
  text: string;
}

interface InvestorStep {
  number: string;
  icon: string;
  title: string;
  text: string;
}

interface InvestorDocument {
  icon: string;
  title: string;
  text: string;
}

function Investor() {
  const services: InvestorService[] = [
    {
      icon: "bi-person-workspace",
      number: "01",
      title: "مرافقة المستثمر",
      text: "الحصول على المعلومات والتوجيه اللازمين خلال مختلف مراحل المشروع الاستثماري.",
    },
    {
      icon: "bi-file-earmark-text",
      number: "02",
      title: "المعلومات والوثائق",
      text: "الوصول إلى مجموعة من الوثائق والمعلومات التي تساعدك على إعداد مشروعك.",
    },
    {
      icon: "bi-graph-up-arrow",
      number: "03",
      title: "فرص الاستثمار",
      text: "اكتشاف الفرص الاستثمارية المتاحة في مختلف القطاعات والمناطق.",
    },
    {
      icon: "bi-headset",
      number: "04",
      title: "الدعم والتوجيه",
      text: "الاستفادة من المعلومات والإرشادات التي تساعدك على اتخاذ قرارات أفضل.",
    },
  ];

  const steps: InvestorStep[] = [
    {
      number: "01",
      icon: "bi-lightbulb",
      title: "فكرة المشروع",
      text: "حدد فكرة مشروعك وادرس الإمكانات والفرص المتاحة.",
    },
    {
      number: "02",
      icon: "bi-search",
      title: "دراسة المشروع",
      text: "قم بدراسة السوق والقطاع وتحديد احتياجات المشروع.",
    },
    {
      number: "03",
      icon: "bi-file-earmark-check",
      title: "الإجراءات",
      text: "حضّر الوثائق واستكمل الإجراءات المطلوبة للمشروع.",
    },
    {
      number: "04",
      icon: "bi-building-check",
      title: "الإنجاز",
      text: "انتقل إلى مرحلة تجسيد المشروع ومتابعة تطوره.",
    },
  ];

  const documents: InvestorDocument[] = [
    {
      icon: "bi-file-earmark-pdf",
      title: "دليل المستثمر",
      text: "دليل عام يساعدك على التعرف على مختلف مراحل الاستثمار.",
    },
    {
      icon: "bi-journal-text",
      title: "الدليل العملي",
      text: "معلومات عملية حول المسار والإجراءات الخاصة بالمشروع.",
    },
    {
      icon: "bi-map",
      title: "دليل فرص الاستثمار",
      text: "مجموعة من المعلومات حول الفرص والإمكانات الاستثمارية.",
    },
    {
      icon: "bi-bar-chart",
      title: "المؤشرات الاستثمارية",
      text: "أرقام ومؤشرات تساعدك على فهم بيئة الاستثمار.",
    },
  ];

  return (
    <>
      {/* =========================================================
          HERO
      ========================================================= */}

      <section className="inner-hero investor-inner-hero">
        <div className="container">
          <div className="inner-hero-content">
            <span>خدمات المستثمر</span>

            <h1>فضاء المستثمر</h1>

            <p>
              كل ما تحتاجه لبدء مشروعك الاستثماري في الجزائر.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          INTRO
      ========================================================= */}

      <section className="investor-intro">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span className="section-overline">
                مرحبًا بك في فضاء المستثمر
              </span>

              <h2 className="investor-main-title">
                ابدأ مشروعك بثقة
                <strong> ووضوح</strong>
              </h2>

              <p className="investor-main-text">
                نوفر لك مجموعة من الخدمات والمعلومات التي تساعدك
                على فهم المسار الاستثماري واكتشاف الفرص المتاحة
                والاستفادة من المرافقة المناسبة لمشروعك.
              </p>

              <p className="investor-main-text">
                سواء كنت في مرحلة الفكرة أو بصدد إنجاز مشروع قائم،
                ستجد هنا موارد ومعلومات تساعدك على التقدم في مشروعك.
              </p>

              <div className="investor-intro-actions">
                <Link
                  to="/inscription"
                  className="aapi-primary-button"
                >
                  تسجيل مستثمر

                  <i
                    className="bi bi-person-plus"
                    aria-hidden="true"
                  ></i>
                </Link>

                <Link
                  to="/opportunities"
                  className="aapi-secondary-button"
                >
                  اكتشف فرص الاستثمار

                  <i
                    className="bi bi-arrow-left"
                    aria-hidden="true"
                  ></i>
                </Link>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="investor-intro-card">
                <div className="investor-intro-card-icon">
                  <i
                    className="bi bi-briefcase"
                    aria-hidden="true"
                  ></i>
                </div>

                <span>فضاء المستثمر</span>

                <strong>
                  من الفكرة
                  <br />
                  إلى الإنجاز
                </strong>

                <p>
                  معلومات، خدمات، فرص وأدلة لمساعدتك في مشروعك.
                </p>

                <div className="investor-card-decoration">
                  <i
                    className="bi bi-arrow-up-left"
                    aria-hidden="true"
                  ></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SERVICES
      ========================================================= */}

      <section
        className="investor-services"
        id="investor-services"
      >
        <div className="container">
          <div className="aapi-section-header centered">
            <span className="section-overline">
              خدمات المستثمر
            </span>

            <h2>
              خدمات تساعدك
              <strong> في مشروعك</strong>
            </h2>

            <p>
              مجموعة من الخدمات المصممة لتسهيل وصول المستثمر إلى
              المعلومات والموارد التي يحتاجها.
            </p>
          </div>

          <div className="row g-4">
            {services.map((service) => (
              <div
                className="col-xl-3 col-lg-6 col-md-6"
                key={service.number}
              >
                <article className="investor-service-card">
                  <div className="investor-service-top">
                    <span>{service.number}</span>

                    <div className="investor-service-icon">
                      <i
                        className={`bi ${service.icon}`}
                        aria-hidden="true"
                      ></i>
                    </div>
                  </div>

                  <h3>{service.title}</h3>

                  <p>{service.text}</p>

                  <a href="#investor-steps">
                    اكتشف المزيد

                    <i
                      className="bi bi-arrow-left"
                      aria-hidden="true"
                    ></i>
                  </a>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          STEPS
      ========================================================= */}

      <section
        className="investor-steps"
        id="investor-steps"
      >
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-5">
              <span className="section-overline">
                مسار الاستثمار
              </span>

              <h2 className="investor-steps-title">
                كيف تبدأ
                <strong> مشروعك؟</strong>
              </h2>

              <p className="investor-steps-intro">
                يمر المشروع الاستثماري بعدة مراحل أساسية. تعرف
                على المسار العام الذي يمكنك اتباعه من الفكرة إلى
                الإنجاز.
              </p>

              <Link
                to="/opportunities"
                className="aapi-primary-button"
              >
                استكشف الفرص

                <i
                  className="bi bi-arrow-left"
                  aria-hidden="true"
                ></i>
              </Link>
            </div>

            <div className="col-lg-7">
              <div className="investor-steps-list">
                {steps.map((step) => (
                  <article
                    className="investor-step-card"
                    key={step.number}
                  >
                    <div className="investor-step-number">
                      {step.number}
                    </div>

                    <div className="investor-step-icon">
                      <i
                        className={`bi ${step.icon}`}
                        aria-hidden="true"
                      ></i>
                    </div>

                    <div className="investor-step-content">
                      <h3>{step.title}</h3>

                      <p>{step.text}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          DOCUMENTS
      ========================================================= */}

      <section className="investor-documents">
        <div className="container">
          <div className="aapi-section-header">
            <div>
              <span className="section-overline">
                موارد المستثمر
              </span>

              <h2>
                أدلة ووثائق
                <strong> مفيدة لمشروعك</strong>
              </h2>
            </div>

            <p>
              يمكنك الاستفادة من مجموعة من الموارد التي تساعدك
              على فهم مختلف جوانب العملية الاستثمارية.
            </p>
          </div>

          <div className="row g-4">
            {documents.map((document) => (
              <div
                className="col-lg-6"
                key={document.title}
              >
                <article className="investor-document-card">
                  <div className="investor-document-icon">
                    <i
                      className={`bi ${document.icon}`}
                      aria-hidden="true"
                    ></i>
                  </div>

                  <div className="investor-document-content">
                    <h3>{document.title}</h3>

                    <p>{document.text}</p>

                    <a href="#">
                      الاطلاع على الوثيقة

                      <i
                        className="bi bi-arrow-left"
                        aria-hidden="true"
                      ></i>
                    </a>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          FAQ
      ========================================================= */}

      <section
        className="investor-faq"
        id="investor-faq"
      >
        <div className="container">
          <div className="aapi-section-header centered">
            <span className="section-overline">
              الأسئلة الشائعة
            </span>

            <h2>
              لديك سؤال؟
              <strong> ستجد الإجابة هنا</strong>
            </h2>

            <p>
              بعض الأسئلة الأساسية التي قد تساعدك قبل البدء
              في مشروعك الاستثماري.
            </p>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-9">
              <div
                className="accordion investor-accordion"
                id="investorAccordion"
              >
                {/* FAQ 1 */}

                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#faqOne"
                      aria-expanded="true"
                      aria-controls="faqOne"
                    >
                      كيف يمكنني التعرف على فرص الاستثمار؟
                    </button>
                  </h2>

                  <div
                    id="faqOne"
                    className="accordion-collapse collapse show"
                    data-bs-parent="#investorAccordion"
                  >
                    <div className="accordion-body">
                      يمكنك الاطلاع على مختلف الفرص والقطاعات
                      الاستثمارية من خلال فضاء فرص الاستثمار
                      والاطلاع على المعلومات الخاصة بكل مشروع.
                    </div>
                  </div>
                </div>

                {/* FAQ 2 */}

                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#faqTwo"
                      aria-expanded="false"
                      aria-controls="faqTwo"
                    >
                      ما هي أول خطوة لإنجاز مشروع استثماري؟
                    </button>
                  </h2>

                  <div
                    id="faqTwo"
                    className="accordion-collapse collapse"
                    data-bs-parent="#investorAccordion"
                  >
                    <div className="accordion-body">
                      تبدأ الخطوة الأولى بتحديد فكرة المشروع ودراسة
                      السوق والقطاع المستهدف ثم تحديد الاحتياجات
                      والإجراءات المتعلقة بالمشروع.
                    </div>
                  </div>
                </div>

                {/* FAQ 3 */}

                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#faqThree"
                      aria-expanded="false"
                      aria-controls="faqThree"
                    >
                      هل توجد خدمات لمرافقة المستثمر؟
                    </button>
                  </h2>

                  <div
                    id="faqThree"
                    className="accordion-collapse collapse"
                    data-bs-parent="#investorAccordion"
                  >
                    <div className="accordion-body">
                      نعم، يوفر فضاء المستثمر معلومات وخدمات تهدف
                      إلى توجيه المستثمر ومرافقته في مختلف مراحل
                      مشروعه.
                    </div>
                  </div>
                </div>

                {/* FAQ 4 */}

                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#faqFour"
                      aria-expanded="false"
                      aria-controls="faqFour"
                    >
                      أين يمكنني العثور على معلومات القطاعات؟
                    </button>
                  </h2>

                  <div
                    id="faqFour"
                    className="accordion-collapse collapse"
                    data-bs-parent="#investorAccordion"
                  >
                    <div className="accordion-body">
                      يمكنك الانتقال إلى صفحة قطاعات الاستثمار
                      للتعرف على أهم المجالات والقطاعات التي توفر
                      إمكانات وفرصًا استثمارية.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================= */}

      <section className="investor-final-cta">
        <div className="container">
          <div className="investor-final-cta-inner">
            <div>
              <span>جاهز للانطلاق؟</span>

              <h2>
                حوّل فكرتك إلى مشروع استثماري
              </h2>

              <p>
                اكتشف القطاعات والفرص المتاحة وابدأ رحلتك
                الاستثمارية.
              </p>
            </div>

            <div className="investor-final-actions">
              <Link
                to="/inscription"
                className="aapi-white-button"
              >
                تسجيل مستثمر

                <i
                  className="bi bi-person-plus"
                  aria-hidden="true"
                ></i>
              </Link>

              <Link
                to="/opportunities"
                className="aapi-outline-white-button"
              >
                فرص الاستثمار

                <i
                  className="bi bi-arrow-left"
                  aria-hidden="true"
                ></i>
              </Link>

              <Link
                to="/contact"
                className="aapi-outline-white-button"
              >
                اتصل بنا

                <i
                  className="bi bi-arrow-left"
                  aria-hidden="true"
                ></i>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Investor;