import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="aapi-hero">

      {/* ============================================================
          BACKGROUND
          ============================================================ */}

      <div className="aapi-hero-background"></div>

      <div className="aapi-hero-overlay"></div>

      <div className="aapi-hero-pattern"></div>

      {/* ============================================================
          CONTENT
          ============================================================ */}

      <div className="container">

        <div className="aapi-hero-content">

          {/* EYEBROW */}

          <div className="aapi-hero-eyebrow">
            <span></span>

            الوكالة الجزائرية لترقية الاستثمار

            <span></span>
          </div>

          {/* TITLE */}

          <h1 className="aapi-hero-title">
            بوابتكم الموحدة للاستثمار في الجزائر
          </h1>

          {/* DESCRIPTION */}

          <p className="aapi-hero-description">
            نرافق المستثمرين وحاملي المشاريع في مختلف مراحل إنجاز مشاريعهم الاستثمارية وتوفير كافة التسهيلات والمعلومات الضرورية.
          </p>

          {/* BUTTONS */}

          <div className="aapi-hero-actions">

            <Link
              to="/opportunities"
              className="aapi-hero-primary-button"
            >
              <span>
                استكشف الفرص
              </span>

              <i className="bi bi-arrow-left"></i>
            </Link>

            <Link
              to="/investor"
              className="aapi-hero-secondary-button"
            >
              <span>
                فضاء المستثمر
              </span>

              <i className="bi bi-arrow-left"></i>
            </Link>

          </div>

          {/* ========================================================
              BADGE
              ======================================================== */}

          <div className="aapi-hero-badge">

            <i className="bi bi-shield-check"></i>

            <span>
              مرافقة، تسهيل، وترقية الاستثمار
            </span>

          </div>

        </div>

      </div>

      {/* ============================================================
          STATISTICS
          ============================================================ */}

      

    </section>
  );
}

export default Hero;