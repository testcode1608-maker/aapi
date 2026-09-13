import { useEffect } from "react";

const THEME_KEY = "aapi-site-theme";

function applyTheme(dark: boolean) {
  document.body.classList.toggle("aapi-site-dark", dark);
  localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
}

function SiteThemeToggle() {
  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    const dark = saved === "dark";
    applyTheme(dark);

    const headerAuth = document.querySelector(".aapi-header-auth");
    if (!headerAuth) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "aapi-site-theme-toggle";

    const updateButton = () => {
      const isDark = document.body.classList.contains("aapi-site-dark");
      button.innerHTML = `<i class="bi ${isDark ? "bi-sun-fill" : "bi-moon-stars-fill"}"></i>`;
      button.setAttribute("aria-label", isDark ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي");
      button.title = isDark ? "الوضع النهاري" : "الوضع الليلي";
    };

    button.addEventListener("click", () => {
      const dark = !document.body.classList.contains("aapi-site-dark");
      applyTheme(dark);
      updateButton();
    });

    updateButton();
    headerAuth.appendChild(button);

    return () => {
      button.remove();
      document.body.classList.remove("aapi-site-dark");
    };
  }, []);

  return null;
}

export default SiteThemeToggle;
