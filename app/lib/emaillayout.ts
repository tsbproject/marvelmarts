// app/lib/emailLayout.ts

export const getMarvelMartsTemplate = (content: string, previewText: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>MarvelMarts</title>
  <style>
    .main-button:hover { background-color: #001f41 !important; }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#F4F7F9; font-family: sans-serif;">
  <div style="display:none;">${previewText}</div>
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding: 20px;">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color:#ffffff; border-radius:16px; overflow:hidden;">
          <tr>
            <td align="center" style="background-color:#002B5B; padding:40px;">
              <img src="https://marvelmarts.vercel.app/logo.png" alt="MarvelMarts" width="200" />
            </td>
          </tr>
          <tr>
            <td style="padding:40px; color:#333333; line-height:1.6;">
              ${content}
            </td>
          </tr>
          <tr>
            <td align="center" style="background-color:#F9FAFB; padding:30px; border-top:1px solid #eeeeee;">
              <p style="font-size:14px; font-weight:bold; color:#002B5B; margin:0;">MarvelMarts HQ</p>
              <p style="font-size:12px; color:#666; margin:5px 0;">Lekki, Lagos, Nigeria</p>
              <p style="font-size:12px; color:#999;">© 2026 MarvelMarts. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;