/**
 * @file debounce.js
 * @description Utility function to debounce rapid function calls.
 * Useful for reducing API requests or expensive operations when input changes quickly.
 *
 * @param {Function} func - The function to debounce.
 * @param {number} delay - Delay in milliseconds before calling `func`.
 * @returns {Function} A debounced version of the input function.
 *
 * @example
 * const debouncedSearch = debounce(query => fetchData(query), 300);
 * input.addEventListener("input", e => debouncedSearch(e.target.value));
 */
function debounce(func, delay = 1000) {
  let timeoutId;

  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId); // Cancel previous timer
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

export default debounce;
export { debounce };
