import { useEffect, useState } from "react";
import { useTranslation } from "../../i18n/I18nProvider";

interface Statistic { icon:string; value:number; suffix:string; label:string; description:string; }
interface StatisticCardProps extends Statistic {}

function Statistics() {
  const { t, language } = useTranslation();

  const statistics: Statistic[] = language === "ar"
    ? [
        { icon:"bi-people", value:20000, suffix:"+", label:"مشروع استثماري", description:"مشروعًا مسجلًا لدى الوكالة الجزائرية لترقية الاستثمار" },
        { icon:"bi-cash-stack", value:9000, suffix:"+ مليار دج", label:"قيمة الاستثمارات", description:"القيمة الإجمالية المصرح بها للمشاريع الاستثمارية" },
        { icon:"bi-briefcase", value:525000, suffix:"+", label:"منصب عمل متوقع", description:"مناصب العمل المتوقع خلقها من المشاريع المسجلة" },
        { icon:"bi-building", value:216, suffix:"", label:"وعاءً عقاريًا", description:"وعاءً عقاريًا موجهًا لمشاريع استثمارية" },
      ]
    : language === "fr"
      ? [
          { icon:"bi-people", value:20000, suffix:"+", label:"Projet d'investissement", description:"Projets enregistrés auprès de l'AAPI" },
          { icon:"bi-cash-stack", value:9000, suffix:"+ Mds DA", label:"Valeur des investissements", description:"Valeur globale déclarée des projets d'investissement" },
          { icon:"bi-briefcase", value:525000, suffix:"+", label:"Emplois prévisionnels", description:"Emplois devant être créés par les projets enregistrés" },
          { icon:"bi-building", value:216, suffix:"", label:"Assiettes foncières", description:"Assiettes foncières destinées à des projets d'investissement" },
        ]
      : [
          { icon:"bi-people", value:20000, suffix:"+", label:"Investment projects", description:"Projects registered with AAPI" },
          { icon:"bi-cash-stack", value:9000, suffix:"+ Bn DA", label:"Investment value", description:"Total declared value of investment projects" },
          { icon:"bi-briefcase", value:525000, suffix:"+", label:"Expected jobs", description:"Jobs expected to be created by registered projects" },
          { icon:"bi-building", value:216, suffix:"", label:"Investment land plots", description:"Land plots allocated for investment projects" },
        ];

  return <section className="statistics-section"><div className="statistics-background"></div><div className="container">
    <div className="statistics-header"><div><span className="statistics-overline">{t("statistics.overline")}</span><h2>{t("statistics.title")} <strong>{t("statistics.titleStrong")}</strong></h2></div><p>{t("statistics.description")}</p></div>
    <div className="row g-0 statistics-grid">{statistics.map(stat=><StatisticCard key={stat.label} {...stat}/>)}</div>
  </div></section>;
}

function StatisticCard({icon,value,suffix,label,description}: StatisticCardProps) {
  const [count,setCount]=useState(0);

  useEffect(()=>{
    const duration=1400;
    const startTime=performance.now();
    let frame=0;
    const animate=(time:number)=>{
      const progress=Math.min((time-startTime)/duration,1);
      setCount(Math.floor(value*(1-Math.pow(1-progress,3))));
      if(progress<1) frame=requestAnimationFrame(animate);
    };
    frame=requestAnimationFrame(animate);
    return()=>cancelAnimationFrame(frame);
  },[value]);

  return <div className="col-xl-3 col-lg-6 col-md-6"><article className="statistic-card"><div className="statistic-card-top"><div className="statistic-icon"><i className={`bi ${icon}`} aria-hidden="true"></i></div></div><div className="statistic-value">{count}<span>{suffix}</span></div><h3>{label}</h3><p>{description}</p><div className="statistic-line"><span></span></div></article></div>;
}

export default Statistics;
