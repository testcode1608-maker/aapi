import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../i18n/I18nProvider";

type Category = "all" | "general";

type Announcement = {
  id: number;
  title: string;
  content: string;
  date: string | null;
  image: string | null;
  category: "general";
  icon: string;
  important?: boolean;
};

type ApiAnnouncement = {
  id: number;
  titre: string;
  contenu: string;
  date_publication: string | null;
  image: string | null;
  created_at: string;
};

const API_URL = "http://localhost/aapi-api/announcements.php";
const API_ORIGIN = "http://localhost";

function resolveAnnouncementImage(image: string | null | undefined) {
  if (!image) return null;
  const value = String(image).trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/")) return `${API_ORIGIN}${value}`;
  if (value.startsWith("uploads/")) return `${API_ORIGIN}/aapi-api/${value}`;
  return `${API_ORIGIN}/aapi-api/uploads/announcements/${value}`;
}

function AnnouncementsPage() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [search, setSearch] = useState("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const categoryLabels: Record<Category, string> = {
    all: t("announcementsPage.all"),
    general: t("announcementsPage.general"),
  };

  useEffect(() => {
    let cancelled = false;

    const loadAnnouncements = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL);
        const data = await response.json();

        if (!response.ok || !data?.success) {
          throw new Error(data?.message || "Unable to load announcements.");
        }

        const rows: ApiAnnouncement[] = Array.isArray(data.announcements)
          ? data.announcements
          : [];

        if (!cancelled) {
          setAnnouncements(
            rows.map((item, index) => ({
              id: Number(item.id),
              title: item.titre,
              content: item.contenu,
              date: item.date_publication || item.created_at || null,
              image: resolveAnnouncementImage(item.image),
              category: "general",
              icon: "bi-megaphone",
              important: index === 0,
            })),
          );
        }
      } catch (requestError) {
        if (!cancelled) {
          setAnnouncements([]);
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Impossible de charger les annonces.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadAnnouncements();

    return () => {
      cancelled = true;
    };
  }, []);

  const locale = document.documentElement.lang === "ar"
    ? "ar-DZ"
    : document.documentElement.lang === "fr"
      ? "fr-DZ"
      : "en-DZ";

  const formatDate = (date: string | null) => {
    if (!date) return "";
    const parsed = new Date(date.replace(" ", "T"));
    if (Number.isNaN(parsed.getTime())) return date;

    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(parsed);
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return announcements.filter((item) => {
      const categoryMatches =
        activeCategory === "all" || item.category === activeCategory;

      const searchMatches =
        !query ||
        `${item.title} ${item.content} ${categoryLabels[item.category]}`
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

          {loading ? (
            <div className="announcements-empty">
              <div className="announcements-empty-icon">
                <i className="bi bi-arrow-repeat" aria-hidden="true" />
              </div>
              <h3>{t("announcementsPage.latest")}</h3>
              <p>...</p>
            </div>
          ) : error ? (
            <div className="announcements-empty">
              <div className="announcements-empty-icon">
                <i className="bi bi-exclamation-circle" aria-hidden="true" />
              </div>
              <h3>{t("announcementsPage.notFound")}</h3>
              <p>{error}</p>
              <button type="button" className="aapi-primary-button" onClick={reset}>
                {t("announcementsPage.showAll")} <i className="bi bi-arrow-left" aria-hidden="true" />
              </button>
            </div>
          ) : filtered.length ? (
            <div className="row g-4">
              {filtered.map((item) => (
                <div className="col-xl-4 col-lg-6 col-md-6" key={item.id}>
                  <article className={item.important ? "announcement-card important" : "announcement-card"}>
                    {item.image && (
                      <div className="announcement-card-image">
                        <img
                          src={item.image.startsWith("http") ? item.image : `http://localhost${item.image}`}
                          alt={item.title}
                          loading="lazy"
                        />
                      </div>
                    )}
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
                      <p>{item.content}</p>
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
