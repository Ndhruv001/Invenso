// src/context/ThemeContext.jsx
import React, { createContext, useState } from "react";
import THEMES from "@/constants/THEMES";

const ThemeContext = createContext();

const themeKeys = Object.keys(THEMES);

const ThemeProvider = ({ children }) => {
  const [themeKey, setThemeKey] = useState("default"); // Default theme key

  const switchTheme = () => {
    const currentIndex = themeKeys.indexOf(themeKey);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    setThemeKey(themeKeys[nextIndex]);
  };

  return (
    <ThemeContext.Provider value={{ theme: THEMES[themeKey], switchTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeProvider };
export default ThemeProvider;
