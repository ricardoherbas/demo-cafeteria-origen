import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/main.scss"; // importa los estilos para que vite los incluya en toda la app

const contenedor = document.getElementById("root");
if (!contenedor) {
    throw new Error("No se encontró el elemento #root en index.html");
    }

    createRoot(contenedor).render(
    <StrictMode>
        <App />
    </StrictMode>,
);