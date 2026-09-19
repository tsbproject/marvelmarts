import prisma from "@/app/lib/prisma";

async function main() {
  console.log(`
==============================================
F4.4 LATEST ORDER SHIPPING CHECK
READ-ONLY - NO DATABASE WRITES
==============================================
`);

  const order = await prisma.order.findFirst({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      subtotal: true,
      shipping: true,
      total: true,
      paymentIntentId: true,
      createdAt: true,
      vendorProfileId: true,
    },
  });

  if (!order) {
    console.log("No orders found.");
    return;
  }

  console.log("LATEST ORDER");
  console.log("----------------------------------------------");
  console.log(`ID:               ${order.id}`);
  console.log(`Order Number:     ${order.orderNumber}`);
  console.log(`Status:           ${order.status}`);
  console.log(`Payment Status:   ${order.paymentStatus}`);
  console.log(
    `Payment Ref:      ${order.paymentIntentId ?? "NONE"}`
  );
  console.log(
    `Subtotal:         ₦${order.subtotal.toFixed(2)}`
  );
  console.log(
    `Shipping:         ₦${order.shipping.toFixed(2)}`
  );
  console.log(
    `Total:            ₦${order.total.toFixed(2)}`
  );
  console.log(
    `Created:          ${order.createdAt.toISOString()}`
  );

  const vendorOrders = await prisma.vendorOrder.findMany({
    where: {
      orderId: order.id,
    },
    select: {
      id: true,
      vendorProfileId: true,
      status: true,
      merchandiseSubtotal: true,
      shipping: true,
      shippingMethod: true,
      total: true,
      commissionRate: true,
      commissionAmount: true,
      vendorNet: true,
    },
  });

  console.log("\nVENDOR ORDERS");
  console.log("----------------------------------------------");

  if (vendorOrders.length === 0) {
    console.log("NONE");
  }

  for (const vendorOrder of vendorOrders) {
    console.log(`ID:               ${vendorOrder.id}`);
    console.log(
      `Vendor:           ${vendorOrder.vendorProfileId}`
    );
    console.log(`Status:           ${vendorOrder.status}`);
    console.log(
      `Merchandise:      ₦${vendorOrder.merchandiseSubtotal.toFixed(2)}`
    );
    console.log(
      `Shipping Method:  ${vendorOrder.shippingMethod}`
    );
    console.log(
      `Shipping:         ₦${vendorOrder.shipping.toFixed(2)}`
    );
    console.log(
      `Total:            ₦${vendorOrder.total.toFixed(2)}`
    );
    console.log(
      `Commission Rate:  ${vendorOrder.commissionRate ?? "NONE"}`
    );
    console.log(
      `Commission:       ₦${vendorOrder.commissionAmount?.toFixed(2) ?? "NONE"}`
    );
    console.log(
      `Vendor Net:       ₦${vendorOrder.vendorNet?.toFixed(2) ?? "NONE"}`
    );
    console.log("");
  }

  console.log("BASIC RECONCILIATION");
  console.log("----------------------------------------------");

  const expectedOrderTotal =
    Number(order.subtotal) + Number(order.shipping);

  console.log(
    `Order subtotal + shipping: ₦${expectedOrderTotal.toFixed(2)}`
  );

  console.log(
    `Recorded order total:      ₦${Number(order.total).toFixed(2)}`
  );

  console.log(
    `Order total matches:       ${
      Math.abs(expectedOrderTotal - Number(order.total)) < 0.01
    }`
  );

  if (vendorOrders.length === 1) {
    const vendorOrder = vendorOrders[0];

    const expectedVendorTotal =
      Number(vendorOrder.merchandiseSubtotal) +
      Number(vendorOrder.shipping);

    console.log(
      `Vendor merchandise + shipping: ₦${expectedVendorTotal.toFixed(2)}`
    );

    console.log(
      `VendorOrder total:             ₦${Number(
        vendorOrder.total
      ).toFixed(2)}`
    );

    console.log(
      `VendorOrder total matches:     ${
        Math.abs(
          expectedVendorTotal -
            Number(vendorOrder.total)
        ) < 0.01
      }`
    );

    console.log(
      `Order shipping:                ₦${Number(
        order.shipping
      ).toFixed(2)}`
    );

    console.log(
      `VendorOrder shipping:          ₦${Number(
        vendorOrder.shipping
      ).toFixed(2)}`
    );

    console.log(
      `Shipping amounts match:         ${
        Math.abs(
          Number(order.shipping) -
            Number(vendorOrder.shipping)
        ) < 0.01
      }`
    );
  }

  console.log(`
==============================================
END OF SHIPPING CHECK
NO DATABASE WRITES WERE PERFORMED
==============================================
`);
}

main()
  .catch((error) => {
    console.error("\nCHECK FAILED");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });