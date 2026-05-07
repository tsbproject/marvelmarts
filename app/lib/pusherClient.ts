// import PusherClient from "pusher-js";


// // Ensure these match exactly what you named in your .env
// export const pusherClient = new PusherClient(
//   process.env.NEXT_PUBLIC_PUSHER_KEY!,
//   {
//     cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
//     forceTLS: true, // Recommended for security
//   }
// );




// "use client";

// import Pusher from "pusher-js";

// // Ensure these match exactly what you named in your .env
// export const pusherClient = new Pusher(
//   process.env.NEXT_PUBLIC_PUSHER_KEY!,
//   {
//     cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
//     forceTLS: true,
//   }
// );



"use client";

import Pusher from "pusher-js";

let pusher: Pusher | null = null;

export const getPusherClient = () => {
  if (!pusher) {
    pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      forceTLS: true,
    });
  }
  return pusher;
};