import { BUTTON_CONFIGS, DEFAULT_BUTTONS } from "@/constants/BUTTON_CONFIGS";

/**
 * Parses pathname to extract section and subSection.
 * @param {string} pathname
 * @returns {{section: string, subSection: string}}
 */
function parsePathname(pathname = "") {
  const [section = "", subSection = ""] = pathname.replace(/^\//, "").split("/");
  return { section, subSection };
}

/**
 * Gets action buttons configuration based on current pathname.
 * @param {string} pathname
 * @returns {{primary: object, secondary: object}}
 */
function getActionButtons(pathname = "") {
  const { section, subSection } = parsePathname(pathname);
  const config = BUTTON_CONFIGS[subSection] || BUTTON_CONFIGS[section];

  if (!config) return { ...DEFAULT_BUTTONS };

  return config;
}

export default getActionButtons;
export { getActionButtons };
