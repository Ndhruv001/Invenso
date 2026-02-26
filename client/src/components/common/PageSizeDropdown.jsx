import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import useTheme from "@/hooks/useTheme";

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50];

function PageSizeDropdown({ pageSize, onChange }) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = newPageSize => {
    onChange({
      pageIndex: 0,
      pageSize: +newPageSize
    });
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`ml-1 sm:ml-4 flex items-center justify-between rounded-lg border 
          px-2 sm:px-3 py-1 text-xs sm:text-sm 
          min-w-[3.5rem] sm:min-w-[4.5rem] 
          ${theme.border} ${theme.card} ${theme.text.primary} 
          transition-colors duration-200 cursor-pointer`}
      >
        {pageSize}
        <ChevronDown size={14} className="ml-1 opacity-70" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={`absolute right-0 bottom-full mb-1 
            w-20 sm:w-24 
            rounded-lg border shadow-lg z-50 
            ${theme.border} ${theme.card}`}
        >
          {PAGE_SIZE_OPTIONS.map(size => (
            <div
              key={size}
              onClick={() => handleChange(size)}
              className={`px-2 py-1 text-xs sm:text-sm cursor-pointer transition-colors duration-150 ${theme.hover} ${theme.text.primary}`}
            >
              {size}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PageSizeDropdown;
export { PageSizeDropdown };
