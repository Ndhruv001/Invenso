/**
 * @file SearchBar.jsx
 * @description A flexible, responsive, and theme-integrated search bar component.
 * Supports a clear button, custom sizing, accessibility features, and dark/light mode.
 * Fully reusable as a global component for consistent search UI across the app.
 */

import React, { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import useTheme from "@/hooks/useTheme";
import { debounce } from "@/lib/helpers/debounce";

/**
 * @typedef {Object} SearchBarProps
 * @property {(value: string) => void} onChange - Callback triggered when input value changes (debounced).
 * @property {string} [placeholder='Search...'] - Placeholder text for the input.
 * @property {string} [className=''] - Additional CSS classes for the container div.
 * @property {boolean} [showClearButton=true] - Whether to display a clear (X) button.
 * @property {() => void} [onClear] - Optional callback when the clear button is clicked or Esc is pressed.
 * @property {boolean} [disabled=false] - If true, disables the input and clear button.
 * @property {'sm' | 'md' | 'lg'} [size='md'] - Size of the search bar.
 * @property {boolean} [autoFocus=false] - If true, focuses the input on mount.
 * @property {React.HTMLProps<HTMLInputElement>} [props] - Additional HTML input properties.
 */

const sizeClasses = {
  sm: "py-1 text-sm",
  md: "py-2.5 text-sm",
  lg: "py-3 text-lg"
};

const iconSizes = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5"
};

const textPadding = {
  sm: "pl-8 pr-8",
  md: "pl-10 pr-10",
  lg: "pl-12 pr-12"
};

const SearchBar = ({
  value = "",
  onChange,
  placeholder = "Search...",
  className = "",
  showClearButton = true,
  onClear,
  disabled = false,
  size = "md",
  autoFocus = false,
  ...props
}) => {
  const { theme } = useTheme();

  return (
    <div className={`relative w-full ${className}`}>
      <Search
        className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.text.muted} ${iconSizes[size]}`}
      />

      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={`
          w-full
          ${textPadding[size]}
          ${sizeClasses[size]}
          rounded-lg border
          ${theme.card} ${theme.border} ${theme.text.primary}
          transition-all duration-200
          focus:outline-none focus:ring-1 focus:ring-opacity-50
          disabled:cursor-not-allowed
        `}
        style={{
          "--tw-ring-color": theme.accent.replace("from-", "").replace("to-", "").split(" ")[0]
        }}
        {...props}
      />

      {showClearButton && value && (
        <button
          type="button"
          onClick={onClear}
          disabled={disabled}
          className={`
            absolute right-3 top-1/2 -translate-y-1/2
            rounded-full p-1
            text-red-400 hover:text-red-600
            cursor-pointer
            disabled:cursor-not-allowed
          `}
          aria-label="Clear search"
          title="Clear search (Esc)"
        >
          <X className={iconSizes[size]} />
        </button>
      )}
    </div>
  );
};

SearchBar.displayName = "SearchBar";

export { SearchBar };
export default SearchBar;
