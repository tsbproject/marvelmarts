// app/api/admin/orders/update/route.ts
import { pusherServer } from "@/app/lib/pusher";

export async function PATCH(req: Request) {
  const body = await req.json();
  const { orderId, status, userId } = body;

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status }
  });

  // This is the magic: Send the update to the user's private channel
  await pusherServer.trigger(`user-${userId}`, "order-sync", updatedOrder);

  return NextResponse.json(updatedOrder);
}