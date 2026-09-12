import { NotificationContext } from "@prisma/client";

export type BroadcastEmailData = {
  firstName?: string | null;
  title: string;
  message: string;
  context: NotificationContext;
};
