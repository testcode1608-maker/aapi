import { Link } from "react-router-dom";
import { useTranslation } from "../i18n/I18nProvider";

interface EventItem { id: number; month: string; day: string; type: string; title: string; location: string; time: string; }

function Events() {
  const { t } = useTranslation();
  const events: EventItem[] = [
    { id: 1, month: t("months.september"), day: "12", type: t("homeEvents.investmentMeetup"), title: t("homeEvents.nationalForum"), location: t("locations.algiers"), time: "09:00 - 17:00" },
    { id: 2, month: t("months.september"), day: "18", type: t("homeEvents.seminar"), title: t("homeEvents.financingSeminar"), location: t("locations.oran"), time: "10:00 - 15:00" },
    { id: 3, month: t("months.october"), day: "05", type: t("homeEvents.forum"), title: t("homeEvents.businessForum"), location: t("locations.constantine"), time: "09:30 - 16:00" },
  ];
  return (
    <section className="events-section"><div className="container">
      <div className="events-header"><div><span className="section-overline">{t("homeEvents.overline")}</span><h2>{t("homeEvents.title")}<strong> {t("homeEvents.titleStrong")}</strong></h2></div><div className="events-header-right"><p>{t("homeEvents.description")}</p><Link to="/events" className="events-all-link"><span>{t("homeEvents.viewAll")}</span><i className="bi bi-arrow-left" aria-hidden="true" /></Link></div></div>
      <div className="events-list">{events.map((event) => <article className="event-item" key={event.id}><div className="event-date"><span>{event.month}</span><strong>{event.day}</strong></div><div className="event-main"><span className="event-type">{event.type}</span><h3>{event.title}</h3><div className="event-info"><span><i className="bi bi-geo-alt" aria-hidden="true" />{event.location}</span><span><i className="bi bi-clock" aria-hidden="true" />{event.time}</span></div></div><Link to="/events" className="event-arrow" aria-label={`${t("homeEvents.view")} ${event.title}`}><i className="bi bi-arrow-left" aria-hidden="true" /></Link></article>)}</div>
      <div className="events-bottom"><Link to="/events" className="green-outline-button"><span>{t("homeEvents.exploreAll")}</span><i className="bi bi-arrow-left" aria-hidden="true" /></Link></div>
    </div></section>
  );
}
export default Events;
