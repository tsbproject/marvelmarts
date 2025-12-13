import nodemailer from "nodemailer";

export async function sendVerificationEmailWithNodemailer(
  to: string,
  code: string,
  uid: string,
  name: string
) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465, // true only for 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify/verify-customer?uid=${uid}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"Support" <${process.env.SMTP_USER}>`,
    to,
    subject: "Verify your account",
    text: `Hi ${name},\n\nYour verification code is: ${code}\n\nOr click this link: ${verifyUrl}`,
    html: `
      <p>Hi ${name},</p>
      <p>Your verification code is: <b>${code}</b></p>
      <p>Or click this link: <a href="${verifyUrl}">${verifyUrl}</a></p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully");
  } catch (err) {
    console.error("Failed to send verification email:", err);

    // ✅ Development fallback
    if (process.env.NODE_ENV === "development") {
      console.log(
        `⚠️ SMTP failed, but here’s the verification code for ${to}: ${code}`
      );
      console.log(`Verification link: ${verifyUrl}`);
    } else {
      throw err; // rethrow in production
    }
  }
}



//PASSWORD RESET

export async function sendPasswordResetEmail(to: string, resetCode: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465, // true only for 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Construct reset link
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?code=${resetCode}&email=${encodeURIComponent(to)}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"Support" <${process.env.SMTP_USER}>`,
    to,
    subject: "Password Reset Request",
    text: `You requested a password reset.\n\nYour reset code is: ${resetCode}\n\nOr click this link to reset your password: ${resetUrl}\n\nThis code will expire in 10 minutes.`,
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Use the code below:</p>
      <h3 style="color:#111">${resetCode}</h3>
      <p>Or click this link to reset your password:</p>
      <p><a href="${resetUrl}" style="color:#1a73e8">${resetUrl}</a></p>
      <p>This code will expire in 10 minutes.</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent:", info.messageId);
  } catch (err) {
    console.error("Failed to send password reset email:", err);

    if (process.env.NODE_ENV === "development") {
      console.log(`⚠️ SMTP failed, reset code for ${to}: ${resetCode}`);
      console.log(`Reset link: ${resetUrl}`);
    } else {
      throw err;
    }
  }
}


