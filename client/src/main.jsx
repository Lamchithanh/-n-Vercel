import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
// import { Environment } from "../../server/src/environment/environment.js";

const loader = document.querySelector(".loader");
const overlay = document.createElement("div");
const clientId =
  "1038987169920-h0ec5fr9rgj10no8s7m7r9mo19iaaknb.apps.googleusercontent.com";
overlay.classList.add("overlay");

document.body.appendChild(overlay);

const renderApp = () => {
  createRoot(document.getElementById("root")).render(
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
  loader.style.display = "none";
  overlay.style.display = "none";
};

// Hiển thị thanh loading toàn bộ trang
loader.style.display = "block";
overlay.style.display = "block";

// Tải trang sau 1 giây
setTimeout(renderApp, 1000);
