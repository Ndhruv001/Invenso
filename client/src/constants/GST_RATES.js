export const GST_RATES = [0, 5, 12, 18, 28];

export const GST_RATE_OPTIONS = GST_RATES.map(rate => ({
  value: rate,
  label: rate === 0 ? "No GST" : `${rate}%`
}));
