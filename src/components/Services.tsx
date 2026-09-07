import { Link } from "react-router-dom";

function Services() {
  const services = [
    {
      icon: "bi-laptop",
      number: "01",
      title: "المنصة الرقمية للمستثمر",
      text: "استفد من الخدمات الرقمية والمعلومات الخاصة بمسار الاستثمار وتسيير الملفات بكل سلاسة.",
      link: "/investor",
    },
    {
      icon: "bi-briefcase",
      number: "02",
      title: "حقيبة المستثمر",
      text: "كل الوثائق والمعلومات الأساسية والنصوص التنظيمية التي يحتاجها المستثمر.",
      link: "/investor#investor-services",
    },
    {
      icon: "bi-bar-chart-line",
      number: "03",
      title: "فرص الاستثمار",
      text: "اكتشف المشاريع والفرص الاستثمارية الواعدة في مختلف القطاعات والمناطق.",
      link: "/opportunities",
    },
    {
      icon: "bi-book",
      number: "04",
      title: "الدليل العملي للمستثمر",
      text: "دليل شامل ومبسط يساعدك على فهم مختلف مراحل وإجراءات إنجاز مشروعك.",
      link: "/investor#investor-steps",
    },
  ];

  return (
    <section
      className="services-aapi"
      id="services"
    >
      <div className="container">

        {/* ========================================================
            SECTION HEADER
            ======================================================== */}

        <div className="aapi-section-header">

          <div>

            <span className="section-overline">
              خدمات المستثمر
            </span>

            <h2>
              خدمات مصممة
              <br />
              <strong>
                لتسهيل استثمارك
              </strong>
            </h2>

          </div>

          <p>
            توفر الوكالة الجزائرية لترقية الاستثمار مجموعة من الخدمات والمعلومات لمرافقة المستثمر في مختلف مراحل مشروعه الاستثماري.
          </p>

        </div>

        {/* ========================================================
            SERVICES
            ======================================================== */}

        <div className="row g-4">

          {services.map((service) => (
            <div
              className="col-xl-3 col-lg-6 col-md-6"
              key={service.number}
            >
              <article className="aapi-service-card">

                <div className="service-card-top">

                  <span className="service-number">
                    {service.number}
                  </span>

                  <div className="service-card-icon">
                    <i
                      className={`bi ${service.icon}`}
                    ></i>
                  </div>

                </div>

                <h3>
                  {service.title}
                </h3>

                <p>
                  {service.text}
                </p>

                <Link to={service.link}>
                  اكتشف الخدمة
                  <i className="bi bi-arrow-left"></i>
                </Link>

              </article>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}

export default Services;