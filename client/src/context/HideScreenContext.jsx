import React, { createContext, useContext, useEffect, useState } from "react";

const HideScreenContext = createContext(null);

export const HideScreenProvider = ({ children }) => {
  const [isScreenHidden, setIsScreenHidden] = useState(false);

  const showScreenHide = () => setIsScreenHidden(true);
  const hideScreen = () => setIsScreenHidden(false);
  const toggleScreenHide = () => setIsScreenHidden(prev => !prev);

  // Keyboard shortcuts (ESC, Ctrl + H)
  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === "Escape") {
        hideScreen();
      }

      if (e.ctrlKey && e.key.toLowerCase() === "h") {
        e.preventDefault();
        toggleScreenHide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <HideScreenContext.Provider
      value={{
        isScreenHidden,
        showScreenHide,
        hideScreen,
        toggleScreenHide
      }}
    >
      {children}
    </HideScreenContext.Provider>
  );
};

export const useHideScreenContext = () => {
  const context = useContext(HideScreenContext);
  if (!context) {
    throw new Error("useHideScreenContext must be used inside HideScreenProvider");
  }
  return context;
};
