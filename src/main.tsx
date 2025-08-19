import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./assets/styles/designBackground.css";
import "./assets/styles/stylesUsers/designUsers.css";
import "./assets/styles/stylesDashboard/designDashboard.css";
import "./assets/styles/stylesGames/designGames.css"



createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
