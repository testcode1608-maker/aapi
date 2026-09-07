import { Link } from "react-router-dom";

interface Opportunity {
  image: string;
  category: string;
  title: string;
  location: string;
  amount: string;
  status: string;
}

function Opportunities() {
  const opportunities: Opportunity[] = [
    {
      image:
        "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=1000&q=80",
      category: "الصناعة",
      title: "تطوير وحدة صناعية للإنتاج والتحويل",
      location: "الجزائر العاصمة",
      amount: "120 مليون دج",
      status: "فرصة متاحة",
    },
    {
      image:
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80",
      category: "الفلاحة",
      title: "مشروع فلاحي لإنتاج وتثمين المنتجات الزراعية",
      location: "بسكرة",
      amount: "85 مليون دج",
      status: "فرصة متاحة",
    },
    {
      image:
        "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1000&q=80",
      category: "الطاقات",
      title: "مشروع لإنتاج الطاقة من المصادر المتجددة",
      location: "وهران",
      amount: "250 مليون دج",
      status: "فرصة متاحة",
    },
  ];

  return (
    <section className="opportunities-section">
      <div className="container">

        {/* ========================================================
            HEADER
           ======================================================== */}

        <div className="opportunities-header">

          <div className="opportunities-title">

            <span className="section-overline">
              فرص استثمارية
            </span>

            <h2>
              اكتشف
              <strong> فرص الاستثمار</strong>
            </h2>

          </div>

          <div className="opportunities-intro">

            <p>
              اكتشف مجموعة من الفرص والمشاريع الاستثمارية
              المتاحة في مختلف القطاعات والمناطق.
            </p>

            <Link
              to="/opportunities"
              className="opportunities-header-link"
            >
              <span>
                عرض جميع الفرص
              </span>

              <i
                className="bi bi-arrow-left"
                aria-hidden="true"
              ></i>
            </Link>

          </div>

        </div>

        {/* ========================================================
            OPPORTUNITY CARDS
           ======================================================== */}

        <div className="row g-4">

          {opportunities.map((opportunity) => (
            <div
              className="col-xl-4 col-lg-4 col-md-6"
              key={opportunity.title}
            >
              <article className="opportunity-card">

                {/* IMAGE */}

                <div className="opportunity-image-wrapper">

                  <img
                    src={opportunity.image}
                    alt={opportunity.title}
                    className="opportunity-image"
                  />

                  <div className="opportunity-image-overlay"></div>

                  <span className="opportunity-category">
                    {opportunity.category}
                  </span>

                  <span className="opportunity-status">
                    <i
                      className="bi bi-check-circle-fill"
                      aria-hidden="true"
                    ></i>

                    {opportunity.status}
                  </span>

                </div>

                {/* CONTENT */}

                <div className="opportunity-content">

                  <h3>
                    {opportunity.title}
                  </h3>

                  <div className="opportunity-details">

                    <div className="opportunity-detail">

                      <i
                        className="bi bi-geo-alt"
                        aria-hidden="true"
                      ></i>

                      <span>
                        {opportunity.location}
                      </span>

                    </div>

                    <div className="opportunity-detail">

                      <i
                        className="bi bi-cash-stack"
                        aria-hidden="true"
                      ></i>

                      <span>
                        {opportunity.amount}
                      </span>

                    </div>

                  </div>

                  <div className="opportunity-footer">

                    <span>
                      مشروع استثماري
                    </span>

                    <Link
                      to="/opportunities"
                      aria-label={`عرض ${opportunity.title}`}
                    >
                      <i
                        className="bi bi-arrow-left"
                        aria-hidden="true"
                      ></i>
                    </Link>

                  </div>

                </div>

              </article>
            </div>
          ))}

        </div>

        {/* ========================================================
            BOTTOM BUTTON
           ======================================================== */}

        <div className="opportunities-bottom">

          <Link
            to="/opportunities"
            className="green-outline-button"
          >
            <span>
              استكشف جميع فرص الاستثمار
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

export default Opportunities;
