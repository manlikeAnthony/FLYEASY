import { brevoEmailApi } from "../../config/brevo";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({
  to,
  subject,
  html,
}: SendEmailOptions): Promise<void> => {
  try {
    await brevoEmailApi.sendTransacEmail({
      sender: {
        email: process.env.EMAIL_USER!, 
        name: "FlyEasy",
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