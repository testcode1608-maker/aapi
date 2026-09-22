import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../i18n/I18nProvider";
import "../styles/opportunities-cards.css";

type Opportunity={id:number;secteur:string;icone:string;titre:string;wilaya:string;description:string;investissement:string;emplois:string;image_url:string;statut:string};

const API="http://localhost/aapi-api/opportunities.php";

function OpportunitiesPage(){
 const {t}=useTranslation();
 const [opportunities,setOpportunities]=useState<Opportunity[]>([]);
 const [activeSector,setActiveSector]=useState("all");
 const [search,setSearch]=useState("");
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [sectors,setSectors]=useState<Array<{id:number;nom:string;slug:string;icone:string}>>([]);
 useEffect(()=>{
  let cancelled=false;
  setLoading(true);
  setError("");
  Promise.all([
   fetch(API,{cache:"no-store"}),
   fetch("http://localhost/aapi-api/sectors.php",{cache:"no-store"})
  ])
   .then(async([opportunitiesResponse,sectorsResponse])=>{
    const opportunitiesData=await opportunitiesResponse.json().catch(()=>null);
    const sectorsData=await sectorsResponse.json().catch(()=>null);
    if(!opportunitiesResponse.ok) throw new Error(opportunitiesData?.message||`Erreur API (${opportunitiesResponse.status})`);
    if(!opportunitiesData?.success) throw new Error(opportunitiesData?.message||"Impossible de charger les opportunités.");
    if(!sectorsResponse.ok) throw new Error(sectorsData?.message||`Erreur API secteurs (${sectorsResponse.status})`);
    if(!sectorsData?.success) throw new Error(sectorsData?.message||"Impossible de charger les secteurs.");
    if(!cancelled){
     setOpportunities(Array.isArray(opportunitiesData.opportunities)?opportunitiesData.opportunities:[]);
     setSectors(Array.isArray(sectorsData.sectors)?sectorsData.sectors:[]);
    }
   })
   .catch(error=>{
    if(cancelled)return;
    setOpportunities([]);
    setSectors([]);
    setError(error instanceof Error?error.message:"Impossible de charger les opportunités.");
   })
   .finally(()=>{if(!cancelled)setLoading(false)});
  return()=>{cancelled=true};
 },[]);
 const filtered=useMemo(()=>{const value=search.trim().toLowerCase();const selectedSector=sectors.find(s=>String(s.id)===activeSector);return opportunities.filter(o=>(!selectedSector||o.secteur===selectedSector.nom)&&(!value||[o.titre,o.wilaya,o.secteur,o.description].some(v=>String(v).toLowerCase().includes(value))))},[activeSector,search,opportunities,sectors]);
 const reset=()=>{setSearch("");setActiveSector("all")};
 return <>
  <section className="inner-hero opportunities-inner-hero"><div className="container"><div className="inner-hero-content"><span>{t("opportunitiesPage.heroOverline")}</span><h1>{t("opportunitiesPage.heroTitle")}</h1><p>{t("opportunitiesPage.heroText")}</p></div></div></section>
  <section className="aapi-section-header"><div className="container"><div className="row align-items-end g-4"><div className="col-lg-7"><span className="section-overline">{t("opportunitiesPage.introOverline")}</span><h2 className="opportunities-title">{t("opportunitiesPage.introTitle")}<strong>{t("opportunitiesPage.introStrong")}</strong></h2><p>{t("opportunitiesPage.introText")}</p></div><div className="col-lg-5"><div className="opportunities-search"><i className="bi bi-search" aria-hidden="true"/><input type="search" placeholder={t("opportunitiesPage.searchPlaceholder")} value={search} onChange={e=>setSearch(e.target.value)} aria-label={t("opportunitiesPage.searchLabel")}/></div></div></div></div></section>
  <section className="opportunities-content"><div className="container">
   <div className="opportunities-filters"><div className="opportunities-filter-title"><i className="bi bi-funnel" aria-hidden="true"/><span>{t("opportunitiesPage.filter")}</span></div><div className="opportunities-filter-buttons"><button type="button" className={activeSector==="all"?"active":""} onClick={()=>setActiveSector("all")} aria-pressed={activeSector==="all"}>{t("opportunitiesPage.all")}</button>{sectors.map(sector=><button key={sector.id} type="button" className={activeSector===String(sector.id)?"active":""} onClick={()=>setActiveSector(String(sector.id))} aria-pressed={activeSector===String(sector.id)}>{sector.nom}</button>)}</div></div>
   <div className="opportunities-results-header"><div><span>{t("opportunitiesPage.results")}</span><strong>{filtered.length}</strong></div><p>{t("opportunitiesPage.available")}</p></div>
   {loading?<div className="opportunities-empty"><i className="bi bi-hourglass-split"/><h3>{t("opportunitiesPage.results")}</h3></div>:error?<div className="opportunities-empty"><i className="bi bi-exclamation-triangle"/><h3>Impossible de charger les opportunités</h3><p>{error}</p><button type="button" onClick={()=>window.location.reload()}>Réessayer</button></div>:<div className="row g-4">{filtered.map(o=><div className="col-lg-4 col-md-6" key={o.id}><article className="opportunity-card">
    <div className="opportunity-card-image"><img src={o.image_url} alt={o.titre} loading="lazy" onError={e=>{e.currentTarget.style.display="none"}}/><div className="opportunity-image-overlay"/><span className="opportunity-sector opportunity-sector-overlay">{o.secteur}</span></div>
    <div className="opportunity-card-body"><div className="opportunity-card-top"><div className="opportunity-icon"><i className={`bi ${o.icone||"bi-buildings"}`} aria-hidden="true"/></div><span className="opportunity-sector">{o.secteur}</span></div><h3>{o.titre}</h3><div className="opportunity-location"><i className="bi bi-geo-alt" aria-hidden="true"/><span>{o.wilaya}</span></div><p>{o.description}</p><div className="opportunity-meta"><div><span>{t("opportunitiesPage.investmentSize")}</span><strong>{o.investissement}</strong></div><div><span>{t("opportunitiesPage.jobs")}</span><strong>{o.emplois}</strong></div></div><Link to={`/opportunities?opportunity=${o.id}`} className="opportunity-button" aria-label={`${t("opportunitiesPage.details")} ${o.titre}`}>{t("opportunitiesPage.details")}<i className="bi bi-arrow-left" aria-hidden="true"/></Link></div>
   </article></div>)}</div>}
   {!loading&&filtered.length===0&&<div className="opportunities-empty"><i className="bi bi-search" aria-hidden="true"/><h3>{t("opportunitiesPage.emptyTitle")}</h3><p>{t("opportunitiesPage.emptyText")}</p><button type="button" onClick={reset}>{t("opportunitiesPage.reset")}</button></div>}
  </div></section>
  <section className="opportunities-cta"><div className="container"><div className="opportunities-cta-box"><div><span>{t("opportunitiesPage.ctaOverline")}</span><h2>{t("opportunitiesPage.ctaTitle")}<strong>{t("opportunitiesPage.ctaStrong")}</strong></h2><p>{t("opportunitiesPage.ctaText")}</p></div><Link to="/investor" className="opportunities-cta-button">{t("opportunitiesPage.investorSpace")}<i className="bi bi-arrow-left" aria-hidden="true"/></Link></div></div></section>
 </>;
}
export default OpportunitiesPage;