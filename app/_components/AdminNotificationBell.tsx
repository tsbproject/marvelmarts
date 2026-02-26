"use client";

import { useEffect, useState, useRef } from "react";
import { 
  Bell, X, ShoppingCart, RotateCcw, Trash2, 
  AlertTriangle, UserPlus, ShieldAlert, MessageSquare,
  Volume2, VolumeX 
} from "lucide-react"; 
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { 
  addNotification, 
  markAllAsRead, 
  markAsRead, 
  clearNotifications 
} from "@/store/notificationSlice";
import { pusherClient } from "@/app/lib/pusherClient";
import { useNotification } from "@/app/_context/NotificationContext";
import { useSession } from "next-auth/react";
import Link from "next/link";

// TACTICAL UTILITY: Notification Sound with Mute Check
const playNotifySound = () => {
  const isMuted = localStorage.getItem("marvelmarts_muted") === "true";
  if (isMuted) return;

  const audio = new Audio("/sounds/notification.mp3");
  audio.play().catch(() => console.log("Audio blocked by browser. Interaction required."));
};

export default function AdminNotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const { notifySuccess, notifyError } = useNotification();
  
  const notifications = useSelector((state: RootState) => state.adminNotifications.notifications);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // 1. INITIALIZE SETTINGS
  useEffect(() => {
    const savedMute = localStorage.getItem("marvelmarts_muted") === "true";
    setIsMuted(savedMute);
  }, []);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !isMuted;
    setIsMuted(newState);
    localStorage.setItem("marvelmarts_muted", String(newState));
    if (!newState) playNotifySound();
  };

  // 2. REAL-TIME SUBSCRIPTIONS
  useEffect(() => {
    const orderChannel = pusherClient.subscribe("admin-orders");
    const systemChannel = pusherClient.subscribe("admin-system");

    let userChannel: any = null;
    if (session?.user?.id) {
      userChannel = pusherClient.subscribe(`user-${session.user.id}`);
      
      userChannel.bind("new-message", (data: any) => {
        playNotifySound();
        dispatch(addNotification({
          type: "message",
          title: "New Message",
          message: data.content?.substring(0, 40) + "...",
          link: `/account/vendor/messages/${data.conversationId}`,
        }));
        notifySuccess(`New transmission from ${data.senderName}`);
      });
    }

    orderChannel.bind("new-refund-request", (data: any) => {
      playNotifySound();
      dispatch(addNotification({ ...data, type: "refund" }));
      notifySuccess(`Refund Request: Order #${data.orderId.slice(-6).toUpperCase()}`);
    });

    orderChannel.bind("order-cancelled", (data: any) => {
      playNotifySound();
      dispatch(addNotification({ ...data, type: "cancel" }));
      notifyError(`Order Cancelled: Order #${data.orderId.slice(-6).toUpperCase()}`);
    });

    systemChannel.bind("new-dispute", (data: any) => {
      playNotifySound();
      dispatch(addNotification({
        // id: data.id,
        type: "dispute",
        title: "Dispute Filed",
        message: data.message,
        link: `/dashboard/admins/disputes/${data.id}`,
      }));
      notifyError(`🚨 New Dispute: ${data.vendorName}`);
    });

    systemChannel.bind("vendor-signup", (data: any) => {
      playNotifySound();
      dispatch(addNotification({
    
        type: "vendor",
        title: "New Vendor Application",
        message: `${data.storeName} is waiting for approval`,
        link: `/dashboard/admins/vendors`,
      }));
      notifySuccess(`🏪 New Vendor: ${data.storeName}`);
    });

    return () => {
      pusherClient.unsubscribe("admin-orders");
      pusherClient.unsubscribe("admin-system");
      if (session?.user?.id) pusherClient.unsubscribe(`user-${session.user.id}`);
    };
  }, [dispatch, notifySuccess, notifyError, session?.user?.id]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'refund': return <RotateCcw size={16} />;
      case 'cancel': return <ShoppingCart size={16} className="rotate-12" />;
      case 'dispute': return <AlertTriangle size={16} />;
      case 'vendor': return <UserPlus size={16} />;
      case 'message': return <MessageSquare size={16} />;
      default: return <ShieldAlert size={16} />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'refund': return 'bg-amber-100 text-amber-600';
      case 'cancel': return 'bg-red-100 text-red-600';
      case 'dispute': return 'bg-rose-100 text-rose-600';
      case 'vendor': return 'bg-blue-100 text-blue-600';
      case 'message': return 'bg-emerald-100 text-emerald-600';
      default: return 'bg-neutral-100 text-neutral-600';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) dispatch(markAllAsRead());
        }}
        className="relative p-2 cursor-pointer hover:bg-neutral-100 rounded-full transition-all active:scale-90"
      >
        <Bell size={24} className="text-accent-navy" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full border-2 border-white animate-bounce">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-[24px] shadow-2xl border border-neutral-100 z-[999] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          <div className="p-5 border-b border-neutral-50 flex justify-between items-center bg-neutral-50/50">
            <h3 className="font-black text-accent-navy uppercase text-xs tracking-widest">Live Activity</h3>
            <div className="flex items-center gap-3">
              {/* MUTE TOGGLE */}
              <button 
                onClick={toggleMute}
                className="p-1.5 hover:bg-neutral-200 rounded-lg transition-colors text-neutral-500"
                title={isMuted ? "Unmute Alerts" : "Mute Alerts"}
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>

              {notifications.length > 0 && (
                <button 
                  onClick={() => dispatch(clearNotifications())}
                  className="text-[10px] font-black uppercase text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                >
                  <Trash2 size={12} /> Clear
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-accent-navy"><X size={18} /></button>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-10 text-center"><p className="text-sm text-neutral-400 font-medium italic">All caught up!</p></div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.link || `/dashboard/admins/orders/${n.orderId}`}
                  onClick={() => { dispatch(markAsRead(n.id)); setIsOpen(false); }}
                  className={`flex items-start gap-4 p-4 border-b border-neutral-50 hover:bg-neutral-50 transition-colors ${!n.isRead ? 'bg-red-50/10' : ''}`}
                >
                  <div className={`mt-1 p-2 rounded-lg ${getColor(n.type)}`}>
                    {getIcon(n.type)}
                  </div>
                  
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-black text-accent-navy leading-tight capitalize truncate">
                      {n.title || n.type.replace('-', ' ')}
                    </p>
                    <p className="text-[11px] text-neutral-500 font-bold uppercase mt-1 line-clamp-2">
                      {n.message || `Order #${n.orderId?.slice(-6).toUpperCase()}`}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                       <p className="text-[10px] text-neutral-400 font-medium">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {n.amount && (
                        <p className="text-[10px] font-black text-accent-navy">₦{Number(n.amount).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}