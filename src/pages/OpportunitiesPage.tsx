import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

type Opportunity = {
  id: number;
  sector: string;
  icon: string;
  title: string;
  location: string;
  description: string;
  investment: string;
  jobs: string;
};

const sectors = [
  "الكل",
  "الصناعة",
  "الفلاحة",
  "الطاقة",
  "السياحة",
  "التكنولوجيا",
  "النقل",
];

const opportunities: Opportunity[] = [
  {
    id: 1,
    sector: "الصناعة",
    icon: "bi-buildings",
    title: "وحدة صناعية لإنتاج مواد البناء",
    location: "الجزائر",
    description:
      "فرصة استثمارية لإنشاء وحدة صناعية متخصصة في إنتاج مواد البناء وتلبية احتياجات السوق.",
    investment: "استثمار متوسط",
    jobs: "120 منصب",
  },
  {
    id: 2,
    sector: "الفلاحة",
    icon: "bi-tree",
    title: "مشروع فلاحي متكامل",
    location: "بسكرة",
    description:
      "إنشاء واستغلال مشروع فلاحي حديث يعتمد على تقنيات الري والإنتاج الزراعي العصري.",
    investment: "استثمار متوسط",
    jobs: "80 منصب",
  },
  {
    id: 3,
    sector: "الطاقة",
    icon: "bi-sun",
    title: "محطة لإنتاج الطاقة الشمسية",
    location: "الهضاب العليا",
    description:
      "تطوير مشروع لإنتاج الطاقة الكهربائية من مصادر الطاقة الشمسية المتجددة.",
    investment: "استثمار كبير",
    jobs: "150 منصب",
  },
  {
    id: 4,
    sector: "السياحة",
    icon: "bi-buildings",
    title: "مجمع سياحي وفندقي",
    location: "وهران",
    description:
      "إنجاز مركب سياحي حديث يوفر خدمات الإقامة والترفيه والأنشطة السياحية.",
    investment: "استثمار كبير",
    jobs: "200 منصب",
  },
  {
    id: 5,
    sector: "التكنولوجيا",
    icon: "bi-cpu",
    title: "مركز للتكنولوجيا والابتكار",
    location: "الجزائر العاصمة",
    description:
      "إنشاء مركز متخصص في الحلول الرقمية والابتكار وتطوير المؤسسات الناشئة.",
    investment: "استثمار متوسط",
    jobs: "100 منصب",
  },
  {
    id: 6,
    sector: "النقل",
    icon: "bi-truck",
    title: "منصة لوجستية متكاملة",
    location: "سطيف",
    description:
      "تطوير منصة لوجستية حديثة لدعم عمليات التخزين والنقل والتوزيع.",
    investment: "استثمار كبير",
    jobs: "170 منصب",
  },
];

function OpportunitiesPage() {
  const [activeSector, setActiveSector] = useState("الكل");
  const [search, setSearch] = useState("");

  const filteredOpportunities = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return opportunities.filter((opportunity) => {
      const matchesSector =
        activeSector === "الكل" ||
        opportunity.sector === activeSector;

      const matchesSearch =
        searchValue === "" ||
        opportunity.title.toLowerCase().includes(searchValue) ||
        opportunity.location.toLowerCase().includes(searchValue) ||
        opportunity.sector.toLowerCase().includes(searchValue);

      return matchesSector && matchesSearch;
    });
  }, [activeSector, search]);

  const resetFilters = () => {
    setSearch("");
    setActiveSector("الكل");
  };

  return (
    <>
      {/* ============================================================
          HERO
          ============================================================ */}
      <section className="inner-hero opportunities-inner-hero">
        <div className="container">
          <div className="inner-hero-content">
            <span>الاستثمار</span>

            <h1>فرص الاستثمار</h1>

            <p>
              اكتشف المشاريع والفرص الاستثمارية المتاحة
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          INTRO
          ============================================================ */}
      <section className="aapi-section-header">
        <div className="container">
          <div className="row align-items-end g-4">
            <div className="col-lg-7">
              <span className="section-overline">
                الفرص الاستثمارية
              </span>

              <h2 className="opportunities-title">
                اكتشف فرصًا
                <strong> واعدة في الجزائر</strong>
              </h2>

              <p>
                تصفح مجموعة من الفرص الاستثمارية حسب
                القطاع والموقع، واكتشف المشاريع التي
                يمكن أن تتوافق مع توجهاتك الاستثمارية.
              </p>
            </div>

            <div className="col-lg-5">
              <div className="opportunities-search">
                <i
                  className="bi bi-search"
                  aria-hidden="true"
                ></i>

                <input
                  type="search"
                  placeholder="ابحث عن فرصة استثمارية..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  aria-label="البحث عن فرصة استثمارية"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FILTERS + RESULTS
          ============================================================ */}
      <section className="opportunities-content">
        <div className="container">
          {/* FILTERS */}
          <div className="opportunities-filters">
            <div className="opportunities-filter-title">
              <i
                className="bi bi-funnel"
                aria-hidden="true"
              ></i>

              <span>تصفية حسب القطاع</span>
            </div>

            <div className="opportunities-filter-buttons">
              {sectors.map((sector) => (
                <button
                  key={sector}
                  type="button"
                  className={
                    activeSector === sector
                      ? "active"
                      : ""
                  }
                  onClick={() => setActiveSector(sector)}
                  aria-pressed={activeSector === sector}
                >
                  {sector}
                </button>
              ))}
            </div>
          </div>

          {/* RESULTS HEADER */}
          <div className="opportunities-results-header">
            <div>
              <span>النتائج</span>

              <strong>
                {filteredOpportunities.length}
              </strong>
            </div>

            <p>فرص استثمارية متاحة</p>
          </div>

          {/* RESULTS */}
          <div className="row g-4">
            {filteredOpportunities.map((opportunity) => (
              <div
                className="col-lg-4 col-md-6"
                key={opportunity.id}
              >
                <article className="opportunity-card">
                  <div className="opportunity-card-top">
                    <div className="opportunity-icon">
                      <i
                        className={`bi ${opportunity.icon}`}
                        aria-hidden="true"
                      ></i>
                    </div>

                    <span className="opportunity-sector">
                      {opportunity.sector}
                    </span>
                  </div>

                  <h3>{opportunity.title}</h3>

                  <div className="opportunity-location">
                    <i
                      className="bi bi-geo-alt"
                      aria-hidden="true"
                    ></i>

                    <span>{opportunity.location}</span>
                  </div>

                  <p>{opportunity.description}</p>

                  <div className="opportunity-meta">
                    <div>
                      <span>حجم الاستثمار</span>

                      <strong>
                        {opportunity.investment}
                      </strong>
                    </div>

                    <div>
                      <span>مناصب العمل</span>

                      <strong>
                        {opportunity.jobs}
                      </strong>
                    </div>
                  </div>

                  <Link
                    to={`/opportunities?opportunity=${opportunity.id}`}
                    className="opportunity-button"
                    aria-label={`تفاصيل ${opportunity.title}`}
                  >
                    تفاصيل الفرصة

                    <i
                      className="bi bi-arrow-left"
                      aria-hidden="true"
                    ></i>
                  </Link>
                </article>
              </div>
            ))}
          </div>

          {/* EMPTY STATE */}
          {filteredOpportunities.length === 0 && (
            <div className="opportunities-empty">
              <i
                className="bi bi-search"
                aria-hidden="true"
              ></i>

              <h3>
                لم يتم العثور على نتائج
              </h3>

              <p>
                جرّب تغيير كلمة البحث أو اختيار قطاع آخر.
              </p>

              <button
                type="button"
                onClick={resetFilters}
              >
                إعادة ضبط البحث
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          CTA
          ============================================================ */}
      <section className="opportunities-cta">
        <div className="container">
          <div className="opportunities-cta-box">
            <div>
              <span>هل لديك مشروع؟</span>

              <h2>
                حوّل فكرتك إلى
                <strong> مشروع استثماري</strong>
              </h2>

              <p>
                اكتشف الخدمات والمعلومات التي تساعدك
                على الانطلاق في مسارك الاستثماري.
              </p>
            </div>

            <Link
              to="/investor"
              className="opportunities-cta-button"
            >
              فضاء المستثمر

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

export default OpportunitiesPage;