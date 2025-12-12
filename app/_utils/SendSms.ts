// import twilio from "twilio";

// const accountSid = process.env.TWILIO_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const smsFrom = process.env.TWILIO_PHONE;

// const client = twilio(accountSid, authToken);

// export async function sendVerificationSMS(
//   phone: string,
//   code: string
// ) {
//   try {
//     const message = await client.messages.create({
//       body: `Your MarvelMarts verification code is: ${code}`,
//       from:process.env.TWILIO_FROM_NUMBER,
//       to: phone,
//     });

//     console.log("📱 SMS sent:", message.sid);
//     return true;
//   } catch (err) {
//     console.error("SMS Error:", err);
//     return false;
//   }
// }

import Twilio from "twilio";

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
  throw new Error("Twilio SID or Auth Token is missing in environment variables.");
}

const client = Twilio(accountSid, authToken);

export default client;
