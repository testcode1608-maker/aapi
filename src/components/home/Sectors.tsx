import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../../i18n/I18nProvider";
import "../../styles/home-sectors.css";

type Sector = {
  id: number;
  nom: string;
  slug: string;
  description: string | null;
  icone: string | null;
  statut: string;
};

const API = "http://localhost/aapi-api/sectors.php";

function Sectors() {
  const { t } = useTranslation();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSectors = async () => {
      try {
        setLoading(true);
        const response = await fetch(API);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || t("sectors.loadError"));
        }

        setSectors(Array.isArray(data.sectors) ? data.sectors : []);
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : t("sectors.loadError"));
        setSectors([]);
      } finally {
        setLoading(false);
      }
    };

    void loadSectors();
  }, [t]);

  return (
    <section className="sectors-section" id="investment">
      <div className="container">
        <div className="aapi-section-header centered">
          <span className="section-overline">{t("sectors.overline")}</span>
          <h2>{t("sectors.title")} <strong>{t("sectors.titleStrong")}</strong></h2>
          <p>{t("sectors.description")}</p>
        </div>

        {loading ? (
          <div className="sectors-loading" role="status">
            {t("sectors.loading")}
          </div>
        ) : error ? (
          <div className="sectors-error" role="alert">
            {error}
          </div>
        ) : sectors.length === 0 ? (
          <div className="sectors-empty">
            {t("sectors.empty")}
          </div>
        ) : (
          <div className="row g-0 sectors-grid">
            {sectors.map((sector, index) => (
              <div className="col-xl-4 col-lg-4 col-md-6" key={sector.id}>
                <article className="sector-card">
                  <div className="sector-card-top">
                    <span className="sector-card-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="sector-icon">
                      <i
                        className={`bi ${sector.icone || "bi-buildings"}`}
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  <div className="sector-content">
                    <h3>{sector.nom}</h3>
                    <p>{sector.description || "—"}</p>

                    <Link to={`/sectors/${sector.slug}`} className="sector-link">
                      <span>{t("common.discover")}</span>
                      <i className="bi bi-arrow-left" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              </div>
            ))}
          </div>
        )}

        <div className="sectors-button-wrapper">
          <Link to="/sectors" className="green-outline-button">
            <span>{t("common.allSectors")}</span>
            <i className="bi bi-arrow-left" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Sectors;
