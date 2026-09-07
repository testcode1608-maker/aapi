import { Link } from "react-router-dom";

function Agency() {
  return (
    <main className="agency-page">

      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="agency-hero">
        <div className="container">
          <div className="agency-hero-content">

            <span className="agency-overline">
              الوكالة
            </span>

            <h1>
              وكالة متخصصة في
              <strong> دعم وتطوير الاستثمار</strong>
            </h1>

            <p>
              نعمل على توفير بيئة مناسبة للمستثمرين ومرافقة
              المشاريع الاستثمارية من الفكرة إلى الإنجاز.
            </p>

            <div className="agency-breadcrumb">
              <Link to="/">
                الرئيسية
              </Link>

              <i
                className="bi bi-chevron-left"
                aria-hidden="true"
              ></i>

              <span>
                الوكالة
              </span>
            </div>

          </div>
        </div>
      </section>


      {/* =====================================================
          INTRODUCTION
          ===================================================== */}

      <section className="agency-introduction">
        <div className="container">

          <div className="row align-items-center g-5">

            <div className="col-lg-6">

              <div className="agency-section-heading">

                <span className="agency-section-overline">
                  من نحن
                </span>

                <h2>
                  شريكك في
                  <strong> رحلة الاستثمار</strong>
                </h2>

              </div>

              <p className="agency-intro-text">
                تمثل الوكالة فضاءً مؤسساتيًا يهدف إلى تسهيل
                وتطوير الاستثمار، من خلال توفير المعلومات
                الضرورية ومرافقة المستثمرين وأصحاب المشاريع.
              </p>

              <p className="agency-intro-text">
                نحرص على تعزيز التواصل مع المستثمرين وتوجيههم
                نحو الفرص المتاحة، مع العمل على تحسين جودة
                الخدمات وتبسيط الإجراءات المرتبطة بالمشاريع
                الاستثمارية.
              </p>

              <Link
                to="/investor"
                className="agency-primary-button"
              >
                تعرف على خدمات المستثمر

                <i
                  className="bi bi-arrow-left"
                  aria-hidden="true"
                ></i>
              </Link>

            </div>


            <div className="col-lg-6">

              <div className="agency-intro-card">

                <div className="agency-intro-card-icon">
                  <i
                    className="bi bi-buildings"
                    aria-hidden="true"
                  ></i>
                </div>

                <span>
                  رؤية مؤسساتية
                </span>

                <h3>
                  نحو بيئة استثمارية أكثر
                  <strong> تنافسية واستدامة</strong>
                </h3>

                <p>
                  نساهم في خلق مناخ أعمال يساعد على إطلاق
                  المشاريع وتوسيع الاستثمارات ودعم التنمية
                  الاقتصادية.
                </p>

                <div className="agency-card-line"></div>

                <div className="agency-card-number">
                  <strong>01</strong>
                  <span>
                    دعم المستثمر
                  </span>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          MISSION
          ===================================================== */}

      <section className="agency-mission">
        <div className="container">

          <div className="agency-centered-heading">

            <span className="agency-section-overline">
              مهمتنا
            </span>

            <h2>
              ماذا نقدم
              <strong> للمستثمر؟</strong>
            </h2>

            <p>
              مجموعة من الخدمات التي تهدف إلى تسهيل الوصول
              إلى المعلومات والفرص الاستثمارية.
            </p>

          </div>


          <div className="row g-4 agency-services-grid">

            <div className="col-lg-4 col-md-6">
              <div className="agency-service-card">

                <span className="agency-service-number">
                  01
                </span>

                <div className="agency-service-icon">
                  <i
                    className="bi bi-info-circle"
                    aria-hidden="true"
                  ></i>
                </div>

                <h3>
                  توفير المعلومات
                </h3>

                <p>
                  توفير معلومات واضحة حول القطاعات والفرص
                  والمشاريع الاستثمارية المتاحة.
                </p>

              </div>
            </div>


            <div className="col-lg-4 col-md-6">
              <div className="agency-service-card">

                <span className="agency-service-number">
                  02
                </span>

                <div className="agency-service-icon">
                  <i
                    className="bi bi-headset"
                    aria-hidden="true"
                  ></i>
                </div>

                <h3>
                  مرافقة المستثمر
                </h3>

                <p>
                  توجيه المستثمر ومرافقته خلال مختلف مراحل
                  تطوير مشروعه الاستثماري.
                </p>

              </div>
            </div>


            <div className="col-lg-4 col-md-6">
              <div className="agency-service-card">

                <span className="agency-service-number">
                  03
                </span>

                <div className="agency-service-icon">
                  <i
                    className="bi bi-graph-up-arrow"
                    aria-hidden="true"
                  ></i>
                </div>

                <h3>
                  تطوير الاستثمار
                </h3>

                <p>
                  المساهمة في تعزيز المشاريع ورفع جاذبية
                  القطاعات الاستثمارية.
                </p>

              </div>
            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          VALUES
          ===================================================== */}

      <section className="agency-values">
        <div className="container">

          <div className="row align-items-center g-5">

            <div className="col-lg-5">

              <span className="agency-section-overline">
                قيمنا
              </span>

              <h2 className="agency-values-title">
                مبادئنا أساس
                <strong> نجاحنا</strong>
              </h2>

              <p className="agency-values-text">
                نعمل وفق مجموعة من المبادئ التي تضع المستثمر
                وجودة الخدمة في صميم عملنا.
              </p>

            </div>


            <div className="col-lg-7">

              <div className="row g-3">

                <div className="col-md-6">
                  <div className="agency-value-item">

                    <i
                      className="bi bi-shield-check"
                      aria-hidden="true"
                    ></i>

                    <div>
                      <h3>
                        الثقة
                      </h3>

                      <p>
                        علاقة مؤسساتية مبنية على الثقة.
                      </p>
                    </div>

                  </div>
                </div>


                <div className="col-md-6">
                  <div className="agency-value-item">

                    <i
                      className="bi bi-lightning-charge"
                      aria-hidden="true"
                    ></i>

                    <div>
                      <h3>
                        الفعالية
                      </h3>

                      <p>
                        خدمات عملية وسريعة للمستثمر.
                      </p>
                    </div>

                  </div>
                </div>


                <div className="col-md-6">
                  <div className="agency-value-item">

                    <i
                      className="bi bi-people"
                      aria-hidden="true"
                    ></i>

                    <div>
                      <h3>
                        الشراكة
                      </h3>

                      <p>
                        التعاون مع المستثمرين وأصحاب المشاريع.
                      </p>
                    </div>

                  </div>
                </div>


                <div className="col-md-6">
                  <div className="agency-value-item">

                    <i
                      className="bi bi-recycle"
                      aria-hidden="true"
                    ></i>

                    <div>
                      <h3>
                        الاستدامة
                      </h3>

                      <p>
                        دعم استثمارات طويلة المدى.
                      </p>
                    </div>

                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          CTA
          ===================================================== */}

      <section className="agency-final-cta">
        <div className="container">

          <div className="agency-final-cta-inner">

            <div>

              <span>
                فرص الاستثمار
              </span>

              <h2>
                هل لديك مشروع استثماري؟
              </h2>

              <p>
                اكتشف القطاعات والفرص المتاحة وابدأ رحلتك
                الاستثمارية.
              </p>

            </div>

            <Link
              to="/opportunities"
              className="agency-final-button"
            >
              اكتشف الفرص

              <i
                className="bi bi-arrow-left"
                aria-hidden="true"
              ></i>
            </Link>

          </div>

        </div>
      </section>

    </main>
  );
}

export default Agency;