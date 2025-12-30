import React, { useState } from "react";
import { formatDate } from "@/lib/helpers/formatters";
import { useTheme } from "@/hooks/useTheme";

const JsonModal = ({ value, label, isOpen, onClose }) => {
  if (!isOpen) return null;
  let formatted;
  try {
    formatted = JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    formatted = String(value);
  }
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-white shadow-2xl rounded-lg max-w-2xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 px-2 py-1 rounded hover:bg-gray-100 text-gray-500 font-bold"
        >
          ×
        </button>
        <div className="mb-2 font-semibold">{label}</div>
        <pre className="text-xs whitespace-pre-wrap bg-gray-100 rounded p-3 max-h-[60vh] overflow-auto">
          {formatted}
        </pre>
      </div>
    </div>
  );
};

const ViewButton = ({ value, label }) => {
  const [open, setOpen] = useState(false);
  if (!value) return <span className="text-xs text-gray-400">—</span>;
  return (
    <>
      <button
        className="px-2 py-0.5 text-xs rounded bg-slate-100 hover:bg-blue-100 text-blue-600 border border-blue-200"
        onClick={() => setOpen(true)}
      >
        View
      </button>
      <JsonModal value={value} label={label} isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
};

const Columns = () => {
  const { theme } = useTheme();

  return [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-gray-500">#{getValue()}</span>
      ),
      size: 60
    },
    {
      accessorKey: "createdAt",
      header: "Timestamp",
      cell: ({ getValue }) => <span className="text-xs">{formatDate(getValue())}</span>,
      size: 130
    },
    {
      accessorKey: "tableName",
      header: "Table",
      cell: ({ getValue }) => <span className="text-xs">{getValue()}</span>,
      size: 120
    },
    {
      accessorKey: "recordId",
      header: "Record ID",
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-gray-400">{getValue() || "—"}</span>
      ),
      size: 80
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ getValue }) => <span className="text-xs font-semibold">{getValue()}</span>,
      size: 80
    },
    {
      accessorKey: "fieldName",
      header: "Field",
      cell: ({ getValue }) => <span className="text-xs">{getValue() || "—"}</span>,
      size: 100
    },
    {
      accessorKey: "oldValue",
      header: "Old",
      cell: ({ getValue }) => <ViewButton value={getValue()} label="Old Value" />,
      size: 70
    },
    {
      accessorKey: "newValue",
      header: "New",
      cell: ({ getValue }) => <ViewButton value={getValue()} label="New Value" />,
      size: 70
    },
    {
      accessorKey: "user",
      header: "User",
      cell: ({ getValue }) => {
        return getValue?.name ? (
          <span className="text-xs font-medium">{getValue().role}</span>
        ) : (
          <span className="text-xs text-gray-400">System</span>
        );
      },
      size: 120
    },
    {
      accessorKey: "ipAddress",
      header: "IP",
      cell: ({ getValue }) => <span className="text-xs">{getValue() || "—"}</span>,
      size: 120
    },
    {
      accessorKey: "userAgent",
      header: "Agent",
      cell: ({ getValue }) => (
        <span className="text-xs truncate max-w-[120px]" title={getValue()}>
          {getValue() || "—"}
        </span>
      ),
      size: 140
    }
  ];
};

export default Columns;
export { Columns };
