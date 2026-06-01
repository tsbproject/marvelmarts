// // import nodemailer from "nodemailer";
// import { Resend } from "resend";

// // 1. BRAND CONFIGURATION
// const COLORS = {
//   navy: "#002B5B",
//   orange: "#F7931E",
//   orangeLight: "#FFE8CC",
//   white: "#FFFFFF",
//   ghost: "#F8F8F8",
//   gray: "#4B4B4B",
//   black: "#1E1E1E",
//   red: "#DC2626",
//   green: "#16A34A"
// };

// const LOGO_URL = "https://marvelmarts.com/logo1-white.png";
// const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// // 2. TRANSPORTER SETUP
// // const transporter = nodemailer.createTransport({
// //   service: "gmail",
// //   auth: {
// //     user: process.env.EMAIL_USER,
// //     pass: process.env.EMAIL_PASS,
// //   },
// // });

// // export const transporter = nodemailer.createTransport({
// //   host: process.env.SMTP_HOST,
// //   port: Number(process.env.SMTP_PORT),
// //   secure: process.env.SMTP_SECURE === "true",
  
// //   auth: {
// //     user: process.env.SMTP_USER,
// //     pass: process.env.SMTP_PASS,
// //   },
// // });



// const resendApiKey = process.env.RESEND_API_KEY;
// const defaultFrom =
//   process.env.RESEND_FROM_EMAIL ||
//   "MarvelMarts <noreply@marvelmarts.com>";

// if (!resendApiKey) {
//   throw new Error("Missing RESEND_API_KEY in environment variables");
// }

// export const resend = new Resend(resendApiKey);

// type SendEmailParams = {
//   to: string | string[];
//   subject: string;
//   html: string;
//   text?: string;
//   from?: string;
//   replyTo?: string;
// };

// export async function sendEmail({
//   to,
//   subject,
//   html,
//   text,
//   from,
//   replyTo,
// }: SendEmailParams) {
//   const { data, error } = await resend.emails.send({
//     from: from || defaultFrom,
//     to: Array.isArray(to) ? to : [to],
//     subject,
//     html,
//     text,
//     replyTo,
//   });

//   if (error) {
//     console.error("📧 Email Dispatch Failed:", error);
//     throw new Error(error.message || "Failed to send email");
//   }

//   return data;
// }




// // 3. THE MASTER LAYOUT WRAPPER
// // This function wraps any "body" content in the official MarvelMarts frame.
// const wrapLayout = (
//   content: string,
//   previewText: string =
//     "Notification from MarvelMarts"
// ) => `
// <!DOCTYPE html>
// <html>
// <head>
//   <meta charset="utf-8">

//   <meta
//     name="viewport"
//     content="width=device-width, initial-scale=1.0"
//   >

//   <style>
//     body {
//       margin: 0;
//       padding: 0;
//       background-color: ${COLORS.ghost};
//       font-family:
//         'Segoe UI',
//         Tahoma,
//         Arial,
//         sans-serif;
//     }

//     .main-button:hover {
//       background-color:
//         #001f41 !important;
//     }

//     a {
//       transition: all 0.2s ease;
//     }
//   </style>
// </head>

// <body>

//   <!-- PREVIEW TEXT -->
//   <div
//     style="
//       display: none;
//       max-height: 0px;
//       overflow: hidden;
//       opacity: 0;
//     "
//   >
//     ${previewText}
//   </div>

//   <table
//     border="0"
//     cellpadding="0"
//     cellspacing="0"
//     width="100%"
//     style="
//       background-color:
//         ${COLORS.ghost};
//       padding: 20px 0;
//     "
//   >

//     <tr>

//       <td align="center">

//         <table
//           border="0"
//           cellpadding="0"
//           cellspacing="0"
//           width="100%"
//           style="
//             max-width: 600px;
//             background-color: #ffffff;
//             border-radius: 16px;
//             overflow: hidden;
//             box-shadow:
//               0 4px 12px
//               rgba(0,0,0,0.05);
//           "
//         >

//           <!-- HEADER -->
//           <tr>

//             <td
//               align="center"
//               style="
//                 background-color:
//                   ${COLORS.navy};
//                 padding: 40px 20px;
//               "
//             >

//               <img
//                 src="${LOGO_URL}"
//                 alt="MarvelMarts"
//                 width="200"
//                 style="display: block;"
//               />

//               <p
//                 style="
//                   color: #ffffff;
//                   font-size: 10px;
//                   text-transform: uppercase;
//                   letter-spacing: 2px;
//                   margin-top: 15px;
//                   opacity: 0.8;
//                 "
//               >
//                 Official Notification
//               </p>

//               <!-- SLOGAN -->
//               <p
//                 style="
//                   color: rgba(255,255,255,0.75);
//                   font-size: 12px;
//                   margin-top: 10px;
//                   line-height: 1.7;
//                   max-width: 420px;
//                 "
//               >
//                 Africa's trusted digital marketplace
//                 for seamless buying, selling,
//                 and business growth.
//               </p>

//             </td>

//           </tr>

//           <!-- CONTENT -->
//           <tr>

//             <td
//               style="
//                 padding: 40px 30px;
//                 color: ${COLORS.black};
//                 line-height: 1.6;
//               "
//             >

//               ${content}

//             </td>

//           </tr>

//           <!-- FOOTER -->
//           <tr>

//             <td
//               align="center"
//               style="
//                 background-color: #F9FAFB;
//                 padding: 35px 30px;
//                 border-top:
//                   1px solid #EEEEEE;
//                 color: ${COLORS.gray};
//                 font-size: 13px;
//               "
//             >

//               <!-- COMPANY -->
//               <p
//                 style="
//                   margin: 0;
//                   font-weight: bold;
//                   color: ${COLORS.navy};
//                   font-size: 15px;
//                 "
//               >
//                 MarvelMarts HQ
//               </p>

//               <p
//                 style="
//                   margin: 6px 0 14px;
//                 "
//               >
//                 Lekki, Lagos, Nigeria
//               </p>

//               <!-- CONTACT -->
//               <p style="margin: 5px 0;">

//                 <a
//                   href="mailto:support@marvelmarts.com"
//                   style="
//                     color: ${COLORS.navy};
//                     text-decoration: none;
//                     font-weight: 600;
//                   "
//                 >
//                   support@marvelmarts.com
//                 </a>

//               </p>

//               <!-- QUICK LINKS -->
//               <div
//                 style="
//                   margin-top: 25px;
//                   margin-bottom: 10px;
//                 "
//               >

//                 <a
//                   href="https://marvelmarts.com"
//                   style="
//                     color: ${COLORS.navy};
//                     text-decoration: none;
//                     font-weight: 700;
//                     margin: 0 10px;
//                     display: inline-block;
//                   "
//                 >
//                   Website
//                 </a>

//                 <span style="color:#D1D5DB;">
//                   |
//                 </span>

//                 <a
//                   href="https://marvelmarts.com/support"
//                   style="
//                     color: ${COLORS.navy};
//                     text-decoration: none;
//                     font-weight: 700;
//                     margin: 0 10px;
//                     display: inline-block;
//                   "
//                 >
//                   Help Center
//                 </a>

//                 <span style="color:#D1D5DB;">
//                   |
//                 </span>

//                 <a
//                   href="https://marvelmarts.com/contact-us"
//                   style="
//                     color: ${COLORS.navy};
//                     text-decoration: none;
//                     font-weight: 700;
//                     margin: 0 10px;
//                     display: inline-block;
//                   "
//                 >
//                   Contact Us
//                 </a>

//               </div>

//               <!-- FOOTER SLOGAN -->
//               <p
//                 style="
//                   margin-top: 22px;
//                   font-size: 12px;
//                   line-height: 1.8;
//                   color: ${COLORS.gray};
//                   max-width: 430px;
//                 "
//               >
//                 MarvelMarts is building the future
//                 of digital commerce in Africa —
//                 empowering businesses and customers
//                 through secure, modern,
//                 and seamless online experiences.
//               </p>

//               <!-- COPYRIGHT -->
//               <p
//                 style="
//                   margin-top: 24px;
//                   font-size: 11px;
//                   opacity: 0.6;
//                 "
//               >
//                 &copy; 2026 MarvelMarts.
//                 All rights reserved.
//               </p>

//             </td>

//           </tr>

//         </table>

//       </td>

//     </tr>

//   </table>

// </body>
// </html>
// `;

// // 4. SHARED SEND FUNCTION
// // async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
// //   try {
// //     return await transporter.sendMail({
// //       from: `"MarvelMarts" <${process.env.EMAIL_FROM}>`,
// //       to,
// //       subject,
// //       html,
// //     });
// //   } catch (error) {
// //     console.error("📧 Email Dispatch Failed:", error);
// //     throw error;
// //   }
// // }



// // --- 5. EXPORTED EMAIL FUNCTIONS ---

// // AUTH: Verification

// export async function sendVerificationEmail({
//   email, code, uid, name, type,
// }: {
//   email: string;

//   code: string;

//   uid: string;

//   name: string;

//   type: "CUSTOMER" | "VENDOR";
// }) {

//   const isVendor =
//     type === "VENDOR";

//  const verifyLink =
//   `${BASE_URL}/auth/verify/verify-${
//     isVendor
//       ? "vendor"
//       : "customer"
//   }?uid=${uid}`;
  
  
//   const content = `
//     <div style="
//       font-family: Helvetica, Arial, sans-serif;
//       max-width: 600px;
//       margin: 0 auto;
//     ">

//       <!-- HEADER -->
//       <div style="text-align:center; margin-bottom:30px;">

//         <h1 style="
//           color: ${COLORS.navy};
//           font-size: 34px;
//           font-weight: 900;
//           font-style: italic;
//           text-transform: uppercase;
//           margin-bottom: 5px;
//           letter-spacing: -1px;
//         ">
//           Verify Your Identity
//         </h1>

//         <p style="
//           color: ${COLORS.gray};
//           font-size: 13px;
//           font-weight: 700;
//           text-transform: uppercase;
//           letter-spacing: 2px;
//           margin-top:0;
//         ">
//           Secure Account Verification
//         </p>

//       </div>

//       <!-- INTRO -->
//       <p style="
//         font-size: 15px;
//         color: ${COLORS.black};
//         line-height: 1.7;
//       ">
//         Hello <strong>${name}</strong>,
//       </p>

//       <p style="
//         font-size: 15px;
//         color: ${COLORS.black};
//         line-height: 1.7;
//       ">
//         Welcome to <strong>MarvelMarts</strong>.
//         Enter this verification code inside the app to confirm your email address and unlock all platform features.
//       </p>

//       <!-- CODE BOX -->
//       <div style="
//        background: ${COLORS.navy};
//         padding: 35px 20px;
//         text-align: center;
//         border-radius: 20px;
//         margin: 35px 0;
//         box-shadow: 0 10px 25px rgba(0,0,0,0.08);
//       ">

//         <p style="
//           color: rgba(255,255,255,0.7);
//           font-size: 11px;
//           font-weight: 700;
//           letter-spacing: 3px;
//           text-transform: uppercase;
//           margin-bottom: 15px;
//         ">
//           Verification Code
//         </p>

//         <div style="
//           color: white;
//           font-size: 38px;
//           font-weight: 900;
//           letter-spacing: 10px;
//           font-family: monospace;
//         ">
//           ${code}
//         </div>

//       </div>

//       <!-- CTA -->
//       <div style="
//         text-align:center;
//         margin: 35px 0;
//       ">

//         <a
//           href="${verifyLink}"
//           style="
//             background-color: ${COLORS.orange};
//             color: white;
//             padding: 16px 32px;
//             border-radius: 14px;
//             text-decoration: none;
//             font-size: 13px;
//             font-weight: 900;
//             text-transform: uppercase;
//             letter-spacing: 1px;
//             display: inline-block;
//             box-shadow: 0 10px 20px rgba(247,147,30,0.25);
//           "
//         >
//           Verify My Account
//         </a>

//       </div>

//       <!-- SECURITY NOTICE -->
//       <div style="
//         background-color: ${COLORS.orangeLight};
//         border-left: 5px solid ${COLORS.orange};
//         padding: 18px 20px;
//         border-radius: 12px;
//         margin: 30px 0;
//       ">

//         <p style="
//           margin:0;
//           color:${COLORS.black};
//           font-size:14px;
//           line-height:1.7;
//         ">
//           <strong>Important:</strong>
//           This verification code will expire in
//           <strong>15 minutes</strong>
//           for security reasons.
//         </p>

//       </div>

//       <!-- SPAM HELP -->
//       <div style="
//         margin-top: 40px;
//         padding: 25px;
//         background-color: #F9FAFB;
//         border-radius: 18px;
//         border: 1px solid #EEEEEE;
//       ">

//         <h3 style="
//           margin-top:0;
//           color:${COLORS.navy};
//           font-size:16px;
//           font-weight:900;
//           text-transform:uppercase;
//         ">
//           Did this email land in spam?
//         </h3>

//         <p style="
//           font-size:14px;
//           color:${COLORS.gray};
//           line-height:1.7;
//         ">
//           To ensure you continue receiving important updates from MarvelMarts:
//         </p>

//         <ol style="
//           padding-left: 18px;
//           color:${COLORS.black};
//           font-size:14px;
//           line-height:1.9;
//         ">
//           <li>
//             Click
//             <strong>
//               "Not Spam"
//             </strong>
//             or
//             <strong>
//               "Move to Inbox"
//             </strong>
//           </li>

//           <li>
//             Add
//             <strong>
//               noreply@marvelmarts.com
//             </strong>
//             to your contacts
//           </li>
//         </ol>

//         <p style="
//           font-size:13px;
//           color:${COLORS.gray};
//           margin-top:15px;
//           line-height:1.7;
//         ">
//           This helps ensure you receive order updates,
//           support replies, shipping notifications,
//           and important account alerts directly in your inbox.
//         </p>

//       </div>

//       <!-- FOOTER NOTICE -->
//       <p style="
//         margin-top:40px;
//         font-size:12px;
//         color:#9CA3AF;
//         line-height:1.8;
//         text-align:center;
//       ">
//         If you did not create an account with MarvelMarts,
//         you can safely ignore this email.
//         No further action is required.
//       </p>

//     </div>
//   `;

//   return sendEmail({
//     to: email,

//     subject:
//       "Verify Your MarvelMarts Account",

//     html: wrapLayout(
//       content,
//       "Your MarvelMarts verification code"
//     ),
//   });
// }



// // AUTH: Password Reset
// export async function sendPasswordResetEmail(to: string, token: string) {
//   const resetUrl = `${BASE_URL}/auth/reset-password?token=${token}`;
//   const content = `
//     <h2>Password Reset Request</h2>
//     <p>We received a request to reset your password. Click the button below to proceed:</p>
//     <div style="text-align: center; margin: 30px 0;">
//         <a href="${resetUrl}" style="background: ${COLORS.navy}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
//     </div>
//     <p>If you did not request this, please ignore this email.</p>
//   `;
//   return sendEmail({ to, subject: "Password Reset Request", html: wrapLayout(content, "Reset your password") });
// }



// // COMMERCE: Order Confirmation
// export async function sendOrderConfirmationEmail(order: any) {
//   const content = `
//     <div style="font-family: 'Helvetica', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//       <h1 style="color: ${COLORS.navy}; text-align: center; font-style: italic; font-weight: 900; letter-spacing: -1px; margin-bottom: 5px;">
//         ORDER SECURED
//       </h1>
//       <p style="text-align: center; color: ${COLORS.navy}; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-top: 0;">
//         Confirmation #${order.orderNumber}
//       </p>
      
//       <p style="color: #444; font-size: 14px; line-height: 1.6; margin: 30px 0;">
//         Hi <strong>${order.firstName}</strong>, your order is being prepared for dispatch! Our fulfillment team has received your payment and is currently pulling your items from the vault.
//       </p>

//       <div style="margin: 20px 0; padding: 25px; background-color: #f9fafb; border: 1px solid #f1f5f9; border-radius: 20px;">
//         <p style="font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">
//           Items Secured
//         </p>
        
//         <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
//           ${order.items.map((item: any) => `
//             <tr>
//               <td style="padding: 10px 0; font-size: 13px; color: ${COLORS.navy}; font-weight: 700;">
//                 ${item.title.toUpperCase()} <span style="color: #94a3b8; font-size: 11px;">x${item.qty}</span>
//               </td>
//               <td style="padding: 10px 0; font-size: 13px; color: ${COLORS.navy}; font-weight: 900; text-align: right;">
//                 ₦${(Number(item.unitPrice) * item.qty).toLocaleString()}
//               </td>
//             </tr>
//           `).join('')}
//         </table>

//         <div style="border-top: 2px solid #eeeeee; margin: 20px 0;"></div>

//         <table width="100%" cellpadding="0" cellspacing="0">
//           <tr>
//             <td style="font-size: 16px; font-weight: 900; color: ${COLORS.navy}; text-transform: uppercase; font-style: italic;">
//               Total Paid
//             </td>
//             <td style="font-size: 20px; font-weight: 900; color: ${COLORS.navy}; text-align: right;">
//               ₦${Number(order.total).toLocaleString()}
//             </td>
//           </tr>
//         </table>
//       </div>

//       <div style="text-align: center; margin-top: 30px;">
//         <a href="https://marvelmarts.com/orders/track-order" 
//            style="background-color: ${COLORS.navy}; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">
//           Track My Order
//         </a>
//       </div>
//     </div>
//   `;

//   return sendEmail({ 
//     to: order.email, 
//     subject: `Order Secured: ${order.orderNumber}`, 
//     html: wrapLayout(content, "Thank you for your order!") 
//   });
// }

// // COMMERCE: Shipment Notification
// export async function sendShipmentNotificationEmail(order: any) {
//   const content = `
//     <div style="font-family: 'Helvetica', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//       <h2 style="color: ${COLORS.navy}; font-style: italic; font-weight: 900; text-transform: uppercase; text-align: center;">
//        YOur Package is Shipped and On The Way! 🚚
//       </h2>
//       <p style="text-align: center; color: #4b5563; font-size: 14px;">
//         Hello ${order.firstName}, your gear has been handed over to our courier and is officially on the move.
//       </p>

//       <div style="background-color: ${COLORS.ghost || '#f8fafc'}; padding: 30px; border-radius: 20px; border-left: 6px solid ${COLORS.orange || '#f97316'}; margin: 30px 0; text-align: center;">
//         <p style="margin: 0; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 2px;">
//           Tracking Number
//         </p>
//         <p style="margin: 10px 0; font-size: 28px; font-weight: 900; color: ${COLORS.navy}; letter-spacing: -1px;">
//           ${order.trackingNumber || 'PENDING DISPATCH'}
//         </p>
//         <p style="margin: 0; font-size: 11px; font-weight: 700; color: ${COLORS.orange || '#f97316'}; text-transform: uppercase;">
//           Status: In Transit
//         </p>
//       </div>

//       <div style="text-align: center; margin-bottom: 30px;">
//         <a href="https://marvelmarts.com/orders/track/${order.orderNumber}" 
//            style="background-color: ${COLORS.navy}; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 12px; text-transform: uppercase; display: inline-block;">
//           Track Real-Time
//         </a>
//       </div>

//       <p style="font-size: 12px; color: #94a3b8; text-align: center; font-style: italic;">
//         Note: Please allow up to 24 hours for the courier's system to activate the tracking link.
//       </p>
//     </div>
//   `;

//   return sendEmail({ 
//     to: order.email, 
//     subject: `Your Order has Shipped! #${order.orderNumber}`, 
//     html: wrapLayout(content, "Your package is on the way") 
//   });
// }


// export async function sendDeliveryConfirmationEmail(order: any) {
//   const content = `
//     <div style="font-family: 'Helvetica', Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
//       <div style="display: inline-block; background-color: #dcfce7; padding: 15px; border-radius: 50%; margin-bottom: 20px;">
//         <span style="font-size: 30px;">✅</span>
//       </div>
      
//       <h2 style="color: ${COLORS.navy}; font-style: italic; font-weight: 900; text-transform: uppercase; margin-bottom: 5px;">
//         Mission Accomplished
//       </h2>
//       <p style="color: #16a34a; font-weight: 800; text-transform: uppercase; font-size: 12px; letter-spacing: 2px; margin-top: 0;">
//         Package Delivered
//       </p>

//       <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 30px 0;">
//         Hi ${order.firstName}, our logistics partner confirms that your MarvelMarts order <strong>#${order.orderNumber}</strong> was successfully delivered.
//       </p>

//       <div style="background-color: #f8fafc; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; text-align: left; margin-bottom: 30px;">
//         <p style="margin: 0; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase;">Delivery Address:</p>
//         <p style="margin: 5px 0 0; color: ${COLORS.navy}; font-weight: 700; font-size: 13px;">
//           ${order.streetAddress}, ${order.city}
//         </p>
//       </div>

//       <p style="font-size: 12px; color: #94a3b8; margin-bottom: 20px;">
//         Not seeing your package? Check your porch, lobby, or with a neighbor before reaching out to support.
//       </p>

//       <a href="https://marvelmarts.com/shop" 
//          style="color: ${COLORS.navy}; font-weight: 900; text-decoration: underline; font-size: 13px; text-transform: uppercase;">
//         Re-up your gear at the Shop
//       </a>
//     </div>
//   `;

//   return sendEmail({ 
//     to: order.email, 
//     subject: `Delivered: Order #${order.orderNumber}`, 
//     html: wrapLayout(content, "Enjoy your new gear!") 
//   });
// }

// // COMMERCE: Refund/Cancel
// export async function sendOrderCancellationEmail(order: any) {
//   const content = `
//     <h2 style="color: ${COLORS.red};">Mission Aborted: Order Cancelled</h2>
//     <p>Hello ${order.firstName}, your order <b>#${order.orderNumber}</b> has been cancelled and a refund is being processed.</p>
//     <div style="background: ${COLORS.ghost}; padding: 15px; border-radius: 12px; margin-top: 20px;">
//       <p style="margin: 0; font-weight: bold; color: ${COLORS.navy};">Refund Information</p>
//       <p style="font-size: 13px;">Funds usually reflect in 3-7 business days.</p>
//     </div>
//   `;
//   return sendEmail({ to: order.email, subject: `Order Cancelled: #${order.orderNumber}`, html: wrapLayout(content, "Cancellation Confirmation") });
// }


// //REFUND STATUS EMAIL
// export async function sendRefundStatusEmail(order: any, status: 'approved' | 'rejected', reason?: string) {
//   const isApproved = status === 'approved';
  
//   const content = `
//     <div style="font-family: 'Helvetica', Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
      
//       {/* Dynamic Status Icon */}
//       <div style="margin-bottom: 25px;">
//         <div style="display: inline-block; padding: 20px; border-radius: 50%; background-color: ${isApproved ? '#ecfdf5' : '#fef2f2'}; border: 2px solid ${isApproved ? '#10b981' : '#ef4444'};">
//           <span style="font-size: 32px;">${isApproved ? '💰' : '🛡️'}</span>
//         </div>
//       </div>

//       <h1 style="color: ${COLORS.navy}; font-style: italic; font-weight: 900; text-transform: uppercase; margin: 0; font-size: 28px; letter-spacing: -1px;">
//         REFUND <span style="color: ${isApproved ? '#10b981' : '#ef4444'};">${status.toUpperCase()}</span>
//       </h1>
      
//       <p style="color: #94a3b8; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; margin-top: 10px; margin-bottom: 30px;">
//         Protocol: Financial Resolution
//       </p>

//       <div style="background-color: #f8fafc; padding: 30px; border-radius: 24px; border: 1px solid #f1f5f9; text-align: left; margin-bottom: 30px;">
//         <table width="100%" cellpadding="0" cellspacing="0">
//           <tr>
//             <td style="padding-bottom: 15px; border-bottom: 1px solid #e2e8f0;">
//               <p style="margin: 0; font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Reference Order</p>
//               <p style="margin: 5px 0 0; font-size: 16px; font-weight: 900; color: ${COLORS.navy};">#${order.orderNumber}</p>
//             </td>
//           </tr>
//         </table>

//         <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-top: 20px;">
//           Hi ${order.firstName}, the review of your refund request for MarvelMarts Order <strong>#${order.orderNumber}</strong> is complete. 
//           ${isApproved 
//             ? `Your request has been <strong>approved</strong>. The funds are being reversed to your original payment method.` 
//             : `Your request was <strong>not approved</strong> at this time based on our standard return protocols.`
//           }
//         </p>

//         {/* Reason Section (Only shows if rejected) */}
//         ${!isApproved && reason ? `
//           <div style="margin-top: 25px; padding: 20px; background-color: #ffffff; border-left: 4px solid #ef4444; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
//             <p style="margin: 0 0 5px; font-size: 10px; font-weight: 900; color: #ef4444; text-transform: uppercase;">Reviewer Notes:</p>
//             <p style="margin: 0; font-size: 13px; color: ${COLORS.navy}; font-weight: 600; line-height: 1.5;">${reason}</p>
//           </div>
//         ` : ''}

//         {/* Policy Link (Only shows if rejected) */}
//         ${!isApproved ? `
//           <div style="margin-top: 20px; text-align: center;">
//             <p style="font-size: 12px; color: #64748b; margin-bottom: 10px;">Questions about this decision?</p>
//             <a href="${BASE_URL}/return-policy" style="color: #ef4444; font-weight: 800; text-transform: uppercase; font-size: 11px; text-decoration: underline; letter-spacing: 1px;">
//               View Our Return Protocols
//             </a>
//           </div>
//         ` : ''}

//         {/* Approval Timeline (Only shows if approved) */}
//         ${isApproved ? `
//           <div style="margin-top: 25px; padding: 15px; background-color: #f0fdf4; border-radius: 12px; text-align: center;">
//             <p style="margin: 0; font-size: 12px; font-weight: 700; color: #16a34a;">
//               ⏱️ Expected arrival: 3–7 business days (Bank dependent).
//             </p>
//           </div>
//         ` : ''}
//       </div>

//       <div style="text-align: center;">
//         <a href="${BASE_URL}/account/customer/orders" 
//            style="color: ${COLORS.navy}; font-weight: 900; text-decoration: none; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; border: 1px solid ${COLORS.navy}; padding: 12px 25px; border-radius: 10px; display: inline-block;">
//           View Order History
//         </a>
//       </div>
//     </div>
//   `;

//   return sendEmail({ 
//     to: order.email, 
//     subject: `Update on Refund: #${order.orderNumber} [${status.toUpperCase()}]`, 
//     html: wrapLayout(content, "Financial Resolution Update") 
//   });
// }

// // SUPPORT: Admin/Customer Tickets
// export async function sendAdminTicketNotification({ id, subject, email, message, articleTitle }: any) {
//   const ticketUrl = `${BASE_URL}/dashboard/admins/support/tickets/${id}`;
//   const content = `
//     <h2 style="color: ${COLORS.navy};">New Support Ticket</h2>
//     <p><strong>From:</strong> ${email}</p>
//     <div style="background: ${COLORS.ghost}; padding: 20px; border-radius: 12px; border-left: 4px solid ${COLORS.navy}; margin: 20px 0;">
//       <p style="margin: 0; white-space: pre-wrap;">${message}</p>
//     </div>
//     ${articleTitle ? `<p style="font-size: 12px; color: ${COLORS.red};">Context: From article "${articleTitle}"</p>` : ""}
//     <div style="text-align: center;"><a href="${ticketUrl}" style="background: ${COLORS.navy}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View Ticket</a></div>
//   `;
//   return sendEmail({ to: process.env.ADMIN_EMAIL!, subject: `[New Ticket] ${subject}`, html: wrapLayout(content, "New ticket received") });
// }

// export async function sendCustomerTicketConfirmation(to: string, subject: string) {
//   const content = `
//     <h2 style="color: ${COLORS.navy};">Request Received</h2>
//     <p>Thanks for reaching out! We've received your message regarding <b>"${subject}"</b> and our team will get back to you within 24 hours.</p>
//   `;
//   return sendEmail({ to, subject: `Request Received: ${subject}`, html: wrapLayout(content, "We've got your message") });
// }

// // ANNOUNCEMENT: Store Live
// export async function sendStoreLiveEmail(to: string, name: string) {
//   const content = `
//     <div style="font-family: 'Helvetica', Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center; padding: 20px;">
      
//       {/* Hero Section */}
//       <div style="background-color: ${COLORS.navy}; border-radius: 32px; padding: 50px 30px; margin-bottom: 30px; border-bottom: 8px solid ${COLORS.orange};">
//         <h1 style="font-size: 42px; font-style: italic; font-weight: 900; text-transform: uppercase; color: #ffffff; margin: 0; letter-spacing: -2px; line-height: 0.9;">
//           THE MART IS <span style="color: ${COLORS.orange};">OPEN.</span>
//         </h1>
//         <p style="color: #94a3b8; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 4px; margin-top: 15px;">
//           Protocol: Live Access Granted
//         </p>
//       </div>

//       {/* Main Copy */}
//       <h2 style="color: ${COLORS.navy}; font-size: 24px; font-weight: 900; italic; text-transform: uppercase; margin-bottom: 10px;">
//         Shopping Redefined.
//       </h2>
//       <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 35px;">
//         Hi ${name}, the wait is over. The doors to **MarvelMarts** are now officially wide open. Step inside to experience a curated collection of gear designed for those who demand more.
//       </p>

//       {/* Bulletproof Button */}
//       <div style="margin: 40px 0;">
//         <a href="${BASE_URL}/shop" 
//            style="background-color: ${COLORS.orange}; color: #ffffff; padding: 20px 45px; border-radius: 16px; text-decoration: none; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; display: inline-block; box-shadow: 0 10px 20px -5px rgba(249, 115, 22, 0.4);">
//           Enter the Marketplace
//         </a>
//       </div>

//       {/* Footer Teaser */}
//       <div style="border-top: 1px solid #e2e8f0; padding-top: 30px; margin-top: 40px;">
//         <p style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">
//           Limited Stock • Premium Logistics • Secure Payments
//         </p>
//       </div>

//     </div>
//   `;

//   return sendEmail({ 
//     to, 
//     subject: "🚨 ACCESS GRANTED: MarvelMarts is officially LIVE", 
//     html: wrapLayout(content, "Step into the future of retail") 
//   });
// }
// // ADMIN: New Sale
// export async function sendAdminOrderNotification(order: any) {
//   const content = `
//     <div style="font-family: 'Helvetica', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; background-color: #ffffff;">
//       {/* Header Banner */}
//       <div style="background-color: ${COLORS.navy}; padding: 30px; text-align: center;">
//         <h2 style="color: #ffffff; font-style: italic; font-weight: 900; text-transform: uppercase; margin: 0; letter-spacing: -1px; font-size: 24px;">
//           💰 NEW SALE SECURED
//         </h2>
//         <p style="color: ${COLORS.navy || '#3b82f6'}; font-weight: 800; font-size: 12px; text-transform: uppercase; margin-top: 5px; letter-spacing: 2px;">
//           Revenue Intelligence: ${order.orderNumber}
//         </p>
//       </div>

//       <div style="padding: 30px;">
//         {/* Core Stats Grid */}
//         <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
//           <tr>
//             <td style="width: 50%; padding: 15px; background-color: #f8fafc; border-radius: 16px 0 0 16px; border-right: 1px solid #e2e8f0;">
//               <p style="margin: 0; font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Total Revenue</p>
//               <p style="margin: 5px 0 0; font-size: 20px; font-weight: 900; color: ${COLORS.navy};">₦${Number(order.total).toLocaleString()}</p>
//             </td>
//             <td style="width: 50%; padding: 15px; background-color: #f8fafc; border-radius: 0 16px 16px 0;">
//               <p style="margin: 0; font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Payment Method</p>
//               <p style="margin: 5px 0 0; font-size: 14px; font-weight: 900; color: ${COLORS.navy}; text-transform: uppercase;">${order.paymentMethod || 'PAYSTACK'}</p>
//             </td>
//           </tr>
//         </table>

//         {/* Customer Details */}
//         <div style="margin-bottom: 30px;">
//           <p style="font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Customer Profile</p>
//           <div style="padding: 15px; border: 1px solid #f1f5f9; border-radius: 12px;">
//             <p style="margin: 0; font-size: 14px; font-weight: 800; color: ${COLORS.navy};">${order.firstName} ${order.lastName}</p>
//             <p style="margin: 3px 0 0; font-size: 12px; color: #64748b;">${order.email}</p>
//             <p style="margin: 8px 0 0; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">📍 ${order.city}, ${order.state}</p>
//           </div>
//         </div>

//         {/* Item Summary (Quick View) */}
//         <div style="margin-bottom: 30px;">
//           <p style="font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Inventory Outflow</p>
//           <table width="100%" style="border-collapse: collapse;">
//             ${order.items.map((item: any) => `
//               <tr style="border-bottom: 1px solid #f1f5f9;">
//                 <td style="padding: 10px 0; font-size: 12px; font-weight: 700; color: ${COLORS.navy};">
//                   ${item.title} <span style="color: #94a3b8;">x${item.qty}</span>
//                 </td>
//                 <td style="padding: 10px 0; font-size: 12px; font-weight: 800; color: ${COLORS.navy}; text-align: right;">
//                   ₦${(item.unitPrice * item.qty).toLocaleString()}
//                 </td>
//               </tr>
//             `).join('')}
//           </table>
//         </div>

//         {/* Admin Action Button */}
//         <div style="text-align: center; margin-top: 10px;">
//           <a href="https://marvelmarts.com/dashboard/admins/orders/${order.id}" 
//              style="display: inline-block; background-color: ${COLORS.navy}; color: #ffffff; padding: 18px 35px; text-decoration: none; border-radius: 16px; font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; width: 80%;">
//             Process Order & Fulfill
//           </a>
//         </div>
//       </div>
//     </div>
//   `;

//    const adminEmails =
//     process.env.ADMIN_EMAILS?.split(",").map((email) => email.trim()) || [];

//   if (adminEmails.length === 0) {
//     console.warn("No ADMIN_EMAILS configured");
//     return;
//   }

//   return sendEmail({ 
//     to: process.env.ADMIN_EMAIL!, 
//     subject: `🔥 [SALE] ₦${Number(order.total).toLocaleString()} - ${order.orderNumber}`, 
//     html: wrapLayout(content, "New Revenue Alert") 
//   });
// }



// export const sendPayoutStatusEmail = async (
//   to: string, 
//   vendorName: string, 
//   amount: number, 
//   status: "APPROVED" | "REJECTED", 
//   remarks?: string
// ) => {
//   const isApproved = status === "APPROVED";
//   const formattedAmount = new Intl.NumberFormat('en-NG', {
//     style: 'currency',
//     currency: 'NGN',
//   }).format(amount);

//   // 1. Prepare the specific content for the payout
//   const content = `
//     <div style="margin-bottom: 25px;">
//       <h2 style="margin: 0; color: ${COLORS.navy}; font-size: 20px; text-transform: uppercase; font-weight: 900;">
//         Payout Request ${status}
//       </h2>
//     </div>

//     <p style="margin-bottom: 20px;">Hello <strong>${vendorName}</strong>,</p>
    
//     <p style="margin-bottom: 20px;">
//       Your withdrawal request for <span style="color: ${COLORS.navy}; font-weight: bold;">${formattedAmount}</span> has been processed.
//     </p>

//     <div style="background-color: ${isApproved ? '#F0FDF4' : '#FEF2F2'}; padding: 20px; border-radius: 12px; border: 1px solid ${isApproved ? '#DCFCE7' : '#FEE2E2'}; margin-bottom: 25px;">
//       ${isApproved 
//         ? `<p style="margin: 0; color: #166534; font-size: 14px;">
//              <strong>STATUS: DISBURSED</strong><br/>
//              The funds have been sent to your bank account and should arrive within 24-48 hours.
//            </p>` 
//         : `<p style="margin: 0; color: #991B1B; font-size: 14px;">
//              <strong>STATUS: REJECTED</strong><br/>
//              <strong>REASON:</strong> ${remarks || "Please contact support for details."}
//            </p>`
//       }
//     </div>

//     <div style="text-align: center; margin-top: 35px;">
//       <a href="https://marvelmarts.com/account/vendor/payouts" 
//          class="main-button"
//          style="background-color: ${COLORS.navy}; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
//         VIEW WITHDRAWAL LOGS
//       </a>
//     </div>
//   `;

//   // 2. Wrap it using your existing central layout
//   const previewText = `Your payout for ${formattedAmount} was ${status.toLowerCase()}.`;
//   const html = wrapLayout(content, previewText);

//   // 3. Send via your existing transport logic
//   return await sendEmail({
//       to,

//       subject: `PAYOUT ${status}: ${formattedAmount}`,

//       html,

//       from:
//         "MarvelMarts Treasury <noreply@marvelmarts.com>",
//     });
// };



// //VENDOR SUSPENSION EMAIL 

// // 5. VENDOR ENFORCEMENT & RESTORATION EMAIL
// export async function sendVendorActionEmail({ 
//   email, 
//   name, 
//   action, 
//   reason 
// }: { 
//   email: string; 
//   name: string; 
//   action: string; 
//   reason: string; 
// }) {
//   const isRestore = action === "RESTORE";
//   const isSuspension = action === "SUSPEND";
  
//   // Dynamic styling based on the action
//   const statusColor = isRestore ? "#10b981" : isSuspension ? "#ef4444" : COLORS.navy;
//   const heading = isRestore ? "Welcome Back to the Marketplace!" : "Account Status Update";
  
//   const content = `
//     <h1 style="color: ${COLORS.navy}; font-size: 24px; font-weight: 900; margin-bottom: 20px; text-transform: uppercase;">
//       ${heading}
//     </h1>
//     <p style="font-size: 16px;">Hello <strong>${name}</strong>,</p>
//     <p>
//       ${isRestore 
//         ? "We are pleased to inform you that your vendor account has been fully reinstated. You can now resume sales and manage your storefront."
//         : "This is a formal notification regarding administrative changes made to your vendor account on MarvelMarts."
//       }
//     </p>
    
//     <div style="background-color: #F9FAFB; border-left: 4px solid ${statusColor}; padding: 25px; margin: 30px 0; border-radius: 8px;">
//       <p style="margin: 0; font-size: 11px; font-weight: bold; color: ${COLORS.gray}; text-transform: uppercase; letter-spacing: 1px;">Update Type</p>
//       <p style="margin: 5px 0 15px 0; font-size: 18px; font-weight: 900; color: ${statusColor}; text-transform: uppercase;">
//         Account ${isRestore ? "Reinstated" : action + "ed"}
//       </p>
      
//       <p style="margin: 0; font-size: 11px; font-weight: bold; color: ${COLORS.gray}; text-transform: uppercase; letter-spacing: 1px;">Note from Admin</p>
//       <p style="margin-top: 5px; color: ${COLORS.black}; font-style: italic;">"${reason}"</p>
//     </div>

//     <p style="margin-bottom: 30px;">
//       ${isRestore 
//         ? "We recommend reviewing our merchant guidelines to ensure your store remains in good standing. Happy selling!"
//         : "If you wish to appeal this decision, please contact our compliance team via the Support Command Center."
//       }
//     </p>
    
//     <a href="https://marvelmarts.com/account/vendor" class="main-button" style="display: inline-block; background-color: ${COLORS.navy}; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
//       ${isRestore ? "Access My Store" : "Open My Dashboard"}
//     </a>
//   `;

//   const previewText = isRestore 
//     ? "Great news! Your MarvelMarts vendor account has been restored." 
//     : `Important: Your MarvelMarts account has been ${action.toLowerCase()}ed.`;

//   return await sendEmail({
//     to: email,
//     subject: `MarvelMarts | Account ${isRestore ? "Restored" : action + "ed"}`,
//     html: wrapLayout(content, previewText),
//   });
// }



// // 6. ADMIN SYSTEM ALERT
// export async function sendAdminAlert({ 
//   type, 
//   subject, 
//   details 
// }: { 
//   type: 'DISPUTE' | 'VENDOR_SIGNUP' | 'REPORT'; 
//   subject: string; 
//   details: string; 
// }) {
//   const adminEmail = process.env.ADMIN_EMAIL || "admin@marvelmarts.com";
  
//   const content = `
//     <h1 style="color: ${COLORS.navy}; font-size: 20px; font-weight: 900; margin-bottom: 15px; text-transform: uppercase;">
//       System Alert: ${type}
//     </h1>
//     <p style="font-size: 16px; color: ${COLORS.black};">Hello Admin,</p>
//     <p>A new high-priority event requires your attention on the <strong>MarvelMarts Control Center</strong>.</p>
    
//     <div style="background-color: #F1F5F9; border-left: 4px solid #F59E0B; padding: 20px; margin: 25px 0; border-radius: 8px;">
//       <p style="margin: 0; font-size: 11px; font-weight: bold; color: ${COLORS.gray}; text-transform: uppercase;">Event Details</p>
//       <p style="margin: 5px 0 10px 0; font-size: 16px; font-weight: bold; color: ${COLORS.navy};">${subject}</p>
//       <p style="margin: 0; color: ${COLORS.black}; font-size: 14px; line-height: 1.5;">${details}</p>
//     </div>

//     <a href="https://marvelmarts.com/dashboard/admins" class="main-button" style="display: inline-block; background-color: ${COLORS.navy}; color: #ffffff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 13px; text-transform: uppercase;">
//       Review in Admin Panel
//     </a>
//   `;

//   return await sendEmail({
//     to: adminEmail,
//     subject: ` [ADMIN ALERT] ${type}: ${subject}`,
//     html: wrapLayout(content, `New ${type.toLowerCase()} requires review.`)
//   });
// }


// // NEW CHAT MESSAGE EMAIL NOTIFICATION

// export async function sendNewMessageEmail(
//   recipientEmail: string,
//   senderName: string,
//   messageContent: string,
//   conversationId: string
// ) {
//   const previewText = `${senderName} sent you a new message on MarvelMarts.`;
  
//   const content = `
//     <div style="font-family: sans-serif; color: #002B5B;">
//       <h2 style="text-transform: uppercase; font-style: italic;">New Message Received</h2>
//       <p>Hi there,</p>
//       <p><strong>${senderName}</strong> has just sent you a message regarding your inquiry:</p>
      
//       <div style="background-color: #FBFBFB; padding: 20px; border-radius: 15px; border: 1px solid #eeeeee; margin: 20px 0; font-style: italic;">
//         "${messageContent.length > 100 ? messageContent.substring(0, 100) + '...' : messageContent}"
//       </div>

//       <div style="margin-top: 30px;">
//         <a href="https://marvelmarts.com/account/messages/${conversationId}" 
//            style="background-color: #F7931E; color: white; padding: 12px 25px; text-decoration: none; border-radius: 10px; font-weight: bold; text-transform: uppercase; font-size: 12px;">
//            View Transmission
//         </a>
//       </div>
      
//       <p style="margin-top: 30px; font-size: 10px; color: #999999; text-transform: uppercase;">
//         Note: Please do not reply directly to this email. Use the MarvelMarts dashboard to respond.
//       </p>
//     </div>
//   `;

//   const html = wrapLayout(content, previewText);

//   return await sendEmail({
//     to: recipientEmail,
//     subject: `New Message from ${senderName} | MarvelMarts`,
//     html,
//   });
// }



// // VENDOR: Status Update (Merged Approve/Reject)
// export async function sendVendorStatusEmail({ email, firstName, storeName, status, reason }: { email: string; firstName: string; storeName: string; status: "APPROVED" | "REJECTED"; reason?: string | null; }) {
//   const isApproved = status === "APPROVED";
//   const content = isApproved ? `
//     <h2 style="color: ${COLORS.navy};">Congratulations, ${firstName}!</h2>
//     <p>Your store <strong>${storeName}</strong> has been officially approved.</p>
//     <p>You can now log in to your dashboard to start selling gear!</p>
//     <div style="text-align: center; margin: 30px 0;">
//         <a href="${BASE_URL}/account/vendor" style="background: ${COLORS.navy}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
//     </div>
//   ` : `
//     <h2 style="color: ${COLORS.red}; text-transform: uppercase;">Application Update</h2>
//     <p>Hello ${firstName}, your application for <strong>${storeName}</strong> requires some changes.</p>
//     <div style="background-color: #fff5f5; border-left: 4px solid ${COLORS.red}; padding: 15px; margin: 20px 0;">
//       <strong>Feedback:</strong> ${reason || "Please review your business details and resubmit."}
//     </div>
//     <div style="text-align: center; margin: 30px 0;">
//         <a href="${BASE_URL}/account/vendor" style="background: ${COLORS.navy}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Fix & Resubmit</a>
//     </div>
//   `;
//   return sendEmail({ to: email, subject: `MarvelMarts: Store ${status}`, html: wrapLayout(content, `Your store application has been ${status.toLowerCase()}`) });
// }



// // VENDOR: Documents Submitted → Under Review
// export async function sendVendorReviewEmail({
//   email,
//   firstName,
//   storeName
// }: {
//   email: string;
//   firstName: string;
//   storeName: string;
// }) {

//   const content = `
//     <h2 style="color: ${COLORS.navy};">Documents Received, ${firstName}!</h2>

//     <p>Thank you for submitting the required verification documents for your store 
//     <strong>${storeName}</strong>.</p>

//     <p>Our compliance team is currently reviewing your documents to ensure everything
//     meets our marketplace standards.</p>

//     <div style="background-color: #f5f9ff; border-left: 4px solid ${COLORS.navy}; padding: 16px; margin: 22px 0;">
//       <strong>Verification Timeline:</strong><br/>
//       Reviews typically take <strong>24 – 48 hours</strong>.
//       If any additional information is required, our team will contact you.
//     </div>

//     <div style="text-align: center; margin: 30px 0;">
//       <a href="${BASE_URL}/account/vendor/verification"
//         style="
//           background: ${COLORS.navy};
//           color: white;
//           padding: 14px 28px;
//           text-decoration: none;
//           border-radius: 8px;
//           font-weight: bold;
//           display: inline-block;
//         ">
//         Track Verification Status
//       </a>
//     </div>

//     <p style="margin-top: 20px;">
//       We appreciate your patience while we complete the review process.
//       You will receive another email once your store is approved.
//     </p>
//   `;

//   return sendEmail({
//     to: email,
//     subject: "MarvelMarts: Documents Under Review",
//     html: wrapLayout(
//       content,
//       "Your vendor verification documents are currently under review"
//     )
//   });
// }




// //VENDOR'S BOOST CREDIT PURCHASE EMAIL

// export async function sendVendorCreditPurchaseEmail({
//   email,
//   firstName,
//   storeName,
//   amountAdded,
//   newBalance,
// }: {
//   email: string;
//   firstName: string;
//   storeName: string;
//   amountAdded: number;
//   newBalance: number;
// }) {
//   const content = `
//     <h2 style="color: ${COLORS.navy};">Credits Added Successfully, ${firstName}!</h2>
//     <p>Your store <strong>${storeName}</strong> has been credited successfully.</p>
//     <p><strong>Credits added:</strong> ${amountAdded}</p>
//     <p><strong>New balance:</strong> ${newBalance}</p>
//     <p>You can now use your credits to boost your products and improve visibility on MarvelMarts.</p>
//     <div style="text-align: center; margin: 30px 0;">
//       <a href="${BASE_URL}/account/vendor" style="background: ${COLORS.navy}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
//     </div>
//   `;

//   return sendEmail({
//     to: email,
//     subject: "MarvelMarts: Boost Credits Added Successfully",
//     html: wrapLayout(content, "Your boost credit purchase was successful"),
//   });
// }


// //VENDOR'S BOOST LOW CREDIT EMAIL

// export async function sendVendorLowCreditsEmail({
//   email,
//   firstName,
//   storeName,
//   currentBalance,
// }: {
//   email: string;
//   firstName: string;
//   storeName: string;
//   currentBalance: number;
// }) {
//   const content = `
//     <h2 style="color: ${COLORS.orange};">Low Boost Credit Balance</h2>
//     <p>Hello ${firstName},</p>
//     <p>Your store <strong>${storeName}</strong> is running low on boost credits.</p>
//     <div style="background-color: #fffaf0; border-left: 4px solid ${COLORS.orange}; padding: 15px; margin: 20px 0;">
//       <strong>Current balance:</strong> ${currentBalance}
//     </div>
//     <p>Top up your credits to continue boosting your products and keeping them visible to buyers.</p>
//     <div style="text-align: center; margin: 30px 0;">
//       <a href="${BASE_URL}/account/vendor/credits" style="background: ${COLORS.navy}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Buy More Credits</a>
//     </div>
//   `;

//   return sendEmail({
//     to: email,
//     subject: "MarvelMarts: Your Boost Credits Are Running Low",
//     html: wrapLayout(content, "Your boost credits are running low"),
//   });
// }


// //VENDOR'S BOOST CREDIT EXHAUSTION EMAIL

// export async function sendVendorExhaustedCreditsEmail({
//   email,
//   firstName,
//   storeName,
// }: {
//   email: string;
//   firstName: string;
//   storeName: string;
// }) {
//   const content = `
//     <h2 style="color: ${COLORS.red}; text-transform: uppercase;">Boost Credits Exhausted</h2>
//     <p>Hello ${firstName},</p>
//     <p>Your store <strong>${storeName}</strong> has exhausted its boost credits.</p>
//     <div style="background-color: #fff5f5; border-left: 4px solid ${COLORS.red}; padding: 15px; margin: 20px 0;">
//       <strong>Action needed:</strong> Purchase more credits to continue boosting your products.
//     </div>
//     <div style="text-align: center; margin: 30px 0;">
//       <a href="${BASE_URL}/account/vendor/credits" style="background: ${COLORS.navy}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Buy Credits Now</a>
//     </div>
//   `;

//   return sendEmail({
//     to: email,
//     subject: "MarvelMarts: Your Boost Credits Have Been Exhausted",
//     html: wrapLayout(content, "Your boost credits have been exhausted"),
//   });
// }

// //CUSTOMER SUPPORT MESSAGE NOTIFICATION EMAIL

// export async function sendSupportAcknowledgementEmail({
//   to,
//   ticketId,
//   subject,
//   priority,
// }: {
//   to: string;
//   ticketId: string;
//   subject: string;
//   priority: string;
// }) {

//   const content = `
//     <div style="font-family: 'Helvetica', Arial, sans-serif; max-width: 600px; margin: 0 auto;">

//       <h1 style="color: ${COLORS.navy}; text-align: center; font-style: italic; font-weight: 900; letter-spacing: -1px; margin-bottom: 5px;">
//         SUPPORT REQUEST RECEIVED
//       </h1>

//       <p style="text-align: center; color: ${COLORS.navy}; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-top: 0;">
//         Ticket #${ticketId}
//       </p>

//       <p style="color: #444; font-size: 14px; line-height: 1.6; margin: 30px 0;">
//         Your support request has been received successfully.
//         Our vendor support team is currently reviewing your request and will respond shortly.
//       </p>

//       <div style="margin: 20px 0; padding: 25px; background-color: #f9fafb; border: 1px solid #f1f5f9; border-radius: 20px;">

//         <p style="font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">
//           Ticket Information
//         </p>

//         <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">

//           <tr>
//             <td style="padding: 10px 0; font-size: 13px; color: #94a3b8; font-weight: 700;">
//               SUBJECT
//             </td>

//             <td style="padding: 10px 0; font-size: 13px; color: ${COLORS.navy}; font-weight: 900; text-align: right;">
//               ${subject}
//             </td>
//           </tr>

//           <tr>
//             <td style="padding: 10px 0; font-size: 13px; color: #94a3b8; font-weight: 700;">
//               PRIORITY
//             </td>

//             <td style="padding: 10px 0; font-size: 13px; color: ${COLORS.navy}; font-weight: 900; text-align: right;">
//               ${priority}
//             </td>
//           </tr>

//           <tr>
//             <td style="padding: 10px 0; font-size: 13px; color: #94a3b8; font-weight: 700;">
//               STATUS
//             </td>

//             <td style="padding: 10px 0; font-size: 13px; color: #16a34a; font-weight: 900; text-align: right;">
//               OPEN
//             </td>
//           </tr>
//         </table>

//         <div style="border-top: 2px solid #eeeeee; margin: 20px 0;"></div>

//         <table width="100%" cellpadding="0" cellspacing="0">
//           <tr>

//             <td style="font-size: 16px; font-weight: 900; color: ${COLORS.navy}; text-transform: uppercase; font-style: italic;">
//               Estimated Response
//             </td>

//             <td style="font-size: 18px; font-weight: 900; color: ${COLORS.navy}; text-align: right;">
//               &lt; 24 Hours
//             </td>

//           </tr>
//         </table>
//       </div>

//       <div style="text-align: center; margin-top: 30px;">

//         <a href="https://marvelmarts.com/account/support/tickets"
//           style="background-color: ${COLORS.navy}; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">
//           View My Tickets
//         </a>

//       </div>
//     </div>
//   `;

//   return sendEmail({
//     to,
//     subject: `Support Ticket Received • ${ticketId}`,
//     html: wrapLayout(
//       content,
//       "Your support request has been received successfully."
//     ),
//   });
// }

// //ADMIN SUPPORT MESSAGE NOTIFICATION EMAIL

// export async function sendAdminSupportNotification({
//   ticketId,
//   subject,
//   category,
//   priority,
//   email,
// }: {
//   ticketId: string;
//   subject: string;
//   category: string;
//   priority: string;
//   email: string;
// }) {

//   const content = `
//     <div style="font-family: 'Helvetica', Arial, sans-serif; max-width: 600px; margin: 0 auto;">

//       <h1 style="color: ${COLORS.navy}; text-align: center; font-style: italic; font-weight: 900; letter-spacing: -1px; margin-bottom: 5px;">
//         NEW SUPPORT TICKET
//       </h1>

//       <p style="text-align: center; color: ${COLORS.navy}; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-top: 0;">
//         Admin Notification
//       </p>

//       <p style="color: #444; font-size: 14px; line-height: 1.6; margin: 30px 0;">
//         A new support request has been submitted through the MarvelMarts support system.
//       </p>

//       <div style="margin: 20px 0; padding: 25px; background-color: #f9fafb; border: 1px solid #f1f5f9; border-radius: 20px;">

//         <p style="font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">
//           Ticket Details
//         </p>

//         <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">

//           <tr>
//             <td style="padding: 10px 0; font-size: 13px; color: #94a3b8; font-weight: 700;">
//               TICKET ID
//             </td>

//             <td style="padding: 10px 0; font-size: 13px; color: ${COLORS.navy}; font-weight: 900; text-align: right;">
//               ${ticketId}
//             </td>
//           </tr>

//           <tr>
//             <td style="padding: 10px 0; font-size: 13px; color: #94a3b8; font-weight: 700;">
//               USER EMAIL
//             </td>

//             <td style="padding: 10px 0; font-size: 13px; color: ${COLORS.navy}; font-weight: 900; text-align: right;">
//               ${email}
//             </td>
//           </tr>

//           <tr>
//             <td style="padding: 10px 0; font-size: 13px; color: #94a3b8; font-weight: 700;">
//               SUBJECT
//             </td>

//             <td style="padding: 10px 0; font-size: 13px; color: ${COLORS.navy}; font-weight: 900; text-align: right;">
//               ${subject}
//             </td>
//           </tr>

//           <tr>
//             <td style="padding: 10px 0; font-size: 13px; color: #94a3b8; font-weight: 700;">
//               CATEGORY
//             </td>

//             <td style="padding: 10px 0; font-size: 13px; color: ${COLORS.navy}; font-weight: 900; text-align: right;">
//               ${category}
//             </td>
//           </tr>

//           <tr>
//             <td style="padding: 10px 0; font-size: 13px; color: #94a3b8; font-weight: 700;">
//               PRIORITY
//             </td>

//             <td style="padding: 10px 0; font-size: 13px; color: ${COLORS.navy}; font-weight: 900; text-align: right;">
//               ${priority}
//             </td>
//           </tr>

//         </table>
//       </div>

//       <div style="text-align: center; margin-top: 30px;">

//         <a href="https://marvelmarts.com/admin/tickets"
//           style="background-color: ${COLORS.navy}; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">
//           Review Ticket
//         </a>

//       </div>
//     </div>
//   `;

//   return sendEmail({
//     to: process.env.ADMIN_SUPPORT_EMAIL!,
//     subject: `New Support Ticket • ${priority}`,
//     html: wrapLayout(
//       content,
//       "A new support ticket has been submitted."
//     ),
//   });
// }

// // SUPPORT PROGRESS EMAIL

// export async function sendSupportProgressEmail({
//   to,
//   ticketId,
//   subject,
//   status,
//   message,
// }: {
//   to: string;

//   ticketId: string;

//   subject: string;

//   status: string;

//   message: string;
// }) {

//   const content = `
//     <div style="font-family: 'Helvetica', Arial, sans-serif; max-width: 600px; margin: 0 auto;">

//       <h1 style="
//         color: ${COLORS.navy};
//         text-align: center;
//         font-style: italic;
//         font-weight: 900;
//         letter-spacing: -1px;
//         margin-bottom: 5px;
//       ">
//         CASE UPDATE
//       </h1>

//       <p style="
//         text-align: center;
//         color: ${COLORS.navy};
//         font-weight: 800;
//         font-size: 12px;
//         text-transform: uppercase;
//         letter-spacing: 2px;
//         margin-top: 0;
//       ">
//         Ticket #${ticketId}
//       </p>

//       <p style="
//         color: #444;
//         font-size: 14px;
//         line-height: 1.7;
//         margin: 30px 0;
//       ">
//         Our support team has provided a progress update regarding your request.
//       </p>

//       <div style="
//         margin: 20px 0;
//         padding: 25px;
//         background-color: #f9fafb;
//         border: 1px solid #f1f5f9;
//         border-radius: 20px;
//       ">

//         <p style="
//           font-size: 10px;
//           font-weight: 900;
//           color: #94a3b8;
//           text-transform: uppercase;
//           letter-spacing: 1px;
//           margin-bottom: 15px;
//         ">
//           Ticket Summary
//         </p>

//         <table width="100%" cellpadding="0" cellspacing="0">

//           <tr>
//             <td style="
//               padding: 10px 0;
//               font-size: 13px;
//               color: #94a3b8;
//               font-weight: 700;
//             ">
//               SUBJECT
//             </td>

//             <td style="
//               padding: 10px 0;
//               font-size: 13px;
//               color: ${COLORS.navy};
//               font-weight: 900;
//               text-align: right;
//             ">
//               ${subject}
//             </td>
//           </tr>

//           <tr>
//             <td style="
//               padding: 10px 0;
//               font-size: 13px;
//               color: #94a3b8;
//               font-weight: 700;
//             ">
//               CURRENT STATUS
//             </td>

//             <td style="
//               padding: 10px 0;
//               font-size: 13px;
//               color: #2563eb;
//               font-weight: 900;
//               text-align: right;
//             ">
//               ${status.replace("_", " ")}
//             </td>
//           </tr>

//         </table>

//         <div style="
//           border-top: 2px solid #eeeeee;
//           margin: 20px 0;
//         "></div>

//         <div>

//           <p style="
//             font-size: 10px;
//             font-weight: 900;
//             color: #94a3b8;
//             text-transform: uppercase;
//             letter-spacing: 1px;
//             margin-bottom: 12px;
//           ">
//             Support Team Message
//           </p>

//           <div style="
//             background: white;
//             padding: 20px;
//             border-radius: 16px;
//             border: 1px solid #e5e7eb;
//             color: #374151;
//             font-size: 14px;
//             line-height: 1.8;
//             font-weight: 500;
//           ">
//             ${message}
//           </div>
//         </div>
//       </div>

//       <div style="
//         text-align: center;
//         margin-top: 30px;
//       ">

//         <a href="https://marvelmarts.com/vendor/account/support/tickets"
//           style="
//             background-color: ${COLORS.navy};
//             color: #ffffff;
//             padding: 15px 30px;
//             text-decoration: none;
//             border-radius: 12px;
//             font-weight: 900;
//             font-size: 12px;
//             text-transform: uppercase;
//             letter-spacing: 1px;
//             display: inline-block;
//           ">
//           View Ticket
//         </a>
//       </div>
//     </div>
//   `;

//   return sendEmail({
//     to,

//     subject: `Support Case Update • ${ticketId}`,

//     html: wrapLayout(
//       content,
//       "Your support ticket has received a new update."
//     ),
//   });
// }



// //SUPPORT CASE RESOLVE EMAIL

// export async function sendSupportResolvedEmail({
//   to,
//   ticketId,
//   subject,
//   message,
// }: {
//   to: string;

//   ticketId: string;

//   subject: string;

//   message: string;
// }) {

//   const content = `
//     <div style="font-family: 'Helvetica', Arial, sans-serif; max-width: 600px; margin: 0 auto;">

//       <h1 style="
//         color: ${COLORS.navy};
//         text-align: center;
//         font-style: italic;
//         font-weight: 900;
//         letter-spacing: -1px;
//         margin-bottom: 5px;
//       ">
//         CASE RESOLVED
//       </h1>

//       <p style="
//         text-align: center;
//         color: ${COLORS.navy};
//         font-weight: 800;
//         font-size: 12px;
//         text-transform: uppercase;
//         letter-spacing: 2px;
//         margin-top: 0;
//       ">
//         Ticket #${ticketId}
//       </p>

//       <p style="
//         color: #444;
//         font-size: 14px;
//         line-height: 1.7;
//         margin: 30px 0;
//       ">
//         Your support request has been marked as resolved by our support team.
//       </p>

//       <div style="
//         margin: 20px 0;
//         padding: 25px;
//         background-color: #f9fafb;
//         border: 1px solid #f1f5f9;
//         border-radius: 20px;
//       ">

//         <p style="
//           font-size: 10px;
//           font-weight: 900;
//           color: #94a3b8;
//           text-transform: uppercase;
//           letter-spacing: 1px;
//           margin-bottom: 15px;
//         ">
//           Resolution Summary
//         </p>

//         <table width="100%" cellpadding="0" cellspacing="0">

//           <tr>
//             <td style="
//               padding: 10px 0;
//               font-size: 13px;
//               color: #94a3b8;
//               font-weight: 700;
//             ">
//               SUBJECT
//             </td>

//             <td style="
//               padding: 10px 0;
//               font-size: 13px;
//               color: ${COLORS.navy};
//               font-weight: 900;
//               text-align: right;
//             ">
//               ${subject}
//             </td>
//           </tr>

//           <tr>
//             <td style="
//               padding: 10px 0;
//               font-size: 13px;
//               color: #94a3b8;
//               font-weight: 700;
//             ">
//               FINAL STATUS
//             </td>

//             <td style="
//               padding: 10px 0;
//               font-size: 13px;
//               color: #16a34a;
//               font-weight: 900;
//               text-align: right;
//             ">
//               RESOLVED
//             </td>
//           </tr>

//         </table>

//         <div style="
//           border-top: 2px solid #eeeeee;
//           margin: 20px 0;
//         "></div>

//         <div>

//           <p style="
//             font-size: 10px;
//             font-weight: 900;
//             color: #94a3b8;
//             text-transform: uppercase;
//             letter-spacing: 1px;
//             margin-bottom: 12px;
//           ">
//             Final Support Response
//           </p>

//           <div style="
//             background: white;
//             padding: 20px;
//             border-radius: 16px;
//             border: 1px solid #e5e7eb;
//             color: #374151;
//             font-size: 14px;
//             line-height: 1.8;
//             font-weight: 500;
//           ">
//             ${message}
//           </div>
//         </div>
//       </div>

//       <div style="
//         text-align: center;
//         margin-top: 30px;
//       ">

//         <a href="https://marvelmarts.com/contact-us"
//           style="
//             background-color: ${COLORS.navy};
//             color: #ffffff;
//             padding: 15px 30px;
//             text-decoration: none;
//             border-radius: 12px;
//             font-weight: 900;
//             font-size: 12px;
//             text-transform: uppercase;
//             letter-spacing: 1px;
//             display: inline-block;
//           ">
//           Contact Support
//         </a>
//       </div>
//     </div>
//   `;

//   return sendEmail({
//     to,

//     subject: `Support Case Resolved • ${ticketId}`,

//     html: wrapLayout(
//       content,
//       "Your support request has been resolved."
//     ),
//   });
// }




export {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "./mail/services/auth.service";

export {
  sendOrderConfirmationEmail,
  sendShipmentNotificationEmail,
  sendDeliveryConfirmationEmail,
} from "./mail/services/order.service";

export {
  sendVendorApprovedEmail,
  sendVendorReviewEmail,
} from "./mail/services/vendor.service";

export {
  sendSupportReceivedEmail,
  sendSupportProgressEmail,
} from "./mail/services/support.service";

export {
  sendAdminAlertEmail,
} from "./mail/services/admin.service";