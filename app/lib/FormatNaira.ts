// app/lib/FormatNaira.ts
export function formatNaira(amount: number) {
  if (typeof amount !== 'number') return "";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}