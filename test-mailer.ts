import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // <-- this loads .env

async function main() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,      // must resolve to mail.marvelmarts.com
    port: Number(process.env.SMTP_PORT),
    secure: true,                     // true for port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    logger: true,
    debug: true,
  });

  try {
    await transporter.verify();
    console.log("SMTP connection is OK");

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: "ajongs2004@yahoo.com",
      subject: "Test Email from MarvelMarts",
      text: "This is a plain text test email.",
      html: "<p>This is a <b>test email</b> sent via Nodemailer.</p>",
    });

    console.log("Message sent:", info.messageId);
  } catch (err) {
    console.error("Error sending email:", err);
  }
}

main();
