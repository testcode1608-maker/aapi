export type Language = "ar" | "fr" | "en";

export const languageNames: Record<Language, string> = {
  ar: "العربية",
  fr: "Français",
  en: "English",
};

export const translations = {
  ar: {
    common: {
      home: "الرئيسية",
      agency: "الوكالة",
      investor: "المستثمر",
      investment: "الاستثمار",
      news: "الأخبار",
      announcements: "الإعلانات",
      contact: "اتصل بنا",
      login: "تسجيل الدخول",
      register: "التسجيل",
      search: "بحث",
      searchPlaceholder: "ابحث في الموقع...",
      language: "اللغة",
      close: "إغلاق",
      menu: "القائمة",
    },
    agency: { presentation: "تقديم الوكالة", missions: "مهام الوكالة", values: "مبادئ الوكالة", journey: "مسار الاستثمار" },
    investor: { space: "فضاء المستثمر", services: "خدمات المستثمر", steps: "مسار الاستثمار", faq: "الأسئلة الشائعة" },
    investment: { opportunities: "فرص الاستثمار", sectors: "قطاعات الاستثمار", projects: "المشاريع الاستثمارية" },
    footer: { republic: "الجمهورية الجزائرية الديمقراطية الشعبية", agency: "الوكالة الجزائرية لترقية الاستثمار" },
  },
  fr: {
    common: {
      home: "Accueil",
      agency: "Agence",
      investor: "Investisseur",
      investment: "Investissement",
      news: "Actualités",
      announcements: "Annonces",
      contact: "Contact",
      login: "Connexion",
      register: "Inscription",
      search: "Rechercher",
      searchPlaceholder: "Rechercher sur le site...",
      language: "Langue",
      close: "Fermer",
      menu: "Menu",
    },
    agency: { presentation: "Présentation de l'agence", missions: "Missions de l'agence", values: "Principes de l'agence", journey: "Parcours d'investissement" },
    investor: { space: "Espace investisseur", services: "Services aux investisseurs", steps: "Parcours d'investissement", faq: "Questions fréquentes" },
    investment: { opportunities: "Opportunités d'investissement", sectors: "Secteurs d'investissement", projects: "Projets d'investissement" },
    footer: { republic: "République algérienne démocratique et populaire", agency: "Agence Algérienne de Promotion de l'Investissement" },
  },
  en: {
    common: {
      home: "Home",
      agency: "Agency",
      investor: "Investor",
      investment: "Investment",
      news: "News",
      announcements: "Announcements",
      contact: "Contact",
      login: "Login",
      register: "Register",
      search: "Search",
      searchPlaceholder: "Search the website...",
      language: "Language",
      close: "Close",
      menu: "Menu",
    },
    agency: { presentation: "About the Agency", missions: "Agency Missions", values: "Agency Principles", journey: "Investment Journey" },
    investor: { space: "Investor Space", services: "Investor Services", steps: "Investment Journey", faq: "Frequently Asked Questions" },
    investment: { opportunities: "Investment Opportunities", sectors: "Investment Sectors", projects: "Investment Projects" },
    footer: { republic: "People's Democratic Republic of Algeria", agency: "Algerian Agency for Investment Promotion" },
  },
} as const;

export type TranslationTree = typeof translations.ar;
