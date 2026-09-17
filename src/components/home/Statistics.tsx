import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "../../i18n/I18nProvider";
import "../../styles/home/statistics.css";

interface StatisticsData {
  projects: number;
  investors: number;
  investment_value: number;
  jobs: number;
}

const STATISTICS_API = "http://localhost/aapi-api/statistics.php";

const labels = {
  ar: { title: "أرقام الاستثمار", projects: "المشاريع الاستثمارية", investors: "المستثمرون النشطون", investment_value: "قيمة الاستثمارات", jobs: "مناصب العمل", loading: "جاري تحميل البيانات...", error: "تعذر تحميل الإحصائيات من خادم AAPI." },
  fr: { title: "Chiffres de l’investissement", projects: "Projets d’investissement", investors: "Investisseurs actifs", investment_value: "Valeur des investissements", jobs: "Emplois", loading: "Chargement des données...", error: "Impossible de charger les statistiques depuis le serveur AAPI." },
  en: { title: "Investment figures", projects: "Investment projects", investors: "Active investors", investment_value: "Investment value", jobs: "Jobs", loading: "Loading data...", error: "Unable to load statistics from the AAPI server." },
} as const;

export default function Statistics() {
  const { language } = useTranslation();
  const [data, setData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadStatistics = async () => {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch(STATISTICS_API, {
          method: "GET",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const payload = await response.json();
        const source = payload?.data ?? payload;

        if (
          payload?.success === false ||
          !source ||
          !Number.isFinite(Number(source.projects)) ||
          !Number.isFinite(Number(source.investors)) ||
          !Number.isFinite(Number(source.investment_value)) ||
          !Number.isFinite(Number(source.jobs))
        ) {
          throw new Error("Invalid statistics response");
        }

        setData({
          projects: Number(source.projects),
          investors: Number(source.investors),
          investment_value: Number(source.investment_value),
          jobs: Number(source.jobs),
        });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("AAPI statistics error:", err);
        setData(null);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadStatistics();
    return () => controller.abort();
  }, []);

  const copy = labels[language];
  const formatter = useMemo(
    () => new Intl.NumberFormat(language === "ar" ? "ar-DZ" : "fr-DZ"),
    [language],
  );

  const items = [
    { key: "projects", label: copy.projects, value: data?.projects, icon: "bi-buildings" },
    { key: "investors", label: copy.investors, value: data?.investors, icon: "bi-people" },
    { key: "investment_value", label: copy.investment_value, value: data?.investment_value, icon: "bi-cash-stack", currency: true },
    { key: "jobs", label: copy.jobs, value: data?.jobs, icon: "bi-briefcase" },
  ];

  return (
    <section className="statistics-section" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="statistics-container">
        <div className="statistics-heading">
          <h2>{copy.title}</h2>
          {(loading || error) && (
            <p className={`statistics-status${error ? " is-error" : ""}`}>
              {loading ? copy.loading : copy.error}
            </p>
          )}
        </div>

        <div className="statistics-grid admin-kpi-grid soft-ui-kpi-grid">
          {items.map((item) => (
            <article className="admin-kpi-card soft-ui-kpi" key={item.key}>
              <div className="admin-kpi-icon">
                <i className={`bi ${item.icon}`} aria-hidden="true" />
              </div>
              <div className="admin-kpi-content">
                <span className="admin-kpi-label">{item.label}</span>
                <strong className="admin-kpi-value">
                  {loading ? "—" : error || item.value === undefined ? "—" : formatter.format(item.value)}
                  {item.currency && !loading && !error && item.value !== undefined ? " DA" : ""}
                </strong>
              </div>
              <svg className="admin-kpi-arrow" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
