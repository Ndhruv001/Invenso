import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

// The component is self-contained and memoized for performance
const CustomDropdown = React.memo(({ option, value, onChange }) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = useMemo(
    () => option.options?.find(opt => opt.value === value),
    [option.options, value]
  );

  const displayValue = useMemo(
    () => selectedOption?.label || option.placeholder || "Select...",
    [selectedOption, option.placeholder]
  );

  const toggleDropdown = useCallback(() => setIsOpen(o => !o), []);

  const handleSelect = useCallback(
    newValue => {
      onChange(newValue);
      setIsOpen(false);
    },
    [onChange]
  );

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // The JSX is identical to your original code
  return (
    <div className="w-full relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-colors duration-200 min-h-[42px] ${theme.card} ${theme.border} ${theme.text.primary} ${theme.hover} focus:outline-none focus:ring-1 focus:${theme.border}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={`block truncate pr-2 ${!value ? theme.text.muted : ""}`}>
          {displayValue}
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-500 ${theme.text.muted} ${isOpen ? "rotate-180" : ""} flex-shrink-0`}
        />
      </button>

      {isOpen && (
        <div
          className={`mt-1 w-full rounded-lg border-2 border-amber-800 shadow-lg max-h-44 overflow-y-auto ${theme.card} ${theme.border} animate-in fade-in-0 zoom-in-95 duration-100`}
          role="listbox"
          style={{
            willChange: "opacity"
          }}
        >
          <div className="py-1">
            <button
              type="button"
              onClick={() => handleSelect("")}
              className={`w-full px-3 py-2 text-left text-sm transition-colors duration-150 ${
                !value
                  ? `bg-gradient-to-r ${theme.accent} text-white`
                  : `${theme.text.primary} hover:bg-purple-50`
              }`}
              role="option"
              aria-selected={!value}
            >
              {option.placeholder || "All"}
            </button>

            {option.options?.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full px-3 py-2 text-left text-sm transition-colors duration-150 cursor-pointer ${
                  opt.value === value
                    ? `bg-gradient-to-r ${theme.accent} text-white`
                    : `${theme.text.primary} ${theme.hover}`
                }`}
                role="option"
                aria-selected={opt.value === value}
              >
                {opt.label}
              </button>
            ))}

            {option.isLoading && (
              <div className={`px-3 py-2 text-sm ${theme.text.muted} flex items-center gap-2`}>
                <div
                  className={`animate-spin w-4 h-4 border-2 ${theme.border} border-t-transparent rounded-full`}
                />
                Loading...
              </div>
            )}

            {!option.isLoading && (!option.options || option.options.length === 0) && (
              <div className={`px-3 py-2 text-sm ${theme.text.muted}`}>No options available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

CustomDropdown.displayName = "CustomDropdown";
export default CustomDropdown;
