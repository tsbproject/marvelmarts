import { OrderService } from "@/app/lib/services/order.service";
import OrdersTable from "./OrdersTable";

export const dynamic = "force-dynamic";

export default async function OrdersManagementPage() {
  const orders = await OrderService.getAdminOrders();

  const serializedOrders = orders.map((order) => ({
    ...order,
    subtotal: Number(order.subtotal),
    shipping: Number(order.shipping),
    tax: Number(order.tax),
    total: Number(order.total),

    vendorOrders: order.vendorOrders.map((vendorOrder) => ({
      ...vendorOrder,
      merchandiseSubtotal: Number(vendorOrder.merchandiseSubtotal),
      shipping: Number(vendorOrder.shipping),
      total: Number(vendorOrder.total),
    })),
  }));

  return (
    <OrdersTable initialOrders={serializedOrders} />
  );
}



