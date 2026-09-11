import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import App from "./App";
import "./index.css";
import "./styles/admin-theme.css";
import "./styles/admin-quick-theme.css";
import "./styles/admin-toolbar.css";

const applyAdminTheme = (theme: "dark" | "light") => {
  document.body.classList.toggle("aapi-admin-light", theme === "light");
  localStorage.setItem("aapi-admin-theme", theme);
  window.dispatchEvent(new CustomEvent("aapi-theme-change", { detail: theme }));
};

const savedAdminTheme = localStorage.getItem("aapi-admin-theme");
if (savedAdminTheme === "light") document.body.classList.add("aapi-admin-light");

window.addEventListener("aapi-theme-change", (event) => {
  const theme = (event as CustomEvent<"dark" | "light">).detail;
  document.body.classList.toggle("aapi-admin-light", theme === "light");
});

const addQuickAdminThemeToggle = () => {
  const navbar = document.querySelector<HTMLElement>(".admin-navbar");
  if (!navbar || navbar.querySelector(".admin-quick-theme-toggle")) return;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "admin-quick-theme-toggle";
  button.setAttribute("aria-label", "تغيير وضع الألوان");
  button.title = "تغيير الوضع";

  const updateIcon = () => {
    const isLight = document.body.classList.contains("aapi-admin-light");
    button.textContent = isLight ? "☾" : "☀";
    button.title = isLight ? "التبديل إلى الوضع الداكن" : "التبديل إلى الوضع الفاتح";
  };

  button.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("aapi-admin-light") ? "dark" : "light";
    applyAdminTheme(nextTheme);
    updateIcon();
  });

  window.addEventListener("aapi-theme-change", updateIcon);
  updateIcon();
  navbar.appendChild(button);
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

const adminThemeObserver = new MutationObserver(() => addQuickAdminThemeToggle());
adminThemeObserver.observe(document.body, { childList: true, subtree: true });
addQuickAdminThemeToggle();
