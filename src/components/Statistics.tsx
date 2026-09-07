
import { useEffect, useState } from "react";

interface Statistic {
  icon: string;
  value: number;
  suffix: string;
  label: string;
  description: string;
}

interface StatisticCardProps extends Statistic {}

function Statistics() {
  const statistics: Statistic[] = [
    {
      icon: "bi-people",
      value: 1200,
      suffix: "+",
      label: "مشروع استثماري",
      description: "مشاريع استثمارية مسجلة",
    },
    {
      icon: "bi-briefcase",
      value: 48,
      suffix: "+",
      label: "قطاع اقتصادي",
      description: "قطاعات متاحة للاستثمار",
    },
    {
      icon: "bi-geo-alt",
      value: 58,
      suffix: "",
      label: "ولاية",
      description: "فرص استثمارية عبر الوطن",
    },
    {
      icon: "bi-graph-up-arrow",
      value: 95,
      suffix: "%",
      label: "نسبة النمو",
      description: "مؤشر تطور الاستثمار",
    },
  ];

  return (
    <section className="statistics-section">
      <div className="statistics-background"></div>

      <div className="container">

        {/* ========================================================
            HEADER
           ======================================================== */}

        <div className="statistics-header">

          <div>
            <span className="statistics-overline">
              أرقام ومؤشرات
            </span>

            <h2>
              الاستثمار في الجزائر
              <strong> بالأرقام</strong>
            </h2>
          </div>

          <p>
            مؤشرات تعكس الإمكانات الكبيرة التي توفرها الجزائر
            للمستثمرين المحليين والدوليين.
          </p>

        </div>

        {/* ========================================================
            STATISTICS
           ======================================================== */}

        <div className="row g-0 statistics-grid">

          {statistics.map((stat) => (
            <StatisticCard
              key={stat.label}
              icon={stat.icon}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              description={stat.description}
            />
          ))}

        </div>

      </div>
    </section>
  );
}

/* ================================================================
   STATISTIC CARD
   ================================================================ */

function StatisticCard({
  icon,
  value,
  suffix,
  label,
  description,
}: StatisticCardProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1400;
    const startTime = performance.now();

    let animationFrame = 0;

    const animate = (currentTime: number) => {
      const progress = Math.min(
        (currentTime - startTime) / duration,
        1
      );

      const easedProgress =
        1 - Math.pow(1 - progress, 3);

      setCount(
        Math.floor(value * easedProgress)
      );

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [value]);

  return (
    <div className="col-xl-3 col-lg-6 col-md-6">

      <article className="statistic-card">

        <div className="statistic-card-top">

          <div className="statistic-icon">
            <i
              className={`bi ${icon}`}
              aria-hidden="true"
            ></i>
          </div>

          

        </div>

        <div className="statistic-value">
          {count}
          <span>{suffix}</span>
        </div>

        <h3>
          {label}
        </h3>

        <p>
          {description}
        </p>

        <div className="statistic-line">
          <span></span>
        </div>

      </article>

    </div>
  );
}

export default Statistics;

