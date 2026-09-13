import { useEffect, useState } from "react";
import { useTranslation } from "../i18n/I18nProvider";

interface Statistic { icon:string; value:number; suffix:string; label:string; description:string; }
interface StatisticCardProps extends Statistic {}

function Statistics() {
  const { t } = useTranslation();
  const statistics: Statistic[] = [
    { icon:"bi-people", value:1200, suffix:"+", label:t("statistics.projects"), description:t("statistics.projectsText") },
    { icon:"bi-briefcase", value:48, suffix:"+", label:t("statistics.sectors"), description:t("statistics.sectorsText") },
    { icon:"bi-geo-alt", value:58, suffix:"", label:t("statistics.wilayas"), description:t("statistics.wilayasText") },
    { icon:"bi-graph-up-arrow", value:95, suffix:"%", label:t("statistics.growth"), description:t("statistics.growthText") },
  ];
  return <section className="statistics-section"><div className="statistics-background"></div><div className="container">
    <div className="statistics-header"><div><span className="statistics-overline">{t("statistics.overline")}</span><h2>{t("statistics.title")} <strong>{t("statistics.titleStrong")}</strong></h2></div><p>{t("statistics.description")}</p></div>
    <div className="row g-0 statistics-grid">{statistics.map(stat=><StatisticCard key={stat.label} {...stat}/>)}</div>
  </div></section>;
}
function StatisticCard({icon,value,suffix,label,description}: StatisticCardProps) {
  const [count,setCount]=useState(0);
  useEffect(()=>{const duration=1400,startTime=performance.now();let frame=0;const animate=(time:number)=>{const progress=Math.min((time-startTime)/duration,1);setCount(Math.floor(value*(1-Math.pow(1-progress,3))));if(progress<1) frame=requestAnimationFrame(animate);};frame=requestAnimationFrame(animate);return()=>cancelAnimationFrame(frame);},[value]);
  return <div className="col-xl-3 col-lg-6 col-md-6"><article className="statistic-card"><div className="statistic-card-top"><div className="statistic-icon"><i className={`bi ${icon}`} aria-hidden="true"></i></div></div><div className="statistic-value">{count}<span>{suffix}</span></div><h3>{label}</h3><p>{description}</p><div className="statistic-line"><span></span></div></article></div>;
}
export default Statistics;
