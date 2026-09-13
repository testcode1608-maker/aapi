import { Link, useParams } from "react-router-dom";
import { useTranslation } from "../i18n/I18nProvider";
import { announcementsDetailsTranslations } from "../i18n/announcementsDetailsTranslations";

function AnnouncementsDetails() {
  const { id } = useParams<{ id: string }>();
  const { language, t } = useTranslation();
  const announcement = announcementsDetailsTranslations[language].articles[id || ""];

  if (!announcement) {
    return (
      <section className="announcement-details-not-found">
        <div className="container">
          <div className="announcement-not-found-card">
            <div className="announcement-not-found-icon"><i className="bi bi-exclamation-circle" aria-hidden="true"></i></div>
            <h1>{t("announcementsDetails.page.notFound")}</h1>
            <p>{t("announcementsDetails.page.notFoundText")}</p>
            <Link to="/announcements" className="btn aapi-btn-primary"><i className="bi bi-arrow-right" aria-hidden="true"></i>{t("announcementsDetails.page.back")}</Link>
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
            <span>{t("announcementsDetails.page.media")}</span>
            <h1>{t("announcementsDetails.page.title")}</h1>
            <div className="announcement-details-breadcrumb">
              <Link to="/">{t("announcementsDetails.page.home")}</Link>
              <i className="bi bi-chevron-left" aria-hidden="true"></i>
              <Link to="/announcements">{t("announcementsDetails.page.media")}</Link>
              <i className="bi bi-chevron-left" aria-hidden="true"></i>
              <strong>{t("announcementsDetails.page.details")}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="announcement-details-section">
        <div className="container">
          <div className="row g-4 g-lg-5">
            <div className="col-lg-8">
              <article className="announcement-details-article">
                <div className="announcement-details-top">
                  <div className="announcement-details-category"><i className="bi bi-folder2-open" aria-hidden="true"></i>{announcement.category}</div>
                  {id === "1" || id === "2" ? <div className="announcement-details-important"><i className="bi bi-star-fill" aria-hidden="true"></i>{t("announcementsDetails.page.important")}</div> : null}
                </div>
                <h2>{announcement.title}</h2>
                <div className="announcement-details-date"><i className="bi bi-calendar3" aria-hidden="true"></i><span>{announcement.date}</span></div>
                <div className="announcement-details-divider"></div>
                <div className="announcement-details-intro">{announcement.excerpt}</div>
                <div className="announcement-details-content">
                  {announcement.content.map((paragraph, index) => <p key={`${id}-${index}`}>{paragraph}</p>)}
                </div>
                <div className="announcement-details-actions">
                  <Link to="/announcements" className="announcement-back-button"><i className="bi bi-arrow-right" aria-hidden="true"></i>{t("announcementsDetails.page.backList")}</Link>
                  <button type="button" className="announcement-print-button" onClick={() => window.print()}><i className="bi bi-printer" aria-hidden="true"></i>{t("announcementsDetails.page.print")}</button>
                </div>
              </article>
            </div>

            <div className="col-lg-4">
              <aside className="announcement-details-sidebar">
                <div className="announcement-sidebar-card">
                  <div className="announcement-sidebar-icon"><i className="bi bi-megaphone" aria-hidden="true"></i></div>
                  <h3>{t("announcementsDetails.page.all")}</h3>
                  <p>{t("announcementsDetails.page.allText")}</p>
                  <Link to="/announcements">{t("announcementsDetails.page.allLink")}<i className="bi bi-arrow-left" aria-hidden="true"></i></Link>
                </div>
                <div className="announcement-sidebar-card green">
                  <div className="announcement-sidebar-icon"><i className="bi bi-lightbulb" aria-hidden="true"></i></div>
                  <h3>{t("announcementsDetails.page.opportunities")}</h3>
                  <p>{t("announcementsDetails.page.opportunitiesText")}</p>
                  <Link to="/opportunities">{t("announcementsDetails.page.opportunitiesLink")}<i className="bi bi-arrow-left" aria-hidden="true"></i></Link>
                </div>
                <div className="announcement-sidebar-contact">
                  <i className="bi bi-headset" aria-hidden="true"></i>
                  <div><strong>{t("announcementsDetails.page.help")}</strong><span>{t("announcementsDetails.page.helpText")}</span></div>
                  <Link to="/contact">{t("announcementsDetails.page.contact")}</Link>
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
