
import { Link } from "react-router-dom";

function Sectors() {
  const sectors = [
    {
      icon: "bi-buildings",
      number: "01",
      title: "الصناعة",
      text: "فرص استثمارية متنوعة في مختلف الأنشطة الصناعية، مع إمكانات واسعة للتطوير والإنتاج.",
    },
    {
      icon: "bi-tree",
      number: "02",
      title: "الفلاحة",
      text: "إمكانات كبيرة للاستثمار في الفلاحة، الصناعات الغذائية، وتثمين المنتجات الزراعية.",
    },
    {
      icon: "bi-lightning-charge",
      number: "03",
      title: "الطاقات",
      text: "مشاريع استثمارية في الطاقة والطاقات المتجددة والحلول المستدامة.",
    },
    {
      icon: "bi-cpu",
      number: "04",
      title: "التكنولوجيا",
      text: "فرص في التكنولوجيا والابتكار والتحول الرقمي وتطوير الحلول الحديثة.",
    },
    {
      icon: "bi-water",
      number: "05",
      title: "السياحة",
      text: "مؤهلات سياحية متنوعة تفتح المجال أمام مشاريع جديدة في مختلف مناطق الجزائر.",
    },
    {
      icon: "bi-truck",
      number: "06",
      title: "النقل واللوجستيك",
      text: "فرص استثمارية في النقل والخدمات اللوجستية وسلاسل التوريد.",
    },
  ];

  return (
    <section
      className="sectors-section"
      id="investment"
    >
      <div className="container">

        {/* ========================================================
            SECTION HEADER
           ======================================================== */}

        <div className="aapi-section-header centered">

          <span className="section-overline">
            قطاعات الاستثمار
          </span>

          <h2>
            اكتشف إمكانات
            <strong> الاستثمار في الجزائر</strong>
          </h2>

          <p>
            مجموعة متنوعة من القطاعات توفر فرصًا واعدة للمستثمرين
            المحليين والأجانب.
          </p>

        </div>

        {/* ========================================================
            SECTORS
           ======================================================== */}

        <div className="row g-0 sectors-grid">

          {sectors.map((sector) => (
            <div
              className="col-xl-4 col-lg-4 col-md-6"
              key={sector.number}
            >
              <article className="sector-card">

                <div className="sector-card-number">
                  {sector.number}
                </div>

                <div className="sector-icon">
                  <i
                    className={`bi ${sector.icon}`}
                    aria-hidden="true"
                  ></i>
                </div>

                <div className="sector-content">

                  <h3>
                    {sector.title}
                  </h3>

                  <p>
                    {sector.text}
                  </p>

                  <Link
                    to="/sectors"
                    className="sector-link"
                  >
                    <span>
                      اكتشف المزيد
                    </span>

                    <i
                      className="bi bi-arrow-left"
                      aria-hidden="true"
                    ></i>
                  </Link>

                </div>

              </article>
            </div>
          ))}

        </div>

        {/* ========================================================
            ALL SECTORS BUTTON
           ======================================================== */}

        <div className="sectors-button-wrapper">

          <Link
            to="/sectors"
            className="green-outline-button"
          >
            <span>
              جميع قطاعات الاستثمار
            </span>

            <i
              className="bi bi-arrow-left"
              aria-hidden="true"
            ></i>
          </Link>

        </div>

      </div>
    </section>
  );
}

export default Sectors;
