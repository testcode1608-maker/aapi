import { useEffect } from "react";

const THEME_KEY = "aapi-site-theme";
const DARK_CLASS = "aapi-site-dark";
const DARK_HTML_CLASS = "aapi-site-dark-root";

function applyTheme(dark: boolean) {
  document.body.classList.toggle(DARK_CLASS, dark);
  document.documentElement.classList.toggle(DARK_HTML_CLASS, dark);
  document.documentElement.dataset.aapiTheme = dark ? "dark" : "light";
  localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
}

function SiteThemeToggle() {
  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    applyTheme(saved === "dark");

    const headerAuth = document.querySelector(".aapi-header-auth");
    if (!headerAuth) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "aapi-site-theme-toggle";

    const updateButton = () => {
      const isDark = document.documentElement.classList.contains(DARK_HTML_CLASS);
      button.innerHTML = `<i class="bi ${isDark ? "bi-sun-fill" : "bi-moon-stars-fill"}"></i>`;
      button.setAttribute("aria-label", isDark ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي");
      button.title = isDark ? "الوضع النهاري" : "الوضع الليلي";
    };

    const handleThemeChange = () => updateButton();

    button.addEventListener("click", () => {
      const dark = !document.documentElement.classList.contains(DARK_HTML_CLASS);
      applyTheme(dark);
      updateButton();
    });

    window.addEventListener("aapi-public-theme-change", handleThemeChange);
    updateButton();
    headerAuth.appendChild(button);

    return () => {
      window.removeEventListener("aapi-public-theme-change", handleThemeChange);
      button.remove();
    };
  }, []);

  return null;
}

export default SiteThemeToggle;
