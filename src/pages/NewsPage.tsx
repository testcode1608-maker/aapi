import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

type NewsItem = {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  icon: string;
  featured?: boolean;
};

const categories = [
  "الكل",
  "أخبار الوكالة",
  "الاستثمار",
  "فعاليات",
  "مستجدات",
];

const news: NewsItem[] = [
  {
    id: 1,
    title: "الوكالة الجزائرية لترقية الاستثمار تعزز خدماتها للمستثمرين",
    excerpt:
      "تواصل الوكالة تطوير خدماتها ومرافقة المستثمرين بهدف تسهيل الوصول إلى المعلومات والخدمات الاستثمارية.",
    date: "02 سبتمبر 2026",
    category: "أخبار الوكالة",
    icon: "bi-building",
    featured: true,
  },
  {
    id: 2,
    title: "فرص استثمارية جديدة في عدد من القطاعات",
    excerpt:
      "التعريف بمجموعة من الفرص الاستثمارية الواعدة في قطاعات مختلفة عبر عدد من ولايات الوطن.",
    date: "28 أوت 2026",
    category: "الاستثمار",
    icon: "bi-graph-up-arrow",
  },
  {
    id: 3,
    title: "لقاء حول تطوير بيئة الأعمال والاستثمار",
    excerpt:
      "لقاء يهدف إلى مناقشة آليات تطوير بيئة الأعمال وتحسين مرافقة أصحاب المشاريع الاستثمارية.",
    date: "25 أوت 2026",
    category: "فعاليات",
    icon: "bi-people",
  },
  {
    id: 4,
    title: "مستجدات حول الخدمات الرقمية للمستثمر",
    excerpt:
      "تعرف على آخر المستجدات المتعلقة بالخدمات الرقمية والوسائل الحديثة لتسهيل المسار الاستثماري.",
    date: "20 أوت 2026",
    category: "مستجدات",
    icon: "bi-laptop",
  },
  {
    id: 5,
    title: "تطوير فرص الاستثمار في القطاع الصناعي",
    excerpt:
      "إمكانات جديدة لدعم المشاريع الصناعية وخلق قيمة مضافة وفرص عمل مستدامة.",
    date: "16 أوت 2026",
    category: "الاستثمار",
    icon: "bi-buildings",
  },
  {
    id: 6,
    title: "ندوة تعريفية حول مسار المستثمر",
    excerpt:
      "ندوة للتعريف بمراحل إنجاز المشروع الاستثماري والخدمات المتاحة لمرافقة المستثمر.",
    date: "12 أوت 2026",
    category: "فعاليات",
    icon: "bi-mic",
  },
  {
    id: 7,
    title: "إطلاق موارد جديدة لفائدة المستثمرين",
    excerpt:
      "إتاحة مجموعة من الموارد والأدلة التي تساعد أصحاب المشاريع على فهم مختلف مراحل الاستثمار.",
    date: "08 أوت 2026",
    category: "مستجدات",
    icon: "bi-file-earmark-text",
  },
  {
    id: 8,
    title: "تشجيع الاستثمار في الطاقات المتجددة",
    excerpt:
      "قطاع الطاقات المتجددة يواصل تقديم فرص واعدة للمستثمرين الراغبين في تطوير مشاريع مبتكرة.",
    date: "03 أوت 2026",
    category: "الاستثمار",
    icon: "bi-sun",
  },
  {
    id: 9,
    title: "اجتماع حول تحسين مرافقة المستثمر",
    excerpt:
      "مناقشة عدد من الإجراءات الرامية إلى تحسين جودة الخدمات المقدمة للمستثمرين.",
    date: "29 جويلية 2026",
    category: "أخبار الوكالة",
    icon: "bi-chat-square-text",
  },
];

function NewsPage() {
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [search, setSearch] = useState("");

  const filteredNews = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return news.filter((item) => {
      const matchesCategory =
        activeCategory === "الكل" ||
        item.category === activeCategory;

      const matchesSearch =
        normalizedSearch === "" ||
        item.title.toLowerCase().includes(normalizedSearch) ||
        item.excerpt.toLowerCase().includes(normalizedSearch) ||
        item.category.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  const featuredNews = news.find(
    (item) => item.featured
  );

  const resetFilters = () => {
    setSearch("");
    setActiveCategory("الكل");
  };

  return (
    <>
      {/* =========================================================
          HERO
          ========================================================= */}
      <section className="inner-hero news-inner-hero">
        <div className="container">
          <div className="inner-hero-content">
            <span>المركز الإعلامي</span>

            <h1>الأخبار</h1>

            <p>
              تابع آخر الأخبار والمستجدات المتعلقة بالاستثمار
              وخدمات الوكالة.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          FEATURED NEWS
          ========================================================= */}
      {featuredNews && (
        <section className="news-featured-section">
          <div className="container">
            <div className="news-featured-card">
              <div className="row g-0 align-items-stretch">
                <div className="col-lg-6">
                  <div className="news-featured-visual">
                    <div className="news-featured-pattern"></div>

                    <div className="news-featured-icon">
                      <i
                        className={`bi ${featuredNews.icon}`}
                        aria-hidden="true"
                      ></i>
                    </div>

                    <span className="news-featured-label">
                      خبر مميز
                    </span>

                    <div className="news-featured-date">
                      <i
                        className="bi bi-calendar3"
                        aria-hidden="true"
                      ></i>

                      {featuredNews.date}
                    </div>
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="news-featured-content">
                    <span className="section-overline">
                      {featuredNews.category}
                    </span>

                    <h2>{featuredNews.title}</h2>

                    <p>{featuredNews.excerpt}</p>

                    <div className="news-featured-meta">
                      <span>
                        <i
                          className="bi bi-clock"
                          aria-hidden="true"
                        ></i>

                        آخر المستجدات
                      </span>

                      <span>
                        <i
                          className="bi bi-newspaper"
                          aria-hidden="true"
                        ></i>

                        أخبار الوكالة
                      </span>
                    </div>

                    <Link
                      to={`/news/${featuredNews.id}`}
                      className="aapi-primary-button"
                    >
                      قراءة الخبر

                      <i
                        className="bi bi-arrow-left"
                        aria-hidden="true"
                      ></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================
          NEWS LIST
          ========================================================= */}
      <section className="news-page-section">
        <div className="container">
          <div className="aapi-section-header">
            <div>
              <span className="section-overline">
                آخر الأخبار
              </span>

              <h2>
                تابع
                <strong> مستجداتنا</strong>
              </h2>
            </div>

            <p>
              اكتشف آخر الأخبار والأنشطة والمستجدات المرتبطة
              بالاستثمار وخدمات المستثمرين.
            </p>
          </div>

          {/* =====================================================
              SEARCH + FILTERS
              ===================================================== */}
          <div className="news-toolbar">
            <div className="news-search">
              <i
                className="bi bi-search"
                aria-hidden="true"
              ></i>

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="ابحث في الأخبار..."
                aria-label="البحث في الأخبار"
              />

              {search && (
                <button
                  type="button"
                  className="news-search-clear"
                  onClick={() => setSearch("")}
                  aria-label="مسح البحث"
                >
                  <i
                    className="bi bi-x-lg"
                    aria-hidden="true"
                  ></i>
                </button>
              )}
            </div>

            <div className="news-filters">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category}
                  className={
                    activeCategory === category
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setActiveCategory(category)
                  }
                  aria-pressed={
                    activeCategory === category
                  }
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* =====================================================
              RESULT INFO
              ===================================================== */}
          <div className="news-results-info">
            <span>
              <strong>{filteredNews.length}</strong>{" "}
              أخبار
            </span>

            {(search || activeCategory !== "الكل") && (
              <button
                type="button"
                onClick={resetFilters}
              >
                إعادة ضبط البحث

                <i
                  className="bi bi-arrow-counterclockwise"
                  aria-hidden="true"
                ></i>
              </button>
            )}
          </div>

          {/* =====================================================
              CARDS
              ===================================================== */}
          {filteredNews.length > 0 ? (
            <div className="row g-4">
              {filteredNews.map((item) => (
                <div
                  className="col-xl-4 col-lg-6 col-md-6"
                  key={item.id}
                >
                  <article className="news-page-card">
                    <div className="news-page-card-visual">
                      <div className="news-card-pattern"></div>

                      <div className="news-page-icon">
                        <i
                          className={`bi ${item.icon}`}
                          aria-hidden="true"
                        ></i>
                      </div>

                      <span className="news-page-category">
                        {item.category}
                      </span>

                      <div className="news-page-date">
                        <i
                          className="bi bi-calendar3"
                          aria-hidden="true"
                        ></i>

                        {item.date}
                      </div>
                    </div>

                    <div className="news-page-card-content">
                      <div className="news-card-small-meta">
                        <span>
                          <i
                            className="bi bi-newspaper"
                            aria-hidden="true"
                          ></i>

                          أخبار
                        </span>
                      </div>

                      <h3>{item.title}</h3>

                      <p>{item.excerpt}</p>

                      <Link
                        to={`/news/${item.id}`}
                        className="news-read-more"
                        aria-label={`قراءة المزيد: ${item.title}`}
                      >
                        قراءة المزيد

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
          ) : (
            <div className="news-empty-state">
              <div className="news-empty-icon">
                <i
                  className="bi bi-search"
                  aria-hidden="true"
                ></i>
              </div>

              <h3>لم يتم العثور على نتائج</h3>

              <p>
                لم نجد أخبارًا مطابقة لبحثك الحالي.
                حاول استخدام كلمات أخرى أو تغيير التصنيف.
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="aapi-primary-button"
              >
                عرض جميع الأخبار

                <i
                  className="bi bi-arrow-left"
                  aria-hidden="true"
                ></i>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          NEWS CTA
          ========================================================= */}
      <section className="news-page-cta">
        <div className="container">
          <div className="news-page-cta-inner">
            <div className="news-cta-icon">
              <i
                className="bi bi-bell"
                aria-hidden="true"
              ></i>
            </div>

            <div className="news-cta-content">
              <span>ابقَ على اطلاع</span>

              <h2>
                تابع آخر مستجدات الاستثمار
              </h2>

              <p>
                اكتشف الأخبار والفعاليات والفرص الجديدة
                التي تهم المستثمرين.
              </p>
            </div>

            <Link
              to="/opportunities"
              className="aapi-white-button"
            >
              اكتشف فرص الاستثمار

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

export default NewsPage;