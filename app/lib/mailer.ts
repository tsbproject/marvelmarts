// import nodemailer from "nodemailer";
// import { Resend } from 'resend';

// const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// // MarvelMarts Official Brand Colors
// const COLORS = {
//   navy: "#002B5B",
//   orange: "#F7931E",
//   orangeLight: "#FFE8CC",
//   white: "#FFFFFF",
//   ghost: "#F8F8F8",
//   gray: "#4B4B4B",
//   black: "#1E1E1E",
// };

// const LOGO_URL = "http://localhost:3000/logo.png";


// // 1. Define the transporter creator properly
// const createTransporter = () => {
//   return nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS, 
//     },
//   });
// };

// /**
//  * Low-level send function used by the wrappers
//  */
// async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
//   try {
//     const transporter = createTransporter();
//     const info = await transporter.sendMail({
//       from: `"MarvelMarts" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       html,
//     });
//     return info;
//   } catch (error) {
//     // CRITICAL: We need to THROW this so the API knows it failed
//     console.error("Nodemailer Error Details:", error);
//     throw error; 
//   }
// }


// // async function sendEmail({ 
// //   to, 
// //   subject, 
// //   html, 
// //   from = `"MarvelMarts" <${process.env.EMAIL_USER}>` 
// // }: { 
// //   to: string; 
// //   subject: string; 
// //   html: string; 
// //   from?: string;
// // }) {
// //   try {
// //     // FIX: createTransporter is now defined above
// //     const transporter = createTransporter();
    
// //     const info = await transporter.sendMail({
// //       from,
// //       to,
// //       subject,
// //       html,
// //     });

// //     console.log("✅ Email sent successfully:", info.messageId);
// //     return info;
// //   } catch (error) {
// //     console.error("📧 Email dispatch failed (nodemailer):", error);
// //     throw error; // Rethrow so the calling function knows it failed
// //   }
// // }



// // --- 1. SUPPORT SYSTEM EMAILS ---

// export async function sendAdminTicketNotification({
//   id,
//   subject,
//   email,
//   message,
//   articleTitle,
// }: {
//   id: string;
//   subject: string;
//   email: string;
//   message: string;
//   articleTitle?: string;
// }) {
//   const ticketUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/admins/support/tickets/${id}`;
//   const html = `
//     <div style="font-family: sans-serif; max-width: 600px; border: 1px solid ${COLORS.ghost}; padding: 20px; border-radius: 16px;">
//       <h2 style="color: ${COLORS.navy}; margin-top: 0;">New Support Ticket</h2>
//       <p><strong>Customer:</strong> ${email}</p>
//       <p><strong>Subject:</strong> ${subject}</p>
//       <div style="background: ${COLORS.ghost}; padding: 15px; border-radius: 12px; border-left: 4px solid ${COLORS.navy}; margin: 20px 0;">
//         <p style="margin: 0; color: ${COLORS.black}; white-space: pre-wrap;">${message}</p>
//       </div>
//       ${articleTitle ? `<p style="font-size: 12px; color: #dc2626;">🚩 Context: Triggered from article <b>"${articleTitle}"</b></p>` : ""}
//       <a href="${ticketUrl}" style="display: block; text-align: center; background: ${COLORS.navy}; color: white; padding: 14px; border-radius: 10px; text-decoration: none; font-weight: bold;">
//         View Ticket in Dashboard
//       </a>
//     </div>
//   `;

//   return sendEmail({ to: process.env.ADMIN_EMAIL!, subject: `[New Ticket] ${subject}`, html });
// }

// export async function sendCustomerTicketConfirmation(to: string, subject: string) {
//   const html = `
//     <div style="font-family: sans-serif; max-width: 600px; padding: 20px; color: ${COLORS.black};">
//       <h2 style="color: ${COLORS.navy};">Request Received</h2>
//       <p>Hi there,</p>
//       <p>Thanks for reaching out! We've received your message regarding <b>"${subject}"</b>.</p>
//       <p>Our team will get back to you as soon as possible (usually within 24 hours).</p>
//       <br />
//       <p>Best regards,<br />MarvelMarts Support Team</p>
//     </div>
//   `;
//   return sendEmail({ to, subject: `We've received your request: ${subject}`, html });
// }

// // --- 2. AUTH EMAILS ---

// /**
//  * The main function your routes call
//  */
// export async function sendVerificationEmailWithNodemailer(
//   email: string,
//   code: string,
//   uid: string,
//   name: string,
//   type: "CUSTOMER" | "VENDOR"
// ) {
//   const isVendor = type === "VENDOR";
//   // Match your folder structure: /auth/verify/verify-customer
//   const verifyLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify/verify-${isVendor ? 'vendor' : 'customer'}?uid=${uid}`;

//   const subject = isVendor ? "Verify Your Vendor Account" : "Verify Your Customer Account";

//   const html = `
//     <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
//       <h2>Hello ${name},</h2>
//       <p>Thank you for joining MarvelMarts! Please use the code below to verify your account:</p>
//       <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
//         ${code}
//       </div>
//       <p>Or click the link below:</p>
//       <a href="${verifyLink}" style="display: inline-block; padding: 10px 20px; background: #002B5B; color: #fff; text-decoration: none; border-radius: 5px;">
//         Verify Account
//       </a>
//       <p>This code expires in 15 minutes.</p>
//     </div>
//   `;

//   return await sendEmail({ to: email, subject, html });
// }

// // --- 3. COMMERCE EMAILS ---

// export async function sendOrderConfirmationEmail(order: any) {
//   const html = `
//     <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid ${COLORS.ghost}; border-radius: 24px; overflow: hidden;">
//       <div style="background-color: ${COLORS.navy}; padding: 40px; text-align: center; color: white;">
//         <img src="${LOGO_URL}" width="140" style="margin-bottom: 20px;" />
//         <h1 style="font-style: italic; text-transform: uppercase; margin: 0; letter-spacing: -1px;">Order Secured</h1>
//         <p style="color: ${COLORS.orange}; font-weight: bold; margin-top: 10px;">Order #${order.orderNumber}</p>
//       </div>
//       <div style="padding: 30px; color: ${COLORS.black};">
//         <p>Hi ${order.firstName},</p>
//         <p>Your gear is being prepped for dispatch!</p>
//         <div style="margin: 20px 0; padding: 20px; background: ${COLORS.ghost}; border-radius: 12px;">
//           ${order.items.map((item: any) => `
//             <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
//               <span>${item.title} x ${item.qty}</span>
//               <span style="font-weight: bold;">₦${(item.unitPrice * item.qty).toLocaleString()}</span>
//             </div>
//           `).join('')}
//           <hr style="border: 0; border-top: 1px solid #ddd; margin: 15px 0;" />
//           <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 18px; color: ${COLORS.navy};">
//             <span>Total Paid</span>
//             <span>₦${Number(order.total).toLocaleString()}</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   `;
//   return sendEmail({ to: order.email, subject: `MarvelMarts Order Secured: ${order.orderNumber}`, html });
// }

// // --- NEW: ORDER CANCELLATION EMAIL ---
// export async function sendOrderCancellationEmail(order: any) {
//   const html = `
//     <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 24px; overflow: hidden;">
//       <div style="background-color: ${COLORS.navy}; padding: 30px; text-align: center;">
//         <img src="${LOGO_URL}" width="120" />
//       </div>
//       <div style="background-color: #dc2626; color: white; padding: 10px; text-align: center; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 2px;">
//         Mission Aborted: Order Cancelled
//       </div>
//       <div style="padding: 40px; color: ${COLORS.black};">
//         <h2>Order #${order.orderNumber} Cancelled</h2>
//         <p>Hello ${order.firstName},</p>
//         <p>This email confirms that your order has been successfully cancelled. If a payment was made, your refund is being processed.</p>
//         <div style="background: ${COLORS.ghost}; padding: 20px; border-radius: 12px; border-left: 4px solid ${COLORS.orange}; margin-top: 20px;">
//           <p style="margin: 0; font-weight: bold; color: ${COLORS.navy};">Refund Information</p>
//           <p style="margin: 5px 0 0; font-size: 13px; color: ${COLORS.gray};">Funds usually reflect in 3-7 business days depending on your bank.</p>
//         </div>
//       </div>
//     </div>
//   `;
//   return sendEmail({ to: order.email, subject: `Order Cancelled: #${order.orderNumber}`, html });
// }

// // --- NEW: REFUND STATUS EMAILS ---
// export async function sendRefundStatusEmail(order: any, status: 'approved' | 'rejected', reason?: string) {
//   const isApproved = status === 'approved';
//   const html = `
//     <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 24px; overflow: hidden;">
//       <div style="background-color: ${COLORS.navy}; padding: 30px; text-align: center;">
//         <img src="${LOGO_URL}" width="120" />
//       </div>
//       <div style="padding: 40px; text-align: center;">
//         <h2 style="color: ${isApproved ? '#16a34a' : '#dc2626'}; text-transform: uppercase;">Refund ${status}</h2>
//         <p>Your refund request for Order <b>#${order.orderNumber}</b> has been ${status}.</p>
//         ${!isApproved && reason ? `<div style="background: ${COLORS.ghost}; padding: 15px; margin-top: 20px; border-radius: 8px; color: ${COLORS.gray};">Reason: ${reason}</div>` : ''}
//         <p style="margin-top: 30px; font-size: 13px; color: ${COLORS.gray};">Thank you for choosing MarvelMarts.</p>
//       </div>
//     </div>
//   `;
//   return sendEmail({ to: order.email, subject: `Update on your Refund: #${order.orderNumber}`, html });
// }

// export async function sendAdminOrderNotification(order: any) {
//   const adminEmail = process.env.ADMIN_EMAIL;
//   if (!adminEmail) return;

//   const html = `
//     <div style="font-family: sans-serif; padding: 20px; border: 2px solid ${COLORS.navy}; border-radius: 12px;">
//       <h2 style="color: ${COLORS.navy};">💰 New Sale!</h2>
//       <p><strong>Order:</strong> ${order.orderNumber}</p>
//       <p><strong>Customer:</strong> ${order.firstName} ${order.lastName} (${order.email})</p>
//       <p><strong>Amount:</strong> ₦${Number(order.total).toLocaleString()}</p>
//     </div>
//   `;
//   return sendEmail({ to: adminEmail, subject: `🔥 New Sale: ${order.orderNumber}`, html });
// }

// // --- 4. ANNOUNCEMENT EMAILS ---

// export async function sendStoreLiveEmail(to: string, name: string) {
//   const shopUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/shop`;
//   const html = `
//     <div style="font-family: sans-serif; max-width: 600px; margin: auto; background-color: ${COLORS.navy}; color: white; border-radius: 24px; overflow: hidden; border: 4px solid ${COLORS.orange};">
//       <div style="padding: 40px; text-align: center;">
//         <h1 style="font-size: 38px; font-style: italic; text-transform: uppercase; line-height: 1; margin: 0;">
//           The Mart is <span style="color: ${COLORS.orange};">Open.</span>
//         </h1>
//         <p style="font-size: 14px; color: ${COLORS.orangeLight}; margin-top: 20px; text-transform: uppercase; letter-spacing: 2px;">
//           Experience Shopping Redefined
//         </p>
//         <div style="margin: 40px 0; background: rgba(247, 147, 30, 0.1); padding: 30px; border-radius: 16px; border: 1px dashed ${COLORS.orange};">
//           <p style="font-size: 18px; margin: 0;">Hi ${name},</p>
//           <p style="line-height: 1.6; color: #d1d5db;">
//             The wait is over. The doors to <strong>MarvelMarts</strong> are now officially wide open.
//           </p>
//         </div>
//         <a href="${shopUrl}" style="display: inline-block; background-color: ${COLORS.orange}; color: white; padding: 20px 40px; border-radius: 50px; text-decoration: none; font-weight: 900; text-transform: uppercase;">
//           Enter the Shop
//         </a>
//       </div>
//     </div>
//   `;
//   return sendEmail({ to, subject: "MarvelMarts is LIVE: Step Into Style", html });
// }




import nodemailer from "nodemailer";
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// MarvelMarts Official Brand Colors
const COLORS = {
  navy: "#002B5B",
  orange: "#F7931E",
  orangeLight: "#FFE8CC",
  white: "#FFFFFF",
  ghost: "#F8F8F8",
  gray: "#4B4B4B",
  black: "#1E1E1E",
};

const LOGO_URL = "https://marvelmarts.vercel.app/logo.png"; // Updated to your project URL

// 1. Define the transporter creator properly
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, 
    },
  });
};

/**
 * Low-level send function used by the wrappers
 */
async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"MarvelMarts" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return info;
  } catch (error) {
    console.error("Nodemailer Error Details:", error);
    throw error; 
  }
}

// --- 1. SUPPORT SYSTEM EMAILS ---

export async function sendAdminTicketNotification({
  id,
  subject,
  email,
  message,
  articleTitle,
}: {
  id: string;
  subject: string;
  email: string;
  message: string;
  articleTitle?: string;
}) {
  const ticketUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/admins/support/tickets/${id}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; border: 1px solid ${COLORS.ghost}; padding: 20px; border-radius: 16px;">
      <h2 style="color: ${COLORS.navy}; margin-top: 0;">New Support Ticket</h2>
      <p><strong>Customer:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <div style="background: ${COLORS.ghost}; padding: 15px; border-radius: 12px; border-left: 4px solid ${COLORS.navy}; margin: 20px 0;">
        <p style="margin: 0; color: ${COLORS.black}; white-space: pre-wrap;">${message}</p>
      </div>
      ${articleTitle ? `<p style="font-size: 12px; color: #dc2626;">🚩 Context: Triggered from article <b>"${articleTitle}"</b></p>` : ""}
      <a href="${ticketUrl}" style="display: block; text-align: center; background: ${COLORS.navy}; color: white; padding: 14px; border-radius: 10px; text-decoration: none; font-weight: bold;">
        View Ticket in Dashboard
      </a>
    </div>
  `;

  return sendEmail({ to: process.env.ADMIN_EMAIL!, subject: `[New Ticket] ${subject}`, html });
}

export async function sendCustomerTicketConfirmation(to: string, subject: string) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; padding: 20px; color: ${COLORS.black};">
      <h2 style="color: ${COLORS.navy};">Request Received</h2>
      <p>Hi there,</p>
      <p>Thanks for reaching out! We've received your message regarding <b>"${subject}"</b>.</p>
      <p>Our team will get back to you as soon as possible (usually within 24 hours).</p>
      <br />
      <p>Best regards,<br />MarvelMarts Support Team</p>
    </div>
  `;
  return sendEmail({ to, subject: `We've received your request: ${subject}`, html });
}

// --- 2. AUTH EMAILS ---

export async function sendVerificationEmailWithNodemailer(
  email: string,
  code: string,
  uid: string,
  name: string,
  type: "CUSTOMER" | "VENDOR"
) {
  const isVendor = type === "VENDOR";
  const verifyLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify/verify-${isVendor ? 'vendor' : 'customer'}?uid=${uid}`;
  const subject = isVendor ? "Verify Your Vendor Account" : "Verify Your Customer Account";

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
      <h2>Hello ${name},</h2>
      <p>Thank you for joining MarvelMarts! Please use the code below to verify your account:</p>
      <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
        ${code}
      </div>
      <p>Or click the link below:</p>
      <a href="${verifyLink}" style="display: inline-block; padding: 10px 20px; background: #002B5B; color: #fff; text-decoration: none; border-radius: 5px;">
        Verify Account
      </a>
      <p>This code expires in 15 minutes.</p>
    </div>
  `;

  return await sendEmail({ to: email, subject, html });
}

// --- 3. COMMERCE EMAILS ---

export async function sendOrderConfirmationEmail(order: any) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid ${COLORS.ghost}; border-radius: 24px; overflow: hidden;">
      <div style="background-color: ${COLORS.navy}; padding: 40px; text-align: center; color: white;">
        <img src="${LOGO_URL}" width="140" style="margin-bottom: 20px;" />
        <h1 style="font-style: italic; text-transform: uppercase; margin: 0; letter-spacing: -1px;">Order Secured</h1>
        <p style="color: ${COLORS.orange}; font-weight: bold; margin-top: 10px;">Order #${order.orderNumber}</p>
      </div>
      <div style="padding: 30px; color: ${COLORS.black};">
        <p>Hi ${order.firstName},</p>
        <p>Your gear is being prepped for dispatch!</p>
        <div style="margin: 20px 0; padding: 20px; background: ${COLORS.ghost}; border-radius: 12px;">
          ${order.items.map((item: any) => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>${item.title} x ${item.qty}</span>
              <span style="font-weight: bold;">₦${(item.unitPrice * item.qty).toLocaleString()}</span>
            </div>
          `).join('')}
          <hr style="border: 0; border-top: 1px solid #ddd; margin: 15px 0;" />
          <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 18px; color: ${COLORS.navy};">
            <span>Total Paid</span>
            <span>₦${Number(order.total).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  `;
  return sendEmail({ to: order.email, subject: `MarvelMarts Order Secured: ${order.orderNumber}`, html });
}

// --- NEW: SHIPMENT NOTIFICATION EMAIL ---
export async function sendShipmentNotificationEmail(order: any) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid ${COLORS.ghost}; border-radius: 24px; overflow: hidden;">
      <div style="background-color: ${COLORS.navy}; padding: 40px; text-align: center; color: white;">
        <img src="${LOGO_URL}" width="140" style="margin-bottom: 20px;" />
        <h1 style="font-style: italic; text-transform: uppercase; margin: 0; letter-spacing: -1px;">Package En Route</h1>
        <p style="color: ${COLORS.orange}; font-weight: bold; margin-top: 10px;">Order #${order.orderNumber}</p>
      </div>
      <div style="padding: 40px; color: ${COLORS.black};">
        <h2>It's on the way!</h2>
        <p>Hello ${order.firstName}, your package has been handed over to our courier.</p>
        
        <div style="background: ${COLORS.ghost}; padding: 25px; border-radius: 16px; border-left: 4px solid ${COLORS.orange}; margin: 25px 0;">
          <p style="margin: 0; font-[10px] font-black uppercase text-gray-400 tracking-widest">Tracking Number</p>
          <p style="margin: 5px 0 0; font-size: 22px; font-weight: 900; color: ${COLORS.navy}; letter-spacing: 1px;">
            ${order.trackingNumber}
          </p>
        </div>
        
        <p style="font-size: 14px; color: ${COLORS.gray}; line-height: 1.6;">
          You can use this number to track your gear on the carrier's portal. Please allow 24 hours for the tracking link to activate.
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid ${COLORS.ghost}; text-align: center;">
          <p style="font-size: 12px; color: ${COLORS.gray};">Thank you for shopping at MarvelMarts.</p>
        </div>
      </div>
    </div>
  `;
  return sendEmail({ to: order.email, subject: `Your MarvelMarts Order has Shipped! #${order.orderNumber}`, html });
}

export async function sendOrderCancellationEmail(order: any) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 24px; overflow: hidden;">
      <div style="background-color: ${COLORS.navy}; padding: 30px; text-align: center;">
        <img src="${LOGO_URL}" width="120" />
      </div>
      <div style="background-color: #dc2626; color: white; padding: 10px; text-align: center; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 2px;">
        Mission Aborted: Order Cancelled
      </div>
      <div style="padding: 40px; color: ${COLORS.black};">
        <h2>Order #${order.orderNumber} Cancelled</h2>
        <p>Hello ${order.firstName},</p>
        <p>This email confirms that your order has been successfully cancelled. If a payment was made, your refund is being processed.</p>
        <div style="background: ${COLORS.ghost}; padding: 20px; border-radius: 12px; border-left: 4px solid ${COLORS.orange}; margin-top: 20px;">
          <p style="margin: 0; font-weight: bold; color: ${COLORS.navy};">Refund Information</p>
          <p style="margin: 5px 0 0; font-size: 13px; color: ${COLORS.gray};">Funds usually reflect in 3-7 business days depending on your bank.</p>
        </div>
      </div>
    </div>
  `;
  return sendEmail({ to: order.email, subject: `Order Cancelled: #${order.orderNumber}`, html });
}

export async function sendRefundStatusEmail(order: any, status: 'approved' | 'rejected', reason?: string) {
  const isApproved = status === 'approved';
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 24px; overflow: hidden;">
      <div style="background-color: ${COLORS.navy}; padding: 30px; text-align: center;">
        <img src="${LOGO_URL}" width="120" />
      </div>
      <div style="padding: 40px; text-align: center;">
        <h2 style="color: ${isApproved ? '#16a34a' : '#dc2626'}; text-transform: uppercase;">Refund ${status}</h2>
        <p>Your refund request for Order <b>#${order.orderNumber}</b> has been ${status}.</p>
        ${!isApproved && reason ? `<div style="background: ${COLORS.ghost}; padding: 15px; margin-top: 20px; border-radius: 8px; color: ${COLORS.gray};">Reason: ${reason}</div>` : ''}
        <p style="margin-top: 30px; font-size: 13px; color: ${COLORS.gray};">Thank you for choosing MarvelMarts.</p>
      </div>
    </div>
  `;
  return sendEmail({ to: order.email, subject: `Update on your Refund: #${order.orderNumber}`, html });
}

export async function sendAdminOrderNotification(order: any) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const html = `
    <div style="font-family: sans-serif; padding: 20px; border: 2px solid ${COLORS.navy}; border-radius: 12px;">
      <h2 style="color: ${COLORS.navy};">💰 New Sale!</h2>
      <p><strong>Order:</strong> ${order.orderNumber}</p>
      <p><strong>Customer:</strong> ${order.firstName} ${order.lastName} (${order.email})</p>
      <p><strong>Amount:</strong> ₦${Number(order.total).toLocaleString()}</p>
    </div>
  `;
  return sendEmail({ to: adminEmail, subject: `🔥 New Sale: ${order.orderNumber}`, html });
}

// --- 4. ANNOUNCEMENT EMAILS ---

export async function sendStoreLiveEmail(to: string, name: string) {
  const shopUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/shop`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; background-color: ${COLORS.navy}; color: white; border-radius: 24px; overflow: hidden; border: 4px solid ${COLORS.orange};">
      <div style="padding: 40px; text-align: center;">
        <h1 style="font-size: 38px; font-style: italic; text-transform: uppercase; line-height: 1; margin: 0;">
          The Mart is <span style="color: ${COLORS.orange};">Open.</span>
        </h1>
        <p style="font-size: 14px; color: ${COLORS.orangeLight}; margin-top: 20px; text-transform: uppercase; letter-spacing: 2px;">
          Experience Shopping Redefined
        </p>
        <div style="margin: 40px 0; background: rgba(247, 147, 30, 0.1); padding: 30px; border-radius: 16px; border: 1px dashed ${COLORS.orange};">
          <p style="font-size: 18px; margin: 0;">Hi ${name},</p>
          <p style="line-height: 1.6; color: #d1d5db;">
            The wait is over. The doors to <strong>MarvelMarts</strong> are now officially wide open.
          </p>
        </div>
        <a href="${shopUrl}" style="display: inline-block; background-color: ${COLORS.orange}; color: white; padding: 20px 40px; border-radius: 50px; text-decoration: none; font-weight: 900; text-transform: uppercase;">
          Enter the Shop
        </a>
      </div>
    </div>
  `;
  return sendEmail({ to, subject: "MarvelMarts is LIVE: Step Into Style", html });
}