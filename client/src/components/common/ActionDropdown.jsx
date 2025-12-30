/**
 * @file ActionDropdown.jsx
 * @description A customizable dropdown menu component for displaying a list of actions, integrated with the application theme.
 */

import React, { useState, useRef, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import useTheme from "@/hooks/useTheme"; // Assuming useTheme is in '@/hooks/useTheme'

/**
 * @typedef {Object} Action
 * @property {string} label - The text to display for the action.
 * @property {React.ElementType} icon - The icon component for the action.
 * @property {() => void} onClick - The function to call when the action is clicked.
 * @property {boolean} [dangerous=false] - If true, the action is styled with a dangerous (red) color.
 */

/**
 * ActionDropdown - A dropdown menu component to display a list of actions.
 *
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.trigger - The element that, when clicked, opens the dropdown.
 * @param {Action[]} props.actions - An array of action objects to be rendered in the dropdown.
 * @returns {JSX.Element} The ActionDropdown component.
 */
const ActionDropdown = ({ trigger, actions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = event => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  const handleActionClick = action => {
    action.onClick();
    setIsOpen(false);
  };

  const dangerColor = "text-red-600";
  const hoverDangerBg = "hover:bg-red-50";

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div className="fixed inset-0 z-10 md:hidden" onClick={() => setIsOpen(false)} />

          {/* Dropdown Menu */}
          <div
            className={`absolute right-0 top-full mt-1 w-48 rounded-lg border ${theme.border} ${theme.bg} py-1 shadow-lg z-20 animate-in fade-in slide-in-from-top-2 duration-200`}
          >
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleActionClick(action)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 ${
                  action.dangerous
                    ? `${dangerColor} ${hoverDangerBg}`
                    : `${theme.text.primary} ${theme.hover}`
                }`}
              >
                <action.icon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{action.label}</span>
                {action.dangerous && (
                  <AlertTriangle
                    className={`ml-auto h-3 w-3 flex-shrink-0 opacity-60 ${dangerColor}`}
                  />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export { ActionDropdown };
export default ActionDropdown;
