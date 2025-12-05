"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";

type NotificationType = "success" | "error" | "info";

interface NotificationState {
  message: string;
  type: NotificationType;
  visible: boolean;
}

interface NotificationContextValue {
  notifySuccess: (message: string) => void;
  notifyError: (message: string) => void;
  notifyInfo: (message: string) => void;
  clearNotification: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined
);

export function useNotification(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return ctx;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<NotificationState>({
    message: "",
    type: "info",
    visible: false,
  });

  const show = useCallback((type: NotificationType, message: string) => {
    setNotification({ message, type, visible: true });

    // Auto hide after 4s
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, visible: false }));
    }, 4000);
  }, []);

  const notifySuccess = (message: string) => show("success", message);
  const notifyError = (message: string) => show("error", message);
  const notifyInfo = (message: string) => show("info", message);

  const clearNotification = () =>
    setNotification((prev) => ({ ...prev, visible: false }));

  return (
    <NotificationContext.Provider
      value={{ notifySuccess, notifyError, notifyInfo, clearNotification }}
    >
      {children}

      {notification.visible && (
        <div className="fixed bottom-6 right-6 z-50">
          <div
            className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium
              ${
                notification.type === "success"
                  ? "bg-green-600 text-white text-xl"
                  : ""
              }
              ${
                notification.type === "error" ? "bg-red-600 text-white text-xl" : ""
              }
              ${
                notification.type === "info" ? "bg-slate-800 text-white text-xl" : ""
              }
            `}
          >
            {notification.message}
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

