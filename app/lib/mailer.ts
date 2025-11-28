// app/_lib/mailer.ts
const RESEND_API_URL = "https://api.resend.com/emails";
const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  console.warn("RESEND_API_KEY not set — emails will fail");
}

export async function sendVerificationEmail(to: string, code: string) {
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

  const html = `
    <div style="font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#111;">
      <h2>Verify your email</h2>
      <p>Your verification code is:</p>
      <div style="font-size: 24px; font-weight: 600; margin: 12px 0; padding: 12px; background:#f5f5f5; display:inline-block;">${code}</div>
      <p>This code expires in 10 minutes.</p>
      <p>If you didn't request this, ignore this email.</p>
    </div>
  `;

  const payload = {
    from: "no-reply@yourdomain.com",
    to,
    subject: "Your verification code",
    html,
  };

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend send failed: ${res.status} ${text}`);
  }

  return true;
}
