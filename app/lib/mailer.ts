// import nodemailer from "nodemailer";
// import { Resend } from 'resend';

// const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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

// /**
//  * Generic Dispatcher
//  * Switches between Resend and Nodemailer based on .env
//  */
// async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
//   const provider = process.env.EMAIL_PROVIDER || "nodemailer"; 
//   const from = process.env.EMAIL_FROM || `"MarvelMarts" <${process.env.SMTP_USER}>`;

//   try {
//     if (provider === "resend" && resend) {
//       return await resend.emails.send({ from, to, subject, html });
//     }

//     const transporter = createTransporter();
//     return await transporter.sendMail({ from, to, subject, html });
//   } catch (error) {
//     console.error(`📧 Email dispatch failed (${provider}):`, error);
//     if (process.env.NODE_ENV === "production") throw error;
//   }
// }

// // --- 1. SUPPORT SYSTEM EMAILS (Restored & Refactored) ---

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
//     <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px; border-radius: 16px;">
//       <h2 style="color: #2563eb; margin-top: 0;">New Support Ticket</h2>
//       <p><strong>Customer:</strong> ${email}</p>
//       <p><strong>Subject:</strong> ${subject}</p>
//       <div style="background: #f9fafb; padding: 15px; border-radius: 12px; border-left: 4px solid #2563eb; margin: 20px 0;">
//         <p style="margin: 0; color: #374151; white-space: pre-wrap;">${message}</p>
//       </div>
//       ${articleTitle ? `<p style="font-size: 12px; color: #dc2626;">🚩 Context: Triggered from article <b>"${articleTitle}"</b></p>` : ""}
//       <a href="${ticketUrl}" style="display: block; text-align: center; background: #2563eb; color: white; padding: 14px; border-radius: 10px; text-decoration: none; font-weight: bold;">
//         View Ticket in Dashboard
//       </a>
//     </div>
//   `;

//   return sendEmail({ to: process.env.ADMIN_EMAIL!, subject: `[New Ticket] ${subject}`, html });
// }

// export async function sendCustomerTicketConfirmation(to: string, subject: string) {
//   const html = `
//     <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
//       <h2 style="color: #111;">Request Received</h2>
//       <p>Hi there,</p>
//       <p>Thanks for reaching out! We've received your message regarding <b>"${subject}"</b>.</p>
//       <p>Our team will get back to you as soon as possible (usually within 24 hours).</p>
//       <br />
//       <p>Best regards,<br />MarvelMarts Support Team</p>
//     </div>
//   `;
//   return sendEmail({ to, subject: `We've received your request: ${subject}`, html });
// }

// // --- 2. AUTH EMAILS (Restored & Enhanced) ---

// export async function sendVerificationEmailWithNodemailer(to: string, code: string, uid: string, name: string) {
//   const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify/verify-customer?uid=${uid}`;
//   const html = `
//     <div style="font-family: sans-serif; padding: 20px;">
//       <p>Hi ${name},</p>
//       <p>Your verification code is: <b style="font-size: 20px;">${code}</b></p>
//       <p>Or click this link: <a href="${verifyUrl}">${verifyUrl}</a></p>
//     </div>
//   `;
//   return sendEmail({ to, subject: "Verify your account", html });
// }

// export async function sendPasswordResetEmail(to: string, resetCode: string) {
//   const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?code=${resetCode}&email=${encodeURIComponent(to)}`;
//   const html = `
//     <div style="font-family: sans-serif; padding: 20px;">
//       <h2>Password Reset Request</h2>
//       <p>Use the code below or click the link to reset your password:</p>
//       <h1 style="color:#111; letter-spacing: 4px;">${resetCode}</h1>
//       <p><a href="${resetUrl}" style="color:#1a73e8; font-weight: bold;">Click here to reset password</a></p>
//     </div>
//   `;
//   return sendEmail({ to, subject: "Password Reset Request", html });
// }


// // --- 3. COMMERCE EMAILS (New) ---

// export async function sendOrderConfirmationEmail(order: any) {
//   const html = `
//     <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden;">
//       <div style="background-color: #001f3f; padding: 40px; text-align: center; color: white;">
//         <h1 style="font-style: italic; text-transform: uppercase; margin: 0;">Order Secured</h1>
//         <p style="color: #60a5fa; font-weight: bold; margin-top: 10px;">Order #${order.orderNumber}</p>
//       </div>
//       <div style="padding: 30px; color: #1e293b;">
//         <p>Hi ${order.firstName},</p>
//         <p>Your gear is being prepped for dispatch!</p>
//         <div style="margin: 20px 0; padding: 20px; background: #f8fafc; border-radius: 12px;">
//           ${order.items.map((item: any) => `
//             <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
//               <span>${item.title} x ${item.qty}</span>
//               <span style="font-weight: bold;">₦${(item.unitPrice * item.qty).toLocaleString()}</span>
//             </div>
//           `).join('')}
//           <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0;" />
//           <div style="display: flex; justify-content: space-between; font-weight: bold;">
//             <span>Total Paid</span>
//             <span>₦${Number(order.total).toLocaleString()}</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   `;
//   return sendEmail({ to: order.email, subject: `MarvelMarts Order Secured: ${order.orderNumber}`, html });
// }

// export async function sendAdminOrderNotification(order: any) {
//   const adminEmail = process.env.ADMIN_EMAIL;
//   if (!adminEmail) return;

//   const html = `
//     <div style="font-family: sans-serif; padding: 20px; border: 2px solid #001f3f; border-radius: 12px;">
//       <h2 style="color: #001f3f;">💰 New Sale!</h2>
//       <p><strong>Order:</strong> ${order.orderNumber}</p>
//       <p><strong>Customer:</strong> ${order.firstName} ${order.lastName} (${order.email})</p>
//       <p><strong>Amount:</strong> ₦${Number(order.total).toLocaleString()}</p>
//     </div>
//   `;
//   return sendEmail({ to: adminEmail, subject: `🔥 New Sale: ${order.orderNumber}`, html });
// }



// //.. 4. EMAIL TEMPLATE TO INFORM USER OF END OF MAINTAINANCE PERIOD
// /**
//  * Sends a mass email or individual announcement when the store goes live
//  */
// export async function sendStoreLiveEmail(to: string, name: string) {
//   const shopUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/shop`;
  
//   const html = `
//     <div style="font-family: 'Arial Black', Gadget, sans-serif; max-width: 600px; margin: auto; background-color: #001f3f; color: white; border-radius: 24px; overflow: hidden; border: 4px solid #3b82f6;">
//       <div style="padding: 40px; text-align: center;">
//         <img src="https://marvelmarts.vercel.app/logo.png" alt="MarvelMarts" style="height: 40px; margin-bottom: 30px; filter: brightness(0) invert(1);">
        
//         <h1 style="font-size: 42px; font-style: italic; text-transform: uppercase; line-height: 1; margin: 0; letter-spacing: -2px;">
//           The Mart is <span style="color: #3b82f6;">Open.</span>
//         </h1>
        
//         <p style="font-size: 16px; color: #93c5fd; margin-top: 20px; text-transform: uppercase; letter-spacing: 2px;">
//           Experience Shopping Redefined
//         </p>
        
//         <div style="margin: 40px 0; background: rgba(59, 130, 246, 0.1); padding: 30px; border-radius: 16px; border: 1px dashed #3b82f6;">
//           <p style="font-size: 18px; margin: 0; font-family: sans-serif;">Hi ${name},</p>
//           <p style="font-family: sans-serif; line-height: 1.6; color: #d1d5db;">
//             The wait is over. We've upgraded our systems, stocked the vault, and the doors to <strong>MarvelMarts</strong> are now officially wide open.
//           </p>
//         </div>

//         <a href="${shopUrl}" style="display: inline-block; background-color: white; color: #001f3f; padding: 20px 40px; border-radius: 50px; text-decoration: none; font-weight: 900; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">
//           Enter the Shop
//         </a>
        
//         <p style="margin-top: 40px; font-size: 10px; color: #60a5fa; text-transform: uppercase; letter-spacing: 4px;">
//           Curated Tech • Premium Style • MarvelMarts 2026
//         </p>
//       </div>
//     </div>
//   `;

//   return sendEmail({ to, subject: "MarvelMarts is LIVE: Step Into Style", html });
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
 * Switches between Resend and Nodemailer based on .env provider
 */
async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const provider = process.env.EMAIL_PROVIDER || "nodemailer"; 
  const from = process.env.EMAIL_FROM || `"MarvelMarts" <${process.env.SMTP_USER}>`;

  try {
    if (provider === "resend" && resend) {
      return await resend.emails.send({ from, to, subject, html });
    }

    const transporter = createTransporter();
    return await transporter.sendMail({ from, to, subject, html });
  } catch (error) {
    console.error(`📧 Email dispatch failed (${provider}):`, error);
    if (process.env.NODE_ENV === "production") throw error;
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
    <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px; border-radius: 16px;">
      <h2 style="color: #2563eb; margin-top: 0;">New Support Ticket</h2>
      <p><strong>Customer:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <div style="background: #f9fafb; padding: 15px; border-radius: 12px; border-left: 4px solid #2563eb; margin: 20px 0;">
        <p style="margin: 0; color: #374151; white-space: pre-wrap;">${message}</p>
      </div>
      ${articleTitle ? `<p style="font-size: 12px; color: #dc2626;">🚩 Context: Triggered from article <b>"${articleTitle}"</b></p>` : ""}
      <a href="${ticketUrl}" style="display: block; text-align: center; background: #2563eb; color: white; padding: 14px; border-radius: 10px; text-decoration: none; font-weight: bold;">
        View Ticket in Dashboard
      </a>
    </div>
  `;

  return sendEmail({ to: process.env.ADMIN_EMAIL!, subject: `[New Ticket] ${subject}`, html });
}

export async function sendCustomerTicketConfirmation(to: string, subject: string) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
      <h2 style="color: #111;">Request Received</h2>
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

export async function sendVerificationEmailWithNodemailer(to: string, code: string, uid: string, name: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify/verify-customer?uid=${uid}`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px;">
      <p>Hi ${name},</p>
      <p>Your verification code is: <b style="font-size: 20px;">${code}</b></p>
      <p>Or click this link: <a href="${verifyUrl}">${verifyUrl}</a></p>
    </div>
  `;
  return sendEmail({ to, subject: "Verify your account", html });
}

export async function sendPasswordResetEmail(to: string, resetCode: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?code=${resetCode}&email=${encodeURIComponent(to)}`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px;">
      <h2>Password Reset Request</h2>
      <p>Use the code below or click the link to reset your password:</p>
      <h1 style="color:#111; letter-spacing: 4px;">${resetCode}</h1>
      <p><a href="${resetUrl}" style="color:#1a73e8; font-weight: bold;">Click here to reset password</a></p>
    </div>
  `;
  return sendEmail({ to, subject: "Password Reset Request", html });
}

// --- 3. COMMERCE EMAILS ---

export async function sendOrderConfirmationEmail(order: any) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden;">
      <div style="background-color: #001f3f; padding: 40px; text-align: center; color: white;">
        <h1 style="font-style: italic; text-transform: uppercase; margin: 0;">Order Secured</h1>
        <p style="color: #60a5fa; font-weight: bold; margin-top: 10px;">Order #${order.orderNumber}</p>
      </div>
      <div style="padding: 30px; color: #1e293b;">
        <p>Hi ${order.firstName},</p>
        <p>Your gear is being prepped for dispatch!</p>
        <div style="margin: 20px 0; padding: 20px; background: #f8fafc; border-radius: 12px;">
          ${order.items.map((item: any) => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>${item.title} x ${item.qty}</span>
              <span style="font-weight: bold;">₦${(item.unitPrice * item.qty).toLocaleString()}</span>
            </div>
          `).join('')}
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0;" />
          <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span>Total Paid</span>
            <span>₦${Number(order.total).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  `;
  return sendEmail({ to: order.email, subject: `MarvelMarts Order Secured: ${order.orderNumber}`, html });
}

export async function sendAdminOrderNotification(order: any) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const html = `
    <div style="font-family: sans-serif; padding: 20px; border: 2px solid #001f3f; border-radius: 12px;">
      <h2 style="color: #001f3f;">💰 New Sale!</h2>
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
    <div style="font-family: 'Arial Black', Gadget, sans-serif; max-width: 600px; margin: auto; background-color: #001f3f; color: white; border-radius: 24px; overflow: hidden; border: 4px solid #3b82f6;">
      <div style="padding: 40px; text-align: center;">
        <h1 style="font-size: 42px; font-style: italic; text-transform: uppercase; line-height: 1; margin: 0; letter-spacing: -2px;">
          The Mart is <span style="color: #3b82f6;">Open.</span>
        </h1>
        <p style="font-size: 16px; color: #93c5fd; margin-top: 20px; text-transform: uppercase; letter-spacing: 2px;">
          Experience Shopping Redefined
        </p>
        <div style="margin: 40px 0; background: rgba(59, 130, 246, 0.1); padding: 30px; border-radius: 16px; border: 1px dashed #3b82f6;">
          <p style="font-size: 18px; margin: 0; font-family: sans-serif;">Hi ${name},</p>
          <p style="font-family: sans-serif; line-height: 1.6; color: #d1d5db;">
            The wait is over. The doors to <strong>MarvelMarts</strong> are now officially wide open.
          </p>
        </div>
        <a href="${shopUrl}" style="display: inline-block; background-color: white; color: #001f3f; padding: 20px 40px; border-radius: 50px; text-decoration: none; font-weight: 900; text-transform: uppercase;">
          Enter the Shop
        </a>
      </div>
    </div>
  `;
  return sendEmail({ to, subject: "MarvelMarts is LIVE: Step Into Style", html });
}