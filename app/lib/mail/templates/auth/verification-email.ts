import { COLORS } from "../../config/color";
import { VerificationTemplateData } from "../../types/auth.types";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  "http://localhost:3000";

export function verificationEmail({
  name,
  code,
  uid,
  type,
}: VerificationTemplateData) {

  const isVendor =
    type === "VENDOR";

  const verifyLink =
    `${BASE_URL}/auth/verify/verify-${
      isVendor
        ? "vendor"
        : "customer"
    }?uid=${uid}`;

  const html = `
    <div
      style="
        font-family: Helvetica, Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
      "
    >

      <div
        style="
          text-align:center;
          margin-bottom:30px;
        "
      >

        <h1
          style="
            color:${COLORS.navy};
            font-size:34px;
            font-weight:900;
            font-style:italic;
            text-transform:uppercase;
            margin-bottom:5px;
            letter-spacing:-1px;
          "
        >
          Verify Your Identity
        </h1>

        <p
          style="
            color:${COLORS.gray};
            font-size:13px;
            font-weight:700;
            text-transform:uppercase;
            letter-spacing:2px;
          "
        >
          Secure Account Verification
        </p>

      </div>

      <p
        style="
          font-size:15px;
          color:${COLORS.black};
          line-height:1.7;
        "
      >
        Hello <strong>${name}</strong>,
      </p>

      <p
        style="
          font-size:15px;
          color:${COLORS.black};
          line-height:1.7;
        "
      >
        Welcome to MarvelMarts.
        Enter the verification code below
        to activate your account and begin
        using all platform features.
      </p>

      <div
        style="
          background:${COLORS.navy};
          padding:35px 20px;
          text-align:center;
          border-radius:20px;
          margin:35px 0;
        "
      >

        <p
          style="
            color:rgba(255,255,255,0.7);
            font-size:11px;
            font-weight:700;
            letter-spacing:3px;
            text-transform:uppercase;
          "
        >
          Verification Code
        </p>

        <div
          style="
            color:white;
            font-size:38px;
            font-weight:900;
            letter-spacing:10px;
            font-family:monospace;
          "
        >
          ${code}
        </div>

      </div>

      <div
        style="
          text-align:center;
          margin:35px 0;
        "
      >

        <a
          href="${verifyLink}"
          style="
            background:${COLORS.orange};
            color:white;
            padding:16px 32px;
            border-radius:14px;
            text-decoration:none;
            font-size:13px;
            font-weight:900;
            text-transform:uppercase;
            letter-spacing:1px;
            display:inline-block;
          "
        >
          Verify My Account
        </a>

      </div>

      <div
        style="
          background:${COLORS.orangeLight};
          border-left:5px solid ${COLORS.orange};
          padding:18px;
          border-radius:12px;
        "
      >

        <p
          style="
            margin:0;
            color:${COLORS.black};
            line-height:1.7;
          "
        >
          <strong>Important:</strong>
          This verification code expires in
          <strong>15 minutes</strong>.
        </p>

      </div>

      <p
        style="
          margin-top:40px;
          font-size:12px;
          color:#9CA3AF;
          text-align:center;
        "
      >
        If you did not create a MarvelMarts
        account, you may safely ignore
        this email.
      </p>

    </div>
  `;

  return {
    subject:
      "Verify Your MarvelMarts Account",

    preview:
      "Your MarvelMarts verification code",

    html,
  };
}