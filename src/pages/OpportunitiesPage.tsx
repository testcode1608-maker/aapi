import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../i18n/I18nProvider";

type Opportunity = { id:number; sector:string; icon:string; title:string; location:string; description:string; investment:string; jobs:string; };

function OpportunitiesPage() {
  const { t } = useTranslation();
  const sectors = [
    ["all", "all"], ["industry", "industry"], ["agriculture", "agriculture"], ["energy", "energy"],
    ["tourism", "tourism"], ["technology", "technology"], ["transport", "transport"],
  ] as const;
  const opportunities: Opportunity[] = [
    { id:1, sector:t("opportunitiesPage.industry"), icon:"bi-buildings", title:t("opportunitiesPage.o1"), location:t("opportunitiesPage.locAlgiers"), description:t("opportunitiesPage.o1Text"), investment:t("opportunitiesPage.medium"), jobs:`120 ${t("opportunitiesPage.jobUnit")}` },
    { id:2, sector:t("opportunitiesPage.agriculture"), icon:"bi-tree", title:t("opportunitiesPage.o2"), location:t("opportunitiesPage.locBiskra"), description:t("opportunitiesPage.o2Text"), investment:t("opportunitiesPage.medium"), jobs:`80 ${t("opportunitiesPage.jobUnit")}` },
    { id:3, sector:t("opportunitiesPage.energy"), icon:"bi-sun", title:t("opportunitiesPage.o3"), location:t("opportunitiesPage.locHighlands"), description:t("opportunitiesPage.o3Text"), investment:t("opportunitiesPage.large"), jobs:`150 ${t("opportunitiesPage.jobUnit")}` },
    { id:4, sector:t("opportunitiesPage.tourism"), icon:"bi-buildings", title:t("opportunitiesPage.o4"), location:t("opportunitiesPage.locOran"), description:t("opportunitiesPage.o4Text"), investment:t("opportunitiesPage.large"), jobs:`200 ${t("opportunitiesPage.jobUnit")}` },
    { id:5, sector:t("opportunitiesPage.technology"), icon:"bi-cpu", title:t("opportunitiesPage.o5"), location:t("opportunitiesPage.locCapital"), description:t("opportunitiesPage.o5Text"), investment:t("opportunitiesPage.medium"), jobs:`100 ${t("opportunitiesPage.jobUnit")}` },
    { id:6, sector:t("opportunitiesPage.transport"), icon:"bi-truck", title:t("opportunitiesPage.o6"), location:t("opportunitiesPage.locSetif"), description:t("opportunitiesPage.o6Text"), investment:t("opportunitiesPage.large"), jobs:`170 ${t("opportunitiesPage.jobUnit")}` },
  ];
  const [activeSector, setActiveSector] = useState("all");
  const [search, setSearch] = useState("");
  const filteredOpportunities = useMemo(() => {
    const value = search.trim().toLowerCase();
    const activeLabel = activeSector === "all" ? "" : t(`opportunitiesPage.${activeSector}`);
    return opportunities.filter((opportunity) => {
      const matchesSector = !activeLabel || opportunity.sector === activeLabel;
      const matchesSearch = !value || [opportunity.title, opportunity.location, opportunity.sector, opportunity.description].some((item) => item.toLowerCase().includes(value));
      return matchesSector && matchesSearch;
    });
  }, [activeSector, search, t]);
  const resetFilters = () => { setSearch(""); setActiveSector("all"); };

  return <>
    <section className="inner-hero opportunities-inner-hero"><div className="container"><div className="inner-hero-content"><span>{t("opportunitiesPage.heroOverline")}</span><h1>{t("opportunitiesPage.heroTitle")}</h1><p>{t("opportunitiesPage.heroText")}</p></div></div></section>

    <section className="aapi-section-header"><div className="container"><div className="row align-items-end g-4"><div className="col-lg-7"><span className="section-overline">{t("opportunitiesPage.introOverline")}</span><h2 className="opportunities-title">{t("opportunitiesPage.introTitle")}<strong>{t("opportunitiesPage.introStrong")}</strong></h2><p>{t("opportunitiesPage.introText")}</p></div><div className="col-lg-5"><div className="opportunities-search"><i className="bi bi-search" aria-hidden="true"/><input type="search" placeholder={t("opportunitiesPage.searchPlaceholder")} value={search} onChange={(e)=>setSearch(e.target.value)} aria-label={t("opportunitiesPage.searchLabel")}/></div></div></div></div></section>

    <section className="opportunities-content"><div className="container">
      <div className="opportunities-filters"><div className="opportunities-filter-title"><i className="bi bi-funnel" aria-hidden="true"/><span>{t("opportunitiesPage.filter")}</span></div><div className="opportunities-filter-buttons">{sectors.map(([key])=><button key={key} type="button" className={activeSector===key?"active":""} onClick={()=>setActiveSector(key)} aria-pressed={activeSector===key}>{t(`opportunitiesPage.${key}`)}</button>)}</div></div>
      <div className="opportunities-results-header"><div><span>{t("opportunitiesPage.results")}</span><strong>{filteredOpportunities.length}</strong></div><p>{t("opportunitiesPage.available")}</p></div>
      <div className="row g-4">{filteredOpportunities.map((opportunity)=><div className="col-lg-4 col-md-6" key={opportunity.id}><article className="opportunity-card"><div className="opportunity-card-top"><div className="opportunity-icon"><i className={`bi ${opportunity.icon}`} aria-hidden="true"/></div><span className="opportunity-sector">{opportunity.sector}</span></div><h3>{opportunity.title}</h3><div className="opportunity-location"><i className="bi bi-geo-alt" aria-hidden="true"/><span>{opportunity.location}</span></div><p>{opportunity.description}</p><div className="opportunity-meta"><div><span>{t("opportunitiesPage.investmentSize")}</span><strong>{opportunity.investment}</strong></div><div><span>{t("opportunitiesPage.jobs")}</span><strong>{opportunity.jobs}</strong></div></div><Link to={`/opportunities?opportunity=${opportunity.id}`} className="opportunity-button" aria-label={`${t("opportunitiesPage.details")} ${opportunity.title}`}>{t("opportunitiesPage.details")}<i className="bi bi-arrow-left" aria-hidden="true"/></Link></article></div>)}</div>
      {filteredOpportunities.length===0&&<div className="opportunities-empty"><i className="bi bi-search" aria-hidden="true"/><h3>{t("opportunitiesPage.emptyTitle")}</h3><p>{t("opportunitiesPage.emptyText")}</p><button type="button" onClick={resetFilters}>{t("opportunitiesPage.reset")}</button></div>}
    </div></section>

    <section className="opportunities-cta"><div className="container"><div className="opportunities-cta-box"><div><span>{t("opportunitiesPage.ctaOverline")}</span><h2>{t("opportunitiesPage.ctaTitle")}<strong>{t("opportunitiesPage.ctaStrong")}</strong></h2><p>{t("opportunitiesPage.ctaText")}</p></div><Link to="/investor" className="opportunities-cta-button">{t("opportunitiesPage.investorSpace")}<i className="bi bi-arrow-left" aria-hidden="true"/></Link></div></div></section>
  </>;
}
export default OpportunitiesPage;
