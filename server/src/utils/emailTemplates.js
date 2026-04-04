const baseTemplate = (title, subtitle, otp, footerNote) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;box-shadow:0 10px 25px rgba(0,0,0,0.05);overflow:hidden;">
          <tr>
            <td style="padding:40px 40px 20px;text-align:center;">
              <div style="display:inline-block;background:linear-gradient(135deg,#6366f1 0%,#a855f7 100%);border-radius:16px;padding:14px 20px;margin-bottom:24px;box-shadow:0 4px 12px rgba(99,102,241,0.2);">
                <span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:1px;">⚡ QuickTalk</span>
              </div>
              <h1 style="margin:0;font-size:24px;font-weight:800;color:#0f172a;line-height:1.4;">${title}</h1>
              <p style="margin:8px 0 0;font-size:15px;color:#64748b;line-height:1.6;">${subtitle}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 40px 30px;text-align:center;">
              <div style="background:#f5f8ff;border:1px solid #dbeafe;border-radius:16px;padding:30px;">
                <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:3px;">Verification Code</p>
                <div style="font-size:42px;font-weight:800;letter-spacing:12px;color:#1e1b4b;font-family:'Courier New',monospace;">
                  ${otp}
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 30px;text-align:center;">
              <div style="display:inline-block;background:#fff7ed;border:1px solid #ffedd5;border-radius:12px;padding:12px 24px;">
                <span style="font-size:13px;color:#ea580c;">⏱ This code expires in <strong>10 minutes</strong></span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 30px;text-align:center;">
              <p style="margin:0;font-size:13px;color:#64748b;line-height:1.8;">
                ${footerNote}<br/>
                If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f1f5f9;text-align:center;background:#f8fafc;">
              <p style="margin:0;font-size:12px;font-weight:500;color:#94a3b8;">
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