const THEMES = {
  default: {
    name: "Modern",
    bg: "bg-gradient-to-br from-slate-50 to-gray-100",
    sidebar: "bg-white",
    header: "bg-white",
    card: "bg-white",
    text: {
      primary: "text-gray-900",
      secondary: "text-gray-600",
      muted: "text-gray-500"
    },
    border: "border-gray-200",
    hover: "hover:bg-gray-50",
    accent: "from-purple-500 to-cyan-500",
    accentFrom: "from-purple-700",
    accentTo: "to-cyan-700"
  },
  ocean: {
    name: "Ocean",
    bg: "bg-gradient-to-br from-blue-50 to-blue-100",
    sidebar: "bg-blue-100 shadow-md border-r border-blue-200",
    header: "bg-blue-100 shadow-sm border-b border-blue-200",
    card: "bg-white shadow-[0_4px_12px_rgba(59,130,246,0.1)] rounded-xl",
    text: {
      primary: "text-blue-900",
      secondary: "text-blue-700",
      muted: "text-blue-600"
    },
    border: "border-blue-300",
    hover: "hover:bg-blue-50 transition",
    accent: "from-blue-400 to-cyan-400",
    accentFrom: "from-blue-600",
    accentTo: "to-cyan-600"
  },
  forest: {
    name: "Forest",
    bg: "bg-gradient-to-br from-green-50 to-green-100",
    sidebar: "bg-green-100 shadow-md border-r border-green-200",
    header: "bg-green-100 shadow-sm border-b border-green-200",
    card: "bg-white shadow-[0_4px_12px_rgba(34,197,94,0.1)] rounded-xl",
    text: {
      primary: "text-green-900",
      secondary: "text-green-700",
      muted: "text-green-600"
    },
    border: "border-green-300",
    hover: "hover:bg-green-50 transition",
    accent: "from-green-400 to-teal-400",
    accentFrom: "from-green-600",
    accentTo: "to-teal-600"
  },
  dark: {
    name: "Dark",
    bg: "bg-gradient-to-br from-gray-800 to-black",
    sidebar: "bg-gray-900",
    header: "bg-gray-900",
    card: "bg-gray-900",
    text: {
      primary: "text-white",
      secondary: "text-gray-200",
      muted: "text-gray-300"
    },
    border: "border-gray-700",
    hover: "hover:bg-gray-700",
    accent: "from-purple-400 to-cyan-400",
    accentFrom: "from-purple-600",
    accentTo: "to-cyan-600"
  }
};

export default THEMES;
export { THEMES };