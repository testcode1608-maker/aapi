import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../i18n/I18nProvider";

type Category = "all" | "general" | "investors" | "offers" | "dates";

type Announcement = {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  category: Exclude<Category, "all">;
  icon: string;
  important?: boolean;
};

const announcementsData: Omit<Announcement, "title" | "excerpt">[] = [
  { id: 1, date: "2026-09-02", category: "investors", icon: "bi-megaphone", important: true },
  { id: 2, date: "2026-08-30", category: "dates", icon: "bi-calendar-event" },
  { id: 3, date: "2026-08-27", category: "dates", icon: "bi-person-plus" },
  { id: 4, date: "2026-08-24", category: "offers", icon: "bi-file-earmark-text" },
  { id: 5, date: "2026-08-20", category: "general", icon: "bi-info-circle" },
  { id: 6, date: "2026-08-17", category: "dates", icon: "bi-clock" },
  { id: 7, date: "2026-08-13", category: "investors", icon: "bi-briefcase" },
  { id: 8, date: "2026-08-09", category: "general", icon: "bi-folder2-open" },
];

function AnnouncementsPage() {
  const { language, t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [search, setSearch] = useState("");

  const categoryLabels: Record<Category, string> = {
    all: t("announcementsPage.all"),
    general: t("announcementsPage.general"),
    investors: t("announcementsPage.investors"),
    offers: t("announcementsPage.offers"),
    dates: t("announcementsPage.dates"),
  };

  const announcements: Announcement[] = announcementsData.map((item) => ({
    ...item,
    title: t(`announcementsPage.a${item.id}Title`),
    excerpt: t(`announcementsPage.a${item.id}Text`),
  }));

  const locale = language === "ar" ? "ar-DZ" : language === "fr" ? "fr-DZ" : "en-DZ";
  const formatDate = (date: string) =>
    new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(`${date}T12:00:00`));

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return announcements.filter((item) => {
      const categoryMatches =
        activeCategory === "all" || item.category === activeCategory;
      const searchMatches =
        !query ||
        `${item.title} ${item.excerpt} ${categoryLabels[item.category]}`
          .toLowerCase()
          .includes(query);

      return categoryMatches && searchMatches;
    });
  }, [activeCategory, search, announcements, categoryLabels]);

  const reset = () => {
    setSearch("");
    setActiveCategory("all");
  };

  return (
    <>
      <section className="inner-hero announcements-inner-hero">
        <div className="container">
          <div className="inner-hero-content">
            <span>{t("announcementsPage.media")}</span>
            <h1>{t("announcementsPage.title")}</h1>
            <p>{t("announcementsPage.heroText")}</p>
          </div>
        </div>
      </section>

      <section className="announcements-intro">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span className="section-overline">{t("announcementsPage.latest")}</span>
              <h2 className="announcements-title">
                {t("announcementsPage.important")}
                <strong>{t("announcementsPage.importantStrong")}</strong>
              </h2>
              <p className="announcements-text">{t("announcementsPage.intro")}</p>
            </div>
            <div className="col-lg-5">
              <div className="announcements-info-box">
                <div className="announcements-info-icon">
                  <i className="bi bi-megaphone" aria-hidden="true" />
                </div>
                <div>
                  <strong>{t("announcementsPage.stay")}</strong>
                  <span>{t("announcementsPage.stayText")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="announcements-page-section">
        <div className="container">
          <div className="announcements-toolbar">
            <div className="announcements-search">
              <i className="bi bi-search" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("announcementsPage.search")}
                aria-label={t("announcementsPage.searchAria")}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label={t("announcementsPage.clear")}
                >
                  <i className="bi bi-x-lg" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="announcements-filters">
              {(Object.keys(categoryLabels) as Category[]).map((category) => (
                <button
                  type="button"
                  key={category}
                  className={activeCategory === category ? "active" : ""}
                  onClick={() => setActiveCategory(category)}
                  aria-pressed={activeCategory === category}
                >
                  {categoryLabels[category]}
                </button>
              ))}
            </div>
          </div>

          <div className="announcements-results">
            <span>
              <strong>{filtered.length}</strong> {t("announcementsPage.announcements")}
            </span>
            {(search || activeCategory !== "all") && (
              <button type="button" onClick={reset}>
                {t("announcementsPage.reset")} <i className="bi bi-arrow-counterclockwise" aria-hidden="true" />
              </button>
            )}
          </div>

          {filtered.length ? (
            <div className="row g-4">
              {filtered.map((item) => (
                <div className="col-xl-4 col-lg-6 col-md-6" key={item.id}>
                  <article className={item.important ? "announcement-card important" : "announcement-card"}>
                    <div className="announcement-card-top">
                      <div className="announcement-icon">
                        <i className={`bi ${item.icon}`} aria-hidden="true" />
                      </div>
                      {item.important && (
                        <span className="announcement-important">
                          {t("announcementsPage.importantLabel")}
                        </span>
                      )}
                      <span className="announcement-category">
                        {categoryLabels[item.category]}
                      </span>
                    </div>

                    <div className="announcement-card-content">
                      <div className="announcement-date">
                        <i className="bi bi-calendar3" aria-hidden="true" />
                        {formatDate(item.date)}
                      </div>
                      <h3>{item.title}</h3>
                      <p>{item.excerpt}</p>
                      <Link
                        to={`/announcements/${item.id}`}
                        className="announcement-read-more"
                        aria-label={`${t("announcementsPage.read")}: ${item.title}`}
                      >
                        {t("announcementsPage.read")} <i className="bi bi-arrow-left" aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          ) : (
            <div className="announcements-empty">
              <div className="announcements-empty-icon">
                <i className="bi bi-search" aria-hidden="true" />
              </div>
              <h3>{t("announcementsPage.notFound")}</h3>
              <p>{t("announcementsPage.notFoundText")}</p>
              <button type="button" className="aapi-primary-button" onClick={reset}>
                {t("announcementsPage.showAll")} <i className="bi bi-arrow-left" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="announcements-cta">
        <div className="container">
          <div className="announcements-cta-inner">
            <div className="announcements-cta-icon">
              <i className="bi bi-briefcase" aria-hidden="true" />
            </div>
            <div className="announcements-cta-content">
              <span>{t("announcementsPage.ctaLabel")}</span>
              <h2>{t("announcementsPage.ctaTitle")}</h2>
              <p>{t("announcementsPage.ctaText")}</p>
            </div>
            <Link to="/opportunities" className="aapi-white-button">
              {t("announcementsPage.ctaButton")} <i className="bi bi-arrow-left" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default AnnouncementsPage;
