import { Resend } from "resend";
import { env } from "../config/env.js";
import { verifyEmailTemplate } from "../templates/emails/verify-email.js";

const resend = new Resend(env.RESEND_API_KEY);

const verifyEmail = async (to: string, code: string) => {
  const { data, error } = await resend.emails.send({
    from: "Rally <noreply@oluwafunmbi.cv>",
    to,
    subject: "Verify your email",
    html: verifyEmailTemplate(code),
  });

  if (error) {
    throw new Error(`failed to send verification email: ${error.message}`);
  }

  return data;
};

export { verifyEmail };
