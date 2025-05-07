import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AdminProvider } from "./contexts/AdminContext";

createRoot(document.getElementById("root")!).render(
  <AdminProvider>
    <App />
  </AdminProvider>
);
