import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";
import { CheckoutService } from "@/app/lib/services/checkout.service";
import { OrderService } from "@/app/lib/services/order.service";
import { PaymentService } from "@/app/lib/services/payment.service";
import { generateUniqueOrderNumber } from "@/app/lib/orders/order-number";


export async function POST(req: NextRequest) {
  try {
   const session = await requireAuth();

    const body = await req.json();
    const rawFormData = body?.formData ?? {};
    const rawItems = Array.isArray(body?.items) ? body.items : [];

   

  
    const formData =
      CheckoutService.prepareForm(
        rawFormData
      );


      const normalizedItems =
      CheckoutService.normalizeCart(
        rawItems
      );
        
    
    const checkout =
      await CheckoutService.prepareItems(
        normalizedItems
      );

    const {
      vendorProfileId,
      orderItems,
      subtotal: serverSubtotal,
      shipping: serverShipping,
      total: serverTotal,
    } = checkout;
          

  
   
   

    const orderNumber = await generateUniqueOrderNumber();

      const order =
          await OrderService.createOrder({
            orderNumber,

            userId: session.user.id,

            vendorProfileId,

            formData,

            orderItems,

            normalizedItems,

            subtotal: serverSubtotal,

            shipping: serverShipping,

            total: serverTotal,
          });

          const payment =
            await PaymentService.initializeOrderPayment(
              order,
              formData.email,
              serverTotal
            );

          return NextResponse.json(
            payment,
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

      const orders =
        await OrderService.getOrders(
          session.user.id
        );

      return NextResponse.json(
        orders
      );
    } catch (error) {
      return handleApiError(error);
    }
  }