import nodemailer from "nodemailer";

// 1. BRAND CONFIGURATION
const COLORS = {
  navy: "#002B5B",
  orange: "#F7931E",
  orangeLight: "#FFE8CC",
  white: "#FFFFFF",
  ghost: "#F8F8F8",
  gray: "#4B4B4B",
  black: "#1E1E1E",
  red: "#DC2626",
  green: "#16A34A"
};

const LOGO_URL = "https://marvelmarts.vercel.app/logo.png";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://marvelmarts.vercel.app";

// 2. TRANSPORTER SETUP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 3. THE MASTER LAYOUT WRAPPER
// This function wraps any "body" content in the official MarvelMarts frame.
const wrapLayout = (content: string, previewText: string = "Notification from MarvelMarts") => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background-color: ${COLORS.ghost}; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; }
    .main-button:hover { background-color: #001f41 !important; }
  </style>
</head>
<body>
  <div style="display: none; max-height: 0px; overflow: hidden;">${previewText}</div>
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${COLORS.ghost}; padding: 20px 0;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <tr>
            <td align="center" style="background-color: ${COLORS.navy}; padding: 40px 20px;">
              <img src="${LOGO_URL}" alt="MarvelMarts" width="200" style="display: block;" />
              <p style="color: #ffffff; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin-top: 15px; opacity: 0.8;">Official Notification</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px; color: ${COLORS.black}; line-height: 1.6;">
              ${content}
            </td>
          </tr>
          <tr>
            <td align="center" style="background-color: #F9FAFB; padding: 30px; border-top: 1px solid #EEEEEE; color: ${COLORS.gray}; font-size: 13px;">
              <p style="margin: 0; font-weight: bold; color: ${COLORS.navy};">MarvelMarts HQ</p>
              <p style="margin: 5px 0;">Lekki, Lagos, Nigeria</p>
              <p style="margin: 5px 0;"><a href="mailto:support@marvelmarts.com" style="color: ${COLORS.navy}; text-decoration: none;">support@marvelmarts.com</a></p>
              <p style="margin-top: 20px; font-size: 11px; opacity: 0.6;">&copy; 2026 MarvelMarts. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// 4. SHARED SEND FUNCTION
async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    return await transporter.sendMail({
      from: `"MarvelMarts" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("📧 Email Dispatch Failed:", error);
    throw error;
  }
}

// --- 5. EXPORTED EMAIL FUNCTIONS ---

// AUTH: Verification
export async function sendVerificationEmailWithNodemailer(email: string, code: string, uid: string, name: string, type: "CUSTOMER" | "VENDOR") {
  const isVendor = type === "VENDOR";
  const verifyLink = `${BASE_URL}/auth/verify/verify-${isVendor ? 'vendor' : 'customer'}?uid=${uid}`;
  const content = `
    <h2>Hello ${name},</h2>
    <p>Thank you for joining MarvelMarts! Please use the code below to verify your account:</p>
    <div style="background: ${COLORS.ghost}; padding: 30px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: ${COLORS.navy}; border-radius: 12px; margin: 20px 0;">
      ${code}
    </div>
    <p>Or click the button below:</p>
    <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyLink}" style="background: ${COLORS.navy}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Account</a>
    </div>
    <p style="font-size: 12px; color: ${COLORS.gray};">This code expires in 15 minutes.</p>
  `;
  return sendEmail({ to: email, subject: "Verify Your Account - MarvelMarts", html: wrapLayout(content, "Verification Code") });
}

// AUTH: Password Reset
export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${BASE_URL}/auth/reset-password?token=${token}`;
  const content = `
    <h2>Password Reset Request</h2>
    <p>We received a request to reset your password. Click the button below to proceed:</p>
    <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background: ${COLORS.navy}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
    </div>
    <p>If you did not request this, please ignore this email.</p>
  `;
  return sendEmail({ to, subject: "Password Reset Request", html: wrapLayout(content, "Reset your password") });
}

// VENDOR: Status Update (Merged Approve/Reject)
export async function sendVendorStatusEmail({ email, firstName, storeName, status, reason }: { email: string; firstName: string; storeName: string; status: "APPROVED" | "REJECTED"; reason?: string | null; }) {
  const isApproved = status === "APPROVED";
  const content = isApproved ? `
    <h2 style="color: ${COLORS.navy};">Congratulations, ${firstName}!</h2>
    <p>Your store <strong>${storeName}</strong> has been officially approved.</p>
    <p>You can now log in to your dashboard to start selling gear!</p>
    <div style="text-align: center; margin: 30px 0;">
        <a href="${BASE_URL}/account/vendor" style="background: ${COLORS.navy}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
    </div>
  ` : `
    <h2 style="color: ${COLORS.red}; text-transform: uppercase;">Application Update</h2>
    <p>Hello ${firstName}, your application for <strong>${storeName}</strong> requires some changes.</p>
    <div style="background-color: #fff5f5; border-left: 4px solid ${COLORS.red}; padding: 15px; margin: 20px 0;">
      <strong>Feedback:</strong> ${reason || "Please review your business details and resubmit."}
    </div>
    <div style="text-align: center; margin: 30px 0;">
        <a href="${BASE_URL}/account/vendor" style="background: ${COLORS.navy}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Fix & Resubmit</a>
    </div>
  `;
  return sendEmail({ to: email, subject: `MarvelMarts: Store ${status}`, html: wrapLayout(content, `Your store application has been ${status.toLowerCase()}`) });
}

// COMMERCE: Order Confirmation
export async function sendOrderConfirmationEmail(order: any) {
  const content = `
    <h1 style="color: ${COLORS.navy}; text-align: center; font-style: italic;">ORDER SECURED</h1>
    <p style="text-align: center; color: ${COLORS.orange}; font-weight: bold;">Order #${order.orderNumber}</p>
    <p>Hi ${order.firstName}, your gear is being prepped for dispatch!</p>
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
  `;
  return sendEmail({ to: order.email, subject: `Order Secured: ${order.orderNumber}`, html: wrapLayout(content, "Thank you for your order!") });
}

// COMMERCE: Shipment Notification
export async function sendShipmentNotificationEmail(order: any) {
  const content = `
    <h2 style="color: ${COLORS.navy};">Package En Route! 🚚</h2>
    <p>Hello ${order.firstName}, your package has been handed over to our courier.</p>
    <div style="background: ${COLORS.ghost}; padding: 25px; border-radius: 16px; border-left: 4px solid ${COLORS.orange}; margin: 25px 0; text-align: center;">
      <p style="margin: 0; font-size: 12px; text-transform: uppercase; color: ${COLORS.gray};">Tracking Number</p>
      <p style="margin: 5px 0 0; font-size: 24px; font-weight: 900; color: ${COLORS.navy};">${order.trackingNumber}</p>
    </div>
    <p style="font-size: 13px; color: ${COLORS.gray}; text-align: center;">Allow 24 hours for the tracking link to activate.</p>
  `;
  return sendEmail({ to: order.email, subject: `Your Order has Shipped! #${order.orderNumber}`, html: wrapLayout(content, "Your package is on the way") });
}

// COMMERCE: Refund/Cancel
export async function sendOrderCancellationEmail(order: any) {
  const content = `
    <h2 style="color: ${COLORS.red};">Mission Aborted: Order Cancelled</h2>
    <p>Hello ${order.firstName}, your order <b>#${order.orderNumber}</b> has been cancelled and a refund is being processed.</p>
    <div style="background: ${COLORS.ghost}; padding: 15px; border-radius: 12px; margin-top: 20px;">
      <p style="margin: 0; font-weight: bold; color: ${COLORS.navy};">Refund Information</p>
      <p style="font-size: 13px;">Funds usually reflect in 3-7 business days.</p>
    </div>
  `;
  return sendEmail({ to: order.email, subject: `Order Cancelled: #${order.orderNumber}`, html: wrapLayout(content, "Cancellation Confirmation") });
}


//REFUND STATUS EMAIL
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

// SUPPORT: Admin/Customer Tickets
export async function sendAdminTicketNotification({ id, subject, email, message, articleTitle }: any) {
  const ticketUrl = `${BASE_URL}/dashboard/admins/support/tickets/${id}`;
  const content = `
    <h2 style="color: ${COLORS.navy};">New Support Ticket</h2>
    <p><strong>From:</strong> ${email}</p>
    <div style="background: ${COLORS.ghost}; padding: 20px; border-radius: 12px; border-left: 4px solid ${COLORS.navy}; margin: 20px 0;">
      <p style="margin: 0; white-space: pre-wrap;">${message}</p>
    </div>
    ${articleTitle ? `<p style="font-size: 12px; color: ${COLORS.red};">Context: From article "${articleTitle}"</p>` : ""}
    <div style="text-align: center;"><a href="${ticketUrl}" style="background: ${COLORS.navy}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View Ticket</a></div>
  `;
  return sendEmail({ to: process.env.ADMIN_EMAIL!, subject: `[New Ticket] ${subject}`, html: wrapLayout(content, "New ticket received") });
}

export async function sendCustomerTicketConfirmation(to: string, subject: string) {
  const content = `
    <h2 style="color: ${COLORS.navy};">Request Received</h2>
    <p>Thanks for reaching out! We've received your message regarding <b>"${subject}"</b> and our team will get back to you within 24 hours.</p>
  `;
  return sendEmail({ to, subject: `Request Received: ${subject}`, html: wrapLayout(content, "We've got your message") });
}

// ANNOUNCEMENT: Store Live
export async function sendStoreLiveEmail(to: string, name: string) {
  const content = `
    <h1 style="font-size: 32px; font-style: italic; text-transform: uppercase; color: ${COLORS.navy}; text-align: center;">The Mart is <span style="color: ${COLORS.orange};">Open.</span></h1>
    <p style="text-align: center;">Hi ${name}, the doors to MarvelMarts are now officially wide open. Experience shopping redefined.</p>
    <div style="text-align: center; margin: 30px 0;">
        <a href="${BASE_URL}/shop" style="background: ${COLORS.orange}; color: white; padding: 18px 36px; border-radius: 50px; text-decoration: none; font-weight: bold; text-transform: uppercase;">Enter the Shop</a>
    </div>
  `;
  return sendEmail({ to, subject: "MarvelMarts is LIVE", html: wrapLayout(content, "Step into style") });
}

// ADMIN: New Sale
export async function sendAdminOrderNotification(order: any) {
  const content = `
    <h2 style="color: ${COLORS.navy};">💰 New Sale!</h2>
    <p><strong>Order:</strong> ${order.orderNumber}</p>
    <p><strong>Amount:</strong> ₦${Number(order.total).toLocaleString()}</p>
    <p><strong>Customer:</strong> ${order.firstName} (${order.email})</p>
  `;
  return sendEmail({ to: process.env.ADMIN_EMAIL!, subject: `🔥 New Sale: ${order.orderNumber}`, html: wrapLayout(content, "Admin Sale Alert") });
}



// ... (Your existing COLORS, LOGO_URL, and wrapLayout are already here)

export const sendPayoutStatusEmail = async (
  to: string, 
  vendorName: string, 
  amount: number, 
  status: "APPROVED" | "REJECTED", 
  remarks?: string
) => {
  const isApproved = status === "APPROVED";
  const formattedAmount = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount);

  // 1. Prepare the specific content for the payout
  const content = `
    <div style="margin-bottom: 25px;">
      <h2 style="margin: 0; color: ${COLORS.navy}; font-size: 20px; text-transform: uppercase; font-weight: 900;">
        Payout Request ${status}
      </h2>
    </div>

    <p style="margin-bottom: 20px;">Hello <strong>${vendorName}</strong>,</p>
    
    <p style="margin-bottom: 20px;">
      Your withdrawal request for <span style="color: ${COLORS.navy}; font-weight: bold;">${formattedAmount}</span> has been processed.
    </p>

    <div style="background-color: ${isApproved ? '#F0FDF4' : '#FEF2F2'}; padding: 20px; border-radius: 12px; border: 1px solid ${isApproved ? '#DCFCE7' : '#FEE2E2'}; margin-bottom: 25px;">
      ${isApproved 
        ? `<p style="margin: 0; color: #166534; font-size: 14px;">
             <strong>STATUS: DISBURSED</strong><br/>
             The funds have been sent to your bank account and should arrive within 24-48 hours.
           </p>` 
        : `<p style="margin: 0; color: #991B1B; font-size: 14px;">
             <strong>STATUS: REJECTED</strong><br/>
             <strong>REASON:</strong> ${remarks || "Please contact support for details."}
           </p>`
      }
    </div>

    <div style="text-align: center; margin-top: 35px;">
      <a href="https://marvelmarts.vercel.app/account/vendor/payouts" 
         class="main-button"
         style="background-color: ${COLORS.navy}; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
        VIEW WITHDRAWAL LOGS
      </a>
    </div>
  `;

  // 2. Wrap it using your existing central layout
  const previewText = `Your payout for ${formattedAmount} was ${status.toLowerCase()}.`;
  const html = wrapLayout(content, previewText);

  // 3. Send via your existing transport logic
  return await transporter.sendMail({
    from: `"MarvelMarts Treasury" <${process.env.EMAIL_USER}>`,
    to,
    subject: `PAYOUT ${status}: ${formattedAmount}`,
    html,
  });
};



//VENDOR SUSPENSION EMAIL 

// 5. VENDOR ENFORCEMENT & RESTORATION EMAIL
export async function sendVendorActionEmail({ 
  email, 
  name, 
  action, 
  reason 
}: { 
  email: string; 
  name: string; 
  action: string; 
  reason: string; 
}) {
  const isRestore = action === "RESTORE";
  const isSuspension = action === "SUSPEND";
  
  // Dynamic styling based on the action
  const statusColor = isRestore ? "#10b981" : isSuspension ? "#ef4444" : COLORS.navy;
  const heading = isRestore ? "Welcome Back to the Marketplace!" : "Account Status Update";
  
  const content = `
    <h1 style="color: ${COLORS.navy}; font-size: 24px; font-weight: 900; margin-bottom: 20px; text-transform: uppercase;">
      ${heading}
    </h1>
    <p style="font-size: 16px;">Hello <strong>${name}</strong>,</p>
    <p>
      ${isRestore 
        ? "We are pleased to inform you that your vendor account has been fully reinstated. You can now resume sales and manage your storefront."
        : "This is a formal notification regarding administrative changes made to your vendor account on MarvelMarts."
      }
    </p>
    
    <div style="background-color: #F9FAFB; border-left: 4px solid ${statusColor}; padding: 25px; margin: 30px 0; border-radius: 8px;">
      <p style="margin: 0; font-size: 11px; font-weight: bold; color: ${COLORS.gray}; text-transform: uppercase; letter-spacing: 1px;">Update Type</p>
      <p style="margin: 5px 0 15px 0; font-size: 18px; font-weight: 900; color: ${statusColor}; text-transform: uppercase;">
        Account ${isRestore ? "Reinstated" : action + "ed"}
      </p>
      
      <p style="margin: 0; font-size: 11px; font-weight: bold; color: ${COLORS.gray}; text-transform: uppercase; letter-spacing: 1px;">Note from Admin</p>
      <p style="margin-top: 5px; color: ${COLORS.black}; font-style: italic;">"${reason}"</p>
    </div>

    <p style="margin-bottom: 30px;">
      ${isRestore 
        ? "We recommend reviewing our merchant guidelines to ensure your store remains in good standing. Happy selling!"
        : "If you wish to appeal this decision, please contact our compliance team via the Support Command Center."
      }
    </p>
    
    <a href="https://marvelmarts.vercel.app/dashboard" class="main-button" style="display: inline-block; background-color: ${COLORS.navy}; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
      ${isRestore ? "Access My Store" : "Open My Dashboard"}
    </a>
  `;

  const previewText = isRestore 
    ? "Great news! Your MarvelMarts vendor account has been restored." 
    : `Important: Your MarvelMarts account has been ${action.toLowerCase()}ed.`;

  return await sendEmail({
    to: email,
    subject: `MarvelMarts | Account ${isRestore ? "Restored" : action + "ed"}`,
    html: wrapLayout(content, previewText),
  });
}



// 6. ADMIN SYSTEM ALERT
export async function sendAdminAlert({ 
  type, 
  subject, 
  details 
}: { 
  type: 'DISPUTE' | 'VENDOR_SIGNUP' | 'REPORT'; 
  subject: string; 
  details: string; 
}) {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@marvelmarts.com";
  
  const content = `
    <h1 style="color: ${COLORS.navy}; font-size: 20px; font-weight: 900; margin-bottom: 15px; text-transform: uppercase;">
      System Alert: ${type}
    </h1>
    <p style="font-size: 16px; color: ${COLORS.black};">Hello Admin,</p>
    <p>A new high-priority event requires your attention on the <strong>MarvelMarts Control Center</strong>.</p>
    
    <div style="background-color: #F1F5F9; border-left: 4px solid #F59E0B; padding: 20px; margin: 25px 0; border-radius: 8px;">
      <p style="margin: 0; font-size: 11px; font-weight: bold; color: ${COLORS.gray}; text-transform: uppercase;">Event Details</p>
      <p style="margin: 5px 0 10px 0; font-size: 16px; font-weight: bold; color: ${COLORS.navy};">${subject}</p>
      <p style="margin: 0; color: ${COLORS.black}; font-size: 14px; line-height: 1.5;">${details}</p>
    </div>

    <a href="https://marvelmarts.vercel.app/dashboard/admins" class="main-button" style="display: inline-block; background-color: ${COLORS.navy}; color: #ffffff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 13px; text-transform: uppercase;">
      Review in Admin Panel
    </a>
  `;

  return await sendEmail({
    to: adminEmail,
    subject: ` [ADMIN ALERT] ${type}: ${subject}`,
    html: wrapLayout(content, `New ${type.toLowerCase()} requires review.`)
  });
}


// NEW CHAT MESSAGE EMAIL NOTIFICATION

export async function sendNewMessageEmail(
  recipientEmail: string,
  senderName: string,
  messageContent: string,
  conversationId: string
) {
  const previewText = `${senderName} sent you a new message on MarvelMarts.`;
  
  const content = `
    <div style="font-family: sans-serif; color: #002B5B;">
      <h2 style="text-transform: uppercase; font-style: italic;">New Message Received</h2>
      <p>Hi there,</p>
      <p><strong>${senderName}</strong> has just sent you a message regarding your inquiry:</p>
      
      <div style="background-color: #FBFBFB; padding: 20px; border-radius: 15px; border: 1px solid #eeeeee; margin: 20px 0; font-style: italic;">
        "${messageContent.length > 100 ? messageContent.substring(0, 100) + '...' : messageContent}"
      </div>

      <div style="margin-top: 30px;">
        <a href="https://marvelmarts.vercel.app/account/messages/${conversationId}" 
           style="background-color: #F7931E; color: white; padding: 12px 25px; text-decoration: none; border-radius: 10px; font-weight: bold; text-transform: uppercase; font-size: 12px;">
           View Transmission
        </a>
      </div>
      
      <p style="margin-top: 30px; font-size: 10px; color: #999999; text-transform: uppercase;">
        Note: Please do not reply directly to this email. Use the MarvelMarts dashboard to respond.
      </p>
    </div>
  `;

  const html = wrapLayout(content, previewText);

  return await sendEmail({
    to: recipientEmail,
    subject: `New Message from ${senderName} | MarvelMarts`,
    html,
  });
}