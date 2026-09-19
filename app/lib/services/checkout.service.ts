import {
  sanitizeAddress,
  sanitizeCityOrState,
  sanitizeEmail,
  sanitizeName,
  sanitizePhone,
  sanitizeText,
} from "@/app/lib/orders/sanitizer";

import { prisma } from "@/app/lib/prisma";
import {
  getShippingFee,
  MARVELMARTS_MULTI_VENDOR_SHIPPING_OPTIONS,
  normalizeShippingMethods,
  SHIPPING_OPTIONS,
  validateSelectedShippingMethod,
  type ShippingMethod,
} from "@/app/lib/shipping";

import {
  validateAddress,
  validateCity,
  validateEmail,
  validateName,
  validatePhone,
  validateState,
} from "@/app/lib/orders/validator";

import {
  MAX_ITEMS,
  MAX_QTY_PER_ITEM,
} from "@/app/lib/orders/constants";

import {
  parsePositiveInt,
} from "@/app/lib/orders/validator";

import type {
  NormalizedCartItem,
} from "@/app/lib/orders/types";

import { badRequest } from "@/app/lib/auth/errors";



export class CheckoutService {
  /**
   * Sanitize and validate checkout form.
   */
  static prepareForm(rawFormData: any) {
    const form = {
      email: sanitizeEmail(rawFormData.email),

      firstName: sanitizeName(
        rawFormData.firstName
      ),

      lastName: sanitizeName(
        rawFormData.lastName
      ),

      phone: sanitizePhone(
        rawFormData.phone
      ),

      streetAddress: sanitizeAddress(
        rawFormData.streetAddress,
        150
      ),

      apartment: sanitizeAddress(
        rawFormData.apartment,
        80
      ),

      city: sanitizeCityOrState(
        rawFormData.city,
        60
      ),

      state: sanitizeCityOrState(
        rawFormData.state,
        40
      ),

      country:
        sanitizeCityOrState(
          rawFormData.country ||
            "Nigeria",
          40
        ),

      orderNotes: sanitizeText(
        rawFormData.orderNotes,
        500
      ),

      useDifferentShipping:
        !!rawFormData.useDifferentShipping,

      shippingDetails: {
        firstName: sanitizeName(
          rawFormData
            ?.shippingDetails
            ?.firstName
        ),

        lastName: sanitizeName(
          rawFormData
            ?.shippingDetails
            ?.lastName
        ),

        streetAddress:
          sanitizeAddress(
            rawFormData
              ?.shippingDetails
              ?.streetAddress,
            150
          ),

        city:
          sanitizeCityOrState(
            rawFormData
              ?.shippingDetails
              ?.city,
            60
          ),

        state:
          sanitizeCityOrState(
            rawFormData
              ?.shippingDetails
              ?.state,
            40
          ),
      },
    };

    const baseValid =
      validateEmail(form.email) &&
      validateName(form.firstName) &&
      validateName(form.lastName) &&
      validatePhone(form.phone) &&
      validateAddress(
        form.streetAddress
      ) &&
      validateCity(form.city) &&
      validateState(form.state);

    if (!baseValid) {
      throw badRequest(
        "Invalid checkout information."
      );
    }

    if (
      form.useDifferentShipping
    ) {
      const shippingValid =
        validateName(
          form.shippingDetails
            .firstName
        ) &&
        validateName(
          form.shippingDetails
            .lastName
        ) &&
        validateAddress(
          form.shippingDetails
            .streetAddress
        ) &&
        validateCity(
          form.shippingDetails
            .city
        ) &&
        validateState(
          form.shippingDetails
            .state
        );

      if (!shippingValid) {
        throw badRequest(
          "Invalid shipping details."
        );
      }
    }

    return form;
  }

  /**
 * Normalize and validate cart items.
 */
static normalizeCart(
  rawItems: any[]
): NormalizedCartItem[] {
  if (!Array.isArray(rawItems)) {
    throw badRequest(
      "Invalid cart."
    );
  }

  if (!rawItems.length) {
    throw badRequest(
      "No items in cart."
    );
  }

  if (
    rawItems.length >
    MAX_ITEMS
  ) {
    throw badRequest(
      "Too many cart items."
    );
  }

  const items =
    rawItems.map((item) => ({
      productId:
        sanitizeText(
          item?.id,
          100
        ),

      variantId:
        item?.variantId
          ? sanitizeText(
              item.variantId,
              100
            )
          : null,

      quantity:
        parsePositiveInt(
          item?.quantity
        ),
    }));

  // Merge duplicate products (including variants)
  const aggregated = new Map<
    string,
    NormalizedCartItem
  >();

  for (const item of items) {
    if (
      !item.productId ||
      item.quantity === null
    ) {
      continue;
    }

    const key = `${item.productId}:${
      item.variantId ?? "default"
    }`;

    const existing =
      aggregated.get(key);

    if (existing) {
      existing.quantity +=
        item.quantity;
    } else {
      aggregated.set(key, {
        productId:
          item.productId,
        variantId:
          item.variantId,
        quantity:
          item.quantity,
      });
    }
  }

  const normalized = [
    ...aggregated.values(),
  ];

  const invalid =
    normalized.some(
      (item) =>
        !item.productId ||
        item.quantity === null ||
        item.quantity < 1 ||
        item.quantity >
          MAX_QTY_PER_ITEM
    );

  if (invalid) {
    throw badRequest(
      "Invalid cart item data."
    );
  }

  return normalized;
}

/**
 * Load products, validate inventory and
 * prepare checkout items.
 */
static async prepareItems(
    normalizedItems: NormalizedCartItem[],
    selectedShippingMethod?: unknown
  ) {
    const uniqueProductIds = [
      ...new Set(
        normalizedItems.map(
          (item) => item.productId
        )
      ),
    ];

    const products =
      await prisma.product.findMany({
        where: {
          id: {
            in: uniqueProductIds,
          },
        },

        select: {
          id: true,
          title: true,
          price: true,
          discountPrice: true,
          stock: true,
          vendorProfileId: true,
          shippingMethod: true,

          variants: {
            select: {
              id: true,
              name: true,
              stock: true,
              price: true,
            },
          },

          images: {
            select: {
              url: true,
            },
            take: 1,
            orderBy: {
              order: "asc",
            },
          },
        },
      });

    if (
      products.length !==
      uniqueProductIds.length
    ) {
      throw badRequest(
        "One or more products are invalid."
      );
    }

    const productMap = new Map(
      products.map((product) => [
        product.id,
        product,
      ])
    );

    /*
     * Every product must have a real vendor.
     * Vendor identity is always loaded from the
     * database and never trusted from the client.
     */
    if (
      products.some(
        (product) =>
          !product.vendorProfileId
      )
    ) {
      throw badRequest(
        "Vendor information missing for one or more products."
      );
    }

    /*
     * Prepare each order item using server-side
     * pricing and inventory validation.
     */
    const preparedItems =
      normalizedItems.map((item) => {
        const product =
          productMap.get(
            item.productId
          )!;

        const vendorProfileId =
          product.vendorProfileId;

        let unitPrice = Number(
          product.discountPrice != null &&
            Number(product.discountPrice) > 0
            ? product.discountPrice
            : product.price
        );

        if (item.variantId) {
          const variant =
            product.variants.find(
              (v) =>
                v.id ===
                item.variantId
            );

          if (!variant) {
            throw badRequest(
              "Selected product variant no longer exists."
            );
          }

          if (
            variant.stock <
            item.quantity!
          ) {
            throw badRequest(
              `${product.title} (${variant.name}) only has ${variant.stock} item(s) remaining.`
            );
          }

          if (
            variant.price != null
          ) {
            unitPrice = Number(
              variant.price
            );
          }
        } else {
          if (
            product.stock <
            item.quantity!
          ) {
            throw badRequest(
              `${product.title} only has ${product.stock} item(s) remaining.`
            );
          }
        }

        if (
          !Number.isFinite(
            unitPrice
          ) ||
          unitPrice < 0
        ) {
          throw badRequest(
            `Invalid pricing detected for "${product.title}".`
          );
        }

        return {
          key: `${product.id}:${
            item.variantId ?? "default"
          }`,

          vendorProfileId,

          orderItem: {
            productId:
              product.id,

            variantId:
              item.variantId,

            qty:
              item.quantity!,

            unitPrice,

            title: sanitizeText(
              product.title,
              200
            ),

            imageUrl:
              product.images[0]
                ?.url ?? null,
          },
        };
      });

    /*
     * Group the server-validated items by vendor.
     */
    const vendorGroups =
      new Map<
        string,
        {
          vendorProfileId: string;
          items: typeof preparedItems;
          products: typeof products;
        }
      >();

    for (const prepared of preparedItems) {
      const group =
        vendorGroups.get(
          prepared.vendorProfileId
        );

      if (group) {
        group.items.push(
          prepared
        );
      } else {
        vendorGroups.set(
          prepared.vendorProfileId,
          {
            vendorProfileId:
              prepared.vendorProfileId,
            items: [prepared],
            products: [],
          }
        );
      }
    }

    /*
     * Attach each product to its vendor group.
     */
    for (const product of products) {
      const vendorProfileId =
        product.vendorProfileId;

      const group =
        vendorGroups.get(
          vendorProfileId
        );

      if (group) {
        group.products.push(
          product
        );
      }
    }

    /*
     * The client may eventually send:
     *
     * {
     *   vendorIdA: "Standard",
     *   vendorIdB: "Express"
     * }
     *
     * For backward compatibility, a single string
     * still applies to every vendor.
     */
    const selectedMethodsByVendor =
      selectedShippingMethod &&
      typeof selectedShippingMethod ===
        "object" &&
      !Array.isArray(
        selectedShippingMethod
      )
        ? selectedShippingMethod as Record<
            string,
            unknown
          >
        : null;

    const legacySelectedMethod =
      typeof selectedShippingMethod ===
      "string"
        ? selectedShippingMethod
        : undefined;

    const vendorOrders: Array<{
      vendorProfileId: string;
      merchandiseSubtotal: number;
      shipping: number;
      shippingMethod: string;
      total: number;
      itemKeys: string[];
      shippingOptions: Array<{
        method: ShippingMethod;
        fee: number;
      }>;
    }> = [];

    let combinedSubtotal = 0;
    let combinedShipping = 0;
    const isMultiVendorCheckout = vendorGroups.size > 1;

    let platformShippingMethod: ShippingMethod | null = null;
    if (isMultiVendorCheckout) {
      if (selectedMethodsByVendor) {
        throw badRequest("Select one MarvelMarts shipping method for a multi-vendor checkout.");
      }

      try {
        platformShippingMethod = validateSelectedShippingMethod(
          MARVELMARTS_MULTI_VENDOR_SHIPPING_OPTIONS.map((option) => option.value),
          legacySelectedMethod ?? "Standard"
        );
      } catch {
        throw badRequest("Select Standard, Express, or Store Pickup for this multi-vendor checkout.");
      }

      combinedShipping = getShippingFee(platformShippingMethod);
    }

    for (const group of vendorGroups.values()) {
      const merchandiseSubtotal = group.items.reduce(
        (sum, item) => sum + item.orderItem.unitPrice * item.orderItem.qty,
        0
      );

      combinedSubtotal += merchandiseSubtotal;

      if (isMultiVendorCheckout) {
        // MarvelMarts owns multi-vendor shipping; it is never allocated to vendors.
        vendorOrders.push({
          vendorProfileId: group.vendorProfileId,
          merchandiseSubtotal,
          shipping: 0,
          shippingMethod: "MARVELMARTS",
          total: merchandiseSubtotal,
          itemKeys: group.items.map((item) => item.key),
          shippingOptions: [],
        });
        continue;
      }

      const configuredShippingMethods =
        group.products.map(
          (product) =>
            normalizeShippingMethods(
              product.shippingMethod
            )
        );

      if (
        configuredShippingMethods.some(
          (methods) =>
            methods.length === 0
        )
      ) {
        throw badRequest(
          "One or more products do not have a valid shipping method configured."
        );
      }

      /*
       * Shipping availability is calculated independently
       * for each vendor.
       */
      const commonShippingMethods =
        configuredShippingMethods.reduce<
          ShippingMethod[]
        >(
          (
            common,
            methods
          ) =>
            common.filter(
              (method) =>
                methods.includes(
                  method
                )
            ),
          SHIPPING_OPTIONS.map(
            (option) =>
              option.value
          )
        );

      if (
        !commonShippingMethods.length
      ) {
        throw badRequest(
          `No common shipping method is available for vendor ${group.vendorProfileId}.`
        );
      }

      let requestedMethod: unknown;

      if (
        selectedMethodsByVendor &&
        Object.prototype.hasOwnProperty.call(
          selectedMethodsByVendor,
          group.vendorProfileId
        )
      ) {
        requestedMethod =
          selectedMethodsByVendor[
            group.vendorProfileId
          ];
      } else {
        requestedMethod =
          legacySelectedMethod;
      }

      let shippingMethod: ShippingMethod;

      if (
        requestedMethod == null
      ) {
        shippingMethod =
          commonShippingMethods[0];
      } else {
        try {
          shippingMethod =
            validateSelectedShippingMethod(
              commonShippingMethods,
              requestedMethod
            );
        } catch {
          throw badRequest(
            `The selected shipping method is not available for vendor ${group.vendorProfileId}.`
          );
        }
      }

      const shipping =
        getShippingFee(
          shippingMethod
        );

      const total =
        merchandiseSubtotal +
        shipping;

      combinedShipping +=
        shipping;

      vendorOrders.push({
        vendorProfileId:
          group.vendorProfileId,

        merchandiseSubtotal,

        shipping,

        shippingMethod,

        total,

        itemKeys:
          group.items.map(
            (item) =>
              item.key
          ),

        shippingOptions:
          commonShippingMethods.map(
            (method) => ({
              method,
              fee:
                getShippingFee(
                  method
                ),
            })
          ),
      });
    }

    /*
     * Strip internal grouping metadata before returning
     * OrderItem data to OrderService.
     */
    const orderItems =
      preparedItems.map(
        (item) =>
          item.orderItem
      );

    return {
      /*
       * Legacy compatibility:
       * Order.vendorProfileId is still required by the
       * existing schema. It must NOT be used as the
       * financial/vendor allocation source once VendorOrder
       * records exist.
       */
      vendorProfileId:
        vendorOrders[0]
          .vendorProfileId,

      orderItems,

      subtotal:
        combinedSubtotal,

      shipping:
        combinedShipping,

      shippingMethod: isMultiVendorCheckout
        ? platformShippingMethod!
        : vendorOrders[0].shippingMethod,

      total:
        combinedSubtotal +
        combinedShipping,

      shippingOptions: isMultiVendorCheckout
        ? MARVELMARTS_MULTI_VENDOR_SHIPPING_OPTIONS.map((option) => ({
            method: option.value,
            fee: option.fee,
          }))
        : vendorOrders[0].shippingOptions,

      vendorOrders,
    };
  }

}

