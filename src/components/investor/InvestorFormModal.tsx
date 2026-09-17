import { useEffect, type ReactNode } from "react";
import { useTranslation } from "../../i18n/I18nProvider";

interface Props {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function InvestorFormModal({ open, onClose, children }: Props) {
  const { language } = useTranslation();
  const direction = language === "ar" ? "rtl" : "ltr";
  const closeLabel = language === "ar" ? "إغلاق" : language === "fr" ? "Fermer" : "Close";

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="investor-form-modal"
      role="dialog"
      aria-modal="true"
      dir={direction}
      lang={language}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="investor-form-modal-panel" dir={direction}>
        <button
          type="button"
          className="investor-form-modal-close"
          onClick={onClose}
          aria-label={closeLabel}
          title={closeLabel}
        >
          <i className="bi bi-x-lg" />
        </button>
        {children}
      </div>
    </div>
  );
}
