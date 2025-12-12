import nodemailer from "nodemailer";

// ------------------------------
// Nodemailer (development)
// ------------------------------
export async function sendVerificationEmailWithNodemailer(
  to: string,
  code: string,
  uid: string,
  name: string
) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.verify()
  .then(() => console.log("SMTP connection is OK"))
  .catch(err => console.error("SMTP connection failed:", err));


  const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify/verify-customer?uid=${uid}`;

 try {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Verify your account",
    text: `Hi ${name},\n\nYour verification code is: ${code}\n\nOr click this link: ${verifyUrl}`,
    html: `
      <p>Hi ${name},</p>
      <p>Your verification code is: <b>${code}</b></p>
      <p>Or click this link: <a href="${verifyUrl}">${verifyUrl}</a></p>
    `,
  });

  console.log("Verification email sent:", info.messageId);
} catch (err: any) {
  console.error("Failed to send verification email:", err);
}


  console.log("Verification email sent:", info.messageId);
}

// ------------------------------
// Resend (production)
// ------------------------------
async function sendVerificationEmailWithResend(
  to: string,
  code: string,
  uid: string,
  name: string
) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL,
      to,
      subject: "Verify your account",
      text: `Hi ${name}, your code is ${code}. Or click: ${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify/verify-customer?uid=${uid}`,
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend API error: ${res.status}`);
  }

  return res.json();
}

// ------------------------------
// Wrapper (exported)
// ------------------------------
export async function sendVerificationEmail(
  to: string,
  code: string,
  uid: string,
  name: string
) {
  if (process.env.NODE_ENV === "development") {
    return sendVerificationEmailWithNodemailer(to, code, uid, name);
  } else {
    return sendVerificationEmailWithResend(to, code, uid, name);
  }
}




// PASSWORD RESET 


export async function sendPasswordResetEmail(to: string, resetCode: string) {
  // Configure transporter (replace with your SMTP settings)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // e.g. "smtp.gmail.com"
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER, // your email
      pass: process.env.SMTP_PASS, // your email password or app password
    },
  });

  const mailOptions = {
    from: `"Support" <${process.env.SMTP_USER}>`,
    to,
    subject: "Password Reset Request",
    text: `You requested a password reset. Your reset code is: ${resetCode}. 
This code will expire in 10 minutes.`,
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Use the code below:</p>
      <h3 style="color:#111">${resetCode}</h3>
      <p>This code will expire in 10 minutes.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}
