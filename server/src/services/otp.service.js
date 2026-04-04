import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import AppError from "../utils/AppError.js";
import { getSignupOtpTemplate, getForgotPasswordOtpTemplate } from "../utils/emailTemplates.js";

const templates = {
  signup: { subject: "Verify Your Email — QuickTalk", template: getSignupOtpTemplate },
  forgot: { subject: "Reset Your Password — QuickTalk", template: getForgotPasswordOtpTemplate }
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS
  }
});

export const sendOTPEmail = async (email, otp, type = "signup") => {
  const { subject, template } = templates[type];

  try {
    const info = await transporter.sendMail({
      from: `"QuickTalk" <${env.EMAIL_USER}>`,
      to: email,
      subject,
      html: template(otp)
    });

    // console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (err) {
    console.error("Nodemailer error while sending OTP:", err);
    throw new AppError("Failed to send OTP email", 502);
  }
};
