// Generates a consistent colored initial tile for products without a real photo.
// Acts as a graceful fallback — same pattern used by Slack, Gmail, Trello, etc.
const palette = ['#2952E3', '#FF6B4A', '#16A34A', '#7C3AED', '#101828'];

export const getProductColor = (product) => {
  return palette[product.id % palette.length];
};

export const getProductInitial = (product) => {
  return product.name.charAt(0).toUpperCase();
};