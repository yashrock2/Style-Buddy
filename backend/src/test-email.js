import { sendTestEmail } from "./services/email.service.js";
import { env } from "./config/env.js";

try {
  await sendTestEmail(env.smtpUser);
  console.log("✅ Email test successful");
} catch (error) {
  console.error("❌ Email test failed");
  console.error(error);
}