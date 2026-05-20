import { brevoEmailApi } from "../../config/brevo";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailOptions) => {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY missing");
  }

  try {
    await brevoEmailApi.sendTransacEmail({
      sender: {
        name: "FlyEasy",
        email: process.env.EMAIL_USER!,
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    });
  } catch (error) {
    console.error("BREVO_EMAIL_ERROR:", error);
    throw error;
  }
};