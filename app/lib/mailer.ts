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

const LOGO_URL = "https://marvelmarts.com/logo.png";

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
 */
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
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

export async function sendVerificationEmailWithNodemailer(to: string, code: string, uid: string, name: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify/verify-customer?uid=${uid}`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; text-align: center; background: ${COLORS.ghost}; border-radius: 20px;">
      <img src="${LOGO_URL}" width="150" alt="MarvelMarts" style="margin-bottom: 20px;" />
      <p>Hi ${name},</p>
      <p>Your verification code is:</p>
      <h1 style="color: ${COLORS.orange}; letter-spacing: 5px; font-size: 32px;">${code}</h1>
      <p>Or click this link to verify:</p>
      <a href="${verifyUrl}" style="color: ${COLORS.navy}; font-weight: bold;">${verifyUrl}</a>
    </div>
  `;
  return sendEmail({ to, subject: "Verify your MarvelMarts Account", html });
}

export async function sendPasswordResetEmail(to: string, resetCode: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?code=${resetCode}&email=${encodeURIComponent(to)}`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid ${COLORS.ghost}; border-radius: 20px;">
      <h2 style="color: ${COLORS.navy};">Password Reset Request</h2>
      <p>Use the code below or click the link to reset your password:</p>
      <h1 style="color:${COLORS.black}; letter-spacing: 4px; background: ${COLORS.orangeLight}; display: inline-block; padding: 10px 20px;">${resetCode}</h1>
      <p style="margin-top: 20px;"><a href="${resetUrl}" style="color:${COLORS.orange}; font-weight: bold; text-decoration: none;">Click here to reset password →</a></p>
    </div>
  `;
  return sendEmail({ to, subject: "Password Reset Request", html });
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

// --- NEW: ORDER CANCELLATION EMAIL ---
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

// --- NEW: REFUND STATUS EMAILS ---
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