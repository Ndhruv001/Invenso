import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import QueryProvider from "./lib/config/QueryProvider.jsx";
import ThemeProvider from "./context/ThemeContext.jsx";
import { UIActionProvider } from "./context/UIActionContext.jsx";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <Router>
    <QueryProvider>
      <ThemeProvider>
        <UIActionProvider>
        <App />
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop />
      </UIActionProvider>
      </ThemeProvider>
    </QueryProvider>
  </Router>
);
