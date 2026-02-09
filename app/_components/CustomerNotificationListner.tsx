"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { addCustomerNotification } from "@/store/customerNotificationSlice";
import { pusherClient } from "@/app/lib/pusherClient";
import { useNotification } from "@/app/_context/NotificationContext";

export default function CustomerNotificationListener() {
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const { notifySuccess, notifyError } = useNotification();

  useEffect(() => {
    if (!session?.user?.id) return;

    // Listen on a private channel unique to this user
    const channel = pusherClient.subscribe(`user-${session.user.id}`);

    channel.bind("refund-update", (data: any) => {
      const isApproved = data.status === "approved";
      
      dispatch(addCustomerNotification({
        orderId: data.orderId,
        type: isApproved ? "refund_approved" : "refund_rejected",
        message: data.message
      }));

      if (isApproved) {
        notifySuccess(`Refund Approved for Order #${data.orderId.slice(-6).toUpperCase()}`);
      } else {
        notifyError(`Refund Declined: ${data.reason}`);
      }
    });

    return () => {
      pusherClient.unsubscribe(`user-${session.user.id}`);
    };
  }, [session?.user?.id, dispatch, notifySuccess, notifyError]);

  return null; // This component stays invisible, it just listens
}