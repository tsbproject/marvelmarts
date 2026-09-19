export const SHIPPING_METHODS = [
  "Standard",
  "Express",
  "Pickup",
  "Free",
] as const;

export type ShippingMethod = (typeof SHIPPING_METHODS)[number];

export type ShippingMethodOption = {
  value: ShippingMethod;
  label: string;
  fee: number;
};
