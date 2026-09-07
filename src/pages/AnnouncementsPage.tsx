import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

type Announcement = {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  icon: string;
  important?: boolean;
};

const categories = [
  "الكل",
  "إعلانات عامة",
  "إعلانات المستثمرين",
  "طلبات وعروض",
  "مواعيد",
];

const announcements: Announcement[] = [
  {
    id: 1,
    title: "إعلان هام لفائدة المستثمرين وأصحاب المشاريع",
    excerpt:
      "إعلان يتضمن معلومات وتوجيهات مهمة لفائدة المستثمرين الراغبين في الاستفادة من الخدمات والمعلومات المتاحة.",
    date: "02 سبتمبر 2026",
    category: "إعلانات المستثمرين",
    icon: "bi-megaphone",
    important: true,
  },
  {
    id: 2,
    title: "إعلان عن تنظيم لقاء إعلامي حول الاستثمار",
    excerpt:
      "تنظم الوكالة لقاءً إعلاميًا للتعريف بمختلف الخدمات والمسارات المتعلقة بالمستثمرين.",
    date: "30 أوت 2026",
    category: "مواعيد",
    icon: "bi-calendar-event",
  },
  {
    id: 3,
    title: "فتح باب التسجيل للمشاركة في فعالية استثمارية",
    excerpt:
      "فتح باب التسجيل أمام المهتمين بالمشاركة في فعالية مخصصة للتعريف بفرص الاستثمار.",
    date: "27 أوت 2026",
    category: "مواعيد",
    icon: "bi-person-plus",
  },
  {
    id: 4,
    title: "إعلان حول طلبات وعروض الاستثمار",
    excerpt:
      "معلومات حول مجموعة من الطلبات والعروض المرتبطة بالمشاريع والفرص الاستثمارية.",
    date: "24 أوت 2026",
    category: "طلبات وعروض",
    icon: "bi-file-earmark-text",
  },
  {
    id: 5,
    title: "تحديث المعلومات الخاصة بخدمات المستثمر",
    excerpt:
      "تم تحديث مجموعة من المعلومات والموارد المتعلقة بالخدمات المتاحة للمستثمرين.",
    date: "20 أوت 2026",
    category: "إعلانات عامة",
    icon: "bi-info-circle",
  },
  {
    id: 6,
    title: "إعلان عن موعد استقبال المستثمرين",
    excerpt:
      "معلومات حول مواعيد استقبال وتوجيه المستثمرين وأصحاب المشاريع.",
    date: "17 أوت 2026",
    category: "مواعيد",
    icon: "bi-clock",
  },
  {
    id: 7,
    title: "دعوة للمشاركة في برنامج دعم المشاريع",
    excerpt:
      "دعوة للمهتمين بالمشاريع الاستثمارية للاطلاع على المعلومات الخاصة بالبرنامج.",
    date: "13 أوت 2026",
    category: "إعلانات المستثمرين",
    icon: "bi-briefcase",
  },
  {
    id: 8,
    title: "إعلان حول توفير وثائق وموارد جديدة",
    excerpt:
      "إتاحة مجموعة من الوثائق والموارد الجديدة لفائدة المستثمرين وأصحاب المشاريع.",
    date: "09 أوت 2026",
    category: "إعلانات عامة",
    icon: "bi-folder2-open",
  },
];

function AnnouncementsPage() {
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [search, setSearch] = useState("");

  const filteredAnnouncements = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return announcements.filter((item) => {
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

  const resetFilters = () => {
    setSearch("");
    setActiveCategory("الكل");
  };

  return (
    <>
      {/* =========================================================
          HERO
          ========================================================= */}
      <section className="inner-hero announcements-inner-hero">
        <div className="container">
          <div className="inner-hero-content">
            <span>المركز الإعلامي</span>

            <h1>الإعلانات</h1>

            <p>
              تابع آخر الإعلانات والتنبيهات والمواعيد المهمة.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          INTRO
          ========================================================= */}
      <section className="announcements-intro">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span className="section-overline">
                آخر الإعلانات
              </span>

              <h2 className="announcements-title">
                معلومات مهمة
                <strong> للمستثمرين</strong>
              </h2>

              <p className="announcements-text">
                هنا تجد أهم الإعلانات والتنبيهات والمواعيد
                المتعلقة بخدمات المستثمر والأنشطة والبرامج.
              </p>
            </div>

            <div className="col-lg-5">
              <div className="announcements-info-box">
                <div className="announcements-info-icon">
                  <i
                    className="bi bi-megaphone"
                    aria-hidden="true"
                  ></i>
                </div>

                <div>
                  <strong>ابقَ على اطلاع</strong>

                  <span>
                    تابع الإعلانات الجديدة باستمرار.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          LIST
          ========================================================= */}
      <section className="announcements-page-section">
        <div className="container">
          {/* SEARCH */}
          <div className="announcements-toolbar">
            <div className="announcements-search">
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
                placeholder="ابحث في الإعلانات..."
                aria-label="البحث في الإعلانات"
              />

              {search && (
                <button
                  type="button"
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

            <div className="announcements-filters">
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

          {/* RESULTS */}
          <div className="announcements-results">
            <span>
              <strong>
                {filteredAnnouncements.length}
              </strong>{" "}
              إعلانات
            </span>

            {(search || activeCategory !== "الكل") && (
              <button
                type="button"
                onClick={resetFilters}
              >
                إعادة ضبط

                <i
                  className="bi bi-arrow-counterclockwise"
                  aria-hidden="true"
                ></i>
              </button>
            )}
          </div>

          {/* CARDS */}
          {filteredAnnouncements.length > 0 ? (
            <div className="row g-4">
              {filteredAnnouncements.map((item) => (
                <div
                  className="col-xl-4 col-lg-6 col-md-6"
                  key={item.id}
                >
                  <article
                    className={
                      item.important
                        ? "announcement-card important"
                        : "announcement-card"
                    }
                  >
                    <div className="announcement-card-top">
                      <div className="announcement-icon">
                        <i
                          className={`bi ${item.icon}`}
                          aria-hidden="true"
                        ></i>
                      </div>

                      {item.important && (
                        <span className="announcement-important">
                          هام
                        </span>
                      )}

                      <span className="announcement-category">
                        {item.category}
                      </span>
                    </div>

                    <div className="announcement-card-content">
                      <div className="announcement-date">
                        <i
                          className="bi bi-calendar3"
                          aria-hidden="true"
                        ></i>

                        {item.date}
                      </div>

                      <h3>{item.title}</h3>

                      <p>{item.excerpt}</p>

                      <Link
                        to={`/announcements/${item.id}`}
                        className="announcement-read-more"
                        aria-label={`قراءة الإعلان: ${item.title}`}
                      >
                        قراءة الإعلان

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
            <div className="announcements-empty">
              <div className="announcements-empty-icon">
                <i
                  className="bi bi-search"
                  aria-hidden="true"
                ></i>
              </div>

              <h3>لم يتم العثور على نتائج</h3>

              <p>
                لم نجد إعلانات مطابقة لبحثك الحالي.
              </p>

              <button
                type="button"
                className="aapi-primary-button"
                onClick={resetFilters}
              >
                عرض جميع الإعلانات

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
          CTA
          ========================================================= */}
      <section className="announcements-cta">
        <div className="container">
          <div className="announcements-cta-inner">
            <div className="announcements-cta-icon">
              <i
                className="bi bi-briefcase"
                aria-hidden="true"
              ></i>
            </div>

            <div className="announcements-cta-content">
              <span>للمستثمرين</span>

              <h2>
                اكتشف فرص الاستثمار المتاحة
              </h2>

              <p>
                تعرف على القطاعات والمشاريع والفرص الاستثمارية.
              </p>
            </div>

            <Link
              to="/opportunities"
              className="aapi-white-button"
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
    </>
  );
}

export default AnnouncementsPage;