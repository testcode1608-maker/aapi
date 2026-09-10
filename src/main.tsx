import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import App from "./App";
import "./index.css";
import "./styles/admin-theme.css";

const savedAdminTheme = localStorage.getItem("aapi-admin-theme");
if (savedAdminTheme === "light") document.body.classList.add("aapi-admin-light");
window.addEventListener("aapi-theme-change", (event) => {
  const theme = (event as CustomEvent<"dark" | "light">).detail;
  document.body.classList.toggle("aapi-admin-light", theme === "light");
});

ReactDOM.createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
