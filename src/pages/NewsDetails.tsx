import { Link, useParams } from "react-router-dom";
import { useTranslation } from "../i18n/I18nProvider";
import { newsDetailsTranslations } from "../i18n/newsDetailsTranslations";

function NewsDetails() {
  const { id } = useParams<{ id: string }>();
  const { language } = useTranslation();
  const page = newsDetailsTranslations[language].page;
  const article = newsDetailsTranslations[language].articles[id as keyof typeof newsDetailsTranslations[typeof language]["articles"]];

  if (!article) return <section className="news-details-not-found"><div className="container"><div className="news-details-empty"><div className="news-details-empty-icon"><i className="bi bi-newspaper" aria-hidden="true"></i></div><h1>{page.notFound}</h1><p>{page.notFoundText}</p><Link to="/news" className="aapi-primary-button">{page.back}<i className="bi bi-arrow-left" aria-hidden="true"></i></Link></div></div></section>;

  return <>
    <section className="inner-hero news-details-hero"><div className="container"><div className="inner-hero-content"><span>{article.category}</span><h1>{page.details}</h1><p>{article.date}</p></div></div></section>
    <section className="news-details-section"><div className="container"><div className="row g-5">
      <div className="col-lg-8"><article className="news-details-article"><div className="news-details-cover"><div className="news-details-cover-pattern"></div><div className="news-details-cover-icon"><i className={`bi ${article.icon}`} aria-hidden="true"></i></div><span className="news-details-cover-category">{article.category}</span><div className="news-details-cover-date"><i className="bi bi-calendar3" aria-hidden="true"></i>{article.date}</div></div>
        <div className="news-details-content"><div className="news-details-meta"><span><i className="bi bi-newspaper" aria-hidden="true"></i>{page.agencyNews}</span><span><i className="bi bi-calendar3" aria-hidden="true"></i>{article.date}</span></div><h1>{article.title}</h1><div className="news-details-divider"></div>{article.content.map((paragraph,index)=><p key={`${id}-${index}`}>{paragraph}</p>)}<div className="news-details-share"><span>{page.share}</span><div className="news-share-buttons"><button type="button" aria-label={page.facebook}><i className="bi bi-facebook" aria-hidden="true"></i></button><button type="button" aria-label={page.x}><i className="bi bi-twitter-x" aria-hidden="true"></i></button><button type="button" aria-label={page.linkedin}><i className="bi bi-linkedin" aria-hidden="true"></i></button></div></div></div>
      </article></div>
      <div className="col-lg-4"><aside className="news-details-sidebar"><div className="news-sidebar-card"><div className="news-sidebar-icon"><i className="bi bi-newspaper" aria-hidden="true"></i></div><h3>{page.media}</h3><p>{page.mediaText}</p><Link to="/news" className="news-sidebar-link">{page.allNews}<i className="bi bi-arrow-left" aria-hidden="true"></i></Link></div><div className="news-sidebar-card news-sidebar-green"><span>{page.investment}</span><h3>{page.investmentTitle}</h3><p>{page.investmentText}</p><Link to="/opportunities" className="aapi-white-button">{page.discover}<i className="bi bi-arrow-left" aria-hidden="true"></i></Link></div><div className="news-sidebar-card"><h3>{page.help}</h3><p>{page.helpText}</p><Link to="/contact" className="news-sidebar-contact">{page.contact}<i className="bi bi-arrow-left" aria-hidden="true"></i></Link></div></aside></div>
    </div></div></section>
    <section className="news-details-bottom"><div className="container"><Link to="/news" className="news-back-button"><i className="bi bi-arrow-right" aria-hidden="true"></i>{page.backAll}</Link></div></section>
  </>;
}

export default NewsDetails;
