import React from "react";
import {
  Trash2,
  Edit3,
  Printer,
  Download,
  ToggleLeft,
  ToggleRight,
  CheckSquare
} from "lucide-react";
import { toast } from "react-toastify";
import useTheme from "@/hooks/useTheme";

const ICONS = {
  edit: Edit3,
  delete: Trash2,
  print: Printer,
  download: Download
};

const LABELS = {
  edit: "Edit",
  delete: "Delete",
  print: "Print",
  download: "Download"
};

const ActionRibbon = ({
  resourceName = "Resource",
  actions = ["edit", "delete", "print", "download"],
  handlers = {},
  selectionOpen = false,
  selectedCount = 0,
  onToggleSelection = () => {},
  className = ""
}) => {
  const { theme } = useTheme();

  const handleActionClick = action => {
    const handler = handlers[action];
    const label = LABELS[action] || action;

    if (!handler) {
      toast.info(`${label} not available for ${resourceName} yet.`, {
        icon: "⚙️"
      });
      return;
    }

    handler();
  };

  return (
    <div
      className={`w-full flex flex-wrap items-center justify-between gap-3 p-2 md:p-3 rounded-lg border-2 ${theme.border} ${className}`}
      role="toolbar"
      aria-label={`${resourceName} actions`}
    >
      {/* Left side */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={onToggleSelection}
          aria-pressed={selectionOpen}
          title={selectionOpen ? "Close selection" : "Open selection"}
          className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400 transition"
        >
          {selectionOpen ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
          <span className="text-sm font-medium hidden xs:inline">
            {selectionOpen ? "Selection On" : "Selection Off"}
          </span>
        </button>

        <div className={`ml-1 inline-flex items-center gap-1 text-xs sm:text-sm px-2 py-1`}>
          <CheckSquare className="h-4 w-4 opacity-80" />
          <span>{selectedCount}</span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 flex-wrap">
        {actions.map(action => {
          const Icon = ICONS[action];
          const label = LABELS[action];

          if (!Icon) return null;

          const destructive = action === "delete";

          return (
            <button
              key={action}
              type="button"
              onClick={() => handleActionClick(action)}
              title={label}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                destructive
                  ? "bg-red-50 text-red-700 hover:bg-red-100 focus:ring-red-300"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 focus:ring-blue-300"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ActionRibbon;
export { ActionRibbon };
