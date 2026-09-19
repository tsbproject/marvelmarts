import {
  SHIPPING_FEES,
  SHIPPING_OPTIONS,
} from "./constants";
import {
  SHIPPING_METHODS,
  ShippingMethod,
  ShippingMethodOption,
} from "./types";

const SHIPPING_METHOD_SET = new Set<string>(SHIPPING_METHODS);

function isShippingMethod(value: unknown): value is ShippingMethod {
  return typeof value === "string" && SHIPPING_METHOD_SET.has(value);
}

/**
 * Converts the Product.shippingMethod database value into
 * the normalized shipping-method array used by the domain.
 *
 * Supports:
 *   ["Standard", "Express"]
 *   "Standard"
 *   "Express"
 *   "Pickup"
 *   "Free"
 */
export function parseShippingMethods(
  value: unknown
): ShippingMethod[] {
  if (Array.isArray(value)) {
    return value.filter(isShippingMethod);
  }

  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed.filter(isShippingMethod);
    }
  } catch {
    // Legacy single-value Product records are handled below.
  }

  return isShippingMethod(value) ? [value] : [];
}

/**
 * Normalizes a vendor's configured methods and enforces
 * the Free Shipping exclusivity rule.
 */
export function normalizeShippingMethods(
  value: unknown
): ShippingMethod[] {
  const methods = Array.from(
    new Set(parseShippingMethods(value))
  );

  if (methods.includes("Free")) {
    return ["Free"];
  }

  return methods;
}

/**
 * Validates that a vendor has a usable shipping configuration.
 */
export function validateShippingConfiguration(
  value: unknown
): ShippingMethod[] {
  const methods = normalizeShippingMethods(value);

  if (methods.length === 0) {
    throw new Error(
      "This product has no valid shipping method configured."
    );
  }

  return methods;
}

/**
 * Validates the customer's selected shipping method
 * against the vendor's enabled methods.
 */
export function validateSelectedShippingMethod(
  configuredMethods: unknown,
  selectedMethod: unknown
): ShippingMethod {
  const methods =
    validateShippingConfiguration(configuredMethods);

  if (!isShippingMethod(selectedMethod)) {
    throw new Error("Invalid shipping method selected.");
  }

  if (!methods.includes(selectedMethod)) {
    throw new Error(
      "The selected shipping method is not available for this product."
    );
  }

  return selectedMethod;
}

/**
 * Returns the authoritative customer shipping charge.
 */
export function getShippingFee(
  method: ShippingMethod
): number {
  return SHIPPING_FEES[method];
}

/**
 * Returns the complete option definition.
 */
export function getShippingOption(
  method: ShippingMethod
): ShippingMethodOption {
  const option = SHIPPING_OPTIONS.find(
    (item) => item.value === method
  );

  if (!option) {
    throw new Error("Invalid shipping method.");
  }

  return option;
}
