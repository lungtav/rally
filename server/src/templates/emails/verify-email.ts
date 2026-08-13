function verifyEmailTemplate(code: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify your email</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7; padding: 40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
 
          <!-- Header -->
          <tr>
            <td style="background-color:#111827; padding:28px 32px;">
              <span style="color:#ffffff; font-size:20px; font-weight:700; letter-spacing:0.5px;">Rally</span>
            </td>
          </tr>
 
          <!-- Body -->
          <tr>
            <td style="padding:40px 32px 24px 32px;">
              <h1 style="margin:0 0 12px 0; font-size:22px; line-height:1.3; color:#111827; font-weight:700;">
                Verify your email
              </h1>
              <p style="margin:0 0 28px 0; font-size:15px; line-height:1.6; color:#4b5563;">
                Enter this code to confirm your email address and finish setting up your account. It expires in <strong>1 minute</strong>.
              </p>
 
              <!-- OTP box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background-color:#f9fafb; border:1px solid #e5e7eb; border-radius:10px; padding:20px;">
                    <span style="font-size:32px; font-weight:700; letter-spacing:10px; color:#111827; font-family: 'Courier New', monospace;">
                      ${code}
                    </span>
                  </td>
                </tr>
              </table>
 
              <p style="margin:28px 0 0 0; font-size:13px; line-height:1.6; color:#9ca3af;">
                Didn't request this code? You can safely ignore this email.
              </p>
            </td>
          </tr>
 
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px; border-top:1px solid #f0f0f0;">
              <p style="margin:0; font-size:12px; color:#9ca3af;">
                &copy; ${new Date().getFullYear()} Rally. All rights reserved.
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

export { verifyEmailTemplate };
