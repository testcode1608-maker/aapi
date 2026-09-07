import { Link } from "react-router-dom";

type Sector = {
  icon: string;
  number: string;
  title: string;
  description: string;
  opportunities: string;
  featured: boolean;
};

const sectors: Sector[] = [
  {
    icon: "bi-buildings",
    number: "01",
    title: "الصناعة",
    description:
      "قطاع صناعي متنوع يوفر فرصًا في الصناعات التحويلية، مواد البناء، الصناعات الغذائية وغيرها.",
    opportunities: "فرص صناعية متعددة",
    featured: true,
  },
  {
    icon: "bi-tree",
    number: "02",
    title: "الفلاحة",
    description:
      "إمكانات واسعة للاستثمار في الإنتاج الزراعي، الصناعات الغذائية، تربية المواشي واستغلال الموارد الفلاحية.",
    opportunities: "فرص فلاحية متنوعة",
    featured: false,
  },
  {
    icon: "bi-sun",
    number: "03",
    title: "الطاقات المتجددة",
    description:
      "إمكانات كبيرة لتطوير مشاريع الطاقة الشمسية والطاقات المتجددة والاستفادة من الموارد الطبيعية.",
    opportunities: "مشاريع طاقة واعدة",
    featured: true,
  },
  {
    icon: "bi-water",
    number: "04",
    title: "السياحة",
    description:
      "تنوع طبيعي وثقافي يوفر فرصًا لتطوير المشاريع الفندقية والسياحية والترفيهية.",
    opportunities: "إمكانات سياحية كبيرة",
    featured: false,
  },
  {
    icon: "bi-cpu",
    number: "05",
    title: "التكنولوجيا والرقمنة",
    description:
      "قطاع واعد لدعم الابتكار والحلول الرقمية وتطوير المؤسسات الناشئة والخدمات التكنولوجية.",
    opportunities: "اقتصاد رقمي وابتكار",
    featured: true,
  },
  {
    icon: "bi-truck",
    number: "06",
    title: "النقل واللوجستيك",
    description:
      "فرص استثمارية مرتبطة بالنقل، التخزين، التوزيع والمنصات اللوجستية الحديثة.",
    opportunities: "منصات وخدمات لوجستية",
    featured: false,
  },
  {
    icon: "bi-droplet",
    number: "07",
    title: "المياه والبيئة",
    description:
      "مشاريع مرتبطة بإدارة الموارد المائية، معالجة المياه والحلول البيئية المستدامة.",
    opportunities: "حلول بيئية مستدامة",
    featured: false,
  },
  {
    icon: "bi-heart-pulse",
    number: "08",
    title: "الصحة",
    description:
      "فرص لتطوير الخدمات الصحية والمنشآت الطبية والصناعات والخدمات المرتبطة بالصحة.",
    opportunities: "خدمات صحية متطورة",
    featured: false,
  },
  {
    icon: "bi-house",
    number: "09",
    title: "العقار والخدمات",
    description:
      "إمكانات استثمارية في العقار الاقتصادي والخدمات الموجهة للمؤسسات والمستثمرين.",
    opportunities: "عقار وخدمات",
    featured: false,
  },
];

function SectorsPage() {
  return (
    <>
      {/* ============================================================
          HERO
          ============================================================ */}
      <section className="inner-hero sectors-inner-hero">
        <div className="container">
          <div className="inner-hero-content">
            <span>الاستثمار</span>

            <h1>قطاعات الاستثمار</h1>

            <p>
              اكتشف القطاعات والإمكانات الاستثمارية في الجزائر
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          INTRO
          ============================================================ */}
      <section className="sectors-page-intro">
        <div className="container">
          <div className="row align-items-end g-5">
            <div className="col-lg-7">
              <span className="section-overline">
                قطاعات متنوعة
              </span>

              <h2 className="sectors-page-title">
                مجالات واسعة
                <strong> للاستثمار والنمو</strong>
              </h2>
            </div>

            <div className="col-lg-5">
              <p className="sectors-page-description">
                تتميز الجزائر بتنوع اقتصادي وإمكانات طبيعية
                وبشرية تسمح بتطوير مشاريع استثمارية في
                قطاعات متعددة.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          STATISTICS
          ============================================================ */}
      <section className="sectors-mini-stats">
        <div className="container">
          <div className="row g-0">
            <div className="col-lg-3 col-md-6">
              <div className="sector-mini-stat">
                <strong>09+</strong>
                <span>قطاعات رئيسية</span>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="sector-mini-stat">
                <strong>58</strong>
                <span>ولاية</span>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="sector-mini-stat">
                <strong>48+</strong>
                <span>نشاطًا اقتصاديًا</span>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="sector-mini-stat">
                <strong>∞</strong>
                <span>إمكانات استثمارية</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTORS
          ============================================================ */}
      <section className="sectors-page-content">
        <div className="container">
          <div className="sectors-page-grid">
            {sectors.map((sector) => (
              <article
                className={
                  sector.featured
                    ? "sector-page-card featured"
                    : "sector-page-card"
                }
                key={sector.number}
              >
                <div className="sector-page-card-top">
                  <span>{sector.number}</span>

                  <div className="sector-page-icon">
                    <i
                      className={`bi ${sector.icon}`}
                      aria-hidden="true"
                    ></i>
                  </div>
                </div>

                <h3>{sector.title}</h3>

                <p>{sector.description}</p>

                <div className="sector-page-opportunity">
                  <i
                    className="bi bi-arrow-left"
                    aria-hidden="true"
                  ></i>

                  <span>{sector.opportunities}</span>
                </div>

                <Link to="/opportunities">
                  استكشف القطاع

                  <i
                    className="bi bi-arrow-left"
                    aria-hidden="true"
                  ></i>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          WHY ALGERIA
          ============================================================ */}
      <section className="why-algeria">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div className="why-algeria-visual">
                <div className="why-algeria-circle">
                  <i
                    className="bi bi-geo-alt"
                    aria-hidden="true"
                  ></i>
                </div>

                <div className="why-algeria-card card-one">
                  <strong>58</strong>
                  <span>ولاية</span>
                </div>

                <div className="why-algeria-card card-two">
                  <strong>+</strong>
                  <span>إمكانات</span>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <span className="section-overline">
                لماذا الجزائر؟
              </span>

              <h2 className="why-algeria-title">
                بيئة توفر
                <strong> إمكانات حقيقية</strong>
              </h2>

              <p className="why-algeria-text">
                تتمتع الجزائر بموقع استراتيجي وموارد طبيعية
                وسوق محلية واسعة، إضافة إلى إمكانات بشرية
                ومؤهلات تسمح بتطوير مشاريع متنوعة.
              </p>

              <div className="why-algeria-list">
                <div>
                  <i
                    className="bi bi-check-circle"
                    aria-hidden="true"
                  ></i>

                  <span>موقع استراتيجي</span>
                </div>

                <div>
                  <i
                    className="bi bi-check-circle"
                    aria-hidden="true"
                  ></i>

                  <span>موارد طبيعية متنوعة</span>
                </div>

                <div>
                  <i
                    className="bi bi-check-circle"
                    aria-hidden="true"
                  ></i>

                  <span>سوق محلية واسعة</span>
                </div>

                <div>
                  <i
                    className="bi bi-check-circle"
                    aria-hidden="true"
                  ></i>

                  <span>موارد بشرية مؤهلة</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          CTA
          ============================================================ */}
      <section className="sectors-page-cta">
        <div className="container">
          <div className="sectors-cta-box">
            <div>
              <span>جاهز للانطلاق؟</span>

              <h2>
                اكتشف فرص
                <strong> الاستثمار</strong>
              </h2>

              <p>
                اختر القطاع المناسب وتعرف على الفرص
                والمعلومات المتاحة للمستثمر.
              </p>
            </div>

            <Link
              to="/opportunities"
              className="sectors-cta-button"
            >
              فرص الاستثمار

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

export default SectorsPage;