import { Link } from "react-router-dom";
import { useTranslation } from "../i18n/I18nProvider";

type EventItem = { id:number; month:string; day:string; type:string; title:string; location:string; time:string; description:string };

function EventsPage() {
  const { t } = useTranslation();
  const events: EventItem[] = [
    { id:1, month:t("months.september"), day:"12", type:t("eventsPage.event1Type"), title:t("eventsPage.event1Title"), location:t("locations.algiers"), time:"09:00 - 17:00", description:t("eventsPage.event1Text") },
    { id:2, month:t("months.september"), day:"18", type:t("eventsPage.event2Type"), title:t("eventsPage.event2Title"), location:t("locations.oran"), time:"10:00 - 15:00", description:t("eventsPage.event2Text") },
    { id:3, month:t("months.october"), day:"05", type:t("eventsPage.event3Type"), title:t("eventsPage.event3Title"), location:t("locations.constantine"), time:"09:30 - 16:00", description:t("eventsPage.event3Text") },
    { id:4, month:t("months.october"), day:"14", type:t("eventsPage.event4Type"), title:t("eventsPage.event4Title"), location:t("locations.algiers"), time:"09:30 - 13:00", description:t("eventsPage.event4Text") },
    { id:5, month:t("months.october"), day:"22", type:t("eventsPage.event5Type"), title:t("eventsPage.event5Title"), location:t("eventsPage.locSetif"), time:"10:00 - 16:00", description:t("eventsPage.event5Text") },
    { id:6, month:t("eventsPage.monthNovember"), day:"03", type:t("eventsPage.event6Type"), title:t("eventsPage.event6Title"), location:t("locations.oran"), time:"09:00 - 17:00", description:t("eventsPage.event6Text") },
  ];
  return <>
    <section className="inner-page"><div className="container"><span className="section-overline">{t("eventsPage.heroOverline")}</span><h1>{t("eventsPage.heroTitle")}</h1><p>{t("eventsPage.heroText")}</p></div></section>
    <section className="events-page-intro"><div className="container"><div className="aapi-section-header"><div><span className="section-overline">{t("eventsPage.introOverline")}</span><h2>{t("eventsPage.introTitle")}<strong>{t("eventsPage.introStrong")}</strong></h2></div><p>{t("eventsPage.introText")}</p></div></div></section>
    <section className="events-page-content"><div className="container"><div className="events-page-list">{events.map((event)=><article className="events-page-card" key={event.id}><div className="events-page-date"><span>{event.month}</span><strong>{event.day}</strong></div><div className="events-page-main"><span className="events-page-type">{event.type}</span><h2>{event.title}</h2><p>{event.description}</p><div className="events-page-info"><span><i className="bi bi-geo-alt" aria-hidden="true"></i>{event.location}</span><span><i className="bi bi-clock" aria-hidden="true"></i>{event.time}</span></div></div><div className="events-page-action"><Link to="/contact" className="events-page-button">{t("eventsPage.moreInfo")} <i className="bi bi-arrow-left" aria-hidden="true"></i></Link></div></article>)}</div></div></section>
    <section className="events-page-cta"><div className="container"><div className="events-page-cta-inner"><div><span>{t("eventsPage.ctaOverline")}</span><h2>{t("eventsPage.ctaTitle")}<strong>{t("eventsPage.ctaStrong")}</strong></h2><p>{t("eventsPage.ctaText")}</p></div><Link to="/opportunities" className="aapi-white-button">{t("eventsPage.ctaButton")} <i className="bi bi-arrow-left" aria-hidden="true"></i></Link></div></div></section>
  </>;
}
export default EventsPage;
