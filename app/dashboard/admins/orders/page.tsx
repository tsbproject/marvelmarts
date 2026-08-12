import { OrderService } from "@/app/lib/services/order.service";
import OrdersTable from "./OrdersTable";

export const dynamic = "force-dynamic";

export default async function OrdersManagementPage() {
  const orders =
    await OrderService.getAdminOrders();

  return (
    <OrdersTable initialOrders={orders} />
  );
}



