// client/src/lib/helpers/getPageTitle.js

const getPageTitle = pathname => {
  if (!pathname || typeof pathname !== "string") return "Dashboard";

  const pathSegments = pathname.split("/").filter(Boolean);

  if (pathSegments.length === 0) return "Dashboard";

  const lastSegment = pathSegments[pathSegments.length - 1].toLowerCase();

  // Format: replace hyphens/underscores, capitalize each word
  return lastSegment
    .replace(/[-_]/g, " ")
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default getPageTitle;
export { getPageTitle };
