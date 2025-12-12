// // /app/components/Notification.tsx
// import { useNotification } from "@/app/_context/NotificationContext"; // Use Notification context

// const Notification: React.FC = () => {
//   const { notifications } = useNotification();

//   return (
//     <div className="fixed top-0 right-0 p-6 z-50 space-y-4">
//       {notifications.map((notification) => (
//         <div
//           key={notification.id}
//           className={`p-4 rounded-lg shadow-md text-white w-80 mb-2 ${
//             notification.type === 'success'
//               ? 'bg-green-500'
//               : notification.type === 'error'
//               ? 'bg-red-500'
//               : 'bg-blue-500'
//           }`}
//         >
//           {notification.message}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default Notification;


// /app/components/Notification.tsx
import { useNotification } from "@/app/_context/NotificationContext";

const Notification: React.FC = () => {
  // You only need the functions here
  const { notifySuccess, notifyError, notifyInfo, clearNotification } = useNotification();

  // This component doesn’t render notifications itself in Option 2.
  // Instead, you call these functions from other components when needed.
  return null;
};

export default Notification;
