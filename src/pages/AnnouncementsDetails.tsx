import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "../i18n/I18nProvider";

type ApiAnnouncement = {
  id: number;
  titre: string;
  contenu: string;
  image: string | null;
  auteur: string | null;
  date_publication: string | null;
  created_at: string;
};

const API_URL = "http://localhost/aapi-api/announcements.php";

function resolveAnnouncementImage(image: string | null, id: number) {
  if (!image) return null;
  const value = String(image).trim();
  if (!value) return null;
  if (/^https?:\\/\\//i.test(value)) return value;
  return `http://localhost/aapi-api/announcement-image.php?id=${id}`;
}

function AnnouncementsDetails() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [announcement, setAnnouncement] = useState<ApiAnnouncement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadAnnouncement = async () => {
      if (!id) {
        setError("Annonce introuvable.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}?id=${encodeURIComponent(id)}`);
        const data = await response.json();

        if (!response.ok || !data?.success || !data?.announcement) {
          throw new Error(data?.message || "Annonce introuvable.");
        }

        if (!cancelled) {
          setAnnouncement({\n            ...data.announcement,\n            image: resolveAnnouncementImage(data.announcement.image, Number(data.announcement.id)),\n          });
        }
      } catch (requestError) {
        if (!cancelled) {
          setAnnouncement(null);
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Impossible de charger l'annonce.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadAnnouncement();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const locale = document.documentElement.lang === "ar"
    ? "ar-DZ"
    : document.documentElement.lang === "fr"
      ? "fr-DZ"
      : "en-DZ";

  const formattedDate = useMemo(() => {
    const date = announcement?.date_publication || announcement?.created_at;
    if (!date) return "";

    const parsed = new Date(date.replace(" ", "T"));
    if (Number.isNaN(parsed.getTime())) return date;

    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(parsed);
  }, [announcement, locale]);

  const paragraphs = useMemo(() => {
    if (!announcement?.contenu) return [];
    return announcement.contenu
      .split(/\r?\n\r?\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }, [announcement]);

  if (loading) {
    return (
      <section className="announcement-details-not-found">
        <div className="container">
          <div className="announcement-not-found-card">
            <div className="announcement-not-found-icon">
              <i className="bi bi-arrow-repeat" aria-hidden="true" />
            </div>
            <h1>{t("announcementsPage.latest")}</h1>
            <p>...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!announcement) {
    return (
      <section className="announcement-details-not-found">
        <div className="container">
          <div className="announcement-not-found-card">
            <div className="announcement-not-found-icon">
              <i className="bi bi-exclamation-circle" aria-hidden="true" />
            </div>
            <h1>{t("announcementsPage.notFound")}</h1>
            <p>{error || t("announcementsPage.notFoundText")}</p>
            <Link to="/announcements" className="btn aapi-btn-primary">
              <i className="bi bi-arrow-right" aria-hidden="true" />
              {t("announcementsPage.reset")}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="announcement-details-hero">
        <div className="container">
          <div className="announcement-details-hero-content">
            <span>{t("announcementsPage.media")}</span>
            <h1>{announcement.titre}</h1>
            <div className="announcement-details-breadcrumb">
              <Link to="/">{t("announcementsPage.title")}</Link>
              <i className="bi bi-chevron-left" aria-hidden="true" />
              <Link to="/announcements">{t("announcementsPage.media")}</Link>
              <i className="bi bi-chevron-left" aria-hidden="true" />
              <strong>{t("announcementsPage.read")}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="announcement-details-section">
        <div className="container">
          <div className="row g-4 g-lg-5">
            <div className="col-lg-8">
              <article className="announcement-details-article">
                {announcement.image && (
                  <div className="announcement-details-image">
                    <img src={announcement.image} alt={announcement.titre} />
                  </div>
                )}

                <div className="announcement-details-top">
                  <div className="announcement-details-category">
                    <i className="bi bi-megaphone" aria-hidden="true" />
                    {t("announcementsPage.general")}
                  </div>
                  <div className="announcement-details-important">
                    <i className="bi bi-check-circle" aria-hidden="true" />
                    {t("announcementsPage.importantLabel")}
                  </div>
                </div>

                <h2>{announcement.titre}</h2>

                <div className="announcement-details-date">
                  <i className="bi bi-calendar3" aria-hidden="true" />
                  <span>{formattedDate}</span>
                </div>

                {announcement.auteur && announcement.auteur.trim() && (
                  <div className="announcement-details-date">
                    <i className="bi bi-person" aria-hidden="true" />
                    <span>{announcement.auteur.trim()}</span>
                  </div>
                )}

                <div className="announcement-details-divider" />

                <div className="announcement-details-content">
                  {paragraphs.length ? (
                    paragraphs.map((paragraph, index) => (
                      <p key={`${announcement.id}-${index}`}>{paragraph}</p>
                    ))
                  ) : (
                    <p>{announcement.contenu}</p>
                  )}
                </div>

                <div className="announcement-details-actions">
                  <Link to="/announcements" className="announcement-back-button">
                    <i className="bi bi-arrow-right" aria-hidden="true" />
                    {t("announcementsPage.reset")}
                  </Link>
                  <button
                    type="button"
                    className="announcement-print-button"
                    onClick={() => window.print()}
                  >
                    <i className="bi bi-printer" aria-hidden="true" />
                    {t("announcementsPage.read")}
                  </button>
                </div>
              </article>
            </div>

            <div className="col-lg-4">
              <aside className="announcement-details-sidebar">
                <div className="announcement-sidebar-card">
                  <div className="announcement-sidebar-icon">
                    <i className="bi bi-megaphone" aria-hidden="true" />
                  </div>
                  <h3>{t("announcementsPage.all")}</h3>
                  <p>{t("announcementsPage.allText")}</p>
                  <Link to="/announcements">
                    {t("announcementsPage.allLink")}
                    <i className="bi bi-arrow-left" aria-hidden="true" />
                  </Link>
                </div>

                <div className="announcement-sidebar-card green">
                  <div className="announcement-sidebar-icon">
                    <i className="bi bi-lightbulb" aria-hidden="true" />
                  </div>
                  <h3>{t("announcementsPage.opportunities")}</h3>
                  <p>{t("announcementsPage.opportunitiesText")}</p>
                  <Link to="/opportunities">
                    {t("announcementsPage.opportunitiesLink")}
                    <i className="bi bi-arrow-left" aria-hidden="true" />
                  </Link>
                </div>

                <div className="announcement-sidebar-contact">
                  <i className="bi bi-headset" aria-hidden="true" />
                  <div>
                    <strong>{t("announcementsPage.help")}</strong>
                    <span>{t("announcementsPage.helpText")}</span>
                  </div>
                  <Link to="/contact">{t("announcementsPage.contact")}</Link>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default AnnouncementsDetails;
