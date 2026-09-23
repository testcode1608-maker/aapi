import { useEffect, useRef, useState } from "react";
import { algeriaWilayas58 } from "../data/algeriaWilayas58";
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
          `<strong>${wilaya.code}</strong> · ${wilaya.ar}<br><small>${wilaya.name}</small>`,
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
    <div className="aapi-wilaya-map-overlay" role="dialog" aria-modal="true" aria-label="خريطة الجزائر">
      <div className="aapi-wilaya-map-modal" dir="rtl">
        <button type="button" className="aapi-wilaya-map-close" onClick={close} aria-label="إغلاق">
          <i className="bi bi-x-lg" aria-hidden="true" />
        </button>

        <div className="aapi-wilaya-map-heading">
          <span>الجزائر</span>
          <h2>خريطة الولايات الجزائرية</h2>
          <p>استكشف الولايات الـ 58 واضغط على أي نقطة لعرض اسم الولاية.</p>
        </div>

        <div className="aapi-wilaya-map-body">
          <div className="aapi-wilaya-map-canvas" ref={mapRef}>
            {mapError && <div className="aapi-wilaya-map-error">تعذر تحميل الخريطة. تحقق من الاتصال بالإنترنت.</div>}
          </div>

          <aside className="aapi-wilaya-map-sidebar">
            <div className="aapi-wilaya-selected">
              <span>الولاية المختارة</span>
              <strong>{selected?.ar ?? "الجزائر"}</strong>
              <small>{selected?.name ?? "Algeria"} · {selected?.code ?? "016"}</small>
            </div>

            <div className="aapi-wilaya-count">
              <strong>58</strong>
              <span>ولاية</span>
            </div>

            <div className="aapi-wilaya-list">
              {algeriaWilayas58.map((wilaya) => (
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
                  <b>{wilaya.ar}</b>
                </button>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
