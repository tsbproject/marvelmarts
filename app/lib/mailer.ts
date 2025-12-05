


// // /app/_lib/mailer.ts
// import fetch from "node-fetch"; // if needed in your environment

// const RESEND_API_URL = "https://api.resend.com/emails";
// const RESEND_API_KEY = process.env.RESEND_API_KEY;
// const FROM_PROD = process.env.RESEND_FROM_EMAIL || "Marvel Marts <no-reply@marvelmarts.com>";
// const FROM_DEV = "Marvel Marts <onboarding@resend.dev>";

// if (!RESEND_API_KEY) {
//   console.warn("RESEND_API_KEY not set — emails will fail");
// }

// export async function sendVerificationEmail(to: string, code: string) {
//   if (!code) throw new Error("Missing verification code");

//   const isLocal = process.env.NODE_ENV === "development";
//   const from = isLocal ? FROM_DEV : FROM_PROD;
//   const resetText = `Your verification code is ${code}. It expires in 10 minutes.`;

//   const payload = {
//     from,
//     to,
//     subject: "Your MarvelMarts verification code",
//     text: resetText,
//     html: `
//       <div style="font-family: Inter, Arial, sans-serif; color:#111;">
//         <h3>Your verification code</h3>
//         <p style="font-size:20px; font-weight:600;">${code}</p>
//         <p>This code expires in 10 minutes.</p>
//       </div>
//     `,
//   };

//   if (!RESEND_API_KEY) {
//     console.warn("No RESEND_API_KEY — skipping real send (dev fallback).");
//     return { ok: true, debug: "no_api_key" };
//   }

//   const res = await fetch(RESEND_API_URL, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${RESEND_API_KEY}`,
//     },
//     body: JSON.stringify(payload),
//   });

//   const data = await res.json();
//   if (!res.ok) {
//     throw new Error(`Resend error: ${res.status} ${JSON.stringify(data)}`);
//   }
//   return data;
// }




// /app/lib/mailer.ts
import fetch from "node-fetch";

// ------------------------------
// CONSTANTS
// ------------------------------
const RESEND_API_URL = "https://api.resend.com/emails";
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const FROM_PROD =
  process.env.RESEND_FROM_EMAIL || "Marvel Marts <no-reply@marvelmarts.com>";
const FROM_DEV = "Marvel Marts <onboarding@resend.dev>";

if (!RESEND_API_KEY) {
  console.warn("RESEND_API_KEY is missing — emails will NOT send in production.");
}

// ------------------------------
// SHARED SEND FUNCTION
// ------------------------------
async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const from =
    process.env.NODE_ENV === "development" ? FROM_DEV : FROM_PROD;

  const payload = {
    from,
    to,
    subject,
    text,
    html,
  };

  if (!RESEND_API_KEY) {
    console.warn(
      "RESEND_API_KEY missing — skipping real email (development fallback)."
    );
    return { ok: true, debug: "no_api_key" };
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      `Resend API error: ${res.status} — ${JSON.stringify(data)}`
    );
  }

  return data;
}

// ------------------------------
// VERIFICATION EMAIL (registration)
// ------------------------------
export async function sendVerificationEmail(to: string, code: string) {
  if (!code) throw new Error("Missing verification code");

  const subject = "Your MarvelMarts verification code";
  const text = `Your verification code is ${code}. It expires in 10 minutes.`;
  const html = `
    <div style="font-family: Inter, Arial, sans-serif; color:#111;">
      <h3>Your verification code</h3>
      <p style="font-size:20px; font-weight:600;">${code}</p>
      <p>This code expires in 10 minutes.</p>
    </div>
  `;

  return sendEmail({ to, subject, text, html });
}

// ------------------------------
// PASSWORD RESET EMAIL
// ------------------------------
export async function sendPasswordResetEmail(to: string, code: string) {
  if (!code) throw new Error("Missing password reset code");

  const subject = "Your MarvelMarts password reset code";
  const text = `Your password reset code is ${code}. It expires in 10 minutes.`;
  const html = `
    <div style="font-family: Inter, Arial, sans-serif; color:#111;">
      <h3>Password Reset Code</h3>
      <p style="font-size:20px; font-weight:600;">${code}</p>
      <p>This code expires in 10 minutes.</p>
    </div>
  `;

  return sendEmail({ to, subject, text, html });
}

