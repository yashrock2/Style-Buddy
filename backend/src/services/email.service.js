import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpPort === 465,
  auth: {
    user: env.smtpUser,
    pass: env.smtpPassword,
  },
});

export async function sendTestEmail(to) {
  const info = await transporter.sendMail({
    from: env.smtpFrom,
    to,
    subject: "StyleBuddy Email Test",
    text: "Your StyleBuddy email service is working successfully!",
  });

  console.log("📧 Test email sent:", info.messageId);
}

export async function sendVerificationEmail(to, otp) {
  await transporter.sendMail({
    from: env.smtpFrom,
    to,
    subject: "Your StyleBuddy Verification Code",
    text: `Your StyleBuddy email verification code is ${otp}. This code will expire in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>Welcome to StyleBuddy 👗</h2>

        <p>Use the verification code below to verify your email address:</p>

        <div style="
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          padding: 20px;
          text-align: center;
          background: #f5f5f5;
          border-radius: 10px;
          margin: 20px 0;
        ">
          ${otp}
        </div>

        <p>This code will expire in <strong>10 minutes</strong>.</p>

        <p>If you did not create a StyleBuddy account, you can ignore this email.</p>

        <p>— StyleBuddy Team</p>
      </div>
    `,
  });
}