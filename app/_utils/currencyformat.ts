const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    notation: 'compact', // This is the magic part
    maximumFractionDigits: 1,
  }).format(value);
};