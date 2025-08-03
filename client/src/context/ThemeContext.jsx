// src/context/ThemeContext.jsx
import React, { createContext, useState } from "react";
import themes from "./themes.js";

const ThemeContext = createContext();

const themeKeys = Object.keys(themes);

const ThemeProvider = ({ children }) => {
  const [themeKey, setThemeKey] = useState("default"); // Default theme key

  const switchTheme = () => {
    const currentIndex = themeKeys.indexOf(themeKey);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    setThemeKey(themeKeys[nextIndex]);
  };

  return (
    <ThemeContext.Provider value={{ theme: themes[themeKey], switchTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext };
export default ThemeProvider;
