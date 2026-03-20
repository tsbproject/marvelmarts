/**
 * Calculates remaining days for a boost expiry
 */
export const getDaysRemaining = (boostUntil: string | Date | null): number => {
  if (!boostUntil) return 0;
  const now = new Date();
  const expiry = new Date(boostUntil);
  
  // Calculate difference in milliseconds
  const diff = expiry.getTime() - now.getTime();
  
  // Convert to days and round up
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  
  return Math.max(0, days);
};