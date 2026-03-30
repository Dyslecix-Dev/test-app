import { render } from "@react-email/components";
import type { JSX } from "react";
import { Resend } from "resend";

export function createEmailClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }
  return new Resend(process.env.RESEND_API_KEY);
}

interface SendEmailOptions {
  from: string;
  to: string | string[];
  subject: string;
  template: JSX.Element;
}

export async function sendEmail({ from, to, subject, template }: SendEmailOptions) {
  const resend = createEmailClient();
  const [html, text] = await Promise.all([render(template), render(template, { plainText: true })]);

  return resend.emails.send({ from, to, subject, html, text });
}
