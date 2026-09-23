import { useEffect, useRef, useState } from "react";
import { algeriaWilayas58 } from "../data/algeriaWilayas58";
import { useTranslation } from "../i18n/I18nProvider";
import "../styles/algeria-wilaya-map.css";

declare global {
  interface Window {
    L?: any;
  }
}

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

function loadLeaflet() {
  return new Promise<any>((resolve, reject) => {
    if (window.L) {
      resolve(window.L);
      return;
    }

    const existingCss = document.querySelector('link[data-aapi-leaflet="true"]');
    if (!existingCss) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = LEAFLET_CSS;
      link.dataset.aapiLeaflet = "true";
      document.head.appendChild(link);
    }

    const existingScript = document.querySelector('script[data-aapi-leaflet="true"]') as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.L));
      existingScript.addEventListener("error", () => reject(new Error("Leaflet failed to load")));
      return;
    }

    const script = document.createElement("script");
    script.src = LEAFLET_JS;
    script.async = true;
    script.dataset.aapiLeaflet = "true";
    script.onload = () => window.L ? resolve(window.L) : reject(new Error("Leaflet unavailable"));
    script.onerror = () => reject(new Error("Leaflet failed to load"));
    document.body.appendChild(script);
  });
}

export default function AlgeriaWilayaMap() {
  const { language } = useTranslation();
  const copy = {
    ar: { country: "الجزائر", title: "خريطة الولايات الجزائرية", subtitle: "استكشف الولايات الـ 58 وحدد الولاية لعرض معلوماتها.", selected: "الولاية المختارة", count: "ولاية", search: "البحث عن ولاية...", close: "إغلاق", error: "تعذر تحميل الخريطة. تحقق من الاتصال بالإنترنت.", map: "الخريطة", list: "قائمة الولايات" },
    fr: { country: "Algérie", title: "Carte des wilayas d’Algérie", subtitle: "Explorez les 58 wilayas et sélectionnez une wilaya pour afficher ses informations.", selected: "Wilaya sélectionnée", count: "wilayas", search: "Rechercher une wilaya...", close: "Fermer", error: "Impossible de charger la carte. Vérifiez votre connexion Internet.", map: "Carte", list: "Liste des wilayas" },
    en: { country: "Algeria", title: "Algeria Wilayas Map", subtitle: "Explore the 58 wilayas and select one to view its information.", selected: "Selected wilaya", count: "wilayas", search: "Search for a wilaya...", close: "Close", error: "Unable to load the map. Please check your internet connection.", map: "Map", list: "Wilaya list" },
  }[language];
  const [search, setSearch] = useState("");
  const displayName = (wilaya: typeof algeriaWilayas58[number]) => language === "ar" ? wilaya.ar : wilaya.name;
  const filteredWilayas = algeriaWilayas58.filter((wilaya) => displayName(wilaya).toLocaleLowerCase().includes(search.toLocaleLowerCase()) || wilaya.code.includes(search));
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(algeriaWilayas58.find((w) => w.code === "016") ?? null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    const selector = ".why-algeria-circle";
    const onOpen = () => setOpen(true);
    document.addEventListener("click", (event) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(selector)) onOpen();
    });
    return () => {
      // delegated listener is recreated by the component only while mounted
    };
  }, []);

  useEffect(() => {
    if (!open || !mapRef.current || leafletMapRef.current) return;

    let cancelled = false;

    void loadLeaflet().then((L) => {
      if (cancelled || !mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [28.2, 2.6],
        zoom: 5,
        minZoom: 4,
        maxZoom: 9,
        scrollWheelZoom: true,
      });

      leafletMapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      algeriaWilayas58.forEach((wilaya) => {
        if (wilaya.lat === null || wilaya.lon === null) return;

        const marker = L.circleMarker([wilaya.lat, wilaya.lon], {
          radius: 7,
          weight: 2,
          color: "#ffffff",
          fillColor: "#198754",
          fillOpacity: 0.95,
        }).addTo(map);

        marker.bindTooltip(
          `<strong>${wilaya.code}</strong> · ${displayName(wilaya)}`,
          { direction: "top", offset: [0, -7] }
        );

        marker.on("click", () => setSelected(wilaya));
      });

      setTimeout(() => map.invalidateSize(), 150);
    }).catch(() => setMapError(true));

    return () => {
      cancelled = true;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    setMapError(false);
  };

  if (!open) return null;

  return (
    <div className="aapi-wilaya-map-overlay" role="dialog" aria-modal="true" aria-label={copy.title}>
      <div className="aapi-wilaya-map-modal" dir="rtl">
        <button type="button" className="aapi-wilaya-map-close" onClick={close} aria-label={copy.close}>
          <i className="bi bi-x-lg" aria-hidden="true" />
        </button>

        <div className="aapi-wilaya-map-heading">
          <span>{copy.country}</span>
          <h2>{copy.title}</h2>
          <p>{copy.subtitle}</p>
        </div>

        <div className="aapi-wilaya-map-body">
          <div className="aapi-wilaya-map-canvas" ref={mapRef}>
            {mapError && <div className="aapi-wilaya-map-error">{copy.error}</div>}
          </div>

          <aside className="aapi-wilaya-map-sidebar">
            <div className="aapi-wilaya-selected">
              <span>{copy.selected}</span>
              <strong>{selected ? displayName(selected) : copy.country}</strong>
              <small>{selected?.code ?? "016"}</small>
            </div>

            <div className="aapi-wilaya-count">
              <strong>58</strong>
              <span>{copy.count}</span>
            </div>

            <div className="aapi-wilaya-tools"><i className="bi bi-search" aria-hidden="true" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={copy.search} aria-label={copy.search} /></div>
            <div className="aapi-wilaya-list">
              {filteredWilayas.map((wilaya) => (
                <button
                  type="button"
                  key={wilaya.code}
                  className={selected?.code === wilaya.code ? "is-selected" : ""}
                  onClick={() => {
                    setSelected(wilaya);
                    if (leafletMapRef.current && wilaya.lat !== null && wilaya.lon !== null) {
                      leafletMapRef.current.setView([wilaya.lat, wilaya.lon], 7, { animate: true });
                    }
                  }}
                >
                  <span>{wilaya.code}</span>
                  <b>{displayName(wilaya)}</b>
                </button>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
