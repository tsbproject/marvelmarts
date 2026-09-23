const CHECKOUT_ATTEMPT_STORAGE_KEY =
  "marvelmarts_checkout_attempt_id";

function getCheckoutAttemptId(): string {
  const existing = sessionStorage.getItem(
    CHECKOUT_ATTEMPT_STORAGE_KEY
  );

  

  if (existing) {
    return existing;
  }

  const id = crypto.randomUUID();

  sessionStorage.setItem(
    CHECKOUT_ATTEMPT_STORAGE_KEY,
    id
  );

  return id;
}

export function clearCheckoutAttemptId(): void {
  sessionStorage.removeItem(
    CHECKOUT_ATTEMPT_STORAGE_KEY
  );
}

export type CreateOrderPayload = {
  formData: any;
  items: any[];
  subtotal: number;
  shipping: number;
  shippingMethod: string;
  total: number;
};

export type CreateOrderResponse = {
  orderId: string;
  orderNumber: string;
  url?: string;
};

export async function createOrder(
  payload: CreateOrderPayload
): Promise<CreateOrderResponse> {
  const checkoutAttemptId = getCheckoutAttemptId();

  const res = await fetch("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...payload,
      checkoutAttemptId,
    }),
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