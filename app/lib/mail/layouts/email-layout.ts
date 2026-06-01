import { COLORS } from "../config/color";

const LOGO_URL =
  "https://marvelmarts.com/logo1-white.png";
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export function emailLayout(
  content: string,
  previewText: string =
    "Notification from MarvelMarts"
) {
  return `
<!DOCTYPE html>
<html lang="en">

<head>

  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>MarvelMarts</title>

  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: ${COLORS.ghost};
      font-family:
        "Segoe UI",
        Tahoma,
        Arial,
        sans-serif;
    }

    table {
      border-collapse: collapse;
    }

    img {
      border: 0;
      display: block;
    }

    a {
      text-decoration: none;
    }

    .main-button:hover {
      opacity: 0.9;
    }

    @media only screen and (max-width: 600px) {

      .container {
        width: 100% !important;
      }

      .content {
        padding: 25px !important;
      }

      .footer-links a {
        display: block !important;
        margin: 10px 0 !important;
      }
    }
  </style>

</head>

<body>

  <!-- PREVIEW TEXT -->
  <div
    style="
      display:none;
      overflow:hidden;
      opacity:0;
      max-height:0;
      max-width:0;
    "
  >
    ${previewText}
  </div>

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="
      background:${COLORS.ghost};
      padding:30px 10px;
    "
  >

    <tr>

      <td align="center">

        <table
          class="container"
          width="600"
          cellpadding="0"
          cellspacing="0"
          style="
            max-width:600px;
            width:100%;
            background:#ffffff;
            border-radius:16px;
            overflow:hidden;
            box-shadow:
              0 4px 12px
              rgba(0,0,0,0.06);
          "
        >

          <!-- HEADER -->
          <tr>

            <td
              align="center"
              style="
                background:${COLORS.navy};
                padding:40px 20px;
              "
            >

              <img
                src="${LOGO_URL}"
                alt="MarvelMarts"
                width="220"
              />

              <p
                style="
                  margin-top:18px;
                  margin-bottom:0;
                  color:rgba(255,255,255,.8);
                  font-size:11px;
                  font-weight:700;
                  letter-spacing:2px;
                  text-transform:uppercase;
                "
              >
                Official Notification
              </p>

              <p
                style="
                  margin-top:10px;
                  margin-bottom:0;
                  max-width:420px;
                  color:rgba(255,255,255,.75);
                  font-size:13px;
                  line-height:1.8;
                "
              >
                Africa's trusted digital marketplace
                for seamless buying, selling,
                and business growth.
              </p>

            </td>

          </tr>

          <!-- BODY CONTENT -->
          <tr>

            <td
              class="content"
              style="
                padding:40px 30px;
                color:${COLORS.black};
                line-height:1.7;
              "
            >

              ${content}

            </td>

          </tr>

          <!-- FOOTER -->
          <tr>

            <td
              align="center"
              style="
                background:#F9FAFB;
                padding:35px 25px;
                border-top:1px solid #eeeeee;
              "
            >

              <!-- COMPANY -->
              <h3
                style="
                  margin:0;
                  color:${COLORS.navy};
                  font-size:16px;
                  font-weight:800;
                "
              >
                MarvelMarts HQ
              </h3>

              <p
                style="
                  margin:8px 0 18px;
                  color:${COLORS.gray};
                  font-size:13px;
                "
              >
                Lekki, Lagos, Nigeria
              </p>

              <!-- CONTACT -->
              <p style="margin:0 0 18px;">

                <a
                  href="mailto:support@marvelmarts.com"
                  style="
                    color:${COLORS.navy};
                    font-weight:700;
                    font-size:13px;
                  "
                >
                  support@marvelmarts.com
                </a>

              </p>

              <!-- LINKS -->
              <div class="footer-links">

                <a
                  href="https://marvelmarts.com"
                  style="
                    color:${COLORS.navy};
                    font-weight:700;
                    margin:0 10px;
                    font-size:13px;
                  "
                >
                  Website
                </a>

                |

                <a
                  href="https://marvelmarts.com/support"
                  style="
                    color:${COLORS.navy};
                    font-weight:700;
                    margin:0 10px;
                    font-size:13px;
                  "
                >
                  Help Center
                </a>

                |

                <a
                  href="https://marvelmarts.com/contact-us"
                  style="
                    color:${COLORS.navy};
                    font-weight:700;
                    margin:0 10px;
                    font-size:13px;
                  "
                >
                  Contact Us
                </a>

              </div>

              <!-- SLOGAN -->
              <p
                style="
                  margin-top:25px;
                  color:${COLORS.gray};
                  font-size:12px;
                  line-height:1.8;
                  max-width:430px;
                "
              >
                MarvelMarts is building the future
                of digital commerce in Africa —
                empowering businesses and customers
                through secure, modern,
                and seamless online experiences.
              </p>

              <!-- SOCIALS -->
              <div
                style="
                  margin-top:20px;
                  margin-bottom:10px;
                "
              >

                <a
                  href="https://facebook.com/marvelmarts"
                  style="
                    margin:0 8px;
                    color:${COLORS.navy};
                    font-size:12px;
                    font-weight:700;
                  "
                >
                  Facebook
                </a>

                <a
                  href="https://instagram.com/marvelmarts"
                  style="
                    margin:0 8px;
                    color:${COLORS.navy};
                    font-size:12px;
                    font-weight:700;
                  "
                >
                  Instagram
                </a>

                <a
                  href="https://linkedin.com/company/marvelmarts"
                  style="
                    margin:0 8px;
                    color:${COLORS.navy};
                    font-size:12px;
                    font-weight:700;
                  "
                >
                  LinkedIn
                </a>

              </div>

              <!-- COPYRIGHT -->
              <p
                style="
                  margin-top:20px;
                  color:#9CA3AF;
                  font-size:11px;
                "
              >
                © ${new Date().getFullYear()}
                MarvelMarts.
                All rights reserved.
              </p>

            </td>

          </tr>

        </table>

      </td>

    </tr>

  </table>

</body>

</html>
`;
}