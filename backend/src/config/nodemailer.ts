import SMTPTransport from "nodemailer/lib/smtp-transport";

const nodemailerConfig: SMTPTransport.Options = {
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 20000,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
};

export default nodemailerConfig;