import { ShippingMethodOption } from "./types";

export const SHIPPING_FEES = {
  Standard: 2500,
  Express: 7500,
  Pickup: 0,
  Free: 0,
} as const;

export const SHIPPING_OPTIONS: readonly ShippingMethodOption[] = [
  {
    value: "Standard",
    label: "Standard Shipping",
    fee: SHIPPING_FEES.Standard,
  },
  {
    value: "Express",
    label: "Express Shipping",
    fee: SHIPPING_FEES.Express,
  },
  {
    value: "Pickup",
    label: "Store Pickup",
    fee: SHIPPING_FEES.Pickup,
  },
  {
    value: "Free",
    label: "Free Shipping",
    fee: SHIPPING_FEES.Free,
  },
] as const;

/** Platform shipping for checkouts containing more than one vendor. */
export const MARVELMARTS_MULTI_VENDOR_SHIPPING_OPTIONS =
  SHIPPING_OPTIONS.filter((option) => option.value !== "Free") as readonly ShippingMethodOption[];
