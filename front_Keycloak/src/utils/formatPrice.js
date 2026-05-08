// utils/formatPrice.js

export const formatPrice = (priceCents) => {
  if (typeof priceCents !== 'number') return '';
  return (priceCents / 100).toFixed(2);
};
