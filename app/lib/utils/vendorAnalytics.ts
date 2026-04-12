// utils/vendorAnalytics.ts

export const calculateVendorTier = (salesCount: number, rating: number) => {
  if (salesCount > 500 && rating >= 4.8) return { label: 'GOLD', color: '#F7931E', bonus: '15% Boost Discount' };
  if (salesCount > 100 && rating >= 4.2) return { label: 'SILVER', color: '#a3bffa', bonus: '5% Boost Discount' };
  return { label: 'BRONZE', color: '#CD7F32', bonus: 'Standard Rates' };
};

export const calculateReputationScore = (rating: number, fulfillmentRate: number) => {
  // Simple weighted average out of 100
  return Math.round((rating * 15) + (fulfillmentRate * 0.25));
};