// import nodemailer from "nodemailer";

// // Reusable transporter helper
// const createTransporter = () => {
//   return nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: Number(process.env.SMTP_PORT),
//     secure: Number(process.env.SMTP_PORT) === 465,
//     auth: {
//       user: process.env.SMTP_USER,
//       pass: process.env.SMTP_PASS,
//     },
//   });
// };

// // --- SUPPORT SYSTEM EMAILS ---

// /**
//  * Sends a notification to the ADMIN when a new ticket is created
//  */
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
//   const transporter = createTransporter();
//   const ticketUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/admins/support/tickets/${id}`;

//   const mailOptions = {
//     from: process.env.EMAIL_FROM || `"MarvelMarts Support" <${process.env.SMTP_USER}>`,
//     to: process.env.ADMIN_EMAIL, // Ensure this is in your .env
//     subject: `[New Ticket] ${subject}`,
//     html: `
//       <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px; border-radius: 16px;">
//         <h2 style="color: #2563eb; margin-top: 0;">New Support Ticket</h2>
//         <p><strong>Customer:</strong> ${email}</p>
//         <p><strong>Subject:</strong> ${subject}</p>
//         <div style="background: #f9fafb; padding: 15px; border-radius: 12px; border-left: 4px solid #2563eb; margin: 20px 0;">
//           <p style="margin: 0; color: #374151; white-space: pre-wrap;">${message}</p>
//         </div>
//         ${articleTitle ? `<p style="font-size: 12px; color: #dc2626;">🚩 Context: Triggered from article <b>"${articleTitle}"</b></p>` : ""}
//         <a href="${ticketUrl}" style="display: block; text-align: center; background: #2563eb; color: white; padding: 14px; border-radius: 10px; text-decoration: none; font-weight: bold;">
//           View Ticket in Dashboard
//         </a>
//       </div>
//     `,
//   };

//   return transporter.sendMail(mailOptions);
// }

// /**
//  * Sends an auto-reply to the CUSTOMER confirming receipt
//  */
// export async function sendCustomerTicketConfirmation(to: string, subject: string) {
//   const transporter = createTransporter();

//   const mailOptions = {
//     from: process.env.EMAIL_FROM || `"MarvelMarts Support" <${process.env.SMTP_USER}>`,
//     to,
//     subject: `We've received your request: ${subject}`,
//     html: `
//       <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
//         <h2 style="color: #111;">Request Received</h2>
//         <p>Hi there,</p>
//         <p>Thanks for reaching out! This is just a quick note to let you know that we've received your message regarding <b>"${subject}"</b>.</p>
//         <p>Our support team will review your request and get back to you as soon as possible (usually within 24 hours).</p>
//         <br />
//         <p>Best regards,<br />MarvelMarts Support Team</p>
//       </div>
//     `,
//   };

//   return transporter.sendMail(mailOptions);
// }

// // --- YOUR EXISTING AUTH EMAILS ---

// export async function sendVerificationEmailWithNodemailer(to: string, code: string, uid: string, name: string) {
//   const transporter = createTransporter();
//   const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify/verify-customer?uid=${uid}`;

//   const mailOptions = {
//     from: process.env.EMAIL_FROM || `"Support" <${process.env.SMTP_USER}>`,
//     to,
//     subject: "Verify your account",
//     html: `
//       <p>Hi ${name},</p>
//       <p>Your verification code is: <b>${code}</b></p>
//       <p>Or click this link: <a href="${verifyUrl}">${verifyUrl}</a></p>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//   } catch (err) {
//     if (process.env.NODE_ENV === "development") {
//       console.log(`⚠️ SMTP failed. Code: ${code}`);
//     } else throw err;
//   }
// }

// export async function sendPasswordResetEmail(to: string, resetCode: string) {
//   const transporter = createTransporter();
//   const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?code=${resetCode}&email=${encodeURIComponent(to)}`;

//   const mailOptions = {
//     from: process.env.EMAIL_FROM || `"Support" <${process.env.SMTP_USER}>`,
//     to,
//     subject: "Password Reset Request",
//     html: `
//       <h2>Password Reset Request</h2>
//       <h3 style="color:#111">${resetCode}</h3>
//       <p><a href="${resetUrl}" style="color:#1a73e8">Click here to reset password</a></p>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//   } catch (err) {
//     if (process.env.NODE_ENV === "development") {
//       console.log(`⚠️ SMTP failed. Reset Code: ${resetCode}`);
//     } else throw err;
//   }
// }





import nodemailer from "nodemailer";
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Generic Dispatcher
 * Switches between Resend and Nodemailer based on .env
 */
async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const provider = process.env.EMAIL_PROVIDER || "nodemailer"; // "resend" or "nodemailer"
  const from = process.env.EMAIL_FROM || `"MarvelMarts" <${process.env.SMTP_USER}>`;

  if (provider === "resend" && resend) {
    return await resend.emails.send({ from, to, subject, html });
  }

  // Fallback to Nodemailer
  const transporter = createTransporter();
  return await transporter.sendMail({ from, to, subject, html });
}

// --- NEW: ORDER CONFIRMATION EMAIL ---
export async function sendOrderConfirmationEmail(order: any) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden;">
      <div style="background-color: #001f3f; padding: 40px; text-align: center; color: white;">
        <h1 style="font-style: italic; text-transform: uppercase; margin: 0;">Order Secured</h1>
        <p style="color: #60a5fa; font-weight: bold; margin-top: 10px;">Order #${order.orderNumber}</p>
      </div>
      <div style="padding: 30px; color: #1e293b;">
        <p>Hi ${order.firstName},</p>
        <p>Your order has been received and is being processed.</p>
        
        <div style="margin: 20px 0; padding: 20px; background: #f8fafc; border-radius: 12px;">
          <h3 style="margin-top: 0; text-transform: uppercase; font-size: 12px; color: #64748b;">Items</h3>
          ${order.items.map((item: any) => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>${item.title} x ${item.qty}</span>
              <span style="font-weight: bold;">₦${(item.unitPrice * item.qty).toLocaleString()}</span>
            </div>
          `).join('')}
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0;" />
          <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span>Total</span>
            <span>₦${Number(order.total).toLocaleString()}</span>
          </div>
        </div>
        
        <p style="font-size: 12px; color: #64748b;">Shipping to: ${order.streetAddress}, ${order.city}</p>
      </div>
    </div>
  `;

  return sendEmail({ to: order.email, subject: `MarvelMarts Order Secured: ${order.orderNumber}`, html });
}

// --- UPDATED AUTH EMAILS (using the dispatcher) ---

export async function sendVerificationEmailWithNodemailer(to: string, code: string, uid: string, name: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify/verify-customer?uid=${uid}`;
  const html = `<p>Hi ${name},</p><p>Verification code: <b>${code}</b></p><a href="${verifyUrl}">Verify Here</a>`;
  
  return sendEmail({ to, subject: "Verify your account", html });
}