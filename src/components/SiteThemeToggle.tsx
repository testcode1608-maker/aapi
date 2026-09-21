import { useEffect } from "react";

const THEME_KEY = "aapi-site-theme";
const DARK_CLASS = "aapi-site-dark";
const DARK_HTML_CLASS = "aapi-site-dark-root";
const ADMIN_LIGHT_CLASS = "aapi-admin-light";
const ADMIN_THEME_KEY = "aapi-admin-theme";
const EVENT_NAME = "aapi-public-theme-change";

function applyTheme(dark: boolean) {
  document.body.classList.toggle(DARK_CLASS, dark);
  document.documentElement.classList.toggle(DARK_HTML_CLASS, dark);
  document.body.classList.toggle(ADMIN_LIGHT_CLASS, !dark);
  document.documentElement.dataset.aapiTheme = dark ? "dark" : "light";
  localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  localStorage.setItem(ADMIN_THEME_KEY, dark ? "dark" : "light");
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { dark } }));
}

export default function SiteThemeToggle() {
  useEffect(() => {
    const adminPath = window.location.pathname.startsWith("/admin");
    const saved = adminPath
      ? localStorage.getItem(ADMIN_THEME_KEY) ?? localStorage.getItem(THEME_KEY)
      : localStorage.getItem(THEME_KEY);
    applyTheme(saved === "dark");

    const button = document.createElement("button");
    button.type = "button";
    button.className = "aapi-site-theme-toggle";
    Object.assign(button.style, {
      position: "fixed",
      bottom: "18px",
      width: "44px",
      height: "44px",
      border: "0",
      borderRadius: "50%",
      display: "grid",
      placeItems: "center",
      zIndex: "99999",
      cursor: "pointer",
      background: "#087443",
      color: "#fff",
      boxShadow: "0 8px 24px rgba(0,0,0,.22)",
      fontSize: "18px",
    });

    const updateButton = () => {
      const dark = document.documentElement.classList.contains(DARK_HTML_CLASS);
      const direction = document.documentElement.dir || getComputedStyle(document.documentElement).direction;
      const isRtl = direction === "rtl";

      // Keep the fixed button in an unused corner so it never changes the page layout.
      button.style.left = isRtl ? "18px" : "auto";
      button.style.right = isRtl ? "auto" : "18px";

      button.innerHTML = `<i class="bi ${dark ? "bi-sun-fill" : "bi-moon-stars-fill"}"></i>`;
      button.setAttribute("aria-label", dark ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي");
      button.title = dark ? "الوضع النهاري" : "الوضع الليلي";
    };

    const directionObserver = new MutationObserver(updateButton);
    directionObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["dir", "lang"],
    });

    button.addEventListener("click", () => {
      const dark = !document.documentElement.classList.contains(DARK_HTML_CLASS);
      applyTheme(dark);
      updateButton();
    });
    window.addEventListener(EVENT_NAME, updateButton);
    document.body.appendChild(button);
    updateButton();

    return () => {
      directionObserver.disconnect();
      window.removeEventListener(EVENT_NAME, updateButton);
      button.remove();
    };
  }, []);

  return null;
}
