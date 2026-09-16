export type CreateOrderPayload = {
  formData: any;
  items: any[];
  subtotal: number;
  shipping: number;
  total: number;
  platformShippingMethod?: string;
};

export type CreateOrderResponse = {
  orderId: string;
  orderNumber: string;
  url?: string;
};

export async function createOrder(
  payload: CreateOrderPayload
): Promise<CreateOrderResponse> {
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401) {
      window.location.href =
        "/auth/sign-in?redirect=/checkout";

      throw new Error("Authentication required.");
    }

    throw new Error(
      data?.error ?? "Unable to create order."
    );
  }

  return data;
}
