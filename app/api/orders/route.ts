import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";

import { requireAuth } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";
import { badRequest } from "@/app/lib/auth/errors";

type NormalizedCartItem = {
  productId: string;
  variantId: string | null;
  quantity: number | null;
};

const NIGERIAN_STATES = new Set([
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara",
]);

const SHIPPING_FEE = 2500;
const MAX_ITEMS = 50;
const MAX_QTY_PER_ITEM = 20;

function generateOrderNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `MARVEL-${year}-${random}`;
}

async function generateUniqueOrderNumber() {
  let orderNumber = generateOrderNumber();
  let exists = await prisma.order.findUnique({
    where: { orderNumber },
    select: { id: true },
  });

  while (exists) {
    orderNumber = generateOrderNumber();
    exists = await prisma.order.findUnique({
      where: { orderNumber },
      select: { id: true },
    });
  }

  return orderNumber;
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function stripDangerousChars(value: string) {
  return value
    .normalize("NFKC")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/[<>`]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/data:/gi, "")
    .replace(/vbscript:/gi, "");
}

function sanitizeText(value: unknown, maxLength: number) {
  return normalizeWhitespace(stripDangerousChars(String(value ?? ""))).slice(0, maxLength);
}

function sanitizeEmail(value: unknown) {
  return stripDangerousChars(String(value ?? ""))
    .replace(/\s+/g, "")
    .toLowerCase()
    .slice(0, 120);
}

function sanitizePhone(value: unknown) {
  return String(value ?? "")
    .replace(/[^\d+\-()\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 20);
}

function sanitizeName(value: unknown) {
  return sanitizeText(String(value ?? "").replace(/[^A-Za-zÀ-ÿ'\-\s]/g, ""), 50);
}

function sanitizeCityOrState(value: unknown, maxLength = 60) {
  return sanitizeText(String(value ?? "").replace(/[^A-Za-zÀ-ÿ'.\-\s]/g, ""), maxLength);
}

function sanitizeAddress(value: unknown, maxLength = 150) {
  return sanitizeText(String(value ?? "").replace(/[^A-Za-z0-9À-ÿ#.,/\-()\s]/g, ""), maxLength);
}

function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateName(value: string) {
  return value.length >= 2 && value.length <= 50;
}

function validatePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

function validateAddress(value: string) {
  return value.length >= 5 && value.length <= 150;
}

function validateCity(value: string) {
  return value.length >= 2 && value.length <= 60;
}

function validateState(value: string) {
  return NIGERIAN_STATES.has(value);
}

function parsePositiveInt(value: unknown) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function parseMoney(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export async function POST(req: NextRequest) {
  try {
   const session = await requireAuth();

    const body = await req.json();
    const rawFormData = body?.formData ?? {};
    const rawItems = Array.isArray(body?.items) ? body.items : [];

    if (!rawItems.length) {
      throw badRequest("No items in cart.");
      
    }

    if (rawItems.length > MAX_ITEMS) {
        throw badRequest("Too many cart items.");
      
    }

    const formData = {
      email: sanitizeEmail(rawFormData.email),
      firstName: sanitizeName(rawFormData.firstName),
      lastName: sanitizeName(rawFormData.lastName),
      phone: sanitizePhone(rawFormData.phone),
      streetAddress: sanitizeAddress(rawFormData.streetAddress, 150),
      apartment: sanitizeAddress(rawFormData.apartment, 80),
      city: sanitizeCityOrState(rawFormData.city, 60),
      state: sanitizeCityOrState(rawFormData.state, 40),
      country: sanitizeCityOrState(rawFormData.country || "Nigeria", 40),
      orderNotes: sanitizeText(rawFormData.orderNotes, 500),
      useDifferentShipping: !!rawFormData.useDifferentShipping,
      shippingDetails: {
        firstName: sanitizeName(rawFormData?.shippingDetails?.firstName),
        lastName: sanitizeName(rawFormData?.shippingDetails?.lastName),
        streetAddress: sanitizeAddress(rawFormData?.shippingDetails?.streetAddress, 150),
        city: sanitizeCityOrState(rawFormData?.shippingDetails?.city, 60),
        state: sanitizeCityOrState(rawFormData?.shippingDetails?.state, 40),
      },
    };

    const baseValid =
      validateEmail(formData.email) &&
      validateName(formData.firstName) &&
      validateName(formData.lastName) &&
      validatePhone(formData.phone) &&
      validateAddress(formData.streetAddress) &&
      validateCity(formData.city) &&
      validateState(formData.state);

    if (!baseValid) {
      throw badRequest("Invalid checkout information.");
    }

    if (formData.useDifferentShipping) {
      const shippingValid =
        validateName(formData.shippingDetails.firstName) &&
        validateName(formData.shippingDetails.lastName) &&
        validateAddress(formData.shippingDetails.streetAddress) &&
        validateCity(formData.shippingDetails.city) &&
        validateState(formData.shippingDetails.state);

      if (!shippingValid) {
        throw badRequest("Invalid shipping details.");
       
      }
    }

    const normalizedItems: NormalizedCartItem[] = rawItems.map((item: any) => {
      const productId = sanitizeText(item?.id, 100);
      const variantId = item?.variantId ? sanitizeText(item.variantId, 100) : null;
      const quantity = parsePositiveInt(item?.quantity);

      return { productId, variantId, quantity };
    });

    const hasInvalidItem = normalizedItems.some(
      (item) =>
        !item.productId ||
        item.quantity === null ||
        item.quantity < 1 ||
        item.quantity > MAX_QTY_PER_ITEM
    );

    if (hasInvalidItem) {
          throw badRequest("Invalid cart item data.");
    }

    const uniqueProductIds = [...new Set<string>(normalizedItems.map((item) => item.productId))];
          const products = await prisma.product.findMany({
          where: {
            id: { in: uniqueProductIds },
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

    if (products.length !== uniqueProductIds.length) {
           throw badRequest("One or more products are invalid.");
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    const vendorIds = new Set(products.map((p) => p.vendorProfileId).filter(Boolean));

    if (!vendorIds.size) {
        throw badRequest("Vendor information missing for these products.");
    }

    if (vendorIds.size > 1) {
         throw badRequest("Mixed-vendor checkout is not supported yet. Please checkout one vendor at a time.");
      
    }

    const vendorProfileId = [...vendorIds][0] as string;

    const orderItems = normalizedItems.map((item) => {
        const product = productMap.get(item.productId)!;

        // Validate Stock & Determine Price
        let unitPrice = Number(product.discountPrice ?? product.price);

        if (item.variantId) {
          const variant = product.variants.find(
            (v) => v.id === item.variantId
          );

          if (!variant) {
            throw badRequest("Selected product variant no longer exists.");
          }

          if (variant.stock < item.quantity!) {
            throw badRequest(
              `${product.title} (${variant.name}) only has ${variant.stock} item(s) remaining.`
            );
          }

          if (variant.price != null) {
            unitPrice = Number(variant.price);
          }
        } else {
          if (product.stock < item.quantity!) {
            throw badRequest(
              `${product.title} only has ${product.stock} item(s) remaining.`
            );
          }
        }

        if (!Number.isFinite(unitPrice) || unitPrice < 0) {
          throw badRequest(
            `Invalid pricing detected for "${product.title}".`
          );
        }

        return {
          productId: product.id,
          variantId: item.variantId,
          qty: item.quantity!,
          unitPrice,
          title: sanitizeText(product.title, 200),
          imageUrl: product.images[0]?.url ?? null,
        };
      });

    const serverSubtotal = orderItems.reduce(
      (sum: number, item: { unitPrice: number; qty: number; }) => sum + item.unitPrice * item.qty,
      0
    );
    const serverShipping = SHIPPING_FEE;
    const serverTotal = serverSubtotal + serverShipping;

    const orderNumber = await generateUniqueOrderNumber();

      const order = await prisma.$transaction(async (tx) => {
          const createdOrder = await tx.order.create({
            data: {
              orderNumber,
              userId: session.user.id,
              vendorProfileId,
              email: formData.email,
              firstName: formData.firstName,
              lastName: formData.lastName,
              phone: formData.phone || null,
              streetAddress: formData.streetAddress,
              apartment: formData.apartment || null,
              city: formData.city,
              state: formData.state,
              orderNotes: formData.orderNotes || null,

              useDifferentShipping: formData.useDifferentShipping,
              shippingFirstName: formData.useDifferentShipping
                ? formData.shippingDetails.firstName || null
                : formData.firstName,
              shippingLastName: formData.useDifferentShipping
                ? formData.shippingDetails.lastName || null
                : formData.lastName,
              shippingAddress: formData.useDifferentShipping
                ? formData.shippingDetails.streetAddress || null
                : formData.streetAddress,
              shippingCity: formData.useDifferentShipping
                ? formData.shippingDetails.city || null
                : formData.city,
              shippingState: formData.useDifferentShipping
                ? formData.shippingDetails.state || null
                : formData.state,

              subtotal: serverSubtotal,
              shipping: serverShipping,
              total: serverTotal,
              status: "pending",
              paymentStatus: false,

              items: {
                create: orderItems,
              },
            },
            include: {
              items: true,
            },
          });

          // Inventory updates go here
          for (const item of normalizedItems) {
            if (item.variantId) {
              await tx.variant.update({
                where: {
                  id: item.variantId!,
                },
                data: {
                  stock: {
                    decrement: item.quantity!,
                  },
                },
              });

              await tx.product.update({
                where: {
                  id: item.productId,
                },
                data: {
                  salesCount: {
                    increment: item.quantity!,
                  },
                },
              });
            } else {
              await tx.product.update({
                where: {
                  id: item.productId,
                },
                data: {
                  stock: {
                    decrement: item.quantity!,
                  },
                  salesCount: {
                    increment: item.quantity!,
                  },
                },
              });
            }
          }

          return createdOrder;
        });

    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.email,
        amount: Math.round(serverTotal * 100),
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          custom_fields: [
            {
              display_name: "Order Number",
              variable_name: "order_number",
              value: order.orderNumber,
            },
          ],
        },
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/thank-you?orderNumber=${order.orderNumber}`,
      }),
    });

    const paystackData = await paystackRes.json();
      if (!paystackRes.ok || !paystackData.status) {
        await prisma.order.update({
          where: {
            id: order.id,
          },
          data: {
            paymentStatus: false,
          },
        });

        throw new Error(
          paystackData.message ??
          "Unable to initialize payment."
        );
      }


      await prisma.order.update({
          where: {
            id: order.id,
          },
          data: {
            paymentIntentId: paystackData.data.reference,
          },
        });

   return NextResponse.json(
        {
          success: true,
          orderId: order.id,
          orderNumber: order.orderNumber,
          paymentReference: paystackData.data.reference,

          // old name
          url: paystackData.data.authorization_url,

          // new name
          authorizationUrl:
            paystackData.data.authorization_url,
        },
        {
          status: 201,
        }
      );
  
  } catch (error) {
    console.error("DB_ORDER_ERROR:", error);
    return handleApiError(error);
  }
}

export async function GET() {
  try {
    const session = await requireAuth();

   

    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        items: true,
        vendorProfile: {
          select: {
            storeName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    return handleApiError(error);
    
  }
}