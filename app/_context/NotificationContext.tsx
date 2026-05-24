"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

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

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotification must be used within a NotificationProvider");
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
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, visible: false }));
    }, 4500);
  }, []);

  const notifySuccess = (message: string) => show("success", message);
  const notifyError = (message: string) => show("error", message);
  const notifyInfo = (message: string) => show("info", message);
  const clearNotification = () => setNotification((prev) => ({ ...prev, visible: false }));

  // Icon mapping
  const icons = {
    success: <CheckCircle2 className="text-white" size={24} />,
    error: <AlertCircle className="text-white" size={24} />,
    info: <Info className="text-white" size={24} />,
  };

  // Color mapping
  const styles = {
    success: "bg-green-600 border-green-400",
    error: "bg-red-600 border-red-400",
    info: "bg-[#002B5B] border-blue-400",
  };

  return (
    <NotificationContext.Provider value={{ notifySuccess, notifyError, notifyInfo, clearNotification }}>
      {children}

      <AnimatePresence>
        {notification.visible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
            className="fixed top-8 right-8 z-9999"
          >
            <div className={`${styles[notification.type]} border-2 shadow-2xl rounded-2xl p-5 flex items-center gap-4 min-w-[320px] max-w-[450px]`}>
              <div className="bg-white/20 p-2 rounded-xl">
                {icons[notification.type]}
              </div>
              
              <div className="flex-1">
                <p className="text-white font-black uppercase italic tracking-wider text-sm leading-tight">
                  {notification.type === 'success' ? 'MarvelMarts Success' : notification.type.toUpperCase()}
                </p>
                <p className="text-white/90 font-bold text-base mt-0.5">
                  {notification.message}
                </p>
              </div>

              <button 
                onClick={clearNotification}
                className="text-white/50 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
}