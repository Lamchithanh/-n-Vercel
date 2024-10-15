import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.jsx";

const loader = document.querySelector(".loader");
const overlay = document.createElement("div");
overlay.classList.add("overlay");

document.body.appendChild(overlay);

const renderApp = () => {
    createRoot(document.getElementById("root")).render(
        <AuthProvider>
            <App />
        </AuthProvider>
    );
    loader.style.display = "none";
    overlay.style.display = "none";
};

// Hiển thị thanh loading toàn bộ trang
loader.style.display = "block";
overlay.style.display = "block";

// Tải trang sau 1 giây
setTimeout(renderApp, 1000);
