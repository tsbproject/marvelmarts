// export async function sendVerificationEmail(to: string, code: string) {
//   if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");
//   if (!code) throw new Error("Verification code is missing");

//   const html = `
//     <div style="font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#111;">
//       <h2>Verify your email</h2>
//       <p>Your verification code is:</p>
//       <div style="font-size: 24px; font-weight: 600; margin: 12px 0; padding: 12px; background:#f5f5f5; display:inline-block;">${code}</div>
//       <p>This code expires in 10 minutes.</p>
//       <p>If you didn't request this, ignore this email.</p>
//     </div>
//   `;

//   const payload = {
//     // Use a verified sender for local testing
//     from: "Marvel Marts <noreply.marvelmarts.com>",
//     to,
//     subject: "Your verification code",
//     html,
//   };

//  const res = await fetch(process.env.RESEND_API_URL!, {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
//   },
//   body: JSON.stringify(payload),
// });
//  console.log("Resend response:", Response);

//   const data = await res.json();
  

//   if (!res.ok) {
//     throw new Error(`Resend send failed: ${res.status} ${JSON.stringify(data)}`);
//   }

//   return data;
// }


// /app/_lib/mailer.ts
import fetch from "node-fetch"; // if needed in your environment

const RESEND_API_URL = "https://api.resend.com/emails";
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_PROD = process.env.RESEND_FROM_EMAIL || "Marvel Marts <no-reply@marvelmarts.com>";
const FROM_DEV = "Marvel Marts <onboarding@resend.dev>";

if (!RESEND_API_KEY) {
  console.warn("RESEND_API_KEY not set — emails will fail");
}

export async function sendVerificationEmail(to: string, code: string) {
  if (!code) throw new Error("Missing verification code");

  const isLocal = process.env.NODE_ENV === "development";
  const from = isLocal ? FROM_DEV : FROM_PROD;
  const resetText = `Your verification code is ${code}. It expires in 10 minutes.`;

  const payload = {
    from,
    to,
    subject: "Your MarvelMarts verification code",
    text: resetText,
    html: `
      <div style="font-family: Inter, Arial, sans-serif; color:#111;">
        <h3>Your verification code</h3>
        <p style="font-size:20px; font-weight:600;">${code}</p>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  };

  if (!RESEND_API_KEY) {
    console.warn("No RESEND_API_KEY — skipping real send (dev fallback).");
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
    throw new Error(`Resend error: ${res.status} ${JSON.stringify(data)}`);
  }
  return data;
}

