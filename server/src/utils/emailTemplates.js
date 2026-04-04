const baseTemplate = (title, subtitle, otp, footerNote) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#0f0f1a;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#0f0f1a 0%,#1a1a2e 50%,#16213e 100%);min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:24px;backdrop-filter:blur(20px);overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding:40px 40px 20px;text-align:center;">
              <div style="display:inline-block;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:16px;padding:14px 20px;margin-bottom:24px;">
                <span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:1px;">⚡ QuickTalk</span>
              </div>
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.4;">${title}</h1>
              <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.6);line-height:1.6;">${subtitle}</p>
            </td>
          </tr>

          <!-- OTP Code -->
          <tr>
            <td style="padding:10px 40px 30px;text-align:center;">
              <div style="background:linear-gradient(135deg,rgba(102,126,234,0.15) 0%,rgba(118,75,162,0.15) 100%);border:1px solid rgba(102,126,234,0.3);border-radius:16px;padding:30px;">
                <p style="margin:0 0 12px;font-size:12px;font-weight:600;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:3px;">Verification Code</p>
                <div style="font-size:40px;font-weight:800;letter-spacing:12px;color:#ffffff;font-family:'Courier New',monospace;">
                  ${otp}
                </div>
              </div>
            </td>
          </tr>

          <!-- Timer Notice -->
          <tr>
            <td style="padding:0 40px 30px;text-align:center;">
              <div style="display:inline-block;background:rgba(255,183,77,0.1);border:1px solid rgba(255,183,77,0.2);border-radius:12px;padding:12px 24px;">
                <span style="font-size:13px;color:#ffb74d;">⏱ This code expires in <strong>10 minutes</strong></span>
              </div>
            </td>
          </tr>

          <!-- Security Notice -->
          <tr>
            <td style="padding:0 40px 30px;text-align:center;">
              <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.4);line-height:1.8;">
                ${footerNote}<br/>
                If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.25);">
                &copy; ${new Date().getFullYear()} QuickTalk &middot; Secure Messaging
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

export const getSignupOtpTemplate = (otp) =>
  baseTemplate(
    "Verify Your Email",
    "Enter the code below to complete your QuickTalk signup.",
    otp,
    "Never share this code with anyone."
  );

export const getForgotPasswordOtpTemplate = (otp) =>
  baseTemplate(
    "Reset Your Password",
    "We received a request to reset your QuickTalk password.",
    otp,
    "Use this code to set a new password."
  );
