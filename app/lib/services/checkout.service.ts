import {
  sanitizeAddress,
  sanitizeCityOrState,
  sanitizeEmail,
  sanitizeName,
  sanitizePhone,
  sanitizeText,
} from "@/app/lib/orders/sanitizer";

import { prisma } from "@/app/lib/prisma";
import { SHIPPING_FEE } from "@/app/lib/orders/constants";

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
  normalizedItems: NormalizedCartItem[]
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

  const vendorIds = new Set(
    products
      .map(
        (product) =>
          product.vendorProfileId
      )
      .filter(Boolean)
  );

  if (!vendorIds.size) {
    throw badRequest(
      "Vendor information missing for these products."
    );
  }

  if (vendorIds.size > 1) {
    throw badRequest(
      "Mixed-vendor checkout is not supported yet. Please checkout one vendor at a time."
    );
  }

  const vendorProfileId = [
    ...vendorIds,
  ][0] as string;

  const orderItems =
    normalizedItems.map((item) => {
      const product =
        productMap.get(
          item.productId
        )!;

      let unitPrice = Number(
        product.discountPrice ??
          product.price
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
      };
    });

  const subtotal =
    orderItems.reduce(
      (sum, item) =>
        sum +
        item.unitPrice *
          item.qty,
      0
    );

  return {
    vendorProfileId,

    orderItems,

    subtotal,

    shipping:
      SHIPPING_FEE,

    total:
      subtotal +
      SHIPPING_FEE,
  };
}

}