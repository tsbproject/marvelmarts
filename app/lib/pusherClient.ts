import PusherClient from "pusher-js";


// Ensure these match exactly what you named in your .env
export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    forceTLS: true, // Recommended for security
  }
);