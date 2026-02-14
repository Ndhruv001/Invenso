import React, { createContext, useContext, useState } from "react";


/**
 * Action shape:
 * {
 *   type: "CREATE" | "EDIT" | "VIEW",
 *   resource: "product" | "sale" | "purchase" | ...
 *   payload?: any
 * }
 */

const UIActionContext = createContext(null);

export const UIActionProvider = ({ children }) => {
  const [action, setAction] = useState({});

  const fireAction = (actionObject) => {
    setAction(actionObject);
  };

  const clearAction = () => {
    setAction(null);
  };

  return (
    <UIActionContext.Provider value={{ action, fireAction, clearAction }}>
      {children}
    </UIActionContext.Provider>
  );
};

export const useUIAction = () => {
  const context = useContext(UIActionContext);
  if (!context) {
    throw new Error("useUIAction must be used inside UIActionProvider");
  }
  return context;
};
