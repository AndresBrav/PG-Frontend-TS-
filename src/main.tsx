import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./assets/styles/designBackground.css";
import "./assets/styles/stylesUsers/styleLogin.css";
import "./assets/styles/stylesDashboard/headerDashboardStyle.css";
import "./assets/styles/stylesDashboard/designInformationLevelStyle.css";
import "gridstack/dist/gridstack.min.css";
import "./assets/Exercise1Widgets.css"


createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
