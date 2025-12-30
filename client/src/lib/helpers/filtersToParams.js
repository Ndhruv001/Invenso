// src/lib/helpers/url.js

/**
 * Converts a filters object into a URLSearchParams object,
 * cleaning out null, undefined, or empty values.
 * @param {object} filters - The filters state object.
 * @returns {URLSearchParams}
 */
function filtersToParams(filters) {
  const params = new URLSearchParams();

  // Handle top-level keys like search, sortBy, page, etc.
  for (const [key, value] of Object.entries(filters)) {
    if (key === 'filterOptions') continue; // Skip the nested object, handle it below

    if (value != null && value.toString().trim() !== '') {
      params.set(key, value.toString());
    }
  }

  // Handle nested filterOptions
  if (filters.filterOptions) {
    for (const [key, value] of Object.entries(filters.filterOptions)) {
      if (value != null && value.toString().trim() !== '') {
        params.set(key, value.toString());
      }
    }
  }
  return params;
}

export { filtersToParams };
export default { filtersToParams };