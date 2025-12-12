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
