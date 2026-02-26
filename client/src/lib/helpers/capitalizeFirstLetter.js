/**
 * Capitalize first letter of each word in a string
 * Example:
 *  "shiv packer" -> "Shiv Packer"
 *  "shiv" -> "Shiv"
 */
export function capitalizeFirstLetter(str) {
  if (!str || typeof str !== "string") return "";

  return str
    .trim()
    .toLowerCase()
    .split(" ")
    .filter(Boolean) // remove extra spaces
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default capitalizeFirstLetter;
