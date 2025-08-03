import React from "react";
import { Route, Routes } from "react-router-dom";
import LoginPage from "./scenes/login/LoginPage.jsx";
import MainLayout from "./scenes/app-layout/MainLayout.jsx";
import ThemeProvider from "./context/ThemeContext.jsx";

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<MainLayout />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
