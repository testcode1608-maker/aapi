import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "../../i18n/I18nProvider";

interface StatisticsData {
  projects: number;
  investors: number;
  investment_value: number;
  jobs: number;
}

interface StatisticCardProps {
  icon: string;
  value: number;
  label: string;
  description: string;
  valueSuffix?: string;
  isCurrency?: boolean;
}

const STATISTICS_API = "http://localhost/aapi-api/statistics.php";

function Statistics() {
  const { t, language } = useTranslation();
  const [data, setData] = useState<StatisticsData>({
    projects: 0,
    investors: 0,
    investment_value: 0,
    jobs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const loadStatistics = async () => {
      try {
        const response = await fetch(STATISTICS_API, {
          method: "GET",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Statistics API returned ${response.status}`);
        }

        const result = await response.json();
        const source = result?.data ?? result;

        setData({
          projects: Number(source?.projects ?? 0),
          investors: Number(source?.investors ?? 0),
          investment_value: Number(source?.investment_value ?? 0),
          jobs: Number(source?.jobs ?? 0),
        });
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("Unable to load AAPI statistics:", error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadStatistics();

    return () => controller.abort();
  }, []);

  const statistics = useMemo(() => {
    if (language === "ar") {
      return [
        {
          icon: "bi-folder2-open",
          value: data.projects,
          label: "إجمالي المشاريع",
          description: "المشاريع الاستثمارية المسجلة لدى الوكالة",
        },
        {
          icon: "bi-people",
          value: data.investors,
          label: "المستثمرون",
          description: "المستثمرون المسجلون في المنصة",
        },
        {
          icon: "bi-cash-stack",
          value: data.investment_value,
          label: "قيمة الاستثمارات",
          description: "القيمة الإجمالية للاستثمارات المسجلة",
          isCurrency: true,
        },
        {
          icon: "bi-briefcase",
          value: data.jobs,
          label: "مناصب العمل",
          description: "مناصب العمل المتوقعة من المشاريع المسجلة",
        },
      ];
    }

    if (language === "fr") {
      return [
        {
          icon: "bi-folder2-open",
          value: data.projects,
          label: "Projets d'investissement",
          description: "Projets d'investissement enregistrés auprès de l'AAPI",
        },
        {
          icon: "bi-people",
          value: data.investors,
          label: "Investisseurs",
          description: "Investisseurs enregistrés sur la plateforme",
        },
        {
          icon: "bi-cash-stack",
          value: data.investment_value,
          label: "Valeur des investissements",
          description: "Valeur totale des investissements enregistrés",
          isCurrency: true,
        },
        {
          icon: "bi-briefcase",
          value: data.jobs,
          label: "Emplois",
          description: "Emplois prévisionnels liés aux projets enregistrés",
        },
      ];
    }

    return [
      {
        icon: "bi-folder2-open",
        value: data.projects,
        label: "Investment projects",
        description: "Investment projects registered with AAPI",
      },
      {
        icon: "bi-people",
        value: data.investors,
        label: "Investors",
        description: "Investors registered on the platform",
      },
      {
        icon: "bi-cash-stack",
        value: data.investment_value,
        label: "Investment value",
        description: "Total value of registered investments",
        isCurrency: true,
      },
      {
        icon: "bi-briefcase",
        value: data.jobs,
        label: "Jobs",
        description: "Expected jobs from registered projects",
      },
    ];
  }, [data, language]);

  return (
    <section className="statistics-section">
      <div className="statistics-background" />
      <div className="container">
        <div className="statistics-header">
          <div>
            <span className="statistics-overline">{t("statistics.overline")}</span>
            <h2>
              {t("statistics.title")} <strong>{t("statistics.titleStrong")}</strong>
            </h2>
          </div>
          <p>{t("statistics.description")}</p>
        </div>

        <div className="statistics-grid admin-kpi-grid soft-ui-kpi-grid">
          {statistics.map((stat) => (
            <StatisticCard
              key={stat.label}
              {...stat}
              loading={loading}
              valueSuffix={stat.isCurrency ? " DA" : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatisticCard({
  icon,
  value,
  label,
  description,
  valueSuffix,
  isCurrency,
  loading,
}: StatisticCardProps & { loading: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (loading) return;

    const duration = 1200;
    const startTime = performance.now();
    let frame = 0;

    const animate = (time: number) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(value * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [loading, value]);

  const displayValue = isCurrency
    ? new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 0 }).format(count)
    : new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 0 }).format(count);

  return (
    <article className="admin-kpi-card soft-ui-kpi">
      <div className="admin-kpi-icon">
        <i className={`bi ${icon}`} aria-hidden="true" />
      </div>

      <div className="admin-kpi-content">
        <span>{label}</span>
        <strong>{loading ? "—" : `${displayValue}${valueSuffix ?? ""}`}</strong>
        <small>
          <i className="bi bi-graph-up-arrow" aria-hidden="true" />
          {description}
        </small>
      </div>

      <svg
        className="admin-kpi-arrow"
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M5 12h13M13 6l6 6-6 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </article>
  );
}

export default Statistics;
