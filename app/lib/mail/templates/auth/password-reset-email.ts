




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
`${BASE_URL}/auth/reset-password`;

const html = ` <div
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
    Use the verification code below on
    the password reset page or click the
    button to continue.
  </p>

  <div
    style="
      text-align:center;
      margin:35px 0;
    "
  >

    <p
      style="
        color:${COLORS.gray};
        font-size:13px;
        font-weight:700;
        text-transform:uppercase;
        letter-spacing:2px;
        margin-bottom:12px;
      "
    >
      Password Reset Code
    </p>

    <div
      style="
        background:#F8F8F8;
        border:2px dashed ${COLORS.orange};
        border-radius:14px;
        display:inline-block;
        padding:18px 30px;
        font-size:32px;
        font-weight:900;
        letter-spacing:8px;
        color:${COLORS.navy};
      "
    >
      ${token}
    </div>

  </div>

  <p
    style="
      text-align:center;
      color:${COLORS.gray};
      font-size:14px;
      line-height:1.8;
    "
  >
    Enter this code on the password reset
    page if you prefer not to use the button.
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

  <p
    style="
      margin-top:20px;
      font-size:12px;
      color:${COLORS.gray};
      text-align:center;
      line-height:1.7;
    "
  >
    If the button does not work,
    visit the password reset page and
    enter the verification code manually.
  </p>

  <div
    style="
      background:${COLORS.orangeLight};
      border-left:5px solid ${COLORS.orange};
      padding:18px;
      border-radius:12px;
      margin-top:30px;
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
      this verification code expires
      in 10 minutes.
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
  "Your MarvelMarts password reset code",

html,


};
}
