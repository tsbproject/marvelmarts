// import { NextResponse } from "next/server";
// import { prisma } from "@/app/lib/prisma";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth";

// function generateOrderNumber() {
//   const year = new Date().getFullYear();
//   const random = Math.floor(100000 + Math.random() * 900000);
//   return `MARVEL-${year}-${random}`;
// }

// async function generateUniqueOrderNumber() {
//   let orderNumber = generateOrderNumber();
//   let exists = await prisma.order.findUnique({
//     where: { orderNumber },
//     select: { id: true },
//   });

//   while (exists) {
//     orderNumber = generateOrderNumber();
//     exists = await prisma.order.findUnique({
//       where: { orderNumber },
//       select: { id: true },
//     });
//   }

//   return orderNumber;
// }

// export async function POST(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session?.user?.id) {
//       return NextResponse.json(
//         { error: "Please login to checkout" },
//         { status: 401 }
//       );
//     }

//     const body = await req.json();
//     const { formData, items, subtotal, shipping, total } = body;

//     if (!items || !Array.isArray(items) || items.length === 0) {
//       return NextResponse.json(
//         { error: "No items in cart" },
//         { status: 400 }
//       );
//     }

//     const productData = await prisma.product.findUnique({
//       where: { id: items[0].id },
//       select: { vendorProfileId: true },
//     });

//     if (!productData?.vendorProfileId) {
//       return NextResponse.json(
//         { error: "Vendor information missing for these products" },
//         { status: 400 }
//       );
//     }

//     const orderNumber = await generateUniqueOrderNumber();

//     const order = await prisma.order.create({
//       data: {
//         orderNumber,
//         userId: session.user.id,
//         vendorProfileId: productData.vendorProfileId,
//         email: formData.email,
//         firstName: formData.firstName,
//         lastName: formData.lastName,
//         phone: formData.phone || null,
//         streetAddress: formData.streetAddress,
//         apartment: formData.apartment || null,
//         city: formData.city,
//         state: formData.state,
//         orderNotes: formData.orderNotes || null,

//         useDifferentShipping: !!formData.useDifferentShipping,
//         shippingFirstName: formData.useDifferentShipping
//           ? formData.shippingDetails?.firstName || null
//           : formData.firstName,
//         shippingLastName: formData.useDifferentShipping
//           ? formData.shippingDetails?.lastName || null
//           : formData.lastName,
//         shippingAddress: formData.useDifferentShipping
//           ? formData.shippingDetails?.streetAddress || null
//           : formData.streetAddress,
//         shippingCity: formData.useDifferentShipping
//           ? formData.shippingDetails?.city || null
//           : formData.city,
//         shippingState: formData.useDifferentShipping
//           ? formData.shippingDetails?.state || null
//           : formData.state,

//         subtotal: Number(subtotal),
//         shipping: Number(shipping),
//         total: Number(total),
//         status: "pending",
//         paymentStatus: false,

//         items: {
//           create: items.map((item: any) => ({
//             productId: item.id,
//             variantId: item.variantId || null,
//             qty: Number(item.quantity),
//             unitPrice: Number(item.price),
//             title: item.title,
//             imageUrl: item.imageUrl || null,
//           })),
//         },
//       },
//       include: {
//         items: true,
//       },
//     });

//     const paystackRes = await fetch(
//       "https://api.paystack.co/transaction/initialize",
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           email: formData.email,
//           amount: Math.round(Number(total) * 100),
//           metadata: {
//             orderId: order.id,
//             orderNumber: order.orderNumber,
//             custom_fields: [
//               {
//                 display_name: "Order Number",
//                 variable_name: "order_number",
//                 value: order.orderNumber,
//               },
//             ],
//           },
//           callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/thank-you?orderNumber=${order.orderNumber}`,
//         }),
//       }
//     );

//     const paystackData = await paystackRes.json();

//     if (!paystackRes.ok || !paystackData.status) {
//       throw new Error(paystackData.message || "Paystack initialization failed");
//     }

//     return NextResponse.json(
//       {
//         orderId: order.id,
//         orderNumber: order.orderNumber,
//         url: paystackData.data.authorization_url,
//       },
//       { status: 201 }
//     );
//   } catch (error: any) {
//     console.error("DB_ORDER_ERROR:", error);
//     return NextResponse.json(
//       { error: error.message || "Failed to process order" },
//       { status: 500 }
//     );
//   }
// }

// export async function GET() {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const orders = await prisma.order.findMany({
//       where: {
//         userId: session.user.id,
//       },
//       include: {
//         items: true,
//         vendorProfile: {
//           select: {
//             storeName: true,
//           },
//         },
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     return NextResponse.json(orders);
//   } catch (error: any) {
//     console.error("GET_ORDERS_ERROR:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch orders" },
//       { status: 500 }
//     );
//   }
// }




import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

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

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please login to checkout" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const rawFormData = body?.formData ?? {};
    const rawItems = Array.isArray(body?.items) ? body.items : [];

    if (!rawItems.length) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    if (rawItems.length > MAX_ITEMS) {
      return NextResponse.json({ error: "Too many cart items" }, { status: 400 });
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
      return NextResponse.json(
        { error: "Invalid checkout form data" },
        { status: 400 }
      );
    }

    if (formData.useDifferentShipping) {
      const shippingValid =
        validateName(formData.shippingDetails.firstName) &&
        validateName(formData.shippingDetails.lastName) &&
        validateAddress(formData.shippingDetails.streetAddress) &&
        validateCity(formData.shippingDetails.city) &&
        validateState(formData.shippingDetails.state);

      if (!shippingValid) {
        return NextResponse.json(
          { error: "Invalid shipping details" },
          { status: 400 }
        );
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
      return NextResponse.json(
        { error: "Invalid cart item data" },
        { status: 400 }
      );
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
            vendorProfileId: true,
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
      return NextResponse.json(
        { error: "One or more products are invalid" },
        { status: 400 }
      );
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    const vendorIds = new Set(products.map((p) => p.vendorProfileId).filter(Boolean));

    if (!vendorIds.size) {
      return NextResponse.json(
        { error: "Vendor information missing for these products" },
        { status: 400 }
      );
    }

    if (vendorIds.size > 1) {
      return NextResponse.json(
        { error: "Mixed-vendor checkout is not supported yet. Please checkout one vendor at a time." },
        { status: 400 }
      );
    }

    const vendorProfileId = [...vendorIds][0] as string;

    const orderItems = normalizedItems.map((item: { productId: string; variantId: any; quantity: any; }) => {
      const product = productMap.get(item.productId)!;
      const unitPrice = Number(product.price);

      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        throw new Error("Invalid product pricing detected");
      }

      return {
        productId: product.id,
        variantId: item.variantId,
        qty: item.quantity!,
        unitPrice,
        title: sanitizeText(product.title, 200),
        imageUrl: product.images[0]?.url || null,
      };
    });

    const serverSubtotal = orderItems.reduce(
      (sum: number, item: { unitPrice: number; qty: number; }) => sum + item.unitPrice * item.qty,
      0
    );
    const serverShipping = SHIPPING_FEE;
    const serverTotal = serverSubtotal + serverShipping;

    const orderNumber = await generateUniqueOrderNumber();

    const order = await prisma.order.create({
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
      throw new Error(paystackData.message || "Paystack initialization failed");
    }

    return NextResponse.json(
      {
        orderId: order.id,
        orderNumber: order.orderNumber,
        url: paystackData.data.authorization_url,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("DB_ORDER_ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process order" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
  } catch (error: any) {
    console.error("GET_ORDERS_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}