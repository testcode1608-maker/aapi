import { Link } from "react-router-dom";
import { useTranslation } from "../i18n/I18nProvider";

function Services() {
  const { t } = useTranslation();
  const services = [
    { icon:"bi-laptop", number:"01", title:t("services.digital"), text:t("services.digitalText"), link:"/investor" },
    { icon:"bi-briefcase", number:"02", title:t("services.briefcase"), text:t("services.briefcaseText"), link:"/investor#investor-services" },
    { icon:"bi-bar-chart-line", number:"03", title:t("services.opportunities"), text:t("services.opportunitiesText"), link:"/opportunities" },
    { icon:"bi-book", number:"04", title:t("services.guide"), text:t("services.guideText"), link:"/investor#investor-steps" },
  ];
  return (
    <section className="services-aapi" id="services">
      <div className="container">
        <div className="aapi-section-header">
          <div><span className="section-overline">{t("services.overline")}</span><h2>{t("services.title")}<br/><strong>{t("services.titleStrong")}</strong></h2></div>
          <p>{t("services.description")}</p>
        </div>
        <div className="row g-4">
          {services.map(service => <div className="col-xl-3 col-lg-6 col-md-6" key={service.number}>
            <article className="aapi-service-card">
              <div className="service-card-top"><span className="service-number">{service.number}</span><div className="service-card-icon"><i className={`bi ${service.icon}`}></i></div></div>
              <h3>{service.title}</h3><p>{service.text}</p>
              <Link to={service.link}>{t("services.discover")}<i className="bi bi-arrow-left"></i></Link>
            </article>
          </div>)}
        </div>
      </div>
    </section>
  );
}
export default Services;
