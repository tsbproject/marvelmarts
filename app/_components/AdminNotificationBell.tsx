// // "use client";

// // import { useEffect, useState, useRef } from "react";
// // import { Bell, X, CornerDownRight, ShoppingCart, RotateCcw } from "lucide-react";
// // import { useSelector, useDispatch } from "react-redux";
// // import { RootState } from "@/store";
// // import { addNotification, markAllAsRead, markAsRead } from "@/store/notificationSlice";
// // import { pusherClient } from "@/app/lib/pusherClient";
// // import { useNotification } from "@/app/_context/NotificationContext";
// // import Link from "next/link";

// // export default function AdminNotificationBell() {
// //   const [isOpen, setIsOpen] = useState(false);
// //   const dropdownRef = useRef<HTMLDivElement>(null);
// //   const dispatch = useDispatch();
// //   const { notifySuccess, notifyError } = useNotification();
  
// //   const notifications = useSelector((state: RootState) => state.adminNotifications.notifications);
// //   const unreadCount = notifications.filter(n => !n.isRead).length;

// //   // Close dropdown when clicking outside
// //   useEffect(() => {
// //     const handleClickOutside = (event: MouseEvent) => {
// //       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
// //         setIsOpen(false);
// //       }
// //     };
// //     document.addEventListener("mousedown", handleClickOutside);
// //     return () => document.removeEventListener("mousedown", handleClickOutside);
// //   }, []);

// //   useEffect(() => {
// //     const channel = pusherClient.subscribe("admin-orders");

// //     channel.bind("new-refund-request", (data: any) => {
// //       dispatch(addNotification({
// //         orderId: data.orderId,
// //         type: "refund",
// //         customerName: data.customerName,
// //         amount: data.amount
// //       }));
// //       notifySuccess(`Refund Request: Order #${data.orderId.slice(-6).toUpperCase()}`);
// //     });

// //     channel.bind("order-cancelled", (data: any) => {
// //       dispatch(addNotification({
// //         orderId: data.orderId,
// //         type: "cancel",
// //         customerName: data.customerName,
// //         amount: data.amount
// //       }));
// //       notifyError(`Order Cancelled: Order #${data.orderId.slice(-6).toUpperCase()}`);
// //     });

// //     return () => {
// //       pusherClient.unsubscribe("admin-orders");
// //     };
// //   }, [dispatch, notifySuccess, notifyError]);

// //   return (
// //     <div className="relative" ref={dropdownRef}>
// //       {/* BELL ICON */}
// //       <button 
// //         onClick={() => {
// //           setIsOpen(!isOpen);
// //           if (!isOpen) dispatch(markAllAsRead());
// //         }}
// //         className="relative p-2 cursor-pointer hover:bg-neutral-100 rounded-full transition-all active:scale-90"
// //       >
// //         <Bell size={24} className="text-accent-navy" />
// //         {unreadCount > 0 && (
// //           <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full border-2 border-white animate-bounce shadow-sm">
// //             {unreadCount > 9 ? "9+" : unreadCount}
// //           </span>
// //         )}
// //       </button>

// //       {/* DROPDOWN MENU */}
// //       {isOpen && (
// //         <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-[24px] shadow-2xl border border-neutral-100 z-[999] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
// //           <div className="p-5 border-b border-neutral-50 flex justify-between items-center bg-neutral-50/50">
// //             <h3 className="font-black text-accent-navy uppercase text-xs tracking-widest">Notifications</h3>
// //             <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-accent-navy">
// //               <X size={18} />
// //             </button>
// //           </div>

// //           <div className="max-h-[400px] overflow-y-auto">
// //             {notifications.length === 0 ? (
// //               <div className="p-10 text-center">
// //                 <p className="text-sm text-neutral-400 font-medium italic">No recent activity</p>
// //               </div>
// //             ) : (
// //               notifications.map((n) => (
// //                 <Link
// //                   key={n.id}
// //                   href={`/dashboard/admins/orders/${n.orderId}`}
// //                   onClick={() => {
// //                     dispatch(markAsRead(n.id));
// //                     setIsOpen(false);
// //                   }}
// //                   className={`flex items-start gap-4 p-4 border-b border-neutral-50 hover:bg-neutral-50 transition-colors ${!n.isRead ? 'bg-brand-primary/5' : ''}`}
// //                 >
// //                   <div className={`mt-1 p-2 rounded-lg ${n.type === 'refund' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
// //                     {n.type === 'refund' ? <RotateCcw size={16} /> : <ShoppingCart size={16} className="rotate-12" />}
// //                   </div>
                  
// //                   <div className="flex-1">
// //                     <p className="text-sm font-black text-accent-navy leading-tight">
// //                       {n.type === 'refund' ? 'Refund Requested' : 'Order Cancelled'}
// //                     </p>
// //                     <p className="text-[11px] text-neutral-500 font-bold uppercase mt-1">
// //                       Order #{n.orderId.slice(-6).toUpperCase()} • {n.customerName}
// //                     </p>
// //                     <p className="text-[10px] text-neutral-400 mt-2 font-medium">
// //                       {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
// //                     </p>
// //                   </div>
// //                 </Link>
// //               ))
// //             )}
// //           </div>

// //           {notifications.length > 0 && (
// //             <Link 
// //               href="/dashboard/admins/notifications" 
// //               className="block p-4 text-center text-[10px] font-black uppercase tracking-widest text-brand-primary hover:bg-brand-primary/5 transition-colors"
// //               onClick={() => setIsOpen(false)}
// //             >
// //               View All Activity
// //             </Link>
// //           )}
// //         </div>
// //       )}
// //     </div>
// //   );
// // }



// "use client";

// import { useEffect, useState, useRef } from "react";
// import { Bell, X, ShoppingCart, RotateCcw } from "lucide-react";
// import { useSelector, useDispatch } from "react-redux";
// import { RootState } from "@/store";
// import { addNotification, markAllAsRead, markAsRead } from "@/store/notificationSlice";
// import { pusherClient } from "@/app/lib/pusherClient";
// import { useNotification } from "@/app/_context/NotificationContext";
// import Link from "next/link";

// export default function AdminNotificationBell() {
//   const [isOpen, setIsOpen] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   const dispatch = useDispatch();
//   const { notifySuccess, notifyError } = useNotification();
  
//   // Note: Using adminNotifications based on your previous Redux setup
//   const notifications = useSelector((state: RootState) => state.adminNotifications.notifications);
//   const unreadCount = notifications.filter(n => !n.isRead).length;

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   useEffect(() => {
//     const channel = pusherClient.subscribe("admin-orders");

//     // REFUND LISTENER
//     channel.bind("order-cancelled", (data: any) => {
//   dispatch(addNotification({
//     orderId: data.orderId,
//     type: "cancel",
//     customerName: data.customerName,
//     amount: Number(data.total || data.amount || 0),
//   })); // No 'id' or 'createdAt' passed here! The slice handles it.

//   notifyError(`Order Cancelled: #${data.orderId.slice(-6).toUpperCase()}`);
// });
//     // CANCELLATION LISTENER
//     channel.bind("order-cancelled", (data: any) => {
//       dispatch(addNotification({
//         id: data.id || Date.now().toString(),
//         orderId: data.orderId,
//         type: "cancel",
//         customerName: data.customerName,
//         amount: data.total || data.amount,
//         isRead: false,
//         createdAt: new Date().toISOString()
//       } as any));

//       notifyError(`Order Cancelled: Order #${data.orderId.slice(-6).toUpperCase()}`);
//     });

//     return () => {
//       pusherClient.unsubscribe("admin-orders");
//     };
//   }, [dispatch, notifySuccess, notifyError]);
//   return (
//     <div className="relative" ref={dropdownRef}>
//       {/* BELL ICON */}
//       <button 
//         onClick={() => {
//           setIsOpen(!isOpen);
//           if (!isOpen) dispatch(markAllAsRead());
//         }}
//         className="relative p-2 cursor-pointer hover:bg-neutral-100 rounded-full transition-all active:scale-90"
//       >
//         <Bell size={24} className="text-accent-navy" />
//         {unreadCount > 0 && (
//           <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full border-2 border-white animate-bounce shadow-sm">
//             {unreadCount > 9 ? "9+" : unreadCount}
//           </span>
//         )}
//       </button>

//       {/* DROPDOWN MENU */}
//       {isOpen && (
//         <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-[24px] shadow-2xl border border-neutral-100 z-[999] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
//           <div className="p-5 border-b border-neutral-50 flex justify-between items-center bg-neutral-50/50">
//             <h3 className="font-black text-accent-navy uppercase text-xs tracking-widest">Notifications</h3>
//             <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-accent-navy">
//               <X size={18} />
//             </button>
//           </div>

//           <div className="max-h-[400px] overflow-y-auto">
//             {notifications.length === 0 ? (
//               <div className="p-10 text-center">
//                 <p className="text-sm text-neutral-400 font-medium italic">No recent activity</p>
//               </div>
//             ) : (
//               [...notifications].reverse().map((n) => (
//                 <Link
//                   key={n.id}
//                   href={`/dashboard/admins/orders/${n.orderId}`}
//                   onClick={() => {
//                     dispatch(markAsRead(n.id));
//                     setIsOpen(false);
//                   }}
//                   className={`flex items-start gap-4 p-4 border-b border-neutral-50 hover:bg-neutral-50 transition-colors ${!n.isRead ? 'bg-red-50/30' : ''}`}
//                 >
//                   <div className={`mt-1 p-2 rounded-lg ${n.type === 'refund' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
//                     {n.type === 'refund' ? <RotateCcw size={16} /> : <ShoppingCart size={16} className="rotate-12" />}
//                   </div>
                  
//                   <div className="flex-1">
//                     <p className="text-sm font-black text-accent-navy leading-tight">
//                       {n.type === 'refund' ? 'Refund Requested' : 'Order Cancelled'}
//                     </p>
//                     <p className="text-[11px] text-neutral-500 font-bold uppercase mt-1">
//                       Order #{n.orderId.slice(-6).toUpperCase()} • {n.customerName}
//                     </p>
//                     <div className="flex justify-between items-center mt-2">
//                        <p className="text-[10px] text-neutral-400 font-medium">
//                         {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                       </p>
//                       {n.amount && (
//                         <p className="text-[10px] font-black text-accent-navy">
//                           ₦{Number(n.amount).toLocaleString()}
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 </Link>
//               ))
//             )}
//           </div>

//           {notifications.length > 0 && (
//             <Link 
//               href="/dashboard/admins/notifications" 
//               className="block p-4 text-center text-[10px] font-black uppercase tracking-widest text-brand-primary hover:bg-brand-primary/5 transition-colors"
//               onClick={() => setIsOpen(false)}
//             >
//               View All Activity
//             </Link>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }





"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, X, ShoppingCart, RotateCcw, Trash2 } from "lucide-react"; // Added Trash2 icon
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { 
  addNotification, 
  markAllAsRead, 
  markAsRead, 
  clearNotifications // Added this
} from "@/store/notificationSlice";
import { pusherClient } from "@/app/lib/pusherClient";
import { useNotification } from "@/app/_context/NotificationContext";
import Link from "next/link";

export default function AdminNotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const { notifySuccess, notifyError } = useNotification();
  
  const notifications = useSelector((state: RootState) => state.adminNotifications.notifications);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const channel = pusherClient.subscribe("admin-orders");

    channel.bind("new-refund-request", (data: any) => {
      dispatch(addNotification({
        orderId: data.orderId,
        type: "refund",
        customerName: data.customerName,
        amount: Number(data.amount || 0),
      }));
      notifySuccess(`Refund Request: Order #${data.orderId.slice(-6).toUpperCase()}`);
    });

    channel.bind("order-cancelled", (data: any) => {
      dispatch(addNotification({
        orderId: data.orderId,
        type: "cancel",
        customerName: data.customerName,
        amount: Number(data.total || 0),
      }));
      notifyError(`Order Cancelled: Order #${data.orderId.slice(-6).toUpperCase()}`);
    });

    return () => {
      pusherClient.unsubscribe("admin-orders");
    };
  }, [dispatch, notifySuccess, notifyError]);

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
          {/* HEADER WITH CLEAR ALL */}
          <div className="p-5 border-b border-neutral-50 flex justify-between items-center bg-neutral-50/50">
            <h3 className="font-black text-accent-navy uppercase text-xs tracking-widest">Notifications</h3>
            <div className="flex items-center gap-3">
              {notifications.length > 0 && (
                <button 
                  onClick={() => dispatch(clearNotifications())}
                  className="text-[10px] font-black uppercase text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                >
                  <Trash2 size={12} />
                  Clear
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-accent-navy">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* LIST */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-sm text-neutral-400 font-medium italic">No recent activity</p>
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={`/dashboard/admins/orders/${n.orderId}`}
                  onClick={() => {
                    dispatch(markAsRead(n.id));
                    setIsOpen(false);
                  }}
                  className={`flex items-start gap-4 p-4 border-b border-neutral-50 hover:bg-neutral-50 transition-colors ${!n.isRead ? 'bg-red-50/20' : ''}`}
                >
                  <div className={`mt-1 p-2 rounded-lg ${n.type === 'refund' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                    {n.type === 'refund' ? <RotateCcw size={16} /> : <ShoppingCart size={16} className="rotate-12" />}
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm font-black text-accent-navy leading-tight">
                      {n.type === 'refund' ? 'Refund Requested' : 'Order Cancelled'}
                    </p>
                    <p className="text-[11px] text-neutral-500 font-bold uppercase mt-1">
                      Order #{n.orderId.slice(-6).toUpperCase()} • {n.customerName}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                       <p className="text-[10px] text-neutral-400 font-medium">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-[10px] font-black text-accent-navy">
                        ₦{Number(n.amount).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <Link 
              href="/dashboard/admins/notifications" 
              className="block p-4 text-center text-[10px] font-black uppercase tracking-widest text-brand-primary hover:bg-brand-primary/5 transition-colors border-t border-neutral-50"
              onClick={() => setIsOpen(false)}
            >
              View All History
            </Link>
          )}
        </div>
      )}
    </div>
  );
}