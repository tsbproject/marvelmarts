// import nodemailer from "nodemailer";

// export async function sendVerificationEmailWithNodemailer(
//   to: string,
//   code: string,
//   uid: string,
//   name: string
// ) {
//   const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: Number(process.env.SMTP_PORT),
//     secure: Number(process.env.SMTP_PORT) === 465, // true only for 465
//     auth: {
//       user: process.env.SMTP_USER,
//       pass: process.env.SMTP_PASS,
//     },
//   });

//   const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify/verify-customer?uid=${uid}`;

//   const mailOptions = {
//     from: process.env.EMAIL_FROM || `"Support" <${process.env.SMTP_USER}>`,
//     to,
//     subject: "Verify your account",
//     text: `Hi ${name},\n\nYour verification code is: ${code}\n\nOr click this link: ${verifyUrl}`,
//     html: `
//       <p>Hi ${name},</p>
//       <p>Your verification code is: <b>${code}</b></p>
//       <p>Or click this link: <a href="${verifyUrl}">${verifyUrl}</a></p>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log("Verification email sent successfully");
//   } catch (err) {
//     console.error("Failed to send verification email:", err);

//     // ✅ Development fallback
//     if (process.env.NODE_ENV === "development") {
//       console.log(
//         `⚠️ SMTP failed, but here’s the verification code for ${to}: ${code}`
//       );
//       console.log(`Verification link: ${verifyUrl}`);
//     } else {
//       throw err; // rethrow in production
//     }
//   }
// }



// //PASSWORD RESET

// export async function sendPasswordResetEmail(to: string, resetCode: string) {
//   const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: Number(process.env.SMTP_PORT),
//     secure: Number(process.env.SMTP_PORT) === 465, // true only for 465
//     auth: {
//       user: process.env.SMTP_USER,
//       pass: process.env.SMTP_PASS,
//     },
//   });

//   // Construct reset link
//   const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?code=${resetCode}&email=${encodeURIComponent(to)}`;

//   const mailOptions = {
//     from: process.env.EMAIL_FROM || `"Support" <${process.env.SMTP_USER}>`,
//     to,
//     subject: "Password Reset Request",
//     text: `You requested a password reset.\n\nYour reset code is: ${resetCode}\n\nOr click this link to reset your password: ${resetUrl}\n\nThis code will expire in 10 minutes.`,
//     html: `
//       <h2>Password Reset Request</h2>
//       <p>You requested a password reset. Use the code below:</p>
//       <h3 style="color:#111">${resetCode}</h3>
//       <p>Or click this link to reset your password:</p>
//       <p><a href="${resetUrl}" style="color:#1a73e8">${resetUrl}</a></p>
//       <p>This code will expire in 10 minutes.</p>
//     `,
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Password reset email sent:", info.messageId);
//   } catch (err) {
//     console.error("Failed to send password reset email:", err);

//     if (process.env.NODE_ENV === "development") {
//       console.log(`⚠️ SMTP failed, reset code for ${to}: ${resetCode}`);
//       console.log(`Reset link: ${resetUrl}`);
//     } else {
//       throw err;
//     }
//   }
// }



import nodemailer from "nodemailer";

// Reusable transporter helper
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

// --- SUPPORT SYSTEM EMAILS ---

/**
 * Sends a notification to the ADMIN when a new ticket is created
 */
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
  const transporter = createTransporter();
  const ticketUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/admins/support/tickets/${id}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"MarvelMarts Support" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL, // Ensure this is in your .env
    subject: `[New Ticket] ${subject}`,
    html: `
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
    `,
  };

  return transporter.sendMail(mailOptions);
}

/**
 * Sends an auto-reply to the CUSTOMER confirming receipt
 */
export async function sendCustomerTicketConfirmation(to: string, subject: string) {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"MarvelMarts Support" <${process.env.SMTP_USER}>`,
    to,
    subject: `We've received your request: ${subject}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
        <h2 style="color: #111;">Request Received</h2>
        <p>Hi there,</p>
        <p>Thanks for reaching out! This is just a quick note to let you know that we've received your message regarding <b>"${subject}"</b>.</p>
        <p>Our support team will review your request and get back to you as soon as possible (usually within 24 hours).</p>
        <br />
        <p>Best regards,<br />MarvelMarts Support Team</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

// --- YOUR EXISTING AUTH EMAILS ---

export async function sendVerificationEmailWithNodemailer(to: string, code: string, uid: string, name: string) {
  const transporter = createTransporter();
  const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify/verify-customer?uid=${uid}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"Support" <${process.env.SMTP_USER}>`,
    to,
    subject: "Verify your account",
    html: `
      <p>Hi ${name},</p>
      <p>Your verification code is: <b>${code}</b></p>
      <p>Or click this link: <a href="${verifyUrl}">${verifyUrl}</a></p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.log(`⚠️ SMTP failed. Code: ${code}`);
    } else throw err;
  }
}

export async function sendPasswordResetEmail(to: string, resetCode: string) {
  const transporter = createTransporter();
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?code=${resetCode}&email=${encodeURIComponent(to)}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"Support" <${process.env.SMTP_USER}>`,
    to,
    subject: "Password Reset Request",
    html: `
      <h2>Password Reset Request</h2>
      <h3 style="color:#111">${resetCode}</h3>
      <p><a href="${resetUrl}" style="color:#1a73e8">Click here to reset password</a></p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.log(`⚠️ SMTP failed. Reset Code: ${resetCode}`);
    } else throw err;
  }
}

