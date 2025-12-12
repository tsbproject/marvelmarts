import nodemailer from "nodemailer";

export async function sendVerificationEmail(
  to: string,
  code: string
) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST!,
      port: Number(process.env.EMAIL_PORT!),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER!,
        pass: process.env.EMAIL_PASS!,
      },
    });

    const info = await transporter.sendMail({
      from: `"MarvelMarts" <${process.env.EMAIL_USER!}>`,
      to,
      subject: "Your MarvelMarts Verification Code",
      text: `Your verification code is: ${code}`,
      html: `<p>Your verification code is <strong>${code}</strong></p>`,
    });

    console.log("📧 Email sent:", info.messageId);
    return true;
  } catch (err) {
    console.error("Email error:", err);
    return false;
  }
}
