export type PlatformShippingMethodId =
  | "STANDARD"
  | "EXPRESS"
  | "STORE_PICKUP";

export type PlatformShippingMethod = {
  id: PlatformShippingMethodId;
  label: string;
  description: string;
  eta: string;
  fee: number;
};

/**
 * Platform-owned shipping catalog.
 * Used ONLY for mixed-vendor checkout.
 * Never read Product.shippingMethod in this path.
 */
export const PLATFORM_SHIPPING_METHODS: PlatformShippingMethod[] = [
  {
    id: "STANDARD",
    label: "Standard delivery",
    description: "Platform rider network. One drop for the whole mixed cart.",
    eta: "2–5 business days",
    fee: 2500,
  },
  {
    id: "EXPRESS",
    label: "Express delivery",
    description: "Priority platform dispatch. Same mixed-cart shipment.",
    eta: "1–2 business days",
    fee: 4500,
  },
  {
    id: "STORE_PICKUP",
    label: "Store pickup",
    description: "Collect at the MarvelMarts hub. No rider fee.",
    eta: "Ready in 24 hours",
    fee: 0,
  },
];

export const DEFAULT_PLATFORM_SHIPPING: PlatformShippingMethodId = "STANDARD";

export function getPlatformShippingMethod(
  id: string | null | undefined
): PlatformShippingMethod {
  return (
    PLATFORM_SHIPPING_METHODS.find((method) => method.id === id) ??
    PLATFORM_SHIPPING_METHODS[0]
  );
}

export function resolveCheckoutShipping(params: {
  isMixedCart: boolean;
  platformMethodId?: string | null;
  singleVendorProductMethod?: string | null;
}): {
  controlledBy: "PLATFORM" | "VENDOR";
  methodId: string;
  label: string;
  fee: number;
} {
  if (params.isMixedCart) {
    const method = getPlatformShippingMethod(params.platformMethodId);
    return {
      controlledBy: "PLATFORM",
      methodId: method.id,
      label: method.label,
      fee: method.fee,
    };
  }

  const vendorMethod = (params.singleVendorProductMethod || "Standard").trim();
  const feeByVendorLabel: Record<string, number> = {
    Standard: 2500,
    Express: 4500,
    "Store Pickup": 0,
    Pickup: 0,
  };

  return {
    controlledBy: "VENDOR",
    methodId: vendorMethod.toUpperCase().replace(/\s+/g, "_"),
    label: vendorMethod,
    fee: feeByVendorLabel[vendorMethod] ?? 2500,
  };
}
