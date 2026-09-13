import { languageNames, type Language } from "../i18n/translations";
import { useTranslation } from "../i18n/I18nProvider";

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useTranslation();
  const languages: Language[] = ["ar", "fr", "en"];

  return (
    <div className="aapi-language-switcher" aria-label={t("common.language")}>
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
