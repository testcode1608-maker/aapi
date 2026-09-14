import { useEffect, useRef, useState, type PointerEvent } from "react";
import { languageNames, type Language } from "../i18n/translations";
import { useTranslation } from "../i18n/I18nProvider";

type Position = { x: number; y: number };

const STORAGE_KEY = "aapi-language-switcher-position";
const DEFAULT_POSITION: Position = { x: 18, y: 14 };

function getInitialPosition(): Position {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_POSITION;
    const parsed = JSON.parse(saved) as unknown;

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "x" in parsed &&
      "y" in parsed &&
      typeof parsed.x === "number" &&
      typeof parsed.y === "number"
    ) {
      return { x: parsed.x, y: parsed.y };
    }
  } catch {
    // Use the default position when localStorage contains invalid data.
  }

  return DEFAULT_POSITION;
}

function clampPosition(position: Position): Position {
  const width = 145;
  const height = 44;
  return {
    x: Math.max(4, Math.min(position.x, Math.max(4, window.innerWidth - width))),
    y: Math.max(4, Math.min(position.y, Math.max(4, window.innerHeight - height))),
  };
}

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useTranslation();
  const languages: Language[] = ["ar", "fr", "en"];
  const [position, setPosition] = useState<Position>(getInitialPosition);
  const dragStart = useRef<Position | null>(null);
  const startPosition = useRef<Position>(position);
  const dragged = useRef(false);

  useEffect(() => {
    const handleResize = () => setPosition((current) => clampPosition(current));
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
  }, [position]);

  const handlePointerDown = (event: PointerEvent<HTMLSpanElement>) => {
    dragStart.current = { x: event.clientX, y: event.clientY };
    startPosition.current = position;
    dragged.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLSpanElement>) => {
    if (!dragStart.current) return;

    const dx = event.clientX - dragStart.current.x;
    const dy = event.clientY - dragStart.current.y;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragged.current = true;

    if (dragged.current) {
      setPosition(
        clampPosition({
          x: startPosition.current.x + dx,
          y: startPosition.current.y + dy,
        }),
      );
    }
  };

  const handlePointerUp = (event: PointerEvent<HTMLSpanElement>) => {
    dragStart.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div
      className={`aapi-language-switcher${dragged.current ? " is-dragging" : ""}`}
      aria-label={t("common.language")}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      <span
        className="aapi-language-drag-handle"
        aria-hidden="true"
        title={t("common.language")}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <i className="bi bi-grip-vertical" />
      </span>

      {languages.map((item) => (
        <button
          key={item}
          type="button"
          className={item === language ? "active" : ""}
          onClick={() => setLanguage(item)}
          aria-pressed={item === language}
          title={languageNames[item]}
        >
          {item.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
