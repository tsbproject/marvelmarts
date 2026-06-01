import { COLORS } from "../../config/color";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  "http://localhost:3000";

export interface PasswordResetTemplateData {
  token: string;
}

export function passwordResetEmail({
  token,
}: PasswordResetTemplateData) {

  const resetUrl =
    `${BASE_URL}/auth/reset-password?token=${token}`;

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
            letter-spacing:-1px;
          "
        >
          Password Reset
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
          Account Recovery
        </p>

      </div>

      <p
        style="
          color:${COLORS.black};
          font-size:15px;
          line-height:1.8;
        "
      >
        We received a request to reset
        your MarvelMarts account password.
      </p>

      <p
        style="
          color:${COLORS.black};
          font-size:15px;
          line-height:1.8;
        "
      >
        Click the button below to create
        a new password.
      </p>

      <div
        style="
          text-align:center;
          margin:40px 0;
        "
      >

        <a
          href="${resetUrl}"
          style="
            background:${COLORS.navy};
            color:white;
            padding:16px 34px;
            border-radius:14px;
            text-decoration:none;
            font-size:13px;
            font-weight:900;
            text-transform:uppercase;
            display:inline-block;
          "
        >
          Reset Password
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
            line-height:1.8;
          "
        >
          For security reasons,
          this reset link will expire shortly.
        </p>

      </div>

      <p
        style="
          margin-top:35px;
          color:${COLORS.gray};
          font-size:13px;
          line-height:1.8;
        "
      >
        If you did not request a password
        reset, no action is required.
        Your account remains secure.
      </p>

      <p
        style="
          margin-top:30px;
          font-size:12px;
          color:#9CA3AF;
          text-align:center;
        "
      >
        This email was sent automatically
        by MarvelMarts Security.
      </p>

    </div>
  `;

  return {
    subject:
      "Reset Your MarvelMarts Password",

    preview:
      "Password reset request",

    html,
  };
}