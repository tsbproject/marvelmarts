export function formatNaira(
  amount: number | string | null | undefined
) {
  if (amount == null) return "";

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}